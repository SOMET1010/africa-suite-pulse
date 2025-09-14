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

interface InventoryPredictionRequest {
  orgId: string;
  outletId?: string;
  forecastPeriod: 'week' | 'month';
  salesForecast?: number;
  events?: string[];
  seasonality?: 'low' | 'medium' | 'high';
}

interface StockPrediction {
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  predictedConsumption: number;
  reorderPoint: number;
  suggestedOrderQuantity: number;
  daysOfStock: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  costImpact: number;
  alternatives?: string[];
}

interface InventoryOptimization {
  outletId: string;
  forecastPeriod: string;
  predictions: StockPrediction[];
  summary: {
    totalItems: number;
    itemsToReorder: number;
    criticalItems: number;
    estimatedCost: number;
    potentialSavings: number;
  };
  alerts: Array<{
    type: 'stockout' | 'overstock' | 'expiry' | 'cost_optimization';
    message: string;
    products: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  aiRecommendations: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orgId,
      outletId,
      forecastPeriod = 'week',
      salesForecast = 0,
      events = [],
      seasonality = 'medium'
    }: InventoryPredictionRequest = await req.json();

    // Get current inventory data
    const { data: inventory } = await supabase
      .from('pos_stock_items')
      .select(`
        id,
        product_id,
        current_stock,
        minimum_stock,
        maximum_stock,
        unit_cost,
        pos_products (
          name,
          category,
          unit_sale
        )
      `)
      .eq('org_id', orgId)
      .eq('outlet_id', outletId || '');

