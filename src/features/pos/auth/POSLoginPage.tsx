import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";
import { User, KeyRound, Loader2, Info } from "lucide-react";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";

type POSRole = "pos_hostess" | "pos_server" | "pos_cashier" | "pos_manager";

interface POSUser {
  user_id: string;
  display_name: string;
  role_name: POSRole;
}

const roleLabels: Record<POSRole, string> = {
  pos_hostess: "Hôtesse",
  pos_server: "Serveur",
  pos_cashier: "Caissier", 
  pos_manager: "Manager"
};

const roleBadgeVariants: Record<POSRole, "default" | "secondary" | "destructive" | "outline"> = {
  pos_hostess: "outline",
  pos_server: "default",
  pos_cashier: "secondary",
  pos_manager: "outline"
};

export default function POSLoginPage() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<POSUser | null>(null);
  const { orgId } = useOrgId();
  const navigate = useNavigate();

  const handlePinInput = (char: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + char);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  const handleLogin = async () => {
    if (!pin || pin.length < 3) {
      setError("Veuillez saisir un code PIN valide (minimum 3 caractères)");
      return;
    }

    if (!orgId) {
      setError("Erreur d'organisation. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Add rate limiting check
      const rateLimitKey = `pos_auth_${pin.slice(0, 2)}`;
      const { data: rateLimitData, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
        p_identifier: rateLimitKey,
        p_action: "pos_login",
        p_max_attempts: 5,
        p_window_minutes: 15
      });

      if (rateLimitError || !rateLimitData) {
        setError("Trop de tentatives. Veuillez attendre 15 minutes.");
        setPin("");
        return;
      }

      const { data, error } = await supabase.rpc("authenticate_pos_user", {
        p_org_id: orgId,
        p_pin: pin
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("PIN invalide ou utilisateur inactif");
        setPin("");
        return;
      }

      const user = data[0] as (POSUser & { session_token: string });
      setCurrentUser(user);

      // Store secure POS session in sessionStorage (more secure than localStorage)
      sessionStorage.setItem("pos_session", JSON.stringify({
        user_id: user.user_id,
        display_name: user.display_name,
        role: user.role_name,
        org_id: orgId,
        outlet_id: '',
        session_token: user.session_token,
        login_time: new Date().toISOString()
      }));

      // Navigate to POS
      navigate("/pos");
    } catch (err: any) {
      console.error("Erreur d'authentification POS:", err);
      setError(err.message || "Erreur lors de la connexion");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        // Get session token from storage to logout properly
        const storedSession = sessionStorage.getItem("pos_session");
        if (storedSession) {
          const session = JSON.parse(storedSession);
          await supabase.rpc("logout_pos_session", {
            p_session_token: session.session_token
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    setCurrentUser(null);
    setPin("");
    sessionStorage.removeItem("pos_session");
  };

  if (currentUser) {
    return (
      <UnifiedLayout
        title="Session POS Active"
        showStatusBar={false}
        contentClassName="flex items-center justify-center p-4"
      >
        <Card className="w-full max-w-md">
          <CardContent className="space-y-6 pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{currentUser.display_name}</h3>
              <Badge variant={roleBadgeVariants[currentUser.role_name]} className="mt-2">
                {roleLabels[currentUser.role_name]}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => navigate("/pos")} size="lg">
                Continuer
              </Button>
              <Button variant="outline" onClick={handleLogout} size="lg">
                Déconnexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      title="Connexion POS"
      showStatusBar={false}
      contentClassName="flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connexion POS</CardTitle>
          <p className="text-muted-foreground">Saisissez votre code PIN</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Test Users Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Codes PIN de test :</strong><br />
              • Marie : srv001<br />
              • Jean : csh001<br />
              • Sophie : mgr001
            </AlertDescription>
          </Alert>

          {/* PIN Display */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 border-2 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{
                    borderColor: i < pin.length ? "hsl(var(--primary))" : "hsl(var(--border))",
                    backgroundColor: i < pin.length ? "hsl(var(--primary) / 0.1)" : "transparent"
                  }}
                >
                  {i < pin.length ? "●" : ""}
                </div>
              ))}
            </div>
          </div>

          {/* Alphanuméric Keyboard */}
          <div className="space-y-3">
            {/* First row: Numbers */}
            <div className="grid grid-cols-10 gap-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((char) => (
                <Button
                  key={char}
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm font-semibold"
                  onClick={() => handlePinInput(char)}
                  disabled={loading}
                >
                  {char}
                </Button>
              ))}
            </div>
            
            {/* Second row: QWERTY */}
            <div className="grid grid-cols-10 gap-1">
              {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((char) => (
                <Button
                  key={char}
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm font-semibold"
                  onClick={() => handlePinInput(char)}
                  disabled={loading}
                >
                  {char}
                </Button>
              ))}
            </div>
            
            {/* Third row: ASDF */}
            <div className="grid grid-cols-9 gap-1">
              {['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'].map((char) => (
                <Button
                  key={char}
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm font-semibold"
                  onClick={() => handlePinInput(char)}
                  disabled={loading}
                >
                  {char}
                </Button>
              ))}
            </div>
            
            {/* Fourth row: ZXCV */}
            <div className="grid grid-cols-7 gap-1">
              {['z', 'x', 'c', 'v', 'b', 'n', 'm'].map((char) => (
                <Button
                  key={char}
                  variant="outline"
                  size="sm"
                  className="h-10 text-sm font-semibold"
                  onClick={() => handlePinInput(char)}
                  disabled={loading}
                >
                  {char}
                </Button>
              ))}
            </div>
            
            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-12"
                onClick={handleClear}
                disabled={loading}
              >
                Effacer tout
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-12"
                onClick={handleBackspace}
                disabled={loading}
              >
                ⌫ Supprimer
              </Button>
            </div>
          </div>

          {/* Login Button */}
          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleLogin}
            disabled={loading || pin.length < 3}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </CardContent>
      </Card>
    </UnifiedLayout>
  );
}