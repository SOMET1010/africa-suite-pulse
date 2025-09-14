import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';

interface StaffingRecommendation {
  department: string;
  currentStaff: number;
  recommendedStaff: number;
  difference: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  skillsNeeded: string[];
  shiftPatterns: Array<{
    shift: string;
    staffNeeded: number;
    roles: string[];
  }>;
}

interface StaffingOptimization {
  date: string;
  totalCurrentStaff: number;
  totalRecommendedStaff: number;
  recommendations: StaffingRecommendation[];
  costImpact: {
    currentCost: number;
    recommendedCost: number;
    savings: number;
  };
  efficiency: {
    guestToStaffRatio: number;
    revenuePerStaff: number;
    productivityScore: number;
  };
  aiInsights: string;
}

export function useStaffingOptimization() {
  const { orgId } = useOrgId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeStaffing = async (params: {
    date: string;
    forecastedOccupancy: number;
    forecastedRevenue: number;
    events?: string[];
    currentStaffLevels?: Record<string, number>;
  }): Promise<StaffingOptimization | null> => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('staffing-optimization', {
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
      console.error('Erreur optimisation staffing:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyStaffing = async (startDate: Date) => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = [];

      for (let day = 0; day < 7; day++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + day);

        // Mock forecasts - in real app, get from analytics
        const occupancyForecast = 60 + Math.random() * 35; // 60-95%
        const revenueForecast = occupancyForecast * 800000; // Revenue correlation

        const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
        const events = isWeekend ? ['Weekend Rush'] : [];

        const optimization = await optimizeStaffing({
          date: targetDate.toISOString().split('T')[0],
          forecastedOccupancy: occupancyForecast,
          forecastedRevenue: revenueForecast,
          events,
          currentStaffLevels: {
            reception: 2,
            housekeeping: 8,
            restaurant: 6,
            security: 2,
            maintenance: 2
          }
        });

        if (optimization) {
          results.push(optimization);
        }
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur génération planning';
      setError(errorMessage);
      console.error('Erreur génération planning:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    optimizeStaffing,
    generateWeeklyStaffing,
    isLoading,
    error
  };
}