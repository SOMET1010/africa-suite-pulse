import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  context?: string;
  orgId: string;
  language: 'fr' | 'en';
}

const systemPrompt = {
  fr: `Tu es l'assistant IA d'Africa Suite, une plateforme de gestion hôtelière et de restauration.
Tu aides les utilisateurs avec:
- Gestion des réservations et chambres
- Système POS et commandes
- Analytics et revenue management
- Questions sur l'utilisation de la plateforme

Réponds de manière concise et professionnelle en français.
Si tu ne peux pas aider, oriente vers le support humain.`,
  
  en: `You are the AI assistant for Africa Suite, a hospitality and restaurant management platform.
You help users with:
- Reservations and room management
- POS system and orders
- Analytics and revenue management
- Platform usage questions

Answer concisely and professionally in English.
If you cannot help, direct to human support.`
};

const generateOpenAIResponse = async (message: string, language: 'fr' | 'en', context?: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt[language] + (context ? `\n\nContexte: ${context}` : '') },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const generatePerplexityResponse = async (message: string, language: 'fr' | 'en', context?: string) => {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { role: 'system', content: systemPrompt[language] },
        { role: 'user', content: message }
      ],
      max_tokens: 250,
      temperature: 0.6
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const generateFallbackResponse = (message: string, language: 'fr' | 'en') => {
  const responses = {
    fr: {
      reservation: "Pour gérer vos réservations, utilisez le module Réservations dans le menu principal. Vous pouvez créer, modifier et suivre toutes vos réservations.",
      pos: "Le système POS vous permet de gérer vos commandes et paiements. Accédez-y via le menu POS pour traiter les commandes.",
      analytics: "Les analytics vous donnent une vue d'ensemble de vos performances. Consultez le dashboard Analytics pour vos KPIs.",
      default: "Je suis là pour vous aider avec Africa Suite. Posez-moi vos questions sur les réservations, le POS, ou les analytics. Pour un support personnalisé, contactez notre équipe."
    },
    en: {
      reservation: "To manage your reservations, use the Reservations module in the main menu. You can create, modify and track all your bookings.",
      pos: "The POS system allows you to manage orders and payments. Access it via the POS menu to process orders.",
      analytics: "Analytics give you an overview of your performance. Check the Analytics dashboard for your KPIs.",
      default: "I'm here to help you with Africa Suite. Ask me about reservations, POS, or analytics. For personalized support, contact our team."
    }
  };

  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('réservation') || lowerMessage.includes('reservation') || lowerMessage.includes('booking')) {
    return responses[language].reservation;
  } else if (lowerMessage.includes('pos') || lowerMessage.includes('commande') || lowerMessage.includes('order')) {
    return responses[language].pos;
  } else if (lowerMessage.includes('analytics') || lowerMessage.includes('statistique') || lowerMessage.includes('performance')) {
    return responses[language].analytics;
  } else {
    return responses[language].default;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context, language = 'fr' }: ChatRequest = await req.json();

    let response;
    let provider = 'fallback';

    // Essayer les providers dans l'ordre
    try {
      response = await generateOpenAIResponse(message, language, context);
      provider = 'OpenAI';
    } catch (error) {
      console.log('OpenAI failed:', error.message);
      try {
        response = await generatePerplexityResponse(message, language, context);
        provider = 'Perplexity';
      } catch (error2) {
        console.log('Perplexity failed:', error2.message);
        response = generateFallbackResponse(message, language);
        provider = 'Fallback';
      }
    }

    return new Response(JSON.stringify({
      response,
      provider,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat-assistant:', error);
    
    const errorResponse = {
      fr: "Désolé, je rencontre un problème technique. Veuillez réessayer ou contacter le support.",
      en: "Sorry, I'm experiencing technical issues. Please try again or contact support."
    };

    return new Response(JSON.stringify({
      response: errorResponse.fr,
      provider: 'error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});