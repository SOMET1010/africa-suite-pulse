import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HotelHealth, ActiveAlert, MonitoringIncident, HotelHealthSummary } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useHotelHealthSummary() {
  return useQuery({
    queryKey: ['hotel-health-summary'],
    queryFn: async (): Promise<HotelHealthSummary> => {
      const { data, error } = await supabase.rpc('get_hotel_health_summary');
      if (error) throw error;
      return data[0] || {
        total_hotels: 0,
        healthy_hotels: 0,
        degraded_hotels: 0,
        down_hotels: 0,
        avg_response_time: 0,
        avg_uptime: 0
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useHotelHealthStatus() {
  return useQuery({
    queryKey: ['hotel-health-status'],
    queryFn: async (): Promise<HotelHealth[]> => {
      const { data, error } = await supabase
        .from('hotel_health_status')
        .select('*')
        .order('last_check_at', { ascending: false });
      if (error) throw error;
      return (data || []) as HotelHealth[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: ['active-alerts'],
    queryFn: async (): Promise<ActiveAlert[]> => {
      const { data, error } = await supabase
        .from('active_alerts')
        .select(`
          *,
          alert_definitions:alert_definition_id (
            name,
            description
          )
        `)
        .eq('status', 'active')
        .order('started_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}

export function useMonitoringIncidents() {
  return useQuery({
    queryKey: ['monitoring-incidents'],
    queryFn: async (): Promise<MonitoringIncident[]> => {
      const { data, error } = await supabase
        .from('monitoring_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as MonitoringIncident[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('active_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
      toast({
        title: "Alerte acquittée",
        description: "L'alerte a été marquée comme acquittée.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'acquitter l'alerte.",
        variant: "destructive",
      });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('active_alerts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-alerts'] });
      toast({
        title: "Alerte résolue",
        description: "L'alerte a été marquée comme résolue.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de résoudre l'alerte.",
        variant: "destructive",
      });
    },
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (incident: Omit<MonitoringIncident, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('monitoring_incidents')
        .insert(incident as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-incidents'] });
      toast({
        title: "Incident créé",
        description: "L'incident a été créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'incident.",
        variant: "destructive",
      });
    },
  });
}