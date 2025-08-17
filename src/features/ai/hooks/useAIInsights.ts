import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';

interface AIInsight {
  type: 'revenue' | 'occupancy' | 'operations' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric: string;
}

interface AIRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
  timeframe: string;
}

interface InsightsResponse {
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  summary: string;
  provider: string;
  generatedAt: string;
}

export function useAIInsights() {
  const { orgId } = useOrgId();
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async (analyticsData: any, period: 'week' | 'month' | 'quarter' = 'week') => {
    if (!orgId) {
      setError('Organisation ID manquant');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('ai-business-insights', {
        body: {
          analyticsData,
          orgId,
          period
        }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setInsights(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur génération insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    insights,
    isLoading,
    error,
    generateInsights
  };
}