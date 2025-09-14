import { usePOSAuthContext } from "./POSAuthProvider";
import { POSRole } from "./usePOSAuthSecure";
import { Navigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";
import { Suspense } from "react";

interface RequirePOSAuthProps {
  children: React.ReactNode;
  requiredRole?: POSRole;
}

export default function RequirePOSAuth({ children, requiredRole }: RequirePOSAuthProps) {
  const { session, loading, hasRole } = usePOSAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Vérification de la session POS...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/pos/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    const roleLabels: Record<POSRole, string> = {
      pos_manager: "Manager POS", 
      pos_cashier: "Caissier",
      pos_server: "Serveur",
      pos_hostess: "Hôtesse d'accueil"
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
                <ShieldX className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Privilèges insuffisants
                </h2>
                <p className="text-muted-foreground">
                  Cette fonctionnalité n'est pas disponible avec votre niveau d'accès actuel.
                </p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Votre rôle :</span>
                  <span className="font-medium text-foreground">
                    {roleLabels[session.role_name as POSRole] || session.role_name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Rôle requis :</span>
                  <span className="font-medium text-primary">
                    {roleLabels[requiredRole] || requiredRole}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Contactez votre administrateur pour obtenir les autorisations nécessaires.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}