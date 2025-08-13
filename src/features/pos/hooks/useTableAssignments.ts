import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { POSTableAssignment } from '../types';
import { toast } from 'sonner';

export const useTableAssignments = (outletId?: string) => {
  return useQuery({
    queryKey: ['table-assignments', outletId],
    queryFn: async () => {
      if (!outletId) return [];

      const { data, error } = await supabase
        .from('table_assignments')
        .select('*')
        .eq('shift_date', new Date().toISOString().split('T')[0])
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as POSTableAssignment[];
    },
    enabled: !!outletId,
  });
};

export const useAssignTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tableId, serverId }: { tableId: string; serverId: string }) => {
      const { data, error } = await supabase.rpc('assign_table_to_server', {
        p_table_id: tableId,
        p_server_id: serverId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-assignments'] });
      toast.success('Table assignée avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'assignation de la table');
    },
  });
};

export const useServerTables = (serverId?: string) => {
  return useQuery({
    queryKey: ['server-tables', serverId],
    queryFn: async () => {
      if (!serverId) return [];

      const { data, error } = await supabase.rpc('get_server_tables', {
        p_server_id: serverId
      });

      if (error) throw error;
      return data;
    },
    enabled: !!serverId,
  });
};

export const useServerAssignments = (serverId?: string) => {
  return useQuery({
    queryKey: ['server-assignments', serverId],
    queryFn: async () => {
      if (!serverId) return [];

      const { data, error } = await supabase
        .from('server_assignments')
        .select('*')
        .eq('server_id', serverId)
        .eq('shift_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!serverId,
  });
};

export const useCreateServerAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: {
      server_id: string;
      zone?: string;
      shift_start?: string;
      shift_end?: string;
      max_tables?: number;
    }) => {
      const { data, error } = await supabase
        .from('server_assignments')
        .insert([{
          ...assignment,
          shift_date: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-assignments'] });
      toast.success('Assignation serveur créée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création de l\'assignation');
    },
  });
};