import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdvancedAnalyticsData } from "../types/advanced";
import { useOrgId } from "@/core/auth/useOrg";

export function useAdvancedAnalytics() {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['advanced-analytics', orgId],
    queryFn: async (): Promise<AdvancedAnalyticsData> => {
      if (!orgId) throw new Error('Organization ID required');

      // Call edge function for AI-powered analytics
      const { data, error } = await supabase.functions.invoke('advanced-analytics', {
        body: { orgId }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useGenerateInsights() {
  const { orgId } = useOrgId();

  return async (context?: string) => {
    if (!orgId) throw new Error('Organization ID required');

    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: { 
        orgId,
        context: context || 'general_analysis'
      }
    });

    if (error) throw error;
    return data;
  };
}