import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SplitBillItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSplitBillData {
  orderId: string;
  splitType: 'by_amount' | 'by_items' | 'even';
  totalSplits: number;
  splits: {
    amount?: number;
    items?: SplitBillItem[];
  }[];
}

export function useSplitBills(orderId?: string) {
  return useQuery({
    queryKey: ['pos-split-bills', orderId],
    queryFn: async () => {
      let query = supabase
        .from('pos_split_bills')
        .select('*')
        .order('split_number');

      if (orderId) {
        query = query.eq('original_order_id', orderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!orderId
  });
}

export function useCreateSplitBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSplitBillData) => {
      const { data: orgData } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!orgData) throw new Error('Organization not found');

      const splitBills = data.splits.map((split, index) => ({
        org_id: orgData.org_id,
        original_order_id: data.orderId,
        split_number: index + 1,
        total_splits: data.totalSplits,
        split_amount: split.amount || 0,
        split_type: data.splitType,
        split_items: split.items || [],
        payment_status: 'pending' as const
      }));

      const { data: result, error } = await supabase
        .from('pos_split_bills')
        .insert(splitBills.map(bill => ({
          ...bill,
          split_items: bill.split_items as any
        })))
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-split-bills'] });
      toast({
        title: "Succès",
        description: "Division de facture créée avec succès"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la division de facture",
        variant: "destructive"
      });
      console.error('Split bill error:', error);
    }
  });
}

export function useUpdateSplitBillPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ splitBillId, status }: { splitBillId: string; status: 'paid' | 'cancelled' }) => {
      const { data, error } = await supabase
        .from('pos_split_bills')
        .update({ payment_status: status })
        .eq('id', splitBillId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-split-bills'] });
    }
  });
}