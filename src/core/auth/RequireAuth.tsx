import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { logSecurityEvent } = useSecurityMonitoring();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setAuthed(!!currentSession);
        
        // Log security events
        if (event === 'SIGNED_IN' && currentSession) {
          setTimeout(() => {
            logSecurityEvent('user_login', {
              user_id: currentSession.user.id,
              timestamp: new Date().toISOString()
            }, 'info');
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setTimeout(() => {
            logSecurityEvent('user_logout', {
              timestamp: new Date().toISOString()
            }, 'info');
          }, 0);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthed(!!data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [logSecurityEvent]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!authed) return <Navigate to="/auth" replace/>;
  return <>{children}</>;
}
