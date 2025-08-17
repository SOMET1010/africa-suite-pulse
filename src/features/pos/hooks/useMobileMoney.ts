import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type MobileMoneyProvider = 'orange_money' | 'mtn_money' | 'moov_money' | 'wave';

export interface MobileMoneyPaymentData {
  orderId: string;
  paymentMethodId: string;
  provider: MobileMoneyProvider;
  phoneNumber: string;
  amount: number;
  currencyCode?: string;
}

export function useMobileMoneyTransactions(orderId?: string) {
  return useQuery({
    queryKey: ['mobile-money-transactions', orderId],
    queryFn: async () => {
      let query = supabase
        .from('pos_mobile_money_transactions')
        .select('*')
        .order('created_at', { ascending: false });

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

export function useInitiateMobileMoneyPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: MobileMoneyPaymentData) => {
      const { data: orgData } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (!orgData) throw new Error('Organization not found');

      // Create mobile money transaction record
      const { data: transaction, error } = await supabase
        .from('pos_mobile_money_transactions')
        .insert({
          org_id: orgData.org_id,
          order_id: data.orderId,
          payment_method_id: data.paymentMethodId,
          provider: data.provider,
          phone_number: data.phoneNumber,
          amount: data.amount,
          currency_code: data.currencyCode || 'XOF',
          status: 'pending'
        })
        .select()
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (error) throw error;

      // Call mobile money API integration
      const { data: result, error: apiError } = await supabase.functions.invoke('mobile-money-payment', {
        body: {
          transactionId: transaction.id,
          provider: data.provider,
          phoneNumber: data.phoneNumber,
          amount: data.amount,
          orderId: data.orderId
        }
      });

      if (apiError) {
        // Update transaction status to failed
        await supabase
          .from('pos_mobile_money_transactions')
          .update({ 
            status: 'failed',
            provider_response: { error: apiError.message }
          })
          .eq('id', transaction.id);
        
        throw apiError;
      }

      return { transaction, apiResult: result };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-transactions'] });
      toast({
        title: "Succès",
        description: "Paiement mobile money initié"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'initier le paiement mobile money",
        variant: "destructive"
      });
      console.error('Mobile money error:', error);
    }
  });
}

export function useCheckMobileMoneyStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data, error } = await supabase.functions.invoke('check-mobile-money-status', {
        body: { transactionId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-money-transactions'] });
    }
  });
}