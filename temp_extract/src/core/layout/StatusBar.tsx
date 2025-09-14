import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/core/utils/cn";
import { useOrgId } from "@/core/auth/useOrg";
import { Wifi, WifiOff, Calendar, Clock, Building2 } from "lucide-react";

interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact";
}

export const StatusBar: React.FC<StatusBarProps> = ({ className, variant = "default", ...props }) => {
  const { orgId } = useOrgId();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Date hôtel (simulation - dans un vrai contexte, vient de l'API)
  const hotelDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Shift actuel (simulation - dans un vrai contexte, calculé selon l'heure)
  const currentShift = currentTime.getHours() < 6 ? "Night Audit" : 
                      currentTime.getHours() < 14 ? "Matin" : 
                      currentTime.getHours() < 22 ? "Après-midi" : "Soir";

  // Organisation (simulation)
  const orgName = orgId ? `Org-${orgId.slice(0, 8)}` : "Aucune organisation";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const timeString = currentTime.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: variant === "compact" ? undefined : '2-digit'
  });

  return (
    <div
      role="status"
      aria-label="Barre de statut"
      className={cn(
        "flex items-center justify-between gap-4 bg-card/90 backdrop-blur border-b border-border px-4 py-2 text-sm",
        "supports-[backdrop-filter]:bg-card/80",
        variant === "compact" && "py-1 text-xs",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-6">
        {/* Date hôtel */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{hotelDate}</span>
        </div>

        {/* Shift */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Shift:</span>
          <span className="font-medium text-foreground">{currentShift}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Organisation */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{orgName}</span>
        </div>

        {/* Heure actuelle */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium text-foreground">{timeString}</span>
        </div>

        {/* Statut réseau */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-success" />
              <span className="text-success font-medium">En ligne</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-danger" />
              <span className="text-danger font-medium">Hors ligne</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};