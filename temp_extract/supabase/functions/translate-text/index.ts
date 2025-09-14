import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const googleTranslateApiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  context?: {
    guestId?: string;
    roomNumber?: string;
    guestName?: string;
    category?: string;
  };
}

interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  method: 'openai' | 'google' | 'cache';
  confidence?: number;
}

// Prompts spécialisés pour l'hôtellerie
const getHotelPrompt = (context?: any) => {
  const basePrompt = `You are a professional hotel translation assistant. Translate the following text accurately while maintaining the hospitality tone and context.

Guidelines:
- Maintain professional and courteous tone appropriate for hotel interactions
- Keep hotel-specific terminology consistent
- Preserve formatting and structure
- If translating guest communications, maintain the appropriate level of formality
- For room service or housekeeping contexts, use standard hotel vocabulary`;

  if (context?.category) {
    const categoryPrompts = {
      'reception': 'Focus on front desk and check-in/check-out terminology.',
      'housekeeping': 'Use housekeeping and room maintenance vocabulary.',
      'concierge': 'Maintain concierge service tone and local recommendations context.',
      'restaurant': 'Use dining and food service terminology.',
      'maintenance': 'Focus on technical and maintenance vocabulary.'
    };
    return basePrompt + '\n\n' + (categoryPrompts[context.category] || '');
  }

  return basePrompt;
};

// Sanitiser les données PII
const sanitizeText = (text: string): string => {
  // Remplacer les numéros de téléphone, emails, et autres données sensibles
  return text
    .replace(/\b\d{10,15}\b/g, '[PHONE]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]');
};

// Cache simple en mémoire (pour l'optimisation des coûts)
const translationCache = new Map<string, { result: TranslationResponse; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

const getCacheKey = (text: string, target: string, source?: string): string => {
  return `${source || 'auto'}-${target}-${text.slice(0, 100)}`;
};

async function translateWithOpenAI(
  text: string, 
  targetLanguage: string, 
  sourceLanguage?: string,
  context?: any
): Promise<TranslationResponse> {
  const sanitizedText = sanitizeText(text);
  
  const prompt = `${getHotelPrompt(context)}

Source language: ${sourceLanguage || 'auto-detect'}
Target language: ${targetLanguage}

Text to translate: "${sanitizedText}"

Respond with ONLY the translated text, no explanations or additional content.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional hotel translation service.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const translatedText = data.choices[0].message.content.trim();

  return {
    translatedText,
    sourceLanguage: sourceLanguage || 'auto',
    targetLanguage,
    method: 'openai',
    confidence: 0.95
  };
}

async function translateWithGoogle(
  text: string, 
  targetLanguage: string, 
  sourceLanguage?: string
): Promise<TranslationResponse> {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: sanitizeText(text),
      target: targetLanguage,
      source: sourceLanguage,
      format: 'text'
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.statusText}`);
  }

  const data = await response.json();
  const translation = data.data.translations[0];

  return {
    translatedText: translation.translatedText,
    sourceLanguage: translation.detectedSourceLanguage || sourceLanguage || 'auto',
    targetLanguage,
    method: 'google',
    confidence: 0.8
  };
}

async function logTranslation(
  userId: string | null,
  request: TranslationRequest,
  response: TranslationResponse,
  orgId?: string
) {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        org_id: orgId,
        action: 'translate',
        table_name: 'translation_service',
        new_values: {
          source_text_length: request.text.length,
          target_language: request.targetLanguage,
          source_language: response.sourceLanguage,
          method: response.method,
          context: request.context,
          confidence: response.confidence
        },
        severity: 'info'
      });
  } catch (error) {
    console.error('Failed to log translation:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let orgId: string | undefined;

    // Vérifier l'authentification si présente
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        
        // Récupérer l'org de l'utilisateur
        const { data: appUser } = await supabase
          .from('app_users')
          .select('org_id')
          .eq('user_id', user.id)
          .single();
        
        orgId = appUser?.org_id;
      }
    }

    const requestData: TranslationRequest = await req.json();
    const { text, targetLanguage, sourceLanguage, context } = requestData;

    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Text and target language are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Vérifier le cache
    const cacheKey = getCacheKey(text, targetLanguage, sourceLanguage);
    const cached = translationCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Cache hit for translation');
      return new Response(
        JSON.stringify({ ...cached.result, method: 'cache' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let result: TranslationResponse;

    // Essayer OpenAI en premier
    if (openAIApiKey) {
      try {
        console.log('Attempting translation with OpenAI');
        result = await translateWithOpenAI(text, targetLanguage, sourceLanguage, context);
      } catch (error) {
        console.error('OpenAI translation failed:', error);
        
        // Fallback vers Google Translate
        if (googleTranslateApiKey) {
          console.log('Falling back to Google Translate');
          result = await translateWithGoogle(text, targetLanguage, sourceLanguage);
        } else {
          throw new Error('Both OpenAI and Google Translate are unavailable');
        }
      }
    } else if (googleTranslateApiKey) {
      console.log('Using Google Translate');
      result = await translateWithGoogle(text, targetLanguage, sourceLanguage);
    } else {
      throw new Error('No translation service configured');
    }

    // Mettre en cache le résultat
    translationCache.set(cacheKey, { result, timestamp: Date.now() });

    // Logger la traduction
    await logTranslation(userId, requestData, result, orgId);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Translation failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});