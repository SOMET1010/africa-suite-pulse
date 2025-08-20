import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

export type OrderStatus = 'draft' | 'sent' | 'preparing' | 'ready' | 'invoiced' | 'paid' | 'completed';
export type InvoiceStatus = 'pending' | 'paid' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'room_charge';

export interface PaymentFlowState {
  currentStep: 'order' | 'invoice' | 'payment' | 'fiscal' | 'completed';
  orderStatus: OrderStatus;
  invoiceStatus: InvoiceStatus;
  isProcessing: boolean;
  error: string | null;
}

export interface InvoiceData {
  id: string;
  orderNumber: string;
  totalAmount: number;
  taxAmount: number;
  subtotalAmount: number;
  status: InvoiceStatus;
  createdAt: string;
}

export interface PaymentData {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: number;
  receivedAmount?: number;
  changeAmount?: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export function usePaymentFlowManager(outletId: string) {
  const [flowState, setFlowState] = useState<PaymentFlowState>({
    currentStep: 'order',
    orderStatus: 'draft',
    invoiceStatus: 'pending',
    isProcessing: false,
    error: null
  });

  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);
  const [currentPayment, setCurrentPayment] = useState<PaymentData | null>(null);

  // Generate invoice from order
  const generateInvoice = useCallback(async (orderId: string) => {
    try {
      setFlowState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('pos_orders')
        .select(`
          *,
          pos_order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('pos_customer_invoices')
        .insert({
          org_id: order.org_id,
          invoice_number: invoiceNumber,
          total_amount: order.total_amount || 0,
          status: 'pending',
          invoice_date: new Date().toISOString(),
          due_date: new Date().toISOString(),
          customer_account_id: order.org_id // Using org_id as fallback
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update order status
      await supabase
        .from('pos_orders')
        .update({ status: 'invoiced' })
        .eq('id', orderId);

      const invoiceData: InvoiceData = {
        id: invoice.id,
        orderNumber: order.order_number,
        totalAmount: invoice.total_amount,
        taxAmount: 0, // Will be calculated from order
        subtotalAmount: invoice.total_amount, // Simplified for now
        status: 'pending',
        createdAt: invoice.created_at
      };

      setCurrentInvoice(invoiceData);
      setFlowState(prev => ({
        ...prev,
        currentStep: 'invoice',
        orderStatus: 'invoiced',
        invoiceStatus: 'pending',
        isProcessing: false
      }));

      logger.info('Invoice generated successfully', { orderId, invoiceId: invoice.id });
      return invoiceData;

    } catch (error) {
      logger.error('Failed to generate invoice', error);
      setFlowState(prev => ({
        ...prev,
        error: 'Échec de la génération de facture',
        isProcessing: false
      }));
      toast.error('Échec de la génération de facture');
      throw error;
    }
  }, []);

  // Process payment
  const processPayment = useCallback(async (
    invoiceId: string,
    paymentMethod: PaymentMethod,
    receivedAmount?: number
  ) => {
    try {
      setFlowState(prev => ({ ...prev, isProcessing: true, error: null }));

      if (!currentInvoice) {
        throw new Error('No current invoice found');
      }

      const totalAmount = currentInvoice.totalAmount;
      const changeAmount = receivedAmount && receivedAmount > totalAmount 
        ? receivedAmount - totalAmount 
        : 0;

      // Create payment transaction
      const { data: payment, error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          org_id: outletId, // Using outletId as org_id for now
          invoice_id: invoiceId,
          method_id: paymentMethod, // Using method as method_id
          amount: totalAmount,
          status: 'completed'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update invoice status
      await supabase
        .from('pos_customer_invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

      // Generate fiscal event
      await generateFiscalEvent(invoiceId, payment.id);

      const paymentData: PaymentData = {
        id: payment.id,
        invoiceId,
        method: paymentMethod,
        amount: totalAmount,
        receivedAmount,
        changeAmount,
        status: 'completed',
        createdAt: payment.created_at
      };

      setCurrentPayment(paymentData);
      setFlowState(prev => ({
        ...prev,
        currentStep: 'completed',
        invoiceStatus: 'paid',
        orderStatus: 'completed',
        isProcessing: false
      }));

      logger.info('Payment processed successfully', { invoiceId, paymentId: payment.id });
      toast.success('Paiement traité avec succès');

      return paymentData;

    } catch (error) {
      logger.error('Failed to process payment', error);
      setFlowState(prev => ({
        ...prev,
        error: 'Échec du traitement du paiement',
        isProcessing: false
      }));
      toast.error('Échec du traitement du paiement');
      throw error;
    }
  }, [currentInvoice, outletId]);

  // Generate fiscal event for compliance
  const generateFiscalEvent = useCallback(async (invoiceId: string, paymentId: string) => {
    try {
      // This would integrate with fiscal compliance system
      logger.info('Generating fiscal event', { invoiceId, paymentId });
      
      // Mock fiscal event creation - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setFlowState(prev => ({ ...prev, currentStep: 'fiscal' }));
      
    } catch (error) {
      logger.error('Failed to generate fiscal event', error);
      // Don't fail the entire flow for fiscal events
    }
  }, []);

  // Reset flow for new order
  const resetFlow = useCallback(() => {
    setFlowState({
      currentStep: 'order',
      orderStatus: 'draft',
      invoiceStatus: 'pending',
      isProcessing: false,
      error: null
    });
    setCurrentInvoice(null);
    setCurrentPayment(null);
  }, []);

  // Validate payment before processing
  const validatePayment = useCallback((
    paymentMethod: PaymentMethod,
    receivedAmount?: number
  ): boolean => {
    if (!currentInvoice) return false;
    
    if (paymentMethod === 'cash' && receivedAmount) {
      return receivedAmount >= currentInvoice.totalAmount;
    }
    
    return true;
  }, [currentInvoice]);

  return {
    flowState,
    currentInvoice,
    currentPayment,
    generateInvoice,
    processPayment,
    resetFlow,
    validatePayment,
    isProcessing: flowState.isProcessing,
    currentStep: flowState.currentStep,
    error: flowState.error
  };
}