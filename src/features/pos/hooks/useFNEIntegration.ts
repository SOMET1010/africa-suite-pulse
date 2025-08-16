import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast-unified";

export interface FNEOrder {
  id: string;
  order_number: string;
  total_amount: number;
  tax_amount: number;
  fne_status: 'pending' | 'submitted' | 'validated' | 'rejected' | 'error';
  fne_invoice_id?: string;
  fne_reference_number?: string;
  fne_qr_code?: string;
  fne_submitted_at?: string;
  fne_validated_at?: string;
  fne_error_message?: string;
}

export interface FNEPendingInvoice {
  id: string;
  order_id: string;
  retry_count: number;
  max_retries: number;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'abandoned';
  last_error_message?: string;
  next_retry_at?: string;
  created_at: string;
  priority: number;
}

export interface FNEApiLog {
  id: string;
  order_id?: string;
  operation_type: string;
  success: boolean;
  response_time_ms?: number;
  error_message?: string;
  fne_invoice_id?: string;
  created_at: string;
}

export interface FNEStats {
  total_invoices: number;
  successful_invoices: number;
  pending_invoices: number;
  failed_invoices: number;
  average_response_time: number;
  success_rate: number;
}

export const useFNEIntegration = (orgId: string) => {
  const queryClient = useQueryClient();

  // Récupérer les commandes avec statut FNE
  const { data: fneOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["fne-orders", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_orders")
        .select(`
          id,
          order_number,
          total_amount,
          tax_amount,
          fne_status,
          fne_invoice_id,
          fne_reference_number,
          fne_qr_code,
          fne_submitted_at,
          fne_validated_at,
          fne_error_message
        `)
        .eq("org_id", orgId)
        .not("fne_status", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as FNEOrder[];
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Récupérer les factures en attente
  const { data: pendingInvoices, isLoading: pendingLoading } = useQuery({
    queryKey: ["fne-pending", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fne_pending_invoices")
        .select("*")
        .eq("org_id", orgId)
        .in("status", ["pending", "processing", "failed"])
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as FNEPendingInvoice[];
    },
    refetchInterval: 15000, // Rafraîchir toutes les 15 secondes
  });

  // Récupérer les logs API FNE
  const { data: apiLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["fne-logs", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fne_api_logs")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as FNEApiLog[];
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });

  // Soumettre une facture FNE
  const submitInvoiceMutation = useMutation({
    mutationFn: async ({
      orderId,
      orderNumber,
      totalAmount,
      taxAmount,
      items,
      customer,
    }: {
      orderId: string;
      orderNumber: string;
      totalAmount: number;
      taxAmount: number;
      items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        taxRate: number;
      }>;
      customer?: {
        name?: string;
        phone?: string;
        email?: string;
      };
    }) => {
      const { data, error } = await supabase.functions.invoke("fne-connector", {
        body: {
          action: "submit_invoice",
          orderId,
          orgId,
          orderNumber,
          totalAmount,
          taxAmount,
          items,
          customer,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fne-orders"] });
      queryClient.invalidateQueries({ queryKey: ["fne-pending"] });
      queryClient.invalidateQueries({ queryKey: ["fne-logs"] });

      if (data.success) {
        toast({
          title: "Facture FNE soumise",
          description: `ID FNE: ${data.fne_invoice_id}`,
          variant: "success",
        });
      } else {
        toast({
          title: "Facture mise en queue",
          description: data.error_message || "Facture ajoutée pour traitement ultérieur",
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur FNE",
        description: error.message || "Impossible de soumettre la facture",
        variant: "destructive",
      });
    },
  });

  // Traiter les factures en attente manuellement
  const processPendingMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("fne-connector", {
        body: {
          action: "process_pending",
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fne-orders"] });
      queryClient.invalidateQueries({ queryKey: ["fne-pending"] });
      queryClient.invalidateQueries({ queryKey: ["fne-logs"] });

      toast({
        title: "Traitement lancé",
        description: "Les factures en attente sont en cours de traitement",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de traitement",
        description: error.message || "Impossible de traiter les factures en attente",
        variant: "destructive",
      });
    },
  });

  // Calculer les statistiques FNE
  const stats: FNEStats = {
    total_invoices: fneOrders?.length || 0,
    successful_invoices: fneOrders?.filter(o => o.fne_status === 'validated').length || 0,
    pending_invoices: pendingInvoices?.length || 0,
    failed_invoices: fneOrders?.filter(o => o.fne_status === 'error').length || 0,
    average_response_time: apiLogs?.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / (apiLogs?.length || 1) || 0,
    success_rate: fneOrders?.length ? (fneOrders.filter(o => o.fne_status === 'validated').length / fneOrders.length) * 100 : 0,
  };

  return {
    // Données
    fneOrders,
    pendingInvoices,
    apiLogs,
    stats,

    // États de chargement
    ordersLoading,
    pendingLoading,
    logsLoading,
    isLoading: ordersLoading || pendingLoading || logsLoading,

    // Actions
    submitInvoice: submitInvoiceMutation.mutate,
    isSubmitting: submitInvoiceMutation.isPending,
    processPending: processPendingMutation.mutate,
    isProcessing: processPendingMutation.isPending,

    // Helpers
    getFNEStatus: (order: FNEOrder) => {
      switch (order.fne_status) {
        case 'pending':
          return { label: 'En attente', color: 'text-yellow-600' };
        case 'submitted':
          return { label: 'Soumise', color: 'text-blue-600' };
        case 'validated':
          return { label: 'Validée', color: 'text-green-600' };
        case 'rejected':
          return { label: 'Rejetée', color: 'text-red-600' };
        case 'error':
          return { label: 'Erreur', color: 'text-red-600' };
        default:
          return { label: 'Inconnu', color: 'text-gray-600' };
      }
    },

    getPendingStatus: (invoice: FNEPendingInvoice) => {
      switch (invoice.status) {
        case 'pending':
          return { label: 'En attente', color: 'text-yellow-600' };
        case 'processing':
          return { label: 'En cours', color: 'text-blue-600' };
        case 'success':
          return { label: 'Réussie', color: 'text-green-600' };
        case 'failed':
          return { label: 'Échec', color: 'text-red-600' };
        case 'abandoned':
          return { label: 'Abandonnée', color: 'text-gray-600' };
        default:
          return { label: 'Inconnu', color: 'text-gray-600' };
      }
    },
  };
};