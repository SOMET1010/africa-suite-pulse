import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function getSecureCorsHeaders(request: Request): Record<string, string> {
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://app.africasuite.com').split(',');
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : 'https://app.africasuite.com';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
}

interface AdvancedAnalyticsRequest {
  orgId: string;
  timeframe?: 'week' | 'month' | 'quarter';
}

serve(async (req) => {
  const corsHeaders = getSecureCorsHeaders(req);
  
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
    const { orgId, timeframe = 'month' }: AdvancedAnalyticsRequest = await req.json();

    console.log(`Generating advanced analytics for org ${orgId}, timeframe: ${timeframe}`);

    // 1. Fetch historical data
    const historicalData = await fetchHistoricalData(orgId, timeframe);

    // 2. Generate forecasts using different algorithms
    const forecasts = await generateForecasts(historicalData);

    // 3. Perform customer segmentation analysis
    const segments = await performSegmentation(orgId);

    // 4. Detect anomalies and generate smart alerts
    const alerts = await generateSmartAlerts(historicalData, orgId);

    // 5. Generate AI-powered business insights
    const insights = await generateBusinessInsights(historicalData, orgId);

    // 6. Get benchmark data
    const benchmarks = await getBenchmarkData(orgId);

    // 7. Get integration status
    const integrations = await getIntegrationStatus(orgId);

    const result = {
      forecasts,
      segments,
      alerts,
      insights,
      benchmarks,
      integrations,
      generatedAt: new Date().toISOString(),
      timeframe
    };

    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      },
    });

  } catch (error) {
    console.error('Error generating advanced analytics:', error);
    
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

async function fetchHistoricalData(orgId: string, timeframe: string) {
  // Mock historical data - in real implementation, query from database
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeframe) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
  }

  return {
    occupancy: generateTimeSeriesData(startDate, endDate, 70, 85),
    revenue: generateTimeSeriesData(startDate, endDate, 500000, 800000),
    adr: generateTimeSeriesData(startDate, endDate, 75000, 95000),
    revpar: generateTimeSeriesData(startDate, endDate, 50000, 75000),
    reservations: generateTimeSeriesData(startDate, endDate, 15, 35),
    averageStay: generateTimeSeriesData(startDate, endDate, 2.1, 3.8)
  };
}

function generateTimeSeriesData(start: Date, end: Date, min: number, max: number) {
  const data = [];
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    // Add some seasonality and trend
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendBoost = isWeekend ? 1.2 : 1.0;
    
    const baseValue = min + (max - min) * Math.random();
    const seasonalValue = baseValue * weekendBoost;
    const noisyValue = seasonalValue * (0.9 + 0.2 * Math.random());
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      value: noisyValue
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}

async function generateForecasts(historicalData: any) {
  const forecasts = [];
  
  // Generate forecasts for each metric
  for (const [metric, data] of Object.entries(historicalData)) {
    const forecast = {
      metric,
      period: 'month',
      current: data[data.length - 1]?.value || 0,
      forecast: generateForecastPoints(data),
      confidence: 'medium',
      trend: calculateTrend(data),
      methodology: 'moving_average'
    };
    
    forecasts.push(forecast);
  }
  
  return forecasts;
}

function generateForecastPoints(historicalData: any[]) {
  const lastValue = historicalData[historicalData.length - 1]?.value || 0;
  const trend = calculateTrendSlope(historicalData);
  const points = [];
  
  for (let i = 1; i <= 30; i++) {
    const baseValue = lastValue + (trend * i);
    const uncertainty = Math.abs(baseValue) * 0.1; // 10% uncertainty
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    
    points.push({
      date: futureDate.toISOString().split('T')[0],
      value: baseValue,
      upperBound: baseValue + uncertainty,
      lowerBound: Math.max(0, baseValue - uncertainty)
    });
  }
  
  return points;
}

function calculateTrend(data: any[]) {
  if (data.length < 2) return 'stable';
  
  const slope = calculateTrendSlope(data);
  return slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'stable';
}

function calculateTrendSlope(data: any[]) {
  if (data.length < 2) return 0;
  
  const recent = data.slice(-7); // Last 7 data points
  const firstValue = recent[0]?.value || 0;
  const lastValue = recent[recent.length - 1]?.value || 0;
  
  return (lastValue - firstValue) / firstValue;
}

async function performSegmentation(orgId: string) {
  // Mock customer segmentation - in real implementation, analyze guest data
  return [
    {
      id: '1',
      name: 'Clients Affaires',
      criteria: {
        bookingSource: ['corporate', 'direct'],
        stayLength: { min: 1, max: 3 },
        frequency: 'repeat'
      },
      size: 156,
      percentage: 32.4,
      averageSpend: 125000,
      averageStayLength: 2.1,
      loyalty: 'high',
      trends: {
        growth: 12.3,
        seasonality: ['Lundi-Jeudi', 'Hors vacances']
      }
    },
    {
      id: '2',
      name: 'Touristes Loisirs',
      criteria: {
        bookingSource: ['booking.com', 'expedia'],
        stayLength: { min: 3, max: 7 },
        frequency: 'first_time'
      },
      size: 203,
      percentage: 42.1,
      averageSpend: 89000,
      averageStayLength: 4.2,
      loyalty: 'medium',
      trends: {
        growth: 8.7,
        seasonality: ['Weekends', 'Vacances scolaires']
      }
    },
    {
      id: '3',
      name: 'Groupes & Événements',
      criteria: {
        bookingSource: ['direct', 'agent'],
        stayLength: { min: 2, max: 5 },
        spendRange: { min: 150000, max: 500000 }
      },
      size: 67,
      percentage: 13.9,
      averageSpend: 285000,
      averageStayLength: 3.4,
      loyalty: 'medium',
      trends: {
        growth: -2.1,
        seasonality: ['Saison des mariages', 'Conférences']
      }
    }
  ];
}

