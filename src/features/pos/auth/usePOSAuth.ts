import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type POSRole = "pos_hostess" | "pos_server" | "pos_cashier" | "pos_manager";

export interface POSSession {
  user_id: string;
  display_name: string;
  role: POSRole;
  org_id: string;
  outlet_id: string;
  session_token: string;
  login_time: string;
}

export function usePOSAuth() {
  const [session, setSession] = useState<POSSession | null>(null);
  const [loading, setLoading] = useState(true);
  const isValidating = useRef(false);

  useEffect(() => {
    if (isValidating.current) return;
    
    logger.debug("POS auth initialization started");
    
    // Check for existing POS session using secure validation
    const storedSession = sessionStorage.getItem("pos_session");
    if (storedSession) {
      logger.debug("POS session found in storage");
      try {
        const parsedSession = JSON.parse(storedSession) as POSSession;
        validateStoredSession(parsedSession);
      } catch (error) {
        logger.error("Error parsing POS session", error);
        clearSession();
        setLoading(false);
      }
    } else {
      logger.debug("No POS session found");
      setLoading(false);
    }
  }, []);

  const validateStoredSession = async (storedSession: POSSession) => {
    if (isValidating.current) return;
    isValidating.current = true;
    
    console.log("🔍 POS session validation started", {
      user_id: storedSession.user_id,
      role: storedSession.role,
      org_id: storedSession.org_id,
      outlet_id: storedSession.outlet_id
    });
    
    logger.debug("POS session validation started", {
      user_id: storedSession.user_id,
      role: storedSession.role
    });

    try {
      // Créer un timeout de 10 secondes pour la validation
      const validationPromise = supabase.rpc("validate_pos_session", {
        p_session_token: storedSession.session_token
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout de validation")), 10000)
      );

      const { data, error } = await Promise.race([validationPromise, timeoutPromise]) as any;

      if (error || !data || data.length === 0) {
        console.log("❌ POS session invalid or expired", error);
        logger.warn("POS session invalid or expired");
        clearSession();
        return;
      }

      const validatedData = data[0];
      
      // Validation simple - utiliser directement les données validées
      if (!validatedData.org_id) {
        console.error("❌ POS session validation failed: missing org_id");
        logger.error("POS session validation failed: missing org_id");
        clearSession();
        return;
      }
      
      const validSession: POSSession = {
        user_id: validatedData.user_id,
        display_name: validatedData.display_name,
        role: validatedData.role_name as POSRole,
        org_id: validatedData.org_id,
        outlet_id: validatedData.outlet_id || storedSession.outlet_id || '',
        session_token: storedSession.session_token,
        login_time: storedSession.login_time
      };
      
      console.log("✅ POS session validated successfully", {
        display_name: validSession.display_name,
        role: validSession.role,
        org_id: validSession.org_id,
        outlet_id: validSession.outlet_id
      });
      
      logger.audit("POS session validated successfully", {
        display_name: validSession.display_name,
        role: validSession.role
      });
      
      setSession(validSession);
      sessionStorage.setItem("pos_session", JSON.stringify(validSession));
    } catch (error) {
      console.error("❌ POS session validation failed", error);
      logger.error("POS session validation failed", error);
      clearSession();
    } finally {
      isValidating.current = false;
      setLoading(false);
    }
  };

  const clearSession = () => {
    setSession(null);
    sessionStorage.removeItem("pos_session");
    isValidating.current = false;
  };

  const logout = async () => {
    if (session?.session_token) {
      try {
        await supabase.rpc("logout_pos_session", {
          p_session_token: session.session_token
        });
      } catch (error) {
        logger.error("POS logout error", error);
      }
    }
    clearSession();
  };

  const updateOutlet = async (outletId: string) => {
    if (!session) return;
    
    // Récupérer l'org_id de l'outlet sélectionné
    const { data: outlet } = await supabase
      .from('pos_outlets')
      .select('org_id')
      .eq('id', outletId)
      .single();
    
    const updatedSession = { 
      ...session, 
      outlet_id: outletId,
      org_id: outlet?.org_id || session.org_id 
    };
    setSession(updatedSession);
    sessionStorage.setItem("pos_session", JSON.stringify(updatedSession));
  };

  const hasRole = (requiredRole: POSRole): boolean => {
    if (!session) return false;
    
    const roleHierarchy = {
      'pos_hostess': 1,
      'pos_server': 2,
      'pos_cashier': 3,
      'pos_manager': 4,
    };
    
    return roleHierarchy[session.role] >= roleHierarchy[requiredRole];
  };

  const isHostess = session?.role === 'pos_hostess';
  const isServer = session?.role === 'pos_server';
  const isCashier = hasRole('pos_cashier');
  const isManager = hasRole('pos_manager');

  return {
    session,
    loading,
    logout,
    updateOutlet,
    hasRole,
    isHostess,
    isServer,
    isCashier,
    isManager,
    isAuthenticated: !!session
  };
}