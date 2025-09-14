import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerAnalyticsOptions {
  orgId: string;
  timeframe?: string;
  customerSegment?: string;
  enabled?: boolean;
}

type AnalysisType = 'behavior' | 'satisfaction' | 'churn' | 'lifetime_value' | 'segmentation';

interface AnalyticsData {
  metadata: {
    analysisType: string;
    timeframe: string;
    dataPoints: number;
    confidence: number;
    timestamp: string;
  };
  [key: string]: any;
}

export const useCustomerAnalytics = ({ 
  orgId, 
  timeframe = '30d',
  customerSegment,
  enabled = true 
}: CustomerAnalyticsOptions) => {
  const queryClient = useQueryClient();

  // Query pour l'analyse comportementale
  const behaviorAnalytics = useQuery({
    queryKey: ['customer-analytics', 'behavior', orgId, timeframe],
    queryFn: async (): Promise<AnalyticsData> => {
      // Récupération des données comportementales
      const { data: reservations } = await supabase
        .from('reservations')
        .select('*')
        .eq('org_id', orgId);

      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('org_id', orgId);

      const behaviorData = {
        reservations: reservations?.slice(-100) || [],
        transactions: transactions?.slice(-100) || [],
        timeframe
      };

      const { data, error } = await supabase.functions.invoke('ai-customer-analytics', {
        body: {
          orgId,
          timeframe,
          analysisType: 'behavior',
          data: behaviorData
        }
      });

      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  // Query pour l'analyse de satisfaction
  const satisfactionAnalytics = useQuery({
    queryKey: ['customer-analytics', 'satisfaction', orgId, timeframe],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: guests } = await supabase
        .from('guests')
        .select('*')
        .eq('org_id', orgId);

      const satisfactionData = {
        customers: guests?.slice(-50) || [],
        timeframe
      };

      const { data, error } = await supabase.functions.invoke('ai-customer-analytics', {
        body: {
          orgId,
          timeframe,
          analysisType: 'satisfaction',
          data: satisfactionData
        }
      });

      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  });

  // Query pour l'analyse de churn
  const churnAnalytics = useQuery({
    queryKey: ['customer-analytics', 'churn', orgId, timeframe],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: guests } = await supabase
        .from('guests')
        .select(`
          *,
          guest_stays!inner(*)
        `)
        .eq('org_id', orgId);

      const churnData = {
        customerHistory: guests || [],
        timeframe
      };

      const { data, error } = await supabase.functions.invoke('ai-customer-analytics', {
        body: {
          orgId,
          timeframe,
          analysisType: 'churn',
          data: churnData
        }
      });

      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false
  });

  // Query pour l'analyse de valeur vie client
  const lifetimeValueAnalytics = useQuery({
    queryKey: ['customer-analytics', 'lifetime_value', orgId, timeframe],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          guests(*)
        `)
        .eq('org_id', orgId);

      const clvData = {
        customerTransactions: transactions || [],
        timeframe
      };

      const { data, error } = await supabase.functions.invoke('ai-customer-analytics', {
        body: {
          orgId,
          timeframe,
          analysisType: 'lifetime_value',
          data: clvData
        }
      });

      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false
  });

  // Query pour la segmentation automatique
  const segmentationAnalytics = useQuery({
    queryKey: ['customer-analytics', 'segmentation', orgId, timeframe],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: customers } = await supabase
        .from('guests')
        .select(`
          *,
          payment_transactions(*),
          guest_stays(*)
        `)
        .eq('org_id', orgId);

      const segmentationData = {
        fullCustomerData: customers || [],
        timeframe
      };

      const { data, error } = await supabase.functions.invoke('ai-customer-analytics', {
        body: {
          orgId,
          timeframe,
          analysisType: 'segmentation',
          data: segmentationData
        }
      });

      if (error) throw error;
      return data;
    },
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false
  });

  // Mutation pour lancer une analyse personnalisée
  const runCustomAnalysis = useMutation({
    mutationFn: async ({ analysisType, customData }: { analysisType: AnalysisType; customData?: any }) => {
      const { data, error } = await supabase.functions.invoke('ai-customer-analytics', {
        body: {
          orgId,
          timeframe,
          analysisType,
          data: customData
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalider les queries liées
      queryClient.invalidateQueries({ 
        queryKey: ['customer-analytics', variables.analysisType, orgId] 
      });
    }
  });

  // Fonction pour rafraîchir toutes les analyses
  const refreshAllAnalytics = () => {
    queryClient.invalidateQueries({ 
      queryKey: ['customer-analytics', undefined, orgId] 
    });
  };

  return {
    // Données d'analyse
    behaviorAnalytics: {
      data: behaviorAnalytics.data,
      isLoading: behaviorAnalytics.isLoading,
      error: behaviorAnalytics.error
    },
    
    satisfactionAnalytics: {
      data: satisfactionAnalytics.data,
      isLoading: satisfactionAnalytics.isLoading,
      error: satisfactionAnalytics.error
    },
    
    churnAnalytics: {
      data: churnAnalytics.data,
      isLoading: churnAnalytics.isLoading,
      error: churnAnalytics.error
    },
    
    lifetimeValueAnalytics: {
      data: lifetimeValueAnalytics.data,
      isLoading: lifetimeValueAnalytics.isLoading,
      error: lifetimeValueAnalytics.error
    },
    
    segmentationAnalytics: {
      data: segmentationAnalytics.data,
      isLoading: segmentationAnalytics.isLoading,
      error: segmentationAnalytics.error
    },

    // Actions
    runCustomAnalysis: runCustomAnalysis.mutate,
    refreshAllAnalytics,
    
    // État global
    isAnyLoading: [
      behaviorAnalytics.isLoading,
      satisfactionAnalytics.isLoading,
      churnAnalytics.isLoading,
      lifetimeValueAnalytics.isLoading,
      segmentationAnalytics.isLoading
    ].some(Boolean),
    
    hasErrors: [
      behaviorAnalytics.error,
      satisfactionAnalytics.error,
      churnAnalytics.error,
      lifetimeValueAnalytics.error,
      segmentationAnalytics.error
    ].some(Boolean)
  };
};