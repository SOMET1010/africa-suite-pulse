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

interface PricingOptimizationRequest {
  orgId: string;
  roomTypeCode: string;
  targetDate: string;
  currentPrice: number;
  occupancyRate: number;
  demandForecast: number;
  competitorRates?: Record<string, number>;
  seasonality?: 'low' | 'medium' | 'high';
  events?: string[];
}

interface OptimizedPricing {
  recommendedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  confidence: number;
  reasoning: string;
  expectedRevenue: number;
  expectedOccupancy: number;
  strategy: 'aggressive' | 'moderate' | 'conservative';
  marketPosition: 'premium' | 'competitive' | 'value';
  triggers: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      orgId, 
      roomTypeCode, 
      targetDate, 
      currentPrice, 
      occupancyRate, 
      demandForecast,
      competitorRates = {},
      seasonality = 'medium',
      events = []
    }: PricingOptimizationRequest = await req.json();

    // Fetch historical data for better optimization
    const { data: historicalData } = await supabase
      .from('reservations')
      .select('rate_total, date_arrival, adults, children')
      .eq('org_id', orgId)
      .gte('date_arrival', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('date_arrival', { ascending: false });

    // Calculate optimization factors
    const optimizationFactors = calculateOptimizationFactors({
      occupancyRate,
      demandForecast,
      seasonality,
      events,
      competitorRates,
      historicalData: historicalData || []
    });

    // Determine optimal pricing strategy
    const pricingStrategy = determinePricingStrategy(optimizationFactors);
    
    // Calculate optimized price
    const optimizedPrice = calculateOptimizedPrice(
      currentPrice, 
      pricingStrategy, 
      optimizationFactors
    );

    // Generate AI reasoning using OpenAI if available
    let aiReasoning = generateFallbackReasoning(optimizationFactors, optimizedPrice, currentPrice);
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (openAIKey) {
      try {
        const aiResponse = await generateAIReasoning(
          openAIKey,
          optimizationFactors,
          optimizedPrice,
          currentPrice
        );
        aiReasoning = aiResponse;
      } catch (error) {
        console.log('OpenAI fallback, using rule-based reasoning:', error);
      }
    }

    const result: OptimizedPricing = {
      recommendedPrice: optimizedPrice.price,
      priceChange: optimizedPrice.price - currentPrice,
      priceChangePercent: ((optimizedPrice.price - currentPrice) / currentPrice) * 100,
      confidence: optimizedPrice.confidence,
      reasoning: aiReasoning,
      expectedRevenue: optimizedPrice.expectedRevenue,
      expectedOccupancy: optimizedPrice.expectedOccupancy,
      strategy: pricingStrategy.strategy,
      marketPosition: pricingStrategy.marketPosition,
      triggers: optimizationFactors.triggers
    };

    // Log the optimization for audit trail
    await supabase
      .from('pricing_optimization_log')
      .insert({
        org_id: orgId,
        room_type_code: roomTypeCode,
        target_date: targetDate,
        current_price: currentPrice,
        recommended_price: optimizedPrice.price,
        confidence: optimizedPrice.confidence,
        factors: optimizationFactors,
        result: result
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pricing optimization:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Pricing optimization failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateOptimizationFactors(params: any) {
  const {
    occupancyRate,
    demandForecast,
    seasonality,
    events,
    competitorRates,
    historicalData
  } = params;

  const triggers = [];
  
  // Demand pressure factor
  let demandPressure = 1.0;
  if (occupancyRate > 85) {
    demandPressure = 1.2;
    triggers.push('High occupancy rate');
  } else if (occupancyRate < 50) {
    demandPressure = 0.8;
    triggers.push('Low occupancy rate');
  }

  // Seasonality factor
  const seasonalityFactors = {
    'low': 0.9,
    'medium': 1.0,
    'high': 1.15
  };
  const seasonalityMultiplier = seasonalityFactors[seasonality];
  if (seasonality === 'high') triggers.push('High season');

  // Events factor
  let eventsMultiplier = 1.0;
  if (events.length > 0) {
    eventsMultiplier = 1.1;
    triggers.push(`Events: ${events.join(', ')}`);
  }

  // Competitor analysis
  let competitorFactor = 1.0;
  if (Object.keys(competitorRates).length > 0) {
    const avgCompetitorRate = Object.values(competitorRates).reduce((a, b) => a + b, 0) / Object.values(competitorRates).length;
    // If we're significantly below competitors, we can increase
    if (avgCompetitorRate > 0) {
      competitorFactor = Math.min(1.15, avgCompetitorRate / 45000); // Assuming base of 45k
      triggers.push('Competitor analysis');
    }
  }

  // Historical performance
  let historicalFactor = 1.0;
  if (historicalData.length > 0) {
    const avgHistoricalRate = historicalData.reduce((sum: number, res: any) => sum + (res.rate_total || 0), 0) / historicalData.length;
    if (avgHistoricalRate > 0) {
      historicalFactor = Math.min(1.1, Math.max(0.95, avgHistoricalRate / 45000));
    }
  }

  return {
    demandPressure,
    seasonalityMultiplier,
    eventsMultiplier,
    competitorFactor,
    historicalFactor,
    demandForecast,
    triggers,
    combinedMultiplier: demandPressure * seasonalityMultiplier * eventsMultiplier * competitorFactor * historicalFactor
  };
}

function determinePricingStrategy(factors: any) {
  const { combinedMultiplier, demandPressure } = factors;
  
  let strategy: 'aggressive' | 'moderate' | 'conservative';
  let marketPosition: 'premium' | 'competitive' | 'value';

  if (combinedMultiplier >= 1.15 && demandPressure >= 1.1) {
    strategy = 'aggressive';
    marketPosition = 'premium';
  } else if (combinedMultiplier <= 0.9) {
    strategy = 'conservative';
    marketPosition = 'value';
  } else {
    strategy = 'moderate';
    marketPosition = 'competitive';
  }

  return { strategy, marketPosition };
}

function calculateOptimizedPrice(currentPrice: number, strategy: any, factors: any) {
  const { combinedMultiplier } = factors;
  
  // Base price adjustment
  let baseAdjustment = combinedMultiplier;
  
  // Strategy-specific adjustments
  const strategyAdjustments = {
    'aggressive': { min: 1.05, max: 1.25 },
    'moderate': { min: 0.95, max: 1.15 },
    'conservative': { min: 0.85, max: 1.05 }
  };
  
  const strategyLimits = strategyAdjustments[strategy.strategy];
  baseAdjustment = Math.max(strategyLimits.min, Math.min(strategyLimits.max, baseAdjustment));
  
  const optimizedPrice = Math.round(currentPrice * baseAdjustment);
  
  // Calculate confidence based on how many factors are in alignment
  const confidence = Math.min(95, Math.max(60, 
    70 + (factors.triggers.length * 5) + 
    (Math.abs(baseAdjustment - 1) < 0.05 ? 10 : 0)
  ));

  // Estimate expected outcomes
  const priceChangePercent = (baseAdjustment - 1) * 100;
  let expectedOccupancyChange = 0;
  
  if (priceChangePercent > 0) {
    expectedOccupancyChange = -priceChangePercent * 0.3; // Price elasticity estimate
  } else {
    expectedOccupancyChange = -priceChangePercent * 0.4;
  }

  const expectedOccupancy = Math.max(30, Math.min(100, factors.demandForecast + expectedOccupancyChange));
  const expectedRevenue = optimizedPrice * (expectedOccupancy / 100);

  return {
    price: optimizedPrice,
    confidence,
    expectedRevenue,
    expectedOccupancy
  };
}

async function generateAIReasoning(
  openAIKey: string, 
  factors: any, 
  optimizedPrice: any, 
  currentPrice: number
) {
  const prompt = `
  Analyze this hotel pricing optimization and provide a concise professional explanation:
  
  Current Price: ${currentPrice.toLocaleString()} F CFA
  Recommended Price: ${optimizedPrice.price.toLocaleString()} F CFA
  Change: ${((optimizedPrice.price - currentPrice) / currentPrice * 100).toFixed(1)}%
  
  Factors:
  - Demand Pressure: ${factors.demandPressure}
  - Combined Multiplier: ${factors.combinedMultiplier.toFixed(2)}
  - Triggers: ${factors.triggers.join(', ')}
  
  Provide a clear, business-focused explanation in French of why this price change is recommended, in 2-3 sentences max.
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
        { role: 'system', content: 'You are a hotel revenue management expert. Provide concise, professional explanations in French.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateFallbackReasoning(factors: any, optimizedPrice: any, currentPrice: number) {
  const change = ((optimizedPrice.price - currentPrice) / currentPrice * 100).toFixed(1);
  const triggers = factors.triggers.join(', ');
  
  if (optimizedPrice.price > currentPrice) {
    return `Augmentation de ${change}% recommandée en raison de : ${triggers}. La demande élevée et les conditions du marché justifient cette optimisation tarifaire pour maximiser les revenus.`;
  } else {
    return `Réduction de ${Math.abs(parseFloat(change))}% recommandée pour stimuler la demande. Facteurs: ${triggers}. Cette stratégie vise à améliorer l'occupation et la compétitivité.`;
  }
}