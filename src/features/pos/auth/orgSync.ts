import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export interface OrgSyncResult {
  success: boolean;
  org_id?: string;
  error?: string;
}

/**
 * Synchronise l'organisation entre l'utilisateur Auth et la session POS
 */
export async function syncOrganizations(
  authOrgId: string | null,
  posOrgId: string | null
): Promise<OrgSyncResult> {
  console.log("🔄 Organisation sync started", {
    authOrgId,
    posOrgId
  });

  // Si les deux sont null, c'est un problème
  if (!authOrgId && !posOrgId) {
    const error = "Aucune organisation trouvée pour cet utilisateur";
    console.error("❌", error);
    return { success: false, error };
  }

  // Si Auth a une org mais pas POS, utiliser celle d'Auth
  if (authOrgId && !posOrgId) {
    console.log("✅ Using Auth org_id", authOrgId);
    return { success: true, org_id: authOrgId };
  }

  // Si POS a une org mais pas Auth, utiliser celle de POS
  if (!authOrgId && posOrgId) {
    console.log("✅ Using POS org_id", posOrgId);
    return { success: true, org_id: posOrgId };
  }

  // Si les deux existent, vérifier qu'elles correspondent
  if (authOrgId && posOrgId) {
    if (authOrgId === posOrgId) {
      console.log("✅ Organizations match", authOrgId);
      return { success: true, org_id: authOrgId };
    } else {
      // Conflit d'organisation - utiliser celle d'Auth par défaut
      console.warn("⚠️ Organization mismatch", {
        authOrgId,
        posOrgId,
        action: "using_auth_org"
      });
      
      logger.warn("Organization mismatch detected", {
        authOrgId,
        posOrgId
      });
      
      return { success: true, org_id: authOrgId };
    }
  }

  return { success: false, error: "Situation d'organisation inattendue" };
}

/**
 * Vérifie si l'utilisateur a accès à une organisation donnée
 */
export async function validateUserOrgAccess(
  userId: string,
  orgId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('org_id')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('active', true)
      .single();

    if (error || !data) {
      console.warn("❌ User doesn't have access to org", {
        userId,
        orgId,
        error: error?.message
      });
      return false;
    }

    console.log("✅ User has access to org", { userId, orgId });
    return true;
  } catch (error) {
    console.error("❌ Error validating user org access", error);
    return false;
  }
}