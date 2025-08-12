import { useState, useEffect } from "react";

export type POSRole = "pos_server" | "pos_cashier" | "pos_manager";

export interface POSSession {
  user_id: string;
  display_name: string;
  role: POSRole;
  org_id: string;
  login_time: string;
}

export function usePOSAuth() {
  const [session, setSession] = useState<POSSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing POS session
    const storedSession = localStorage.getItem("pos_session");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession) as POSSession;
        
        // Check if session is not too old (24 hours max)
        const loginTime = new Date(parsedSession.login_time);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setSession(parsedSession);
        } else {
          localStorage.removeItem("pos_session");
        }
      } catch (error) {
        console.error("Error parsing POS session:", error);
        localStorage.removeItem("pos_session");
      }
    }
    setLoading(false);
  }, []);

  const logout = () => {
    setSession(null);
    localStorage.removeItem("pos_session");
  };

  const hasRole = (requiredRole: POSRole): boolean => {
    if (!session) return false;
    
    const roleHierarchy = {
      'pos_server': 1,
      'pos_cashier': 2,
      'pos_manager': 3,
    };
    
    return roleHierarchy[session.role] >= roleHierarchy[requiredRole];
  };

  const isServer = session?.role === 'pos_server';
  const isCashier = hasRole('pos_cashier');
  const isManager = hasRole('pos_manager');

  return {
    session,
    loading,
    logout,
    hasRole,
    isServer,
    isCashier,
    isManager,
    isAuthenticated: !!session
  };
}