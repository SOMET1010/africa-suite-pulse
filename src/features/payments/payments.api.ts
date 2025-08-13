import { supabase } from "@/integrations/supabase/client";
import type {
  PaymentMethod,
  PaymentMethodInsert,
  PaymentMethodUpdate,
  PaymentTerminal,
  PaymentTerminalInsert,
  PaymentTerminalUpdate,
  Currency,
  CurrencyInsert,
  CurrencyUpdate,
  PaymentTransaction,
  PaymentTransactionInsert,
  PaymentTransactionWithMethod,
  CreateTransactionInput,
  PaymentSummary,
  SupabaseResponse,
  SupabaseMultiResponse
} from "@/types/payments";

export const listPaymentMethods = (orgId: string) =>
  supabase.from("payment_methods").select("id, org_id, label, code, kind, active, commission_percent, capture_mode, created_at, updated_at, expense_service_code, metadata, settlement_delay_days").eq("org_id", orgId).order("label");

export const upsertPaymentMethod = (payload: any) =>
  supabase.from("payment_methods").upsert(payload).select();

export const deletePaymentMethod = (id: string) =>
  supabase.from("payment_methods").delete().eq("id", id);

export const listTerminals = (orgId: string) =>
  supabase.from("payment_terminals").select("id, org_id, name, device_id, provider, active, take_commission, created_at, updated_at").eq("org_id", orgId).order("name");

export const upsertTerminal = (payload: any) =>
  supabase.from("payment_terminals").upsert(payload).select();

export const deleteTerminal = (id: string) =>
  supabase.from("payment_terminals").delete().eq("id", id);

export const listCurrencies = (orgId: string) =>
  supabase.from("currencies").select("id, org_id, code, label, is_base, rate_to_base, active, created_at, updated_at").eq("org_id", orgId).order("is_base", { ascending: false }).order("code");

export const upsertCurrency = (payload: any) =>
  supabase.from("currencies").upsert(payload).select();

export const deleteCurrency = (id: string) =>
  supabase.from("currencies").delete().eq("id", id);

// Payment transactions
export async function createPaymentTransaction(input: CreateTransactionInput): Promise<PaymentTransaction> {
  const { data, error } = await (supabase as any)
    .from('payment_transactions')
    .insert({
      org_id: input.org_id,
      invoice_id: input.invoice_id,
      method_id: input.method_id,
      amount: input.amount,
      currency_code: input.currency_code ?? null,
      status: 'captured',
      reference: input.reference ?? null,
      metadata: input.metadata ?? {},
    })
    .select('id, org_id, invoice_id, method_id, amount, currency_code, status, reference, created_at')
    .single();

  if (error) throw error;
  return data;
}

export async function listInvoiceTransactions(invoiceId: string): Promise<PaymentTransactionWithMethod[]> {
  const { data, error } = await (supabase as any)
    .from('payment_transactions')
    .select(`
      id, invoice_id, method_id, amount, currency_code, status, reference, created_at,
      payment_methods!inner (
        label,
        code
      )
    `)
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getInvoicePaymentSummary(invoiceId: string): Promise<PaymentSummary> {
  const { data, error } = await (supabase as any)
    .from('payment_transactions')
    .select('amount')
    .eq('invoice_id', invoiceId)
    .eq('status', 'captured');

  if (error) throw error;
  
  const totalPaid = (data || []).reduce((sum: number, transaction: any) => 
    sum + Number(transaction.amount), 0);
  return { totalPaid, transactionCount: data?.length || 0 };
}