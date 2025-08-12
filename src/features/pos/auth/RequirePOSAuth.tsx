import { usePOSAuth, POSRole } from "./usePOSAuth";
import { Navigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldX } from "lucide-react";

interface RequirePOSAuthProps {
  children: React.ReactNode;
  requiredRole?: POSRole;
}

export default function RequirePOSAuth({ children, requiredRole }: RequirePOSAuthProps) {
  const { session, loading, hasRole } = usePOSAuth();

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <ShieldX className="h-4 w-4" />
            <AlertDescription>
              Accès refusé. Votre rôle ({session.role}) ne permet pas d'accéder à cette fonctionnalité.
              Rôle requis : {requiredRole}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}