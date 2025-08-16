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
  logger.debug("Organisation sync started", {
    authOrgId,
    posOrgId
  });

  // Si les deux sont null, c'est un problème
  if (!authOrgId && !posOrgId) {
    const error = "Aucune organisation trouvée pour cet utilisateur";
    logger.error("No organization found for user");
    return { success: false, error };
  }

  // Si Auth a une org mais pas POS, utiliser celle d'Auth
  if (authOrgId && !posOrgId) {
    logger.debug("Using Auth org_id", { authOrgId });
    return { success: true, org_id: authOrgId };
  }

  // Si POS a une org mais pas Auth, utiliser celle de POS
  if (!authOrgId && posOrgId) {
    logger.debug("Using POS org_id", { posOrgId });
    return { success: true, org_id: posOrgId };
  }

  // Si les deux existent, vérifier qu'elles correspondent
  if (authOrgId && posOrgId) {
    if (authOrgId === posOrgId) {
      logger.debug("Organizations match", { authOrgId });
      return { success: true, org_id: authOrgId };
    } else {
      // Conflit d'organisation - utiliser celle d'Auth par défaut
      logger.warn("Organization mismatch detected", {
        authOrgId,
        posOrgId,
        action: "using_auth_org"
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
      logger.warn("User doesn't have access to org", {
        userId,
        orgId,
        error: error?.message
      });
      return false;
    }

    logger.debug("User has access to org", { userId, orgId });
    return true;
  } catch (error) {
    logger.error("Error validating user org access", error);
    return false;
  }
}