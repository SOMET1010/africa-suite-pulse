import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePaymentMethods, useCreatePaymentTransaction } from '@/queries/payments.queries';
import type { CartItem } from '../types';
import { logger } from '@/services/logger.service';
import { getErrorMessage } from '@/utils/errorHandling';
import { usePOSTicketPrinting } from './usePOSTicketPrinting';

interface PaymentState {
  selectedMethodId: string;
  amountReceived: number;
  reference?: string;
  isProcessing: boolean;
  printStatus?: 'idle' | 'printing' | 'success' | 'failed';
  changeManagementStep?: 'none' | 'required' | 'completed';
  pendingInvoice?: any;
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
    isProcessing: false,
    printStatus: 'idle',
    changeManagementStep: 'none',
    pendingInvoice: null
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: loadingMethods } = usePaymentMethods(orgId);
  const createTransactionMutation = useCreatePaymentTransaction();
  
  // Ticket printing
  const { printTicket, isPrinting } = usePOSTicketPrinting();

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
    logger.audit('Processing POS payment', { orderId: input.orderId, amount: input.amountReceived, method: input.methodId });
    
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
        invoiceId: String(invoice.id), // Ensure string type for invoiceId
        methodId: input.methodId,
        amount: input.amountReceived,
        reference: input.reference
      });

      // 3. Complete the order
      await completeOrderMutation.mutateAsync(input.orderId);

      // 4. Check if change management is needed for cash payments
      const selectedMethod = paymentMethods.find(m => m.id === input.methodId);
      const changeAmount = getChangeAmount(input.totals.total);
      
      if (selectedMethod?.kind === 'cash' && changeAmount > 0) {
        // Cash payment with change - require change management
        setPaymentState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          changeManagementStep: 'required',
          pendingInvoice: invoice,
          printStatus: 'idle'
        }));
        
        toast({
          title: "Paiement réussi",
          description: `Commande payée. Gérez la monnaie à rendre: ${changeAmount} FCFA`,
        });
      } else {
        // No change needed - proceed with printing
        await finalizePaymentWithPrinting(input.orderId, invoice);
      }

      return { invoice, success: true };

    } catch (error: unknown) {
      logger.error('Payment processing failed', { error, orderId: input.orderId });
      
      toast({
        title: "Erreur de paiement",
        description: getErrorMessage(error) || "Impossible de traiter le paiement",
        variant: "destructive",
      });

      setPaymentState(prev => ({ ...prev, isProcessing: false, printStatus: 'idle' }));
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

  // Finalize payment with printing (after change management)
  const finalizePaymentWithPrinting = async (orderId: string, invoice?: any) => {
    setPaymentState(prev => ({ ...prev, printStatus: 'printing' }));
    
    try {
      printTicket({ orderId });
      setPaymentState(prev => ({ ...prev, printStatus: 'success' }));
      
      toast({
        title: "Ticket imprimé",
        description: `Commande finalisée et ticket imprimé. Facture: ${invoice?.id || 'N/A'}`,
      });
    } catch (printError) {
      logger.warn('Automatic printing failed', { printError, orderId });
      setPaymentState(prev => ({ ...prev, printStatus: 'failed' }));
      
      toast({
        title: "Impression échouée",
        description: `Commande finalisée. Facture: ${invoice?.id || 'N/A'}. Utilisez l'impression manuelle.`,
      });
    }
  };

  // Complete change management and finalize payment
  const completeChangeManagement = () => {
    const { pendingInvoice } = paymentState;
    setPaymentState(prev => ({ 
      ...prev, 
      changeManagementStep: 'completed',
      selectedMethodId: '',
      amountReceived: 0,
      reference: '',
      pendingInvoice: null
    }));
    
    // Find the current order ID - we need to pass it from the dialog
    // For now, we'll need to modify the dialog to pass the orderId
  };

  // Manual print function
  const printTicketManually = (orderId: string) => {
    setPaymentState(prev => ({ ...prev, printStatus: 'printing' }));
    printTicket({ orderId });
  };

  return {
    paymentState,
    updatePaymentState,
    paymentMethods,
    loadingMethods,
    processPayment,
    validatePayment,
    getChangeAmount,
    printTicketManually,
    completeChangeManagement,
    finalizePaymentWithPrinting,
    isProcessing: paymentState.isProcessing || createTransactionMutation.isPending || completeOrderMutation.isPending,
    isPrinting: isPrinting || paymentState.printStatus === 'printing'
  };
}