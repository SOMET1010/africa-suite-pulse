import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, invalidatePaymentQueries } from '@/lib/queryClient';
import type { 
  PaymentMethod, 
  PaymentTerminal, 
  Currency,
  PaymentTransaction,
  PaymentTransactionWithMethod 
} from '@/types/database';

// Types pour les API calls de paiement
type CreateTransactionInput = {
  orgId: string;
  invoiceId: string;
  methodId: string;
  amount: number;
  currencyCode?: string;
  reference?: string;
};

type PaymentSummary = {
  totalPaid: number;
  transactionCount: number;
  remainingDue: number;
};

// Helper pour throw errors
function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw error;
  if (!data) throw new Error("Aucune donnée reçue");
  return data;
}

// --- PAYMENT METHODS ---

export function usePaymentMethods(orgId: string) {
  return useQuery({
    queryKey: queryKeys.paymentMethods(orgId),
    queryFn: async (): Promise<PaymentMethod[]> => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("org_id", orgId)
        .eq("active", true)
        .order("label");

      return throwIfError(data, error);
    },
    enabled: !!orgId,
  });
}

export function useUpsertPaymentMethod() {
  return useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        // Update
        const { data, error } = await supabase
          .from("payment_methods")
          .update(payload)
          .eq("id", payload.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert - ensure required fields
        const insertPayload = {
          org_id: payload.org_id,
          code: payload.code || 'AUTO',
          label: payload.label || 'Nouveau moyen',
          kind: payload.kind || 'passive',
          ...payload,
        };
        
        const { data, error } = await supabase
          .from("payment_methods")
          .insert(insertPayload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      invalidatePaymentQueries(data.org_id);
    },
  });
}

export function useDeletePaymentMethod() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      // Note: On devrait avoir l'orgId dans le context
      console.log("🎯 Payment method deleted, invalidating cache");
    },
  });
}

// --- PAYMENT TERMINALS ---

export function usePaymentTerminals(orgId: string) {
  return useQuery({
    queryKey: queryKeys.paymentTerminals(orgId),
    queryFn: async (): Promise<PaymentTerminal[]> => {
      const { data, error } = await supabase
        .from("payment_terminals")
        .select("*")
        .eq("org_id", orgId)
        .eq("active", true)
        .order("name");

      return throwIfError(data, error);
    },
    enabled: !!orgId,
  });
}

export function useUpsertPaymentTerminal() {
  return useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        const { data, error } = await supabase
          .from("payment_terminals")
          .update(payload)
          .eq("id", payload.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert - ensure required fields
        const insertPayload = {
          org_id: payload.org_id,
          name: payload.name || 'Nouveau terminal',
          ...payload,
        };
        
        const { data, error } = await supabase
          .from("payment_terminals")
          .insert(insertPayload)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      invalidatePaymentQueries(data.org_id);
    },
  });
}

// --- CURRENCIES ---

export function useCurrencies(orgId: string) {
  return useQuery({
    queryKey: queryKeys.currencies(orgId),
    queryFn: async (): Promise<Currency[]> => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("org_id", orgId)
        .eq("active", true)
        .order("is_base", { ascending: false })
        .order("label");

      return throwIfError(data, error);
    },
    enabled: !!orgId,
  });
}

// --- TRANSACTIONS ---

export function useInvoiceTransactions(invoiceId: string) {
  return useQuery({
    queryKey: queryKeys.transactions(invoiceId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select(`
          *,
          payment_methods!inner(label, code)
        `)
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!invoiceId,
  });
}

export function usePaymentSummary(invoiceId: string) {
  return useQuery({
    queryKey: queryKeys.paymentSummary(invoiceId),
    queryFn: async (): Promise<PaymentSummary> => {
      const { data, error } = await supabase
        .from("payment_transactions")
        .select("amount")
        .eq("invoice_id", invoiceId)
        .eq("status", "captured");

      if (error) throw error;

      const transactions = data || [];
      const totalPaid = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      return {
        totalPaid,
        transactionCount: transactions.length,
        remainingDue: 0, // Sera calculé côté UI avec le montant total
      };
    },
    enabled: !!invoiceId,
  });
}

export function useCreatePaymentTransaction() {
  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      console.log("🔄 Creating payment transaction", input);

      const payload = {
        org_id: input.orgId,
        invoice_id: input.invoiceId,
        method_id: input.methodId,
        amount: input.amount,
        currency_code: input.currencyCode || null,
        reference: input.reference || null,
        status: "captured",
        metadata: {},
      };

      const { data, error } = await supabase
        .from("payment_transactions")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating transaction:", error);
        throw error;
      }

      console.log("✅ Transaction created:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      invalidatePaymentQueries(variables.orgId, variables.invoiceId);
    },
  });
}