import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsData {
  revenue: number[];
  occupancy: number[];
  orders: number[];
  averageSpend: number;
  period: string;
}

interface InsightRequest {
  analyticsData: AnalyticsData;
  orgId: string;
  period: 'week' | 'month' | 'quarter';
}

const generateOpenAIInsights = async (data: AnalyticsData, period: string) => {
  const prompt = `
Analyse ces données de performance hôtelière/restaurant:
- Revenus sur ${period}: ${data.revenue.join(', ')}
- Taux d'occupation: ${data.occupancy.join(', ')}%
- Commandes: ${data.orders.join(', ')}
- Panier moyen: ${data.averageSpend} FCFA

Génère 5 insights business et 3 recommandations stratégiques.
Réponds en JSON:
{
  "insights": [
    {
      "type": "revenue|occupancy|operations|trend",
      "title": "titre court",
      "description": "analyse détaillée",
      "impact": "high|medium|low",
      "metric": "valeur chiffrée"
    }
  ],
  "recommendations": [
    {
      "title": "recommandation",
      "description": "explication",
      "priority": "high|medium|low",
      "expectedImpact": "impact estimé",
      "timeframe": "court|moyen|long terme"
    }
  ],
  "summary": "résumé exécutif en 2 phrases"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Tu es un expert en analyse business pour l\'hôtellerie-restauration en Afrique.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    }),
  });

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
};

const generatePerplexityInsights = async (data: AnalyticsData, period: string) => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        {
          role: 'system',
          content: 'Expert en analyse business hôtellerie. Analyse les données et génère insights + recommandations en JSON.'
        },
        {
          role: 'user',
          content: `Données: revenus ${data.revenue}, occupation ${data.occupancy}%, commandes ${data.orders}, panier ${data.averageSpend}F sur ${period}`
        }
      ],
      max_tokens: 600,
      temperature: 0.2
    }),
  });

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
};

const generateFallbackInsights = (data: AnalyticsData, period: string) => {
  const avgRevenue = data.revenue.reduce((a, b) => a + b, 0) / data.revenue.length;
  const avgOccupancy = data.occupancy.reduce((a, b) => a + b, 0) / data.occupancy.length;
  const totalOrders = data.orders.reduce((a, b) => a + b, 0);
  
  const revenueGrowth = data.revenue.length > 1 ? 
    ((data.revenue[data.revenue.length - 1] - data.revenue[0]) / data.revenue[0] * 100).toFixed(1) : 0;

  return {
    insights: [
      {
        type: 'revenue',
        title: 'Performance Revenue',
        description: `Revenu moyen de ${avgRevenue.toLocaleString()} FCFA avec une évolution de ${revenueGrowth}%`,
        impact: avgRevenue > 100000 ? 'high' : 'medium',
        metric: `${avgRevenue.toLocaleString()} FCFA`
      },
      {
        type: 'occupancy',
        title: 'Taux d\'Occupation',
        description: `Taux moyen de ${avgOccupancy.toFixed(1)}% sur la période`,
        impact: avgOccupancy > 75 ? 'high' : avgOccupancy > 50 ? 'medium' : 'low',
        metric: `${avgOccupancy.toFixed(1)}%`
      },
      {
        type: 'operations',
        title: 'Volume des Commandes',
        description: `${totalOrders} commandes traitées avec un panier moyen de ${data.averageSpend} FCFA`,
        impact: 'medium',
        metric: `${totalOrders} commandes`
      }
    ],
    recommendations: [
      {
        title: avgOccupancy < 60 ? 'Améliorer le taux d\'occupation' : 'Optimiser les revenus',
        description: avgOccupancy < 60 ? 
          'Mettre en place des promotions ciblées pour augmenter l\'occupation' :
          'Focus sur l\'augmentation du panier moyen et des services additionnels',
        priority: 'high',
        expectedImpact: avgOccupancy < 60 ? '+15% d\'occupation' : '+10% de revenu par client',
        timeframe: 'court terme'
      },
      {
        title: 'Analyse des tendances',
        description: 'Mettre en place un suivi quotidien des KPIs pour identifier les patterns',
        priority: 'medium',
        expectedImpact: 'Meilleure réactivité aux changements',
        timeframe: 'moyen terme'
      }
    ],
    summary: `Performance globale ${avgOccupancy > 65 ? 'satisfaisante' : 'à améliorer'} avec un potentiel d'optimisation sur ${avgOccupancy < 60 ? 'l\'occupation' : 'les revenus'}.`
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analyticsData, period }: InsightRequest = await req.json();

    // Essayer les providers dans l'ordre
    let result;
    let provider = 'fallback';

    try {
      result = await generateOpenAIInsights(analyticsData, period);
      provider = 'OpenAI';
    } catch (error) {
      console.log('OpenAI failed:', error.message);
      try {
        result = await generatePerplexityInsights(analyticsData, period);
        provider = 'Perplexity';
      } catch (error2) {
        console.log('Perplexity failed:', error2.message);
        result = generateFallbackInsights(analyticsData, period);
        provider = 'Fallback';
      }
    }

    return new Response(JSON.stringify({
      ...result,
      provider,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-business-insights:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});