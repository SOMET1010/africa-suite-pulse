import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface StaffingRequest {
  orgId: string;
  date: string;
  forecastedOccupancy: number;
  forecastedRevenue: number;
  events?: string[];
  currentStaffLevels?: Record<string, number>;
}

interface StaffingRecommendation {
  department: string;
  currentStaff: number;
  recommendedStaff: number;
  difference: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  skillsNeeded: string[];
  shiftPatterns: Array<{
    shift: string;
    staffNeeded: number;
    roles: string[];
  }>;
}

interface StaffingOptimization {
  date: string;
  totalCurrentStaff: number;
  totalRecommendedStaff: number;
  recommendations: StaffingRecommendation[];
  costImpact: {
    currentCost: number;
    recommendedCost: number;
    savings: number;
  };
  efficiency: {
    guestToStaffRatio: number;
    revenuePerStaff: number;
    productivityScore: number;
  };
  aiInsights: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orgId,
      date,
      forecastedOccupancy,
      forecastedRevenue,
      events = [],
      currentStaffLevels = {}
    }: StaffingRequest = await req.json();

    // Fetch historical staffing data
    const { data: historicalStaffing } = await supabase
      .from('housekeeping_staff')
      .select('role, status, current_assignment')
      .eq('org_id', orgId);

    // Get room capacity
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id')
      .eq('org_id', orgId);

    const totalRooms = rooms?.length || 50;
    const estimatedGuests = Math.round((forecastedOccupancy / 100) * totalRooms * 1.8); // Average 1.8 guests per room

    // Generate staffing recommendations
    const recommendations = generateStaffingRecommendations({
      forecastedOccupancy,
      forecastedRevenue,
      estimatedGuests,
      totalRooms,
      events,
      currentStaffLevels,
      historicalStaffing: historicalStaffing || []
    });

    // Calculate costs
    const costImpact = calculateCostImpact(recommendations);

    // Calculate efficiency metrics
    const efficiency = calculateEfficiencyMetrics(
      recommendations,
      estimatedGuests,
      forecastedRevenue
    );

    // Generate AI insights
    let aiInsights = generateFallbackInsights(recommendations, efficiency);
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (openAIKey) {
      try {
        aiInsights = await generateAIInsights(
          openAIKey,
          recommendations,
          efficiency,
          { forecastedOccupancy, estimatedGuests, events }
        );
      } catch (error) {
        console.log('Using fallback insights:', error);
      }
    }

    const result: StaffingOptimization = {
      date,
      totalCurrentStaff: recommendations.reduce((sum, rec) => sum + rec.currentStaff, 0),
      totalRecommendedStaff: recommendations.reduce((sum, rec) => sum + rec.recommendedStaff, 0),
      recommendations,
      costImpact,
      efficiency,
      aiInsights
    };

    // Log the recommendation
    await supabase
      .from('staffing_recommendations_log')
      .insert({
        org_id: orgId,
        target_date: date,
        forecasted_occupancy: forecastedOccupancy,
        forecasted_revenue: forecastedRevenue,
        recommendations: result
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in staffing optimization:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Staffing optimization failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateStaffingRecommendations(params: any): StaffingRecommendation[] {
  const {
    forecastedOccupancy,
    estimatedGuests,
    totalRooms,
    events,
    currentStaffLevels
  } = params;

  const occupiedRooms = Math.round((forecastedOccupancy / 100) * totalRooms);

  const departments = [
    {
      department: 'Reception',
      current: currentStaffLevels.reception || 2,
      baseRatio: 0.8, // Per 100 guests
      eventMultiplier: events.length > 0 ? 1.2 : 1.0,
      skills: ['Accueil client', 'Check-in/out', 'Langues étrangères'],
      shifts: [
        { shift: 'Matin 6h-14h', roles: ['Réceptionniste principal', 'Assistant'] },
        { shift: 'Après-midi 14h-22h', roles: ['Réceptionniste', 'Night auditor prep'] },
        { shift: 'Nuit 22h-6h', roles: ['Night auditor'] }
      ]
    },
    {
      department: 'Gouvernante',
      current: currentStaffLevels.housekeeping || 8,
      baseRatio: 0.15, // Per room to clean
      eventMultiplier: 1.0,
      skills: ['Nettoyage', 'Linge', 'Inspection qualité'],
      shifts: [
        { shift: 'Matin 8h-16h', roles: ['Gouvernante générale', 'Femmes de chambre'] },
        { shift: 'Après-midi 16h-20h', roles: ['Équipe turnover', 'Maintenance'] }
      ]
    },
    {
      department: 'Restaurant',
      current: currentStaffLevels.restaurant || 6,
      baseRatio: 0.25, // Per guest
      eventMultiplier: events.length > 0 ? 1.3 : 1.0,
      skills: ['Service', 'Cuisine', 'Vente'],
      shifts: [
        { shift: 'Petit-déjeuner 6h-11h', roles: ['Chef', 'Serveurs', 'Plongeur'] },
        { shift: 'Déjeuner 11h-15h', roles: ['Chef', 'Serveurs', 'Commis'] },
        { shift: 'Dîner 18h-23h', roles: ['Chef', 'Serveurs', 'Barman'] }
      ]
    },
    {
      department: 'Sécurité',
      current: currentStaffLevels.security || 2,
      baseRatio: 0.03, // Per guest
      eventMultiplier: events.length > 0 ? 1.5 : 1.0,
      skills: ['Surveillance', 'Intervention', 'Premiers secours'],
      shifts: [
        { shift: '24h/24', roles: ['Agent de sécurité', 'Responsable sécurité'] }
      ]
    },
    {
      department: 'Maintenance',
      current: currentStaffLevels.maintenance || 2,
      baseRatio: 0.08, // Per room
      eventMultiplier: 1.0,
      skills: ['Électricité', 'Plomberie', 'Climatisation'],
      shifts: [
        { shift: 'Jour 8h-17h', roles: ['Technicien principal', 'Assistant maintenance'] }
      ]
    }
  ];

  return departments.map(dept => {
    let recommended: number;
    
    if (dept.department === 'Gouvernante') {
      recommended = Math.ceil(occupiedRooms * dept.baseRatio * dept.eventMultiplier);
    } else if (dept.department === 'Maintenance') {
      recommended = Math.ceil(totalRooms * dept.baseRatio);
    } else {
      recommended = Math.ceil(estimatedGuests * dept.baseRatio * dept.eventMultiplier);
    }

    // Minimum staffing levels
    const minimums: Record<string, number> = {
      'Reception': 2,
      'Gouvernante': 4,
      'Restaurant': 3,
      'Sécurité': 1,
      'Maintenance': 1
    };

    recommended = Math.max(minimums[dept.department] || 1, recommended);

    const difference = recommended - dept.current;
    let priority: 'low' | 'medium' | 'high' | 'critical';

    if (Math.abs(difference) === 0) priority = 'low';
    else if (Math.abs(difference) <= 1) priority = 'medium';
    else if (Math.abs(difference) <= 3) priority = 'high';
    else priority = 'critical';

    const reasoning = generateReasoningForDepartment(
      dept.department,
      dept.current,
      recommended,
      forecastedOccupancy,
      events
    );

    return {
      department: dept.department,
      currentStaff: dept.current,
      recommendedStaff: recommended,
      difference,
      priority,
      reasoning,
      skillsNeeded: dept.skills,
      shiftPatterns: dept.shifts.map(shift => ({
        shift: shift.shift,
        staffNeeded: Math.ceil(recommended / dept.shifts.length),
        roles: shift.roles
      }))
    };
  });
}

function generateReasoningForDepartment(
  department: string,
  current: number,
  recommended: number,
  occupancy: number,
  events: string[]
): string {
  const difference = recommended - current;
  const eventsText = events.length > 0 ? ` avec ${events.length} événement(s) prévus` : '';

  if (difference > 0) {
    if (department === 'Gouvernante') {
      return `Occupation à ${occupancy}%${eventsText} nécessite ${difference} personne(s) supplémentaire(s) pour maintenir les standards de propreté.`;
    } else if (department === 'Restaurant') {
      return `Flux clients élevé${eventsText} requiert ${difference} personne(s) en plus pour assurer un service de qualité.`;
    } else {
      return `Charge de travail augmentée nécessite ${difference} personne(s) supplémentaire(s) en ${department}.`;
    }
  } else if (difference < 0) {
    return `Activité modérée permet une réduction de ${Math.abs(difference)} personne(s) en ${department} pour optimiser les coûts.`;
  } else {
    return `Niveau de staffing actuel optimal pour l'activité prévue en ${department}.`;
  }
}

function calculateCostImpact(recommendations: StaffingRecommendation[]) {
  // Average hourly rates by department (F CFA)
  const hourlyRates: Record<string, number> = {
    'Reception': 2500,
    'Gouvernante': 2000,
    'Restaurant': 2200,
    'Sécurité': 2800,
    'Maintenance': 3000
  };

  let currentCost = 0;
  let recommendedCost = 0;

  recommendations.forEach(rec => {
    const rate = hourlyRates[rec.department] || 2000;
    const hoursPerDay = 8; // Average shift

    currentCost += rec.currentStaff * rate * hoursPerDay;
    recommendedCost += rec.recommendedStaff * rate * hoursPerDay;
  });

  return {
    currentCost,
    recommendedCost,
    savings: currentCost - recommendedCost
  };
}

function calculateEfficiencyMetrics(
  recommendations: StaffingRecommendation[],
  estimatedGuests: number,
  forecastedRevenue: number
) {
  const totalRecommendedStaff = recommendations.reduce((sum, rec) => sum + rec.recommendedStaff, 0);

  return {
    guestToStaffRatio: totalRecommendedStaff > 0 ? estimatedGuests / totalRecommendedStaff : 0,
    revenuePerStaff: totalRecommendedStaff > 0 ? forecastedRevenue / totalRecommendedStaff : 0,
    productivityScore: Math.min(100, Math.max(0, 
      ((estimatedGuests / totalRecommendedStaff) / 3) * 100 // Target ratio of 3 guests per staff
    ))
  };
}

async function generateAIInsights(
  openAIKey: string,
  recommendations: StaffingRecommendation[],
  efficiency: any,
  context: any
) {
  const prompt = `
  Analyze this hotel staffing optimization:
  
  Forecasted Occupancy: ${context.forecastedOccupancy}%
  Estimated Guests: ${context.estimatedGuests}
  Events: ${context.events.join(', ') || 'None'}
  
  Current vs Recommended Staff:
  ${recommendations.map(r => `${r.department}: ${r.currentStaff} → ${r.recommendedStaff} (${r.difference > 0 ? '+' : ''}${r.difference})`).join('\n')}
  
  Efficiency Metrics:
  - Guest to Staff Ratio: ${efficiency.guestToStaffRatio.toFixed(1)}
  - Revenue per Staff: ${efficiency.revenuePerStaff.toLocaleString()} F CFA
  - Productivity Score: ${efficiency.productivityScore.toFixed(0)}%
  
  Provide a concise strategic analysis in French (2-3 sentences) focusing on the key staffing adjustments and their business impact.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a hotel operations expert. Provide strategic staffing insights in French.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateFallbackInsights(
  recommendations: StaffingRecommendation[],
  efficiency: any
): string {
  const totalDifference = recommendations.reduce((sum, rec) => sum + Math.abs(rec.difference), 0);
  const highPriorityDepts = recommendations.filter(r => r.priority === 'high' || r.priority === 'critical').map(r => r.department);

  if (totalDifference === 0) {
    return `Staffing optimal avec un ratio de ${efficiency.guestToStaffRatio.toFixed(1)} clients par employé. La productivité est bien équilibrée pour maintenir la qualité de service.`;
  } else if (highPriorityDepts.length > 0) {
    return `Ajustements prioritaires requis en ${highPriorityDepts.join(' et ')} pour maintenir les standards de service. Le ratio client/staff ciblé de ${efficiency.guestToStaffRatio.toFixed(1)} optimisera la productivité.`;
  } else {
    return `Optimisations mineures suggérées pour améliorer l'efficacité opérationnelle. Le score de productivité de ${efficiency.productivityScore.toFixed(0)}% indique une bonne performance globale.`;
  }
}