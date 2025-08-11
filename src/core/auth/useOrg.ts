import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

async function createProfileForUser(userId: string, email?: string) {
  // D'abord, s'assurer qu'il y a au moins une organisation
  const { data: orgs } = await (supabase as any)
    .from("hotel_settings")
    .select("org_id")
    .limit(1);
  
  let orgId: string;
  
  if (!orgs || orgs.length === 0) {
    // Créer une organisation par défaut
    const { data: newOrg } = await (supabase as any)
      .from("hotel_settings")
      .insert({
        name: "Mon Hôtel",
        org_id: crypto.randomUUID()
      })
      .select("org_id")
      .single();
    
    orgId = newOrg.org_id;
  } else {
    orgId = orgs[0].org_id;
  }
  
  // Créer le profil utilisateur - SECURITY: Role assignment moved to database trigger
  await (supabase as any)
    .from("app_users")
    .insert({
      user_id: userId,
      org_id: orgId,
      email: email
      // Role assignment now handled by handle_new_user trigger in database
    });
}

type ProfileRow = {
  user_id: string;
  org_id: string | null;
};

type UseOrgIdResult = {
  orgId: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CACHE_KEY = "org_id_cache";

export function useOrgId(): UseOrgIdResult {
  const [orgId, setOrgId] = useState<string | null>(() => {
    // petit cache pour éviter 1 requête au 1er render si dispo
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      // Vérifier que c'est un UUID valide et pas la string "null"
      if (cached && cached !== "null" && cached.length === 36) {
        return cached;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(!orgId);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const loadOrgId = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) {
        setOrgId(null);
        try { sessionStorage.removeItem(CACHE_KEY); } catch {}
        return;
      }

      const { data, error: dbErr } = await (supabase as any)
        .from("app_users")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (dbErr) throw dbErr;
      
      // Si aucun profil n'existe, en créer un
      if (!data) {
        await createProfileForUser(user.id, user.email);
        // Retry after creating profile
        const { data: retryData, error: retryErr } = await (supabase as any)
          .from("app_users")
          .select("org_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        
        if (retryErr) throw retryErr;
        const org = retryData?.org_id ?? null;
        if (!alive.current) return;
        setOrgId(org);
        try {
          if (org) sessionStorage.setItem(CACHE_KEY, org);
          else sessionStorage.removeItem(CACHE_KEY);
        } catch {}
        return;
      }

      const org = data?.org_id ?? null;
      if (!alive.current) return;
      setOrgId(org);
      try {
        if (org) sessionStorage.setItem(CACHE_KEY, org);
        else sessionStorage.removeItem(CACHE_KEY);
      } catch {}
    } catch (e: any) {
      if (!alive.current) return;
      setError(e?.message ?? "Erreur inconnue lors de la récupération de l'organisation");
      setOrgId(null);
      try { sessionStorage.removeItem(CACHE_KEY); } catch {}
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  // première charge
  useEffect(() => {
    alive.current = true;
    // si pas de cache, on charge; sinon on valide en arrière-plan
    if (!orgId) loadOrgId();
    else loadOrgId(); // "revalidate on mount" pour rafraîchir le cache
    return () => { alive.current = false; };
  }, [loadOrgId]);

  // suivre les changements d'auth
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      // re-fetch org à chaque changement (login, logout, token refresh…)
      loadOrgId();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [loadOrgId]);

  return { orgId, loading, error, refresh: loadOrgId };
}