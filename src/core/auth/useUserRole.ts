import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'admin' | 'manager' | 'staff' | 'user' | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRole(null);
          return;
        }

        // SECURITY: Use new secure function to get user role
        const { data, error } = await (supabase as any).rpc("get_current_user_role");
        
        if (error) {
          // Silently handle error - user role fetch failed
          setError(error.message);
          setRole(null);
          return;
        }

        setRole(data as UserRole);
      } catch (err: unknown) {
        // Silently handle error - getCurrentUserRole failed
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getCurrentUserRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (requiredRole: UserRole) => {
    if (!role || !requiredRole) return false;
    
    const roleHierarchy = {
      'user': 1,
      'staff': 2, 
      'manager': 3,
      'admin': 4
    };
    
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any).rpc("has_permission", { 
        p_permission: permission 
      });
      
      if (error) {
        // Silently handle error - permission check failed
        return false;
      }
      
      return !!data;
    } catch (err) {
      // Silently handle error - permission check failed
      return false;
    }
  };

  return {
    role,
    loading,
    error,
    hasRole,
    hasPermission,
    isAdmin: role === 'admin',
    isManager: hasRole('manager'),
    isStaff: hasRole('staff')
  };
}