import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/utils/errorHandling";
import { EnhancedInput, ToggleButtons, TouchButton, FormLoadingState } from "@/components/enhanced";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login"|"signup"|"reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|undefined>();
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) nav("/");
    });
    return () => sub?.subscription.unsubscribe();
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(undefined);
    
    // SECURITY: Removed console.log - contains email data
    
    try {
      if (mode === "login") {
        // SECURITY: Removed console.log
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('Login error:', error);
          throw error;
        }
        // SECURITY: Removed console.log
      } else if (mode === "signup") {
        // SECURITY: Removed console.log
        const redirectUrl = `${window.location.origin}/`;
        // SECURITY: Removed console.log
        
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { 
            emailRedirectTo: redirectUrl 
          } 
        });
        
        // SECURITY: Removed console.log - contains sensitive auth data
        
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        if (data.user && !data.session) {
          setErr("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
          // SECURITY: Removed console.log
          return;
        }
        
        // SECURITY: Removed console.log
      } else if (mode === "reset") {
        // SECURITY: Removed console.log
        const redirectUrl = `${window.location.origin}/auth?mode=reset-confirm`;
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        });
        
        if (error) {
          console.error('Reset error:', error);
          throw error;
        }
        
        setResetEmailSent(true);
        setErr("Email de récupération envoyé ! Vérifiez votre boîte mail.");
        // SECURITY: Removed console.log
        return;
      }
    } catch (e: unknown) {
      console.error('Auth error:', e);
      setErr(getErrorMessage(e) || "Une erreur s'est produite lors de l'authentification");
    } finally {
      setBusy(false);
    }
  }

  const authOptions = [
    { value: "login", label: "Connexion", icon: <LogIn className="h-4 w-4" /> },
    { value: "signup", label: "Créer un compte", icon: <UserPlus className="h-4 w-4" /> }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card shadow-luxury backdrop-blur-sm p-8 form-gap flex flex-col">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">AfricaSuite PMS</h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Connectez-vous à votre compte" : "Créez votre compte professionnel"}
            </p>
          </div>

          {/* Mode Toggle */}
          {mode !== "reset" && (
            <div className="mb-6">
              <ToggleButtons
                options={authOptions}
                value={mode}
                onChange={(value) => setMode(value as "login" | "signup")}
                variant="primary"
                size="md"
                className="w-full"
              />
            </div>
          )}

          {/* Reset Mode Header */}
          {mode === "reset" && (
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Récupération de mot de passe</h2>
              <p className="text-sm text-muted-foreground">
                Entrez votre adresse email pour recevoir un lien de récupération
              </p>
            </div>
          )}

          {/* Email Input */}
          <EnhancedInput
            label="Adresse email"
            type="email"
            placeholder="votre.email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            disabled={busy}
            size="md"
          />

          {/* Password Input */}
          {mode !== "reset" && (
            <EnhancedInput
              label="Mot de passe"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              required
              disabled={busy}
              size="md"
            />
          )}

          {/* Forgot Password Link */}
          {mode === "login" && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-sm text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* Error/Success Message */}
          {err && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {err}
            </div>
          )}

          {/* Loading State */}
          {busy && (
            <FormLoadingState 
              text={mode === "login" ? "Connexion en cours..." : mode === "signup" ? "Création du compte..." : "Envoi de l'email..."} 
            />
          )}

          {/* Submit Button */}
          <TouchButton
            type="submit"
            disabled={busy || !email || (mode !== "reset" && !password)}
            intent="primary"
            touchSize="comfortable"
            feedback="haptic"
            className="w-full mt-2 h-12 text-base"
          >
            {mode === "login" ? "Se connecter" : mode === "signup" ? "Créer le compte" : "Envoyer l'email"}
          </TouchButton>

          {/* Back to Login Link for Reset Mode */}
          {mode === "reset" && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setMode("login"); setErr(undefined); setResetEmailSent(false); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Retour à la connexion
              </button>
            </div>
          )}

          {/* Additional Info for Signup */}
          {mode === "signup" && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
