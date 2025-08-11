import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportTemplate, ReportGeneration } from "../types";
import { useOrgId } from "@/core/auth/useOrg";

export function useReportTemplates() {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['report-templates', orgId],
    queryFn: async (): Promise<ReportTemplate[]> => {
      if (!orgId) throw new Error('Organization ID required');

      // Mock data for now - will be replaced with actual Supabase queries
      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Rapport d\'occupation quotidien',
          description: 'Suivi quotidien des taux d\'occupation et revenus',
          type: 'occupancy',
          frequency: 'daily',
          sections: [
            {
              id: '1',
              type: 'kpis',
              title: 'Indicateurs clés',
              config: { metrics: ['occupancy', 'adr', 'revpar'] },
              order: 1
            },
            {
              id: '2',
              type: 'chart',
              title: 'Évolution occupation',
              config: { chartType: 'line', dataSource: 'occupancy' },
              order: 2
            }
          ],
          recipients: ['manager@hotel.com', 'director@hotel.com'],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Rapport hebdomadaire performance',
          description: 'Analyse hebdomadaire des performances et tendances',
          type: 'performance',
          frequency: 'weekly',
          sections: [
            {
              id: '3',
              type: 'kpis',
              title: 'Résumé de la semaine',
              config: { metrics: ['occupancy', 'revenue'] },
              order: 1
            }
          ],
          recipients: ['owner@hotel.com'],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10')
        }
      ];

      return mockTemplates;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReportGeneration() {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();

  const generateReport = useMutation({
    mutationFn: async ({ templateId, manual = false }: { templateId: string; manual?: boolean }) => {
      if (!orgId) throw new Error('Organization ID required');

      // Call edge function to generate report
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          templateId,
          orgId,
          manual
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-generations', orgId] });
    }
  });

  return {
    generateReport: generateReport.mutate,
    isGenerating: generateReport.isPending
  };
}

export function useReportHistory() {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['report-generations', orgId],
    queryFn: async (): Promise<ReportGeneration[]> => {
      if (!orgId) throw new Error('Organization ID required');

      // Mock data for now
      const mockGenerations: ReportGeneration[] = [
        {
          id: '1',
          templateId: '1',
          status: 'completed',
          startedAt: new Date('2024-01-15T08:00:00'),
          completedAt: new Date('2024-01-15T08:02:15'),
          filePath: '/reports/daily-occupancy-2024-01-15.pdf',
          emailsSent: 2
        },
        {
          id: '2',
          templateId: '2',
          status: 'completed',
          startedAt: new Date('2024-01-14T09:00:00'),
          completedAt: new Date('2024-01-14T09:05:30'),
          filePath: '/reports/weekly-performance-2024-w02.pdf',
          emailsSent: 1
        },
        {
          id: '3',
          templateId: '1',
          status: 'failed',
          startedAt: new Date('2024-01-13T08:00:00'),
          error: 'Données insuffisantes pour la période'
        }
      ];

      return mockGenerations;
    },
    enabled: !!orgId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}