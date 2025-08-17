import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';

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

export function useInventoryPrediction() {
  const { orgId } = useOrgId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictInventory = async (params: {
    outletId?: string;
    forecastPeriod?: 'week' | 'month';
    salesForecast?: number;
    events?: string[];
    seasonality?: 'low' | 'medium' | 'high';
  }): Promise<InventoryOptimization | null> => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('inventory-prediction', {
        body: {
          orgId,
          forecastPeriod: 'week',
          ...params
        }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur prédiction inventaire:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const runDailyInventoryCheck = async (outletIds: string[] = ['main']) => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = [];

      for (const outletId of outletIds) {
        const prediction = await predictInventory({
          outletId,
          forecastPeriod: 'week',
          seasonality: 'medium',
          events: []
        });

        if (prediction) {
          results.push(prediction);
        }
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur vérification inventaire';
      setError(errorMessage);
      console.error('Erreur vérification inventaire:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const generatePurchaseOrders = (predictions: StockPrediction[]) => {
    const urgentItems = predictions.filter(p => p.urgency === 'critical' || p.urgency === 'high');
    const mediumItems = predictions.filter(p => p.urgency === 'medium');
    
    return {
      urgent: {
        items: urgentItems,
        totalCost: urgentItems.reduce((sum, item) => sum + item.costImpact, 0),
        deadline: 'Immédiat'
      },
      medium: {
        items: mediumItems,
        totalCost: mediumItems.reduce((sum, item) => sum + item.costImpact, 0),
        deadline: '2-3 jours'
      },
      total: {
        items: urgentItems.length + mediumItems.length,
        cost: urgentItems.reduce((sum, item) => sum + item.costImpact, 0) + 
              mediumItems.reduce((sum, item) => sum + item.costImpact, 0)
      }
    };
  };

  return {
    predictInventory,
    runDailyInventoryCheck,
    generatePurchaseOrders,
    isLoading,
    error
  };
}