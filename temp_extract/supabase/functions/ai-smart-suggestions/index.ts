import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestionRequest {
  currentItems: any[];
  customerCount: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  orgId: string;
  tableId?: string;
}

interface AIProvider {
  name: string;
  generateSuggestions: (context: string) => Promise<any>;
}

// OpenAI Provider
const openAIProvider: AIProvider = {
  name: 'OpenAI',
  generateSuggestions: async (context: string) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en recommandations culinaires pour restaurant africain. 
            Analyse le contexte et suggère 3 produits complémentaires pertinents.
            Réponds uniquement en JSON avec cette structure:
            {
              "suggestions": [
                {
                  "name": "nom du produit",
                  "description": "description courte",
                  "price": prix_en_francs,
                  "reason": "pourquoi cette suggestion"
                }
              ],
              "type": "complement|upsell|popular"
            }`
          },
          { role: 'user', content: context }
        ],
        max_tokens: 400,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
};

// Perplexity Provider
const perplexityProvider: AIProvider = {
  name: 'Perplexity',
  generateSuggestions: async (context: string) => {
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
            content: `Expert en recommandations culinaires africaines. Suggère 3 produits en JSON format:
            {"suggestions": [{"name": "produit", "description": "desc", "price": prix, "reason": "raison"}], "type": "complement"}`
          },
          { role: 'user', content: context }
        ],
        max_tokens: 300,
        temperature: 0.6
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }
};

// Fallback avec des suggestions fixes intelligentes
const fallbackProvider: AIProvider = {
  name: 'Fallback',
  generateSuggestions: async (context: string) => {
    const hasMainDish = context.includes('plat principal');
    const hasBeverage = context.includes('boisson');
    const isEvening = context.includes('soir');

    let suggestions = [];
    let type = 'popular';

    if (hasMainDish && !hasBeverage) {
      suggestions = [
        {
          name: 'Bissap frais',
          description: 'Boisson traditionnelle rafraîchissante',
          price: 800,
          reason: 'Parfait avec les plats épicés'
        },
        {
          name: 'Jus de gingembre',
          description: 'Boisson digestive naturelle',
          price: 900,
          reason: 'Aide à la digestion'
        },
        {
          name: 'Eau minérale',
          description: 'Eau fraîche',
          price: 500,
          reason: 'Toujours nécessaire'
        }
      ];
      type = 'complement';
    } else if (isEvening) {
      suggestions = [
        {
          name: 'Thieboudienne',
          description: 'Riz au poisson, plat national',
          price: 3500,
          reason: 'Très populaire le soir'
        },
        {
          name: 'Mafé',
          description: 'Ragoût à la pâte darachide',
          price: 3000,
          reason: 'Plat réconfortant du soir'
        },
        {
          name: 'Yassa poulet',
          description: 'Poulet aux oignons et citron',
          price: 2800,
          reason: 'Léger et savoureux'
        }
      ];
      type = 'popular';
    } else {
      suggestions = [
        {
          name: 'Alloco',
          description: 'Banane plantain frite',
          price: 1500,
          reason: 'Accompagnement populaire'
        },
        {
          name: 'Sauce épicée',
          description: 'Sauce pimentée maison',
          price: 500,
          reason: 'Rehausse tous les plats'
        },
        {
          name: 'Pain local',
          description: 'Pain frais du jour',
          price: 300,
          reason: 'Complément idéal'
        }
      ];
      type = 'complement';
    }

    return { suggestions, type };
  }
};

const generateAISuggestions = async (request: SuggestionRequest) => {
  const context = `
Contexte restaurant africain:
- Articles actuels: ${request.currentItems.map(item => item.product?.name || 'Article').join(', ')}
- Nombre de clients: ${request.customerCount}
- Moment: ${request.timeOfDay}
- Suggestions demandées: 3 produits complémentaires ou populaires
`;

  // Essayer les providers dans l'ordre
  const providers = [openAIProvider, perplexityProvider, fallbackProvider];
  
  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name} provider...`);
      const result = await provider.generateSuggestions(context);
      console.log(`${provider.name} succeeded:`, result);
      
      return {
        suggestions: result.suggestions,
        type: result.type,
        provider: provider.name
      };
    } catch (error) {
      console.log(`${provider.name} failed:`, error.message);
      continue;
    }
  }

  throw new Error('All AI providers failed');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: SuggestionRequest = await req.json();

    const result = await generateAISuggestions(request);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-smart-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [],
      type: 'popular',
      provider: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});