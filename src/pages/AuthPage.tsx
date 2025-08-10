import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|undefined>();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) nav("/");
    });
    return () => sub?.subscription.unsubscribe();
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(undefined);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const redirectUrl = `${window.location.origin}/`; // Required for email confirmation flows
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl } });
        if (error) throw error;
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-soft p-6 space-y-4">
        <div className="text-xl font-semibold text-center">AfricaSuite PMS</div>
        <div className="flex gap-2">
          <button type="button" onClick={()=>setMode("login")}
            className={`flex-1 px-3 py-2 rounded-xl border ${mode==="login"?"bg-primary/10 border-transparent":"border-border"}`}>Connexion</button>
          <button type="button" onClick={()=>setMode("signup")}
            className={`flex-1 px-3 py-2 rounded-xl border ${mode==="signup"?"bg-primary/10 border-transparent":"border-border"}`}>Créer un compte</button>
        </div>
        <input className="w-full px-3 py-2 rounded-xl border border-border bg-card" placeholder="Email"
               type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full px-3 py-2 rounded-xl border border-border bg-card" placeholder="Mot de passe"
               type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button disabled={busy} className="w-full min-h-11 px-4 rounded-xl text-primary-foreground bg-primary hover:bg-primary/90">
          {busy ? "…" : (mode==="login" ? "Se connecter" : "Créer le compte")}
        </button>
      </form>
    </div>
  );
}
