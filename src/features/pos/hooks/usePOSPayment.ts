import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePaymentMethods, useCreatePaymentTransaction } from '@/queries/payments.queries';
import type { CartItem } from '../types';

interface PaymentState {
  selectedMethodId: string;
  amountReceived: number;
  reference?: string;
  isProcessing: boolean;
}

interface ProcessPaymentInput {
  orderId: string;
  orgId: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    taxAmount: number;
    serviceCharge: number;
    total: number;
  };
  methodId: string;
  amountReceived: number;
  reference?: string;
}

export function usePOSPayment(orgId: string) {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    selectedMethodId: '',
    amountReceived: 0,
    reference: '',
    isProcessing: false
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: loadingMethods } = usePaymentMethods(orgId);
  const createTransactionMutation = useCreatePaymentTransaction();

  // Complete order mutation
  const completeOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('pos_orders')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-order'] });
    }
  });

  // Process payment
  const processPayment = async (input: ProcessPaymentInput) => {
    console.log('🔄 Processing POS payment:', input);
    
    setPaymentState(prev => ({ ...prev, isProcessing: true }));

    try {
      // 1. Create invoice for the order
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          org_id: input.orgId,
          invoice_number: `POS-${Date.now()}`,
          subtotal: input.totals.subtotal,
          tax_amount: input.totals.taxAmount,
          total_amount: input.totals.total,
          status: 'paid',
          notes: `Commande POS ${input.orderId}`,
          metadata: {
            pos_order_id: input.orderId,
            payment_method: input.methodId
          }
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Create payment transaction
      await createTransactionMutation.mutateAsync({
        orgId: input.orgId,
        invoiceId: invoice.id,
        methodId: input.methodId,
        amount: input.amountReceived,
        reference: input.reference
      });

      // 3. Complete the order
      await completeOrderMutation.mutateAsync(input.orderId);

      toast({
        title: "Paiement réussi",
        description: `Commande payée avec succès. Facture: ${invoice.id}`,
      });

      // Reset payment state
      setPaymentState({
        selectedMethodId: '',
        amountReceived: 0,
        reference: '',
        isProcessing: false
      });

      return { invoice, success: true };

    } catch (error: any) {
      console.error('❌ Payment processing failed:', error);
      
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible de traiter le paiement",
        variant: "destructive",
      });

      setPaymentState(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  };

  // Update payment state
  const updatePaymentState = (updates: Partial<PaymentState>) => {
    setPaymentState(prev => ({ ...prev, ...updates }));
  };

  // Validate payment
  const validatePayment = (total: number) => {
    if (!paymentState.selectedMethodId) {
      return { isValid: false, error: "Sélectionnez un moyen de paiement" };
    }

    const selectedMethod = paymentMethods.find(m => m.id === paymentState.selectedMethodId);
    
    if (selectedMethod?.kind === 'cash' && paymentState.amountReceived < total) {
      return { 
        isValid: false, 
        error: `Montant insuffisant. Reçu: ${paymentState.amountReceived} FCFA, Total: ${total} FCFA` 
      };
    }

    if (selectedMethod?.kind === 'mobile_money' && !paymentState.reference?.trim()) {
      return { isValid: false, error: "Référence de transaction requise pour Mobile Money" };
    }

    return { isValid: true, error: null };
  };

  // Get change amount for cash payments
  const getChangeAmount = (total: number) => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentState.selectedMethodId);
    if (selectedMethod?.kind === 'cash' && paymentState.amountReceived > total) {
      return paymentState.amountReceived - total;
    }
    return 0;
  };

  return {
    paymentState,
    updatePaymentState,
    paymentMethods,
    loadingMethods,
    processPayment,
    validatePayment,
    getChangeAmount,
    isProcessing: paymentState.isProcessing || createTransactionMutation.isPending || completeOrderMutation.isPending
  };
}