async function generateSmartAlerts(historicalData: any, orgId: string) {
  const alerts = [];
  
  // Check for performance issues
  const recentOccupancy = historicalData.occupancy?.slice(-7) || [];
  const avgOccupancy = recentOccupancy.reduce((sum: number, point: any) => sum + point.value, 0) / recentOccupancy.length;
  
  if (avgOccupancy < 65) {
    alerts.push({
      id: '1',
      type: 'performance',
      severity: 'medium',
      title: 'Taux d\'occupation en baisse',
      description: 'Le taux d\'occupation moyen des 7 derniers jours est inférieur aux objectifs',
      metric: 'Taux d\'occupation',
      currentValue: avgOccupancy,
      expectedValue: 75,
      threshold: 65,
      trend: 'declining',
      actionItems: [
        'Réviser la stratégie tarifaire',
        'Lancer une campagne marketing ciblée',
        'Analyser la concurrence locale'
      ],
      detectedAt: new Date(),
      isActive: true
    });
  }
  
  // Check for revenue opportunities
  const recentRevenue = historicalData.revenue?.slice(-7) || [];
  const revenueGrowth = calculateTrendSlope(recentRevenue);
  
  if (revenueGrowth > 0.15) {
    alerts.push({
      id: '2',
      type: 'opportunity',
      severity: 'low',
      title: 'Forte croissance des revenus détectée',
      description: 'Les revenus affichent une croissance exceptionnelle (+15%)',
      metric: 'Revenus',
      currentValue: recentRevenue[recentRevenue.length - 1]?.value || 0,
      trend: 'improving',
      actionItems: [
        'Optimiser les tarifs pendant cette période favorable',
        'Renforcer les efforts marketing',
        'Préparer la capacité pour répondre à la demande'
      ],
      detectedAt: new Date(),
      isActive: true
    });
  }
  
  return alerts;
}

async function generateBusinessInsights(historicalData: any, orgId: string) {
  // This would typically call an AI service like Perplexity
  // For now, return mock insights
  return [
    {
      id: '1',
      category: 'revenue',
      priority: 'high',
      title: 'Optimisation du Revenue Management',
      summary: 'Opportunité d\'augmentation des revenus de 15% par ajustement tarifaire',
      details: 'L\'analyse des données révèle que vos tarifs sont sous-optimisés pendant les périodes de forte demande. Une stratégie de pricing dynamique pourrait générer des revenus supplémentaires significatifs.',
      dataPoints: [
        { metric: 'RevPAR actuel', value: 68500 },
        { metric: 'RevPAR potentiel', value: 78800, comparison: { period: 'objectif', value: 68500, change: 15.0 } },
        { metric: 'Jours sous-optimisés', value: 12 }
      ],
      recommendations: [
        {
          id: 'r1',
          title: 'Implémenter un pricing dynamique',
          description: 'Ajuster automatiquement les tarifs selon la demande et la concurrence',
          priority: 'high',
          effort: 'medium',
          impact: 'high',
          category: 'revenue',
          actionSteps: [
            'Analyser les patterns de demande historiques',
            'Définir les règles de pricing automatique',
            'Tester sur une période limitée',
            'Déployer progressivement'
          ],
          estimatedROI: 150,
          timeframe: '2-3 mois'
        }
      ],
      potentialImpact: {
        revenue: 185000,
        occupancy: 3.2
      },
      generatedAt: new Date(),
      isActionable: true
    }
  ];
}

async function getBenchmarkData(orgId: string) {
  // Mock benchmark data - in real implementation, compare with market data
  return [
    {
      metric: 'Taux d\'occupation',
      hotelValue: 78.5,
      marketAverage: 72.3,
      topQuartile: 85.2,
      rank: 23,
      totalProperties: 156,
      market: 'Abidjan Centre',
      category: '4 étoiles',
      comparisonPeriod: 'Dernier trimestre'
    },
    {
      metric: 'ADR (Tarif moyen)',
      hotelValue: 87500,
      marketAverage: 82300,
      topQuartile: 96800,
      rank: 34,
      totalProperties: 156,
      market: 'Abidjan Centre',
      category: '4 étoiles',
      comparisonPeriod: 'Dernier trimestre'
    }
  ];
}

async function getIntegrationStatus(orgId: string) {
  // Mock integration status
  return [
    {
      id: '1',
      provider: 'google_analytics',
      name: 'Google Analytics Hotel',
      isActive: true,
      settings: { propertyId: 'GA-XXXXXX-X' },
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      syncFrequency: 'daily',
      dataMapping: {
        'sessions': 'website_visits',
        'pageviews': 'page_views',
        'users': 'unique_visitors'
      }
    },
    {
      id: '2',
      provider: 'power_bi',
      name: 'Dashboard Direction',
      isActive: false,
      settings: {},
      syncFrequency: 'weekly',
      dataMapping: {}
    }
  ];
}