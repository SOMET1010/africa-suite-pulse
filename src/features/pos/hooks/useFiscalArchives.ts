import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FiscalArchive {
  id: string;
  org_id: string;
  archive_date: string;
  archive_type: 'daily' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  hash_signature: string;
  certificate_number: string;
  software_version: string;
  certification_number: string;
  digital_signature: string;
  status: 'pending' | 'processed' | 'archived' | 'exported' | 'error';
  is_sealed: boolean;
  created_at: string;
  file_size_bytes?: number;
  validation_errors?: any[];
}

export interface ComplianceLog {
  id: string;
  org_id: string;
  event_type: string;
  event_description: string;
  compliance_status: 'compliant' | 'warning' | 'non_compliant';
  performed_at: string;
  archive_id?: string;
}

export function useFiscalArchives() {
  return useQuery({
    queryKey: ['fiscal-archives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_archives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FiscalArchive[];
    }
  });
}

export function useComplianceLogs() {
  return useQuery({
    queryKey: ['fiscal-compliance-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fiscal_compliance_logs')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ComplianceLog[];
    }
  });
}

export function useCreateFiscalArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      archiveType: 'daily' | 'monthly' | 'yearly';
      periodStart: string;
      periodEnd: string;
    }) => {
      const { data: orgData } = await supabase.rpc('get_current_user_org_id');
      
      const { data, error } = await supabase.rpc('generate_fiscal_archive', {
        p_org_id: orgData,
        p_archive_type: params.archiveType,
        p_period_start: params.periodStart,
        p_period_end: params.periodEnd
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-archives'] });
      queryClient.invalidateQueries({ queryKey: ['fiscal-compliance-logs'] });
      toast({
        title: "Archive fiscal créée",
        description: "L'archive a été générée avec succès selon la norme NF525"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'archive fiscal",
        variant: "destructive"
      });
      console.error('Fiscal archive error:', error);
    }
  });
}

export function useExportFiscalArchive() {
  return useMutation({
    mutationFn: async (params: {
      archiveId: string;
      exportType: 'usb' | 'cloud';
      format: 'json' | 'xml' | 'csv';
    }) => {
      const { data, error } = await supabase.functions.invoke('fiscal-archive-export', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Create download link
      const blob = new Blob([data], { 
        type: variables.format === 'json' ? 'application/json' : 
              variables.format === 'xml' ? 'application/xml' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiscal_archive_${new Date().getTime()}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "L'archive fiscal a été exportée avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter l'archive fiscal",
        variant: "destructive"
      });
      console.error('Export error:', error);
    }
  });
}

export function useSealArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (archiveId: string) => {
      const { data, error } = await supabase
        .from('fiscal_archives')
        .update({
          is_sealed: true,
          sealed_at: new Date().toISOString(),
          status: 'archived'
        })
        .eq('id', archiveId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-archives'] });
      toast({
        title: "Archive scellée",
        description: "L'archive a été scellée définitivement selon NF525"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sceller l'archive",
        variant: "destructive"
      });
      console.error('Seal error:', error);
    }
  });
}