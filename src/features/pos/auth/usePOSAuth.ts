import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    // Check for existing POS session using secure validation
    const storedSession = sessionStorage.getItem("pos_session");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession) as POSSession;
        validateStoredSession(parsedSession);
      } catch (error) {
        console.error("Error parsing POS session:", error);
        clearSession();
      }
    }
    setLoading(false);
  }, []);

  const validateStoredSession = async (storedSession: POSSession) => {
    try {
      const { data, error } = await supabase.rpc("validate_pos_session", {
        p_session_token: storedSession.session_token
      });

      if (error || !data || data.length === 0) {
        clearSession();
        return;
      }

      const validatedData = data[0];
      const validSession: POSSession = {
        user_id: validatedData.user_id,
        display_name: validatedData.display_name,
        role: validatedData.role_name as POSRole,
        org_id: validatedData.org_id,
        outlet_id: storedSession.outlet_id,
        session_token: storedSession.session_token,
        login_time: storedSession.login_time
      };
      
      setSession(validSession);
      sessionStorage.setItem("pos_session", JSON.stringify(validSession));
    } catch (error) {
      console.error("Session validation error:", error);
      clearSession();
    }
  };

  const clearSession = () => {
    setSession(null);
    sessionStorage.removeItem("pos_session");
  };

  const logout = async () => {
    if (session?.session_token) {
      try {
        await supabase.rpc("logout_pos_session", {
          p_session_token: session.session_token
        });
      } catch (error) {
        console.error("Logout error:", error);
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