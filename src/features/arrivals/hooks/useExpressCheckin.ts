import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExpressCheckinResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  message: string;
}

export function useExpressCheckin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservationId: string): Promise<ExpressCheckinResult> => {
      // Step 1: Update reservation status to 'present'
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({ 
          status: 'present',
          checked_in_at: new Date().toISOString()
        })
        .eq('id', reservationId);
      
      if (reservationError) throw reservationError;
      
      // Step 2: Get reservation details for invoice creation
      const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()
      
      if (fetchError) throw fetchError;
      
      // Step 3: Create invoice (simplified version)
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          org_id: reservation.org_id,
          reservation_id: reservationId,
          guest_id: reservation.guest_id,
          number: invoiceNumber,
          total_amount: reservation.rate_total || 0,
          status: 'pending'
        })
        .select()
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()
      
      if (invoiceError) throw invoiceError;
      
      return {
        success: true,
        invoiceId: invoice.id.toString(),
        invoiceNumber: invoiceNumber,
        message: `Check-in réussi. Facture ${invoiceNumber} créée.`
      };
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['arrivals'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      
      if (result.success) {
        toast({
          title: 'Check-in express réussi',
          description: result.message,
        });
      } else {
        toast({
          title: 'Check-in partiel',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur check-in express',
        description: error.message || 'Une erreur est survenue lors du check-in',
        variant: 'destructive',
      });
    },
  });
}

export function useCreateCorrectionEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      invoiceItemId: string;
      reasonCode: string;
      reasonText: string;
    }) => {
      // Get the original invoice item
      const { data: originalItem, error: fetchError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('id', params.invoiceItemId)
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()
      
      if (fetchError) throw fetchError;
      
      // Create a negative correction entry
      const { error: insertError } = await supabase
        .from('invoice_items')
        .insert({
          invoice_id: originalItem.invoice_id,
          org_id: originalItem.org_id,
          service_code: `CORR-${originalItem.service_code}`,
          description: `CORRECTION: ${originalItem.description} (${params.reasonText})`,
          quantity: -originalItem.quantity,
          unit_price: originalItem.unit_price,
          total_price: -originalItem.total_price,
          folio_number: originalItem.folio_number,
          billing_condition: originalItem.billing_condition,
          hotel_date: new Date().toISOString().split('T')[0]
        });
      
      if (insertError) throw insertError;
      
      // Log the correction in audit logs
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert({
          org_id: originalItem.org_id,
          action: 'correction',
          table_name: 'invoice_items',
          record_id: params.invoiceItemId,
          reason_code: params.reasonCode,
          reason_text: params.reasonText,
          severity: 'warning'
        });
      
      if (auditError) console.warn('Failed to log correction:', auditError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      
      toast({
        title: 'Contre-passation créée',
        description: 'L\'écriture de correction a été enregistrée',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur contre-passation',
        description: error.message || 'Impossible de créer la contre-passation',
        variant: 'destructive',
      });
    },
  });
}