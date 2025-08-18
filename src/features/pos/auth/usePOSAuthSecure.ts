import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger.service";

export type POSRole = "pos_hostess" | "pos_server" | "pos_cashier" | "pos_manager";

export interface POSSecureSession {
  pos_user_id: string;
  user_id: string; // Compatibilité avec l'ancien système
  display_name: string;
  role_name: POSRole;
  role: POSRole; // Compatibilité avec l'ancien système
  employee_code: string;
  org_id: string;
  outlet_id?: string;
  session_token: string;
  expires_at: string;
  login_time: string; // Compatibilité avec l'ancien système
}

// Singleton sécurisé pour éviter les initialisations multiples
let globalSession: POSSecureSession | null = null;
let globalLoading = true;
let isValidating = false;
let hasInitialized = false;
const sessionListeners: Set<(session: POSSecureSession | null) => void> = new Set();
const loadingListeners: Set<(loading: boolean) => void> = new Set();

export function usePOSAuthSecure() {
  const [session, setSession] = useState<POSSecureSession | null>(globalSession);
  const [loading, setLoading] = useState(globalLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ajouter les listeners
    sessionListeners.add(setSession);
    loadingListeners.add(setLoading);
    
    // Initialisation globale une seule fois
    if (!hasInitialized && !isValidating) {
      hasInitialized = true;
      
      logger.debug("POS Secure Auth initialization - SINGLE INIT");
      
      // Vérifier s'il y a une session stockée
      const storedSession = sessionStorage.getItem("pos_secure_session");
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          validateStoredSession(parsedSession);
        } catch (error) {
          logger.error("Error parsing stored POS session", error);
          clearSession();
        }
      } else {
        updateGlobalLoading(false);
      }
    }
    
    // Cleanup function
    return () => {
      sessionListeners.delete(setSession);
      loadingListeners.delete(setLoading);
    };
  }, []);

  const updateGlobalSession = (newSession: POSSecureSession | null) => {
    globalSession = newSession;
    sessionListeners.forEach(listener => listener(newSession));
  };

  const updateGlobalLoading = (newLoading: boolean) => {
    globalLoading = newLoading;
    loadingListeners.forEach(listener => listener(newLoading));
  };

  const validateStoredSession = async (storedSession: POSSecureSession) => {
    if (isValidating) return;
    isValidating = true;
    
    logger.debug("POS Secure session validation started", {
      pos_user_id: storedSession.pos_user_id,
      role: storedSession.role_name,
      org_id: storedSession.org_id
    });

    try {
      // Vérifier si la session n'est pas expirée
      const expiresAt = new Date(storedSession.expires_at);
      if (expiresAt <= new Date()) {
        logger.warn("POS session expired", { expires_at: storedSession.expires_at });
        clearSession();
        return;
      }

      // Valider la session avec la nouvelle fonction sécurisée
      const { data, error } = await supabase.rpc("validate_pos_secure_session", {
        p_session_token: storedSession.session_token
      });

      if (error || !data || data.length === 0) {
        logger.warn("POS Secure session invalid or expired", { error });
        clearSession();
        return;
      }

      const validatedData = data[0];
      
      if (!validatedData.org_id) {
        logger.error("POS Secure session validation failed: missing org_id");
        clearSession();
        return;
      }
      
      const validSession: POSSecureSession = {
        pos_user_id: validatedData.pos_user_id,
        user_id: validatedData.pos_user_id, // Compatibilité
        display_name: validatedData.display_name,
        role_name: validatedData.role_name as POSRole,
        role: validatedData.role_name as POSRole, // Compatibilité
        employee_code: validatedData.employee_code,
        org_id: validatedData.org_id,
        outlet_id: validatedData.outlet_id || storedSession.outlet_id,
        session_token: storedSession.session_token,
        expires_at: storedSession.expires_at,
        login_time: storedSession.login_time || new Date().toISOString() // Compatibilité
      };
      
      logger.audit("POS Secure session validated successfully", {
        display_name: validSession.display_name,
        role: validSession.role_name,
        org_id: validSession.org_id,
        employee_code: validSession.employee_code
      });
      
      updateGlobalSession(validSession);
      sessionStorage.setItem("pos_secure_session", JSON.stringify(validSession));
    } catch (error) {
      logger.error("POS Secure session validation failed", error);
      clearSession();
    } finally {
      isValidating = false;
      updateGlobalLoading(false);
    }
  };

  const clearSession = () => {
    logger.debug("Clearing POS Secure session");
    updateGlobalSession(null);
    sessionStorage.removeItem("pos_secure_session");
    isValidating = false;
    hasInitialized = false;
    setError(null);
  };

  const authenticate = async (employeeCode: string, pin: string, orgId: string): Promise<{ success: boolean; error?: string; lockedUntil?: Date }> => {
    updateGlobalLoading(true);
    setError(null);

    try {
      logger.debug("POS Secure authentication attempt", { employeeCode, orgId });

      const { data, error } = await supabase.rpc("secure_pos_authenticate", {
        p_employee_code: employeeCode,
        p_pin: pin,
        p_org_id: orgId
      });

      if (error) {
        logger.error("POS Secure authentication error", error);
        setError("Erreur d'authentification");
        return { success: false, error: "Erreur d'authentification" };
      }

      if (!data || data.length === 0) {
        setError("Code employé ou PIN incorrect");
        return { success: false, error: "Code employé ou PIN incorrect" };
      }

      const authData = data[0];
      const newSession: POSSecureSession = {
        pos_user_id: authData.pos_user_id,
        user_id: authData.pos_user_id, // Compatibilité
        display_name: authData.display_name,
        role_name: authData.role_name as POSRole,
        role: authData.role_name as POSRole, // Compatibilité
        employee_code: authData.employee_code,
        org_id: orgId,
        session_token: authData.session_token,
        expires_at: authData.expires_at,
        login_time: new Date().toISOString() // Compatibilité
      };

      updateGlobalSession(newSession);
      sessionStorage.setItem("pos_secure_session", JSON.stringify(newSession));

      logger.audit("POS Secure authentication successful", {
        display_name: newSession.display_name,
        role: newSession.role_name,
        employee_code: newSession.employee_code
      });

      return { success: true };
    } catch (error) {
      logger.error("POS Secure authentication failed", error);
      setError("Erreur de connexion");
      return { success: false, error: "Erreur de connexion" };
    } finally {
      updateGlobalLoading(false);
    }
  };

  const logout = async () => {
    if (session?.session_token) {
      try {
        await supabase.rpc("secure_pos_logout", {
          p_session_token: session.session_token
        });
        
        logger.audit("POS Secure logout successful", {
          employee_code: session.employee_code,
          display_name: session.display_name
        });
      } catch (error) {
        logger.error("POS Secure logout error", error);
      }
    }
    clearSession();
  };

  const updateOutlet = async (outletId: string) => {
    if (!globalSession) return;
    
    const updatedSession = { 
      ...globalSession, 
      outlet_id: outletId
    };
    updateGlobalSession(updatedSession);
    sessionStorage.setItem("pos_secure_session", JSON.stringify(updatedSession));
  };

  const hasRole = (requiredRole: POSRole): boolean => {
    if (!globalSession) return false;
    
    const roleHierarchy = {
      'pos_hostess': 1,
      'pos_server': 2,
      'pos_cashier': 3,
      'pos_manager': 4,
    };
    
    return roleHierarchy[globalSession.role_name] >= roleHierarchy[requiredRole];
  };

  const isHostess = globalSession?.role_name === 'pos_hostess';
  const isServer = globalSession?.role_name === 'pos_server';
  const isCashier = hasRole('pos_cashier');
  const isManager = hasRole('pos_manager');

  return {
    session,
    loading,
    error,
    authenticate,
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