// API Facturation robuste avec gestion d'erreurs - Phase 1 refactoring
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { throwIfError, handleError, withPerformanceLogging } from "@/services/api.core";
import type {
  Invoice,
  InvoiceWithItems,
  InvoiceListItem,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  BillingStats,
  BillingFilters,
  BillingApiResponse,
  BillingListResponse
} from "../types/billing.types";

// ============= CORE CRUD OPERATIONS =============

export async function createInvoice(input: CreateInvoiceInput): Promise<BillingApiResponse<Invoice>> {
  return withPerformanceLogging('createInvoice', async () => {
    try {
      // Generate invoice number
      const invoiceNumber = `FAC-${Date.now()}`;
      
      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      // Calculate tax based on hotel settings (default 18% VAT for Ivory Coast)
      // Note: tax_rate column doesn't exist yet, using default
      const tax_rate = 0.18; // Default VAT rate for Ivory Coast
      const tax_amount = Math.round(subtotal * tax_rate * 100) / 100;
      const total_amount = subtotal + tax_amount;

      // Create invoice with proper type handling
      const { data: invoice, error: invoiceError } = await (supabase as any)
        .from('invoices')
        .insert({
          number: invoiceNumber,
          guest_name: input.guest_name,
          guest_email: input.guest_email || null,
          guest_phone: input.guest_phone || null,
          guest_address: input.guest_address || null,
          guest_id: input.guest_id || null,
          reservation_id: input.reservation_id || null,
          room_number: input.room_number || null,
          room_type: input.room_type || null,
          check_in_date: input.check_in_date || null,
          check_out_date: input.check_out_date || null,
          nights_count: input.nights_count || null,
          adults_count: input.adults_count || 1,
          children_count: input.children_count || 0,
          reference: input.reference || null,
          description: input.description || null,
          notes: input.notes || null,
          due_date: input.due_date || null,
          folio_number: input.folio_number || 1,
          group_billing_mode: input.group_billing_mode || 'individual',
          subtotal,
          tax_amount,
          total_amount,
          status: 'pending'
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (input.items.length > 0) {
        const { error: itemsError } = await (supabase as any)
          .from('invoice_items')
          .insert(
            input.items.map(item => ({
              invoice_id: invoice.id,
              service_code: item.service_code,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.quantity * item.unit_price,
              folio_number: item.folio_number || 1,
              billing_condition: item.billing_condition || 'stay',
              valid_from: item.valid_from || null,
              valid_until: item.valid_until || null
            }))
          );

        if (itemsError) throw itemsError;
      }

      return { data: invoice as any, error: null };
    } catch (error) {
      logger.error('Error creating invoice', error);
      return { data: null, error: error as Error };
    }
  });
}

export async function getInvoiceById(invoiceId: string): Promise<BillingApiResponse<InvoiceWithItems>> {
  return withPerformanceLogging('getInvoiceById', async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      
      return { data: { ...data, items: data.invoice_items || [] } as any, error: null };
    } catch (error) {
      logger.error('Error fetching invoice', error);
      return { data: null, error: error as Error };
    }
  });
}

export async function listInvoices(
  orgId: string, 
  filters: BillingFilters = {},
  limit = 50,
  offset = 0
): Promise<BillingListResponse<InvoiceListItem>> {
  return withPerformanceLogging('listInvoices', async () => {
    try {
      let query = (supabase as any)
        .from('invoices')
        .select(`
          id,
          number,
          guest_name,
          status,
          total_amount,
          issue_date,
          due_date,
          reference
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('issue_date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('issue_date', filters.date_to);
      }
      if (filters.guest_name) {
        query = query.ilike('guest_name', `%${filters.guest_name}%`);
      }
      if (filters.room_number) {
        query = query.ilike('room_number', `%${filters.room_number}%`);
      }
      if (filters.amount_min) {
        query = query.gte('total_amount', filters.amount_min);
      }
      if (filters.amount_max) {
        query = query.lte('total_amount', filters.amount_max);
      }
      if (filters.folio_number?.length) {
        query = query.in('folio_number', filters.folio_number);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { 
        data: data as any[], 
        error: null, 
        count: count || 0,
        has_more: (count || 0) > offset + limit
      };
    } catch (error) {
      logger.error('Error listing invoices', error);
      return { data: null, error: error as Error };
    }
  });
}

export async function updateInvoice(
  invoiceId: string, 
  updates: UpdateInvoiceInput
): Promise<BillingApiResponse<Invoice>> {
  return withPerformanceLogging('updateInvoice', async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('invoices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      
      return { data: data as any, error: null };
    } catch (error) {
      logger.error('Error updating invoice', error);
      return { data: null, error: error as Error };
    }
  });
}

export async function deleteInvoice(invoiceId: string): Promise<BillingApiResponse<boolean>> {
  return withPerformanceLogging('deleteInvoice', async () => {
    try {
      // First delete items (cascade should handle this, but being explicit)
      await (supabase as any)
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      // Then delete invoice
      const { error } = await (supabase as any)
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      
      return { data: true, error: null };
    } catch (error) {
      logger.error('Error deleting invoice', error);
      return { data: null, error: error as Error };
    }
  });
}

// ============= STATS & ANALYTICS =============

export async function getBillingStats(orgId: string): Promise<BillingApiResponse<BillingStats>> {
  return withPerformanceLogging('getBillingStats', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      
      // Today's stats
      const { data: todayData } = await (supabase as any)
        .from('invoices')
        .select('status, total_amount')
        .eq('org_id', orgId)
        .gte('issue_date', today);

      // Overdue invoices
      const { data: overdueData } = await (supabase as any)
        .from('invoices')
        .select('total_amount')
        .eq('org_id', orgId)
        .eq('status', 'overdue');

      // This month stats
      const { data: monthData } = await (supabase as any)
        .from('invoices')
        .select('total_amount')
        .eq('org_id', orgId)
        .gte('issue_date', monthStart);

      const todayInvoices = todayData || [];
      const overdueInvoices = overdueData || [];
      const monthInvoices = monthData || [];

      const stats: BillingStats = {
        today: {
          invoices_count: todayInvoices.length,
          total_amount: todayInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0),
          paid_amount: todayInvoices
            .filter((inv: any) => inv.status === 'paid')
            .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0),
          pending_count: todayInvoices.filter((inv: any) => inv.status === 'pending').length
        },
        overdue: {
          invoices_count: overdueInvoices.length,
          total_amount: overdueInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0)
        },
        this_month: {
          invoices_count: monthInvoices.length,
          total_amount: monthInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0),
          avg_invoice_amount: monthInvoices.length > 0 
            ? monthInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0) / monthInvoices.length
            : 0
        }
      };

      return { data: stats, error: null };
    } catch (error) {
      logger.error('Error fetching billing stats', error);
      return { data: null, error: error as Error };
    }
  });
}