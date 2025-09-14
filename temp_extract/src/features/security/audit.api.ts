
import { supabase } from "@/integrations/supabase/client";

export type AuditLog = {
  id: string;
  occurred_at: string;
  user_id: string | null;
  org_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  severity: "info" | "warning" | "error" | string;
};

export type ListAuditLogsParams = {
  orgId?: string;
  limit?: number;
  fromDate?: string; // ISO
  toDate?: string;   // ISO
  action?: string;
  table?: string;
  severity?: string;
};

export const auditApi = {
  async listAuditLogs(params: ListAuditLogsParams = {}) {
    const { orgId, limit = 100, fromDate, toDate, action, table, severity } = params;
    let query = (supabase as any).from("audit_logs").select("*");

    // RLS assure déjà org_id = get_current_user_org_id(), le filtre orgId est optionnel
    if (orgId) query = query.eq("org_id", orgId);

    if (fromDate) query = query.gte("occurred_at", fromDate);
    if (toDate) query = query.lte("occurred_at", toDate);
    if (action) query = query.eq("action", action);
    if (table) query = query.eq("table_name", table);
    if (severity) query = query.eq("severity", severity);

    query = query.order("occurred_at", { ascending: false }).limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as AuditLog[];
  },
};
