import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';

interface PricingOptimization {
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

export function usePricingOptimization() {
  const { orgId } = useOrgId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizePrice = async (params: {
    roomTypeCode: string;
    targetDate: string;
    currentPrice: number;
    occupancyRate: number;
    demandForecast: number;
    competitorRates?: Record<string, number>;
    seasonality?: 'low' | 'medium' | 'high';
    events?: string[];
  }): Promise<PricingOptimization | null> => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('pricing-optimization', {
        body: {
          orgId,
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
      console.error('Erreur optimisation pricing:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const runAutomaticOptimization = async (roomTypes: string[], days: number = 7) => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = [];
      const baseDate = new Date();

      for (let day = 0; day < days; day++) {
        const targetDate = new Date(baseDate);
        targetDate.setDate(baseDate.getDate() + day);

        for (const roomType of roomTypes) {
          // Mock current conditions - in real app, fetch from analytics
          const mockConditions = {
            currentPrice: 50000,
            occupancyRate: 65 + Math.random() * 30,
            demandForecast: 70 + Math.random() * 25,
            seasonality: 'medium' as const,
            events: day % 3 === 0 ? ['Conference'] : []
          };

          const optimization = await optimizePrice({
            roomTypeCode: roomType,
            targetDate: targetDate.toISOString().split('T')[0],
            ...mockConditions
          });

          if (optimization) {
            results.push({
              date: targetDate.toISOString().split('T')[0],
              roomType,
              ...optimization
            });
          }
        }
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur optimisation automatique';
      setError(errorMessage);
      console.error('Erreur optimisation automatique:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    optimizePrice,
    runAutomaticOptimization,
    isLoading,
    error
  };
}