import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Permission,
  ProfilePermission,
  ProfilePermissionInsert,
  AppUser,
  AppUserInsert,
  AppUserUpdate,
  StaffInvitationInsert,
  InvitationPayload,
  HasPermissionResponse,
  SupabaseResponse,
  SupabaseMultiResponse
} from "@/types/database";

export const listProfiles = (orgId: string) =>
  supabase.from("user_profiles").select("*").eq("org_id", orgId).order("name");

export const upsertProfile = (payload: any) =>
  supabase.from("user_profiles").upsert(payload).select();

export const deleteProfile = (id: string) =>
  supabase.from("user_profiles").delete().eq("id", id);

export const listPermissions = () =>
  supabase.from("permissions").select("*").order("category").order("label");

export const listProfilePermissions = (profileId: string) =>
  supabase.from("profile_permissions").select("*").eq("profile_id", profileId);

export const upsertProfilePermissions = (rows: any[]) =>
  supabase.from("profile_permissions").upsert(rows).select();

export const listAppUsers = (orgId: string) =>
  (supabase as any).from("app_users").select(`
    id, user_id, org_id, login, full_name, profile_id, password_expires_on, active, created_at, last_login_at
  `).eq("org_id", orgId).order("full_name");

export const upsertAppUser = (payload: any) =>
  (supabase as any).from("app_users").upsert(payload).select();

export const deleteAppUser = (id: string) =>
  (supabase as any).from("app_users").delete().eq("id", id);

/** Helper RPC - SECURITY: Updated to use new has_permission function */
export const hasPermission = async (key: string): Promise<boolean> => {
  const { data, error } = await (supabase as any).rpc("has_permission", { p_permission: key });
  if (error) throw error;
  return !!data;
};

export const createInvitation = (payload: {org_id: string; email: string; role: string;}) =>
  supabase.from("staff_invitations").insert({
    ...payload,
    token: crypto.randomUUID(),
    status: "pending"
  }).select();