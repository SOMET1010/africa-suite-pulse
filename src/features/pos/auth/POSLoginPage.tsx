import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";
import { User, KeyRound, Loader2 } from "lucide-react";

type POSRole = "pos_server" | "pos_cashier" | "pos_manager";

interface POSUser {
  user_id: string;
  display_name: string;
  role_name: POSRole;
}

const roleLabels: Record<POSRole, string> = {
  pos_server: "Serveur",
  pos_cashier: "Caissier", 
  pos_manager: "Manager"
};

const roleBadgeVariants: Record<POSRole, "default" | "secondary" | "destructive" | "outline"> = {
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

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
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
      setError("Veuillez saisir un PIN valide (minimum 4 chiffres)");
      return;
    }

    if (!orgId) {
      setError("Erreur d'organisation. Veuillez vous reconnecter.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
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

      const user = data[0] as POSUser;
      setCurrentUser(user);

      // Store POS session in localStorage
      localStorage.setItem("pos_session", JSON.stringify({
        user_id: user.user_id,
        display_name: user.display_name,
        role: user.role_name,
        org_id: orgId,
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

  const handleLogout = () => {
    setCurrentUser(null);
    setPin("");
    localStorage.removeItem("pos_session");
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session POS Active</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <Button
                key={digit}
                variant="outline"
                size="lg"
                className="h-12 text-lg font-semibold"
                onClick={() => handlePinInput(digit.toString())}
                disabled={loading}
              >
                {digit}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={handleClear}
              disabled={loading}
            >
              Effacer
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-12 text-lg font-semibold"
              onClick={() => handlePinInput("0")}
              disabled={loading}
            >
              0
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={handleBackspace}
              disabled={loading}
            >
              ⌫
            </Button>
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
    </div>
  );
}