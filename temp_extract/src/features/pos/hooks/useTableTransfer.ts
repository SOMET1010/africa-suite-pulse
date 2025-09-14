import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TransferTableData {
  orderId: string;
  fromTableId?: string;
  toTableId?: string;
  reason?: string;
}

export function useTableTransfers(orderId?: string) {
  return useQuery({
    queryKey: ['pos-table-transfers', orderId],
    queryFn: async () => {
      let query = supabase
        .from('pos_table_transfers')
        .select(`
          *,
          from_table:pos_tables!pos_table_transfers_from_table_id_fkey(table_number, zone),
          to_table:pos_tables!pos_table_transfers_to_table_id_fkey(table_number, zone)
        `)
        .order('transferred_at', { ascending: false });

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });
}

export function useTransferTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TransferTableData) => {
      const { data: orgData } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!orgData) throw new Error('Organization not found');

      const { data: user } = await supabase.auth.getUser();

      // Update order table
      const { error: orderError } = await supabase
        .from('pos_orders')
        .update({ table_id: data.toTableId })
        .eq('id', data.orderId);

      if (orderError) throw orderError;

      // Record transfer history
      const { data: transfer, error: transferError } = await supabase
        .from('pos_table_transfers')
        .insert({
          org_id: orgData.org_id,
          order_id: data.orderId,
          from_table_id: data.fromTableId,
          to_table_id: data.toTableId,
          transfer_reason: data.reason,
          transferred_by: user.user?.id
        })
        .select()
        .single();

      if (transferError) throw transferError;
      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-table-transfers'] });
      toast({
        title: "Succès",
        description: "Table transférée avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de transférer la table",
        variant: "destructive"
      });
      console.error('Table transfer error:', error);
    }
  });
}