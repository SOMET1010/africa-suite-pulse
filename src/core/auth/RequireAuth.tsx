import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session); setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => setAuthed(!!sess));
    return () => sub?.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!authed) return <Navigate to="/auth" replace/>;
  return <>{children}</>;
}
