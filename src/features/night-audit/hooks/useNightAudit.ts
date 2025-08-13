import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast-unified";
import type { NightAuditSession, AuditCheckpoint, DailyClosure } from "../types";

export const useNightAuditSessions = () => {
  return useQuery({
    queryKey: ["night-audit-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("night_audit_sessions")
        .select("id, audit_date, status, started_at, completed_at, started_by, hotel_date_before, hotel_date_after, org_id")
        .order("created_at", { ascending: false })
        .range(0, 50);

      if (error) throw error;
      return data as NightAuditSession[];
    },
  });
};

export const useAuditCheckpoints = (sessionId?: string) => {
  return useQuery({
    queryKey: ["audit-checkpoints", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from("audit_checkpoints")
        .select("id, checkpoint_type, checkpoint_name, status, order_index, is_critical, started_at, completed_at, error_message")
        .eq("session_id", sessionId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as AuditCheckpoint[];
    },
    enabled: !!sessionId,
  });
};

export const useStartNightAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (auditDate: string) => {
      const { data, error } = await supabase.rpc("start_night_audit", {
        p_audit_date: auditDate,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Audit de nuit démarré",
        description: "La session d'audit a été créée avec succès",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["night-audit-sessions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer l'audit",
        variant: "destructive",
      });
    },
  });
};

export const useCompleteNightAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc("complete_night_audit", {
        p_session_id: sessionId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Audit terminé",
        description: "L'audit de nuit a été complété avec succès",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["night-audit-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["daily-closures"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de terminer l'audit",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCheckpoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      checkpointId,
      status,
      data,
      errorMessage,
    }: {
      checkpointId: string;
      status: string;
      data?: Record<string, any>;
      errorMessage?: string;
    }) => {
      const { data: result, error } = await supabase.rpc("update_audit_checkpoint", {
        p_checkpoint_id: checkpointId,
        p_status: status,
        p_data: data || null,
        p_error_message: errorMessage || null,
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      if (variables.status === "completed") {
        toast({
          title: "Checkpoint complété",
          description: "L'étape a été marquée comme terminée",
          variant: "success",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["audit-checkpoints"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le checkpoint",
        variant: "destructive",
      });
    },
  });
};

export const useDailyClosures = () => {
  return useQuery({
    queryKey: ["daily-closures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_closures")
        .select("id, closure_date, total_rooms, occupied_rooms, arrivals_count, departures_count, revenue_total, org_id")
        .order("closure_date", { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as DailyClosure[];
    },
  });
};