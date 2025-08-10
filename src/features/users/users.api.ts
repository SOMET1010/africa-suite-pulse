import { supabase } from "@/integrations/supabase/client";

export const listProfiles = (orgId: string) =>
  supabase.from("profiles")
  .select("user_id, full_name, email, role, org_id, active, last_login_at")
  .eq("org_id", orgId)
  .order("full_name", { ascending: true });

export const updateProfile = (user_id: string, patch: any) =>
  supabase.from("profiles").update(patch).eq("user_id", user_id);

export const createInvitation = (payload: {org_id: string; email: string; role: string;}) =>
  (supabase as any).from("staff_invitations").insert({
    ...payload,
    token: crypto.randomUUID(),
    status: "pending"
  }).select();