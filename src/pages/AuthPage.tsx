import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/utils/errorHandling";

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
    
    console.log('Form submission started:', { mode, email });
    
    try {
      if (mode === "login") {
        console.log('Attempting login...');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Login error:', error);
          throw error;
        }
        console.log('Login successful');
      } else {
        console.log('Attempting signup...');
        const redirectUrl = `${window.location.origin}/`;
        console.log('Redirect URL:', redirectUrl);
        
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
            emailRedirectTo: redirectUrl 
          } 
        });
        
        console.log('Signup response:', { data, error });
        
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        if (data.user && !data.session) {
          setErr("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
          console.log('Account created, email confirmation required');
          return;
        }
        
        console.log('Signup successful');
      }
    } catch (e: unknown) {
      console.error('Auth error:', e);
      setErr(getErrorMessage(e) || "Une erreur s'est produite lors de l'authentification");
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
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Adresse email</label>
          <input className="w-full px-3 py-2 rounded-xl border border-border bg-card" 
                 placeholder="votre.email@exemple.com"
                 type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Mot de passe</label>
          <input className="w-full px-3 py-2 rounded-xl border border-border bg-card" 
                 placeholder="Votre mot de passe"
                 type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {err && <div className="text-sm text-destructive p-2 rounded bg-destructive/10">{err}</div>}
        <button disabled={busy} className="w-full min-h-11 px-4 rounded-xl text-primary-foreground bg-primary hover:bg-primary/90">
          {busy ? "…" : (mode==="login" ? "Se connecter" : "Créer le compte")}
        </button>
      </form>
    </div>
  );
}
