import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonalizationRequest {
  guestId: string;
  orgId: string;
  currentMenu?: any[];
  orderHistory?: any[];
  preferences?: any;
  timeOfDay?: string;
  language?: 'fr' | 'en';
}

const generatePersonalizedRecommendations = async (
  orderHistory: any[], 
  currentMenu: any[], 
  preferences: any,
  timeOfDay: string,
  language: 'fr' | 'en'
) => {
  const prompt = language === 'fr' 
    ? `Basé sur l'historique des commandes et les préférences du client, recommande 3-5 plats personnalisés du menu actuel.
       Historique: ${JSON.stringify(orderHistory?.slice(-10))}
       Préférences: ${JSON.stringify(preferences)}
       Heure: ${timeOfDay}
       
       Réponds en JSON avec: { recommendations: [{ id, name, reason, confidence }] }`
    : `Based on order history and customer preferences, recommend 3-5 personalized dishes from the current menu.
       History: ${JSON.stringify(orderHistory?.slice(-10))}
       Preferences: ${JSON.stringify(preferences)}
       Time: ${timeOfDay}
       
       Respond in JSON with: { recommendations: [{ id, name, reason, confidence }] }`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu es un expert en recommandations culinaires personnalisées.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return { recommendations: [] };
    }
  } catch (error) {
    console.error('AI recommendation error:', error);
    return generateFallbackRecommendations(orderHistory, currentMenu, timeOfDay);
  }
};

const generateFallbackRecommendations = (orderHistory: any[], currentMenu: any[], timeOfDay: string) => {
  // Logique de fallback basée sur les patterns
  const frequentCategories = orderHistory?.reduce((acc: any, order: any) => {
    const category = order.category || 'main';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {}) || {};

  const topCategory = Object.keys(frequentCategories).sort((a, b) => 
    frequentCategories[b] - frequentCategories[a]
  )[0] || 'main';

  const timeBasedFilter = timeOfDay === 'morning' ? 'breakfast' : 
                         timeOfDay === 'evening' ? 'dinner' : 'lunch';

  const recommendations = currentMenu
    ?.filter(item => item.category === topCategory || item.type === timeBasedFilter)
    ?.slice(0, 5)
    ?.map(item => ({
      id: item.id,
      name: item.name,
      reason: `Basé sur vos préférences pour ${topCategory}`,
      confidence: 0.7
    })) || [];

  return { recommendations };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { guestId, orgId, currentMenu, orderHistory, preferences, timeOfDay, language = 'fr' }: PersonalizationRequest = await req.json();

    console.log('Generating personalized recommendations for guest:', guestId);

    const recommendations = await generatePersonalizedRecommendations(
      orderHistory || [],
      currentMenu || [],
      preferences || {},
      timeOfDay || 'lunch',
      language
    );

    // Analyse des patterns pour insights supplémentaires
    const insights = {
      preferredCategories: orderHistory?.reduce((acc: any, order: any) => {
        const cat = order.category || 'unknown';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}) || {},
      averageOrderValue: orderHistory?.reduce((sum, order) => sum + (order.total || 0), 0) / (orderHistory?.length || 1) || 0,
      visitFrequency: orderHistory?.length || 0,
      lastVisit: orderHistory?.[orderHistory.length - 1]?.date || null
    };

    return new Response(JSON.stringify({
      recommendations: recommendations.recommendations || [],
      insights,
      personalizationScore: Math.min(0.9, (orderHistory?.length || 0) * 0.1 + 0.3),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-menu-personalization:', error);
    
    return new Response(JSON.stringify({
      recommendations: [],
      insights: {},
      personalizationScore: 0.3,
      error: 'Service temporairement indisponible',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});