import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  orgId: string;
  context: string;
  analyticsData?: any;
  customPrompt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { orgId, context, analyticsData, customPrompt }: InsightRequest = await req.json();

    console.log(`Generating AI insights for org ${orgId}, context: ${context}`);

    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    // Prepare context data for AI analysis
    const contextData = await prepareAnalyticsContext(orgId, analyticsData);
    
    // Generate AI insights using Perplexity
    const aiInsights = await generateAIInsights(contextData, context, customPrompt);
    
    // Process and structure the insights
    const structuredInsights = await processInsights(aiInsights, contextData);

    return new Response(JSON.stringify({
      success: true,
      insights: structuredInsights,
      generatedAt: new Date().toISOString(),
      context
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });
  }
});

async function prepareAnalyticsContext(orgId: string, providedData?: any) {
  // If analytics data is provided, use it; otherwise fetch current data
  if (providedData) {
    return providedData;
  }

  // Mock analytics context - in real implementation, fetch from database
  return {
    occupancyRate: 76.8,
    adr: 87500,
    revpar: 67200,
    totalRevenue: 2450000,
    totalReservations: 284,
    averageStayLength: 2.8,
    recentTrends: {
      occupancy: 'increasing',
      revenue: 'stable',
      bookingPace: 'declining'
    },
    seasonality: 'high_season',
    marketConditions: 'competitive',
    guestSatisfaction: 4.2,
    repeatCustomers: 34.5
  };
}

async function generateAIInsights(contextData: any, context: string, customPrompt?: string) {
  const systemPrompt = `Tu es un expert consultant en gestion hôtelière avec une expertise en revenue management, analytics et optimisation opérationnelle. 

Analyse les données d'un hôtel et fournis des insights actionables et des recommandations stratégiques précises.

Contexte des données:
- Taux d'occupation: ${contextData.occupancyRate}%
- ADR (Tarif moyen): ${contextData.adr} XOF
- RevPAR: ${contextData.revpar} XOF
- Revenus totaux: ${contextData.totalRevenue} XOF
- Nombre de réservations: ${contextData.totalReservations}
- Durée moyenne de séjour: ${contextData.averageStayLength} nuits
- Tendances récentes: ${JSON.stringify(contextData.recentTrends)}
- Saisonnalité: ${contextData.seasonality}
- Conditions du marché: ${contextData.marketConditions}
- Satisfaction client: ${contextData.guestSatisfaction}/5
- Clients fidèles: ${contextData.repeatCustomers}%

Fournis une analyse détaillée avec:
1. Diagnostic de performance actuelle
2. Opportunités d'amélioration identifiées
3. Recommandations actionables avec priorités
4. Impact financier estimé
5. Risques potentiels à surveiller`;

  const userPrompt = customPrompt || `Analyse approfondie des performances hôtelières pour optimiser les revenus et l'efficacité opérationnelle. Contexte spécifique: ${context}`;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 2000,
      return_images: false,
      return_related_questions: false,
      frequency_penalty: 1,
      presence_penalty: 0
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function processInsights(aiResponse: string, contextData: any) {
  // Parse the AI response and structure it into our insight format
  const insights = [];

  // Extract key themes and create structured insights
  const sections = aiResponse.split('\n\n').filter(section => section.trim());
  
  let currentInsight: any = {
    id: crypto.randomUUID(),
    category: 'strategy',
    priority: 'medium',
    title: 'Analyse IA des performances',
    summary: '',
    details: '',
    dataPoints: [],
    recommendations: [],
    potentialImpact: {},
    generatedAt: new Date(),
    isActionable: true
  };

  for (const section of sections) {
    if (section.includes('Diagnostic') || section.includes('Performance')) {
      currentInsight.category = 'operations';
      currentInsight.title = 'Diagnostic de Performance';
      currentInsight.summary = section.substring(0, 200) + '...';
      currentInsight.details += section + '\n\n';
    } else if (section.includes('Opportunité') || section.includes('Amélioration')) {
      currentInsight.category = 'revenue';
      currentInsight.priority = 'high';
      
      // Extract potential revenue impact if mentioned
      const revenueMatch = section.match(/(\d+)%.*revenus?/i);
      if (revenueMatch) {
        const percentage = parseInt(revenueMatch[1]);
        currentInsight.potentialImpact.revenue = Math.round(contextData.totalRevenue * percentage / 100);
      }
    } else if (section.includes('Recommandation') || section.includes('Action')) {
      // Extract recommendations
      const recommendations = extractRecommendations(section);
      currentInsight.recommendations.push(...recommendations);
    } else if (section.includes('Risque') || section.includes('Attention')) {
      // Create a separate risk insight
      insights.push({
        id: crypto.randomUUID(),
        category: 'risk',
        priority: 'high',
        title: 'Risques Identifiés',
        summary: section.substring(0, 200) + '...',
        details: section,
        dataPoints: [],
        recommendations: [],
        potentialImpact: {},
        generatedAt: new Date(),
        isActionable: true
      });
    } else {
      currentInsight.details += section + '\n\n';
    }
  }

  // Add contextual data points
  currentInsight.dataPoints = [
    { metric: 'Taux d\'occupation', value: contextData.occupancyRate },
    { metric: 'RevPAR', value: contextData.revpar },
    { metric: 'Satisfaction client', value: contextData.guestSatisfaction }
  ];

  if (currentInsight.details.trim()) {
    insights.push(currentInsight);
  }

  return insights;
}

function extractRecommendations(text: string) {
  const recommendations = [];
  
  // Simple extraction of numbered or bulleted recommendations
  const lines = text.split('\n').filter(line => 
    line.match(/^\d+\./) || line.match(/^-/) || line.match(/^•/)
  );

  for (const line of lines) {
    const cleanLine = line.replace(/^\d+\.|\-|•/, '').trim();
    if (cleanLine.length > 10) {
      recommendations.push({
        id: crypto.randomUUID(),
        title: cleanLine.substring(0, 80) + (cleanLine.length > 80 ? '...' : ''),
        description: cleanLine,
        priority: 'medium',
        effort: 'medium',
        impact: 'medium',
        category: 'operations',
        actionSteps: [cleanLine],
        timeframe: '2-4 semaines'
      });
    }
  }

  return recommendations;
}