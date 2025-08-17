import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/OrgProvider";
import { User, KeyRound, Loader2, Info } from "lucide-react";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";
import { logger } from "@/services/logger.service";

type POSRole = "pos_hostess" | "pos_server" | "pos_cashier" | "pos_manager";

interface POSUser {
  user_id: string;
  display_name: string;
  role_name: POSRole;
  pos_user_id?: string;
  employee_code?: string;
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
    if (pin.length < 6) {
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
    if (!pin || pin.length < 4) {
      setError("Veuillez saisir un code PIN valide (minimum 4 chiffres)");
      return;
    }

    if (!orgId) {
      setError("Erreur d'organisation. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Rate limiting is temporarily disabled in the backend function
      const { data, error } = await supabase.rpc("authenticate_pos_user", {
        p_pin: pin,
        p_org_id: orgId
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("PIN invalide ou utilisateur inactif");
        setPin("");
        return;
      }

      const authResponse = data[0] as any; // Backend returns more fields than the TypeScript definition
      const user: POSUser & { session_token: string } = {
        user_id: authResponse.user_id,
        pos_user_id: authResponse.pos_user_id || '', // Optional field
        display_name: authResponse.display_name,
        employee_code: authResponse.employee_code || '', // Optional field
        role_name: authResponse.role_name as POSRole,
        session_token: authResponse.session_token
      };
      setCurrentUser(user);

      // Store secure POS session in sessionStorage (more secure than localStorage)
      sessionStorage.setItem("pos_session", JSON.stringify({
        user_id: authResponse.user_id,
        display_name: authResponse.display_name,
        role: authResponse.role_name,
        org_id: authResponse.org_id,
        outlet_id: authResponse.outlet_id || '',
        session_token: authResponse.session_token,
        login_time: new Date().toISOString()
      }));

      // Navigate to POS
      navigate("/pos");
    } catch (err: unknown) {
      logger.security("POS authentication failed", { error: err, pin: pin.length > 0 ? "[REDACTED]" : "empty" });
      setError(err instanceof Error ? err.message : "Erreur lors de la connexion");
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
        logger.error("POS logout error", { error });
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
              • Marie : 1234<br />
              • Jean : 5678<br />
              • Sophie : 9999
            </AlertDescription>
          </Alert>

          {/* PIN Display */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold"
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

          {/* Numeric Keypad */}
          <div className="space-y-4">
            {/* Numbers 1-3 */}
            <div className="grid grid-cols-3 gap-4">
              {['1', '2', '3'].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="lg"
                  className="h-16 text-2xl font-bold"
                  onClick={() => handlePinInput(num)}
                  disabled={loading}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            {/* Numbers 4-6 */}
            <div className="grid grid-cols-3 gap-4">
              {['4', '5', '6'].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="lg"
                  className="h-16 text-2xl font-bold"
                  onClick={() => handlePinInput(num)}
                  disabled={loading}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            {/* Numbers 7-9 */}
            <div className="grid grid-cols-3 gap-4">
              {['7', '8', '9'].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  size="lg"
                  className="h-16 text-2xl font-bold"
                  onClick={() => handlePinInput(num)}
                  disabled={loading}
                >
                  {num}
                </Button>
              ))}
            </div>
            
            {/* Last row: Clear, 0, Backspace */}
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-16 text-lg font-bold"
                onClick={handleClear}
                disabled={loading}
              >
                Effacer
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-16 text-2xl font-bold"
                onClick={() => handlePinInput('0')}
                disabled={loading}
              >
                0
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-16 text-lg font-bold"
                onClick={handleBackspace}
                disabled={loading}
              >
                ⌫
              </Button>
            </div>
          </div>

          {/* Login Button */}
          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleLogin}
            disabled={loading || pin.length < 4}
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