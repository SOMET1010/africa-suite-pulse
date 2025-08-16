import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/services/logger.service";

// Types pour les événements fiscaux
export interface FiscalEvent {
  id: string;
  org_id: string;
  sequence_number: number;
  event_type: 'SALE_LINE' | 'PAYMENT' | 'DISCOUNT' | 'REFUND' | 'VOID' | 'X_CLOSURE' | 'Z_CLOSURE' | 'CORRECTION';
  event_timestamp: string;
  reference_type: 'order' | 'order_item' | 'payment' | 'session' | 'closure';
  reference_id: string;
  event_data: any;
  previous_hash: string;
  event_hash: string;
  digital_signature: string;
  signature_algorithm: string;
  fiscal_period: string;
  cashier_id?: string;
  pos_station_id?: string;
  created_at: string;
  created_by?: string;
}

export interface DailyClosureZ {
  id: string;
  org_id: string;
  closure_date: string;
  pos_station_id: string;
  cashier_id: string;
  closure_data: any;
  total_sales_amount: number;
  total_tax_amount: number;
  total_transactions_count: number;
  daily_chain_hash: string;
  closure_signature: string;
  signature_certificate: string;
  signature_timestamp: string;
  is_sealed: boolean;
  compliance_status: 'pending' | 'validated' | 'error';
  created_at: string;
}

// Hook pour récupérer les événements fiscaux
export function useFiscalEvents(date?: string) {
  return useQuery({
    queryKey: ["fiscal-events", date],
    queryFn: async () => {
      let query = supabase
        .from("pos_fiscal_events")
        .select("*")
        .order("sequence_number", { ascending: true });

      if (date) {
        query = query.eq("fiscal_period", date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FiscalEvent[];
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

// Hook pour récupérer les clôtures Z
export function useDailyClosuresZ(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["daily-closures-z", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("pos_daily_closures_z")
        .select("*")
        .order("closure_date", { ascending: false });

      if (startDate) {
        query = query.gte("closure_date", startDate);
      }
      if (endDate) {
        query = query.lte("closure_date", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DailyClosureZ[];
    },
  });
}

// Hook pour créer un événement fiscal
export function useCreateFiscalEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      eventType: FiscalEvent['event_type'];
      referenceType: FiscalEvent['reference_type'];
      referenceId: string;
      eventData: any;
      cashierId?: string;
      posStationId?: string;
    }) => {
      // Obtenir l'org_id de l'utilisateur
      const { data: orgData } = await supabase.rpc("get_current_user_org_id");
      
      if (!orgData) {
        throw new Error("Organisation non trouvée");
      }

      // Appeler la fonction pour créer l'événement fiscal
      const { data, error } = await supabase.rpc("create_fiscal_event", {
        p_org_id: orgData,
        p_event_type: params.eventType,
        p_reference_type: params.referenceType,
        p_reference_id: params.referenceId,
        p_event_data: params.eventData,
        p_cashier_id: params.cashierId,
        p_pos_station_id: params.posStationId || 'POS-01'
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-events"] });
      logger.audit("Fiscal event created successfully", { eventCreated: true });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur fiscale",
        description: error.message || "Impossible de créer l'événement fiscal",
        variant: "destructive",
      });
    }
  });
}

// Hook pour vérifier l'intégrité de la chaîne fiscale
export function useVerifyFiscalChain() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (date: string) => {
      // Récupérer tous les événements de la journée
      const { data: events, error } = await supabase
        .from("pos_fiscal_events")
        .select("*")
        .eq("fiscal_period", date)
        .order("sequence_number", { ascending: true });

      if (error) throw error;

      // Vérifier l'intégrité de la chaîne
      let isValid = true;
      let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';

      for (const event of events) {
        if (event.previous_hash !== previousHash) {
          isValid = false;
          break;
        }
        previousHash = event.event_hash;
      }

      return {
        isValid,
        totalEvents: events.length,
        date
      };
    },
    onSuccess: (result) => {
      if (result.isValid) {
        toast({
          title: "Chaîne fiscale valide",
          description: `${result.totalEvents} événements vérifiés pour le ${result.date}`,
        });
      } else {
        toast({
          title: "Chaîne fiscale compromise",
          description: `Intégrité rompue pour le ${result.date}`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de vérification",
        description: error.message || "Impossible de vérifier la chaîne fiscale",
        variant: "destructive",
      });
    }
  });
}

// Hook pour effectuer une clôture Z
export function useCreateClosureZ() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      posStationId: string;
      cashierId: string;
      closureData: any;
    }) => {
      // Obtenir l'org_id de l'utilisateur
      const { data: orgData } = await supabase.rpc("get_current_user_org_id");
      
      if (!orgData) {
        throw new Error("Organisation non trouvée");
      }

      const today = new Date().toISOString().split('T')[0];

      // Calculer les totaux depuis les événements fiscaux du jour
      const { data: events, error: eventsError } = await supabase
        .from("pos_fiscal_events")
        .select("*")
        .eq("org_id", orgData)
        .eq("fiscal_period", today)
        .in("event_type", ["SALE_LINE", "PAYMENT"]);

      if (eventsError) throw eventsError;

      // Calculer les totaux
      let totalSales = 0;
      let totalTax = 0;
      let transactionCount = 0;

      events.forEach(event => {
        if (event.event_type === 'SALE_LINE') {
          const eventData = event.event_data as any;
          totalSales += eventData.total_price || 0;
          totalTax += eventData.tax_amount || 0;
        } else if (event.event_type === 'PAYMENT') {
          transactionCount++;
        }
      });

      // Générer le hash de la chaîne du jour
      const lastEvent = events[events.length - 1];
      const dailyChainHash = lastEvent ? lastEvent.event_hash : '0000000000000000000000000000000000000000000000000000000000000000';

      // Générer une signature simplifiée (à remplacer par une vraie signature PKI)
      const closureSignature = `SEAL_${today}_${params.posStationId}_${Date.now()}`;

      // Créer la clôture Z
      const { data, error } = await supabase
        .from("pos_daily_closures_z")
        .insert({
          org_id: orgData,
          closure_date: today,
          pos_station_id: params.posStationId,
          cashier_id: params.cashierId,
          closure_data: params.closureData,
          total_sales_amount: totalSales,
          total_tax_amount: totalTax,
          total_transactions_count: transactionCount,
          daily_chain_hash: dailyChainHash,
          closure_signature: closureSignature,
          signature_certificate: "TEMP_CERT_" + Date.now(),
          is_sealed: true,
          compliance_status: 'validated'
        })
        .select()
        .single();

      if (error) throw error;

      // Créer un événement fiscal pour la clôture Z
      await supabase.rpc("create_fiscal_event", {
        p_org_id: orgData,
        p_event_type: 'Z_CLOSURE',
        p_reference_type: 'closure',
        p_reference_id: data.id,
        p_event_data: {
          closure_date: today,
          total_sales: totalSales,
          total_tax: totalTax,
          transaction_count: transactionCount,
          signature: closureSignature
        },
        p_cashier_id: params.cashierId,
        p_pos_station_id: params.posStationId
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["daily-closures-z"] });
      queryClient.invalidateQueries({ queryKey: ["fiscal-events"] });
      toast({
        title: "Clôture Z effectuée",
        description: `Clôture scellée pour le ${data.closure_date}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de clôture",
        description: error.message || "Impossible d'effectuer la clôture Z",
        variant: "destructive",
      });
    }
  });
}