    // Get historical sales data
    const daysBack = forecastPeriod === 'week' ? 30 : 90;
    const { data: salesHistory } = await supabase
      .from('pos_order_items')
      .select(`
        product_id,
        quantity,
        created_at,
        pos_orders!inner (
          org_id,
          outlet_id,
          status
        )
      `)
      .eq('pos_orders.org_id', orgId)
      .eq('pos_orders.outlet_id', outletId || '')
      .eq('pos_orders.status', 'completed')
      .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());

    // Generate predictions
    const predictions = generateStockPredictions({
      inventory: inventory || [],
      salesHistory: salesHistory || [],
      forecastPeriod,
      salesForecast,
      events,
      seasonality
    });

    // Generate alerts
    const alerts = generateInventoryAlerts(predictions);

    // Calculate summary
    const summary = calculateInventorySummary(predictions);

    // Generate AI recommendations
    let aiRecommendations = generateFallbackRecommendations(predictions, alerts, summary);
    
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (openAIKey) {
      try {
        aiRecommendations = await generateAIRecommendations(
          openAIKey,
          predictions,
          alerts,
          summary,
          { forecastPeriod, events, seasonality }
        );
      } catch (error) {
        console.log('Using fallback recommendations:', error);
      }
    }

    const result: InventoryOptimization = {
      outletId: outletId || 'main',
      forecastPeriod,
      predictions,
      summary,
      alerts,
      aiRecommendations
    };

    // Log the prediction
    await supabase
      .from('inventory_predictions_log')
      .insert({
        org_id: orgId,
        outlet_id: outletId,
        forecast_period: forecastPeriod,
        predictions: result
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in inventory prediction:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Inventory prediction failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateStockPredictions(params: any): StockPrediction[] {
  const {
    inventory,
    salesHistory,
    forecastPeriod,
    salesForecast,
    events,
    seasonality
  } = params;

  const forecastDays = forecastPeriod === 'week' ? 7 : 30;
  
  // Seasonality multipliers
  const seasonalMultipliers = {
    'low': 0.8,
    'medium': 1.0,
    'high': 1.3
  };
  
  // Events multiplier
  const eventsMultiplier = events.length > 0 ? 1.2 : 1.0;
  
  return inventory.map((item: any) => {
    // Calculate historical consumption
    const itemSales = salesHistory.filter((sale: any) => sale.product_id === item.product_id);
    const totalSold = itemSales.reduce((sum: number, sale: any) => sum + sale.quantity, 0);
    const salesPeriod = Math.max(1, salesHistory.length > 0 ? 
      (Date.now() - new Date(salesHistory[salesHistory.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24) : 30
    );
    
    const dailyConsumption = totalSold / salesPeriod;
    
    // Apply modifiers
    const baseConsumption = dailyConsumption * seasonalMultipliers[seasonality] * eventsMultiplier;
    const predictedConsumption = Math.ceil(baseConsumption * forecastDays);
    
    // Calculate reorder point and quantity
    const leadTime = 3; // Assume 3 days lead time
    const safetyStock = Math.ceil(dailyConsumption * leadTime * 1.5);
    const reorderPoint = Math.max(item.minimum_stock || 0, safetyStock);
    
    // Economic order quantity (simplified)
    const monthlyDemand = dailyConsumption * 30;
    const suggestedOrderQuantity = Math.ceil(Math.sqrt(2 * monthlyDemand * 50 / (item.unit_cost || 1)) / 10) * 10; // Round to 10s
    
    // Days of stock remaining
    const daysOfStock = dailyConsumption > 0 ? item.current_stock / dailyConsumption : 999;
    
    // Determine urgency
    let urgency: 'low' | 'medium' | 'high' | 'critical';
    if (item.current_stock <= reorderPoint) {
      urgency = daysOfStock <= 2 ? 'critical' : 'high';
    } else if (daysOfStock <= 7) {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }
    
    // Generate reasoning
    const reasoning = generateStockReasoning(
      item,
      predictedConsumption,
      daysOfStock,
      urgency,
      events
    );
    
    // Calculate cost impact
    const costImpact = urgency === 'critical' ? 
      (item.unit_cost || 0) * suggestedOrderQuantity : 0;
    
    return {
      productId: item.product_id,
      productName: item.pos_products?.name || 'Produit inconnu',
      category: item.pos_products?.category || 'Général',
      currentStock: item.current_stock,
      predictedConsumption,
      reorderPoint,
      suggestedOrderQuantity,
      daysOfStock: Math.round(daysOfStock),
      urgency,
      reasoning,
      costImpact,
      alternatives: generateAlternatives(item.pos_products?.category)
    };
  });
}

function generateStockReasoning(
  item: any,
  predictedConsumption: number,
  daysOfStock: number,
  urgency: string,
  events: string[]
): string {
  const productName = item.pos_products?.name || 'ce produit';
  const eventsText = events.length > 0 ? ` avec ${events.length} événement(s) prévus` : '';
  
  if (urgency === 'critical') {
    return `Stock critique pour ${productName}. Rupture imminente dans ${Math.round(daysOfStock)} jours${eventsText}. Commande urgente nécessaire.`;
  } else if (urgency === 'high') {
    return `Stock faible pour ${productName}. Réapprovisionnement recommandé sous 2-3 jours${eventsText}.`;
  } else if (urgency === 'medium') {
    return `Stock modéré pour ${productName}. Prévoir réapprovisionnement dans la semaine${eventsText}.`;
  } else {
    return `Stock suffisant pour ${productName}. Consommation prévue: ${predictedConsumption} unités.`;
  }
}

function generateAlternatives(category: string): string[] {
  const alternatives: Record<string, string[]> = {
    'Boissons': ['Produits de substitution', 'Marques alternatives', 'Formats différents'],
    'Nourriture': ['Ingrédients de remplacement', 'Fournisseur alternatif', 'Menu adaptatif'],
    'Nettoyage': ['Produits équivalents', 'Concentrés', 'Marques génériques'],
    'default': ['Fournisseur de backup', 'Produit équivalent', 'Stock de sécurité']
  };
  
  return alternatives[category] || alternatives.default;
}

function generateInventoryAlerts(predictions: StockPrediction[]) {
  const alerts = [];
  
  // Critical stockout alerts
  const criticalItems = predictions.filter(p => p.urgency === 'critical');
  if (criticalItems.length > 0) {
    alerts.push({
      type: 'stockout' as const,
      message: `${criticalItems.length} produit(s) en rupture imminente`,
      products: criticalItems.map(p => p.productName),
      priority: 'critical' as const
    });
  }
  
  // Overstock alerts
  const overstockItems = predictions.filter(p => p.daysOfStock > 60);
  if (overstockItems.length > 0) {
    alerts.push({
      type: 'overstock' as const,
      message: `${overstockItems.length} produit(s) en surstock`,
      products: overstockItems.map(p => p.productName),
      priority: 'medium' as const
    });
  }
  
  // High cost impact alerts
  const highCostItems = predictions.filter(p => p.costImpact > 100000);
  if (highCostItems.length > 0) {
    alerts.push({
      type: 'cost_optimization' as const,
      message: `Commandes urgentes représentant ${highCostItems.reduce((sum, p) => sum + p.costImpact, 0).toLocaleString()} F CFA`,
      products: highCostItems.map(p => p.productName),
      priority: 'high' as const
    });
  }
  
  return alerts;
}

function calculateInventorySummary(predictions: StockPrediction[]) {
  const itemsToReorder = predictions.filter(p => p.currentStock <= p.reorderPoint).length;
  const criticalItems = predictions.filter(p => p.urgency === 'critical').length;
  const estimatedCost = predictions.reduce((sum, p) => sum + p.costImpact, 0);
  
  // Calculate potential savings from optimization
  const overstockValue = predictions
    .filter(p => p.daysOfStock > 60)
    .reduce((sum, p) => sum + (p.currentStock * 1000), 0); // Assume average 1000 F CFA per unit
  
  return {
    totalItems: predictions.length,
    itemsToReorder,
    criticalItems,
    estimatedCost,
    potentialSavings: overstockValue * 0.1 // 10% of overstock value as potential savings
  };
}

async function generateAIRecommendations(
  openAIKey: string,
  predictions: StockPrediction[],
  alerts: any[],
  summary: any,
  context: any
) {
  const criticalProducts = predictions.filter(p => p.urgency === 'critical').map(p => p.productName);
  const highValueItems = predictions.filter(p => p.costImpact > 50000).map(p => p.productName);
  
  const prompt = `
  Analyze this restaurant inventory prediction:
  
  Period: ${context.forecastPeriod}
  Events: ${context.events.join(', ') || 'None'}
  Seasonality: ${context.seasonality}
  
  Summary:
  - Total items: ${summary.totalItems}
  - Items to reorder: ${summary.itemsToReorder}
  - Critical items: ${summary.criticalItems}
  - Estimated cost: ${summary.estimatedCost.toLocaleString()} F CFA
  
  Critical products: ${criticalProducts.join(', ') || 'None'}
  High-value orders: ${highValueItems.join(', ') || 'None'}
  
  Provide strategic inventory recommendations in French (2-3 sentences) focusing on cost optimization and avoiding stockouts.
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
        { role: 'system', content: 'You are a restaurant inventory management expert. Provide strategic recommendations in French.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateFallbackRecommendations(
  predictions: StockPrediction[],
  alerts: any[],
  summary: any
): string {
  const criticalCount = summary.criticalItems;
  const reorderCount = summary.itemsToReorder;
  const totalCost = summary.estimatedCost;

  if (criticalCount > 0) {
    return `Action urgente requise : ${criticalCount} produit(s) en rupture imminente nécessitent une commande immédiate. Budget total estimé : ${totalCost.toLocaleString()} F CFA. Prioriser les commandes critiques pour éviter les ruptures de service.`;
  } else if (reorderCount > 0) {
    return `Planification des approvisionnements : ${reorderCount} produit(s) à recommander dans les prochains jours. Optimiser les commandes groupées pour réduire les coûts de livraison et maintenir les niveaux de stock optimaux.`;
  } else {
    return `Stocks bien gérés avec des niveaux appropriés pour tous les produits. Continuer la surveillance quotidienne et maintenir les bonnes pratiques de rotation des stocks pour éviter les pertes.`;
  }
}