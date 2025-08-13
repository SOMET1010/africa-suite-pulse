import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Wifi, WifiOff, Battery, BatteryLow } from "lucide-react";
import { cn } from "@/core/utils/cn";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon = AlertTriangle, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <Card className={cn("border-0 bg-transparent", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center p-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
        {action && (
          <div className="pt-4">
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Chargement...", className }: LoadingStateProps) {
  return (
    <Card className={cn("border-0 bg-transparent", className)}>
      <CardContent className="flex flex-col items-center justify-center text-center p-12 space-y-4">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Erreur de chargement", 
  description = "Une erreur est survenue lors du chargement des données.",
  retry,
  className 
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title={title}
      description={description}
      action={retry && (
        <button 
          onClick={retry}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Réessayer
        </button>
      )}
      className={className}
    />
  );
}

interface OfflineStateProps {
  className?: string;
}

export function OfflineState({ className }: OfflineStateProps) {
  return (
    <EmptyState
      icon={WifiOff}
      title="Mode hors ligne"
      description="Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées."
      className={className}
    />
  );
}

interface ConnectionStateProps {
  isOnline: boolean;
  isLowBattery?: boolean;
  className?: string;
}

export function ConnectionState({ isOnline, isLowBattery, className }: ConnectionStateProps) {
  if (!isOnline) {
    return <OfflineState className={className} />;
  }

  if (isLowBattery) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-warning", className)}>
        <BatteryLow className="w-4 h-4" />
        <span>Batterie faible - Mode économie d'énergie activé</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm text-success", className)}>
      <Wifi className="w-4 h-4" />
      <span>En ligne</span>
    </div>
  );
}