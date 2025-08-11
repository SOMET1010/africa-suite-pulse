import { supabase } from "@/integrations/supabase/client";

export const listPaymentMethods = (orgId: string) =>
  (supabase as any).from("payment_methods").select("*").eq("org_id", orgId).order("label");

export const upsertPaymentMethod = (payload: any) =>
  (supabase as any).from("payment_methods").upsert(payload).select();

export const deletePaymentMethod = (id: string) =>
  (supabase as any).from("payment_methods").delete().eq("id", id);

export const listTerminals = (orgId: string) =>
  (supabase as any).from("payment_terminals").select("*").eq("org_id", orgId).order("name");

export const upsertTerminal = (payload: any) =>
  (supabase as any).from("payment_terminals").upsert(payload).select();

export const deleteTerminal = (id: string) =>
  (supabase as any).from("payment_terminals").delete().eq("id", id);

export const listCurrencies = (orgId: string) =>
  (supabase as any).from("currencies").select("*").eq("org_id", orgId).order("is_base", { ascending: false }).order("code");

export const upsertCurrency = (payload: any) =>
  (supabase as any).from("currencies").upsert(payload).select();

export const deleteCurrency = (id: string) =>
  (supabase as any).from("currencies").delete().eq("id", id);

// Payment transactions
export type CreateTransactionInput = {
  org_id: string;
  invoice_id: string;          // folio ou facture
  method_id: string;           // id de payment_methods
  amount: number;              // en devise base (ex: XOF)
  currency_code?: string;      // si différent de la devise base
  reference?: string;          // n° transaction MM / 4 derniers CB / chèque
  metadata?: Record<string, any>;
};

export type PaymentTransaction = {
  id: string;
  org_id: string;
  invoice_id: string;
  method_id: string;
  amount: number;
  currency_code: string | null;
  status: string;
  reference: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export async function createPaymentTransaction(input: CreateTransactionInput) {
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
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function listInvoiceTransactions(invoiceId: string): Promise<PaymentTransaction[]> {
  const { data, error } = await (supabase as any)
    .from('payment_transactions')
    .select(`
      *,
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

export async function getInvoicePaymentSummary(invoiceId: string) {
  const { data, error } = await (supabase as any)
    .from('payment_transactions')
    .select('amount')
    .eq('invoice_id', invoiceId)
    .eq('status', 'captured');

  if (error) throw error;
  
  const totalPaid = (data || []).reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  return { totalPaid, transactionCount: data?.length || 0 };
}