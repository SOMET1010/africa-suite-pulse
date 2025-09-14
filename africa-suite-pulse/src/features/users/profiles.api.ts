import { supabase } from "@/integrations/supabase/client";

export const listUserProfiles = (orgId: string) =>
  (supabase as any).from("user_profiles")
  .select("*")
  .eq("org_id", orgId)
  .order("name", { ascending: true });

export const createUserProfile = (payload: {
  org_id: string;
  name: string;
  description?: string;
  access_level: string;
}) =>
  (supabase as any).from("user_profiles").insert(payload).select().single();

export const updateUserProfile = (id: string, patch: any) =>
  (supabase as any).from("user_profiles").update(patch).eq("id", id);

export const deleteUserProfile = (id: string) =>
  (supabase as any).from("user_profiles").delete().eq("id", id);

export const listPermissions = () =>
  (supabase as any).from("permissions")
  .select("*")
  .order("category", { ascending: true })
  .order("label", { ascending: true });

export const updateProfilePermissions = async (profileId: string, permissionKeys: string[]) => {
  // Delete existing permissions
  await (supabase as any).from("profile_permissions").delete().eq("profile_id", profileId);
  
  // Insert new permissions
  if (permissionKeys.length > 0) {
    const permissions = permissionKeys.map(permissionKey => ({
      profile_id: profileId,
      permission_key: permissionKey,
      allowed: true
    }));
    
    return (supabase as any).from("profile_permissions").insert(permissions);
  }
  
  return { data: null, error: null };
};

export const listUsers = (orgId: string) =>
  (supabase as any).from("app_users")
  .select("*")
  .eq("org_id", orgId)
  .order("full_name", { ascending: true });

export const updateUser = (userId: string, patch: any) =>
  (supabase as any).from("app_users").update(patch).eq("user_id", userId);

export const updateProfile = (userId: string, patch: any) =>
  (supabase as any).from("app_users").update(patch).eq("user_id", userId);

export const createInvitation = (payload: {org_id: string; email: string; role: string;}) =>
  (supabase as any).from("staff_invitations").insert({
    ...payload,
    token: crypto.randomUUID(),
    status: "pending"
  }).select();