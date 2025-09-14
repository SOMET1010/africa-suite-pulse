import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Database, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    // Monitor network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check database connection
    const checkDbConnection = async () => {
      try {
        const { error } = await supabase.from('rooms').select('id').limit(1);
        setDbStatus(error ? 'disconnected' : 'connected');
        if (!error) setLastSync(new Date());
      } catch {
        setDbStatus('disconnected');
      }
    };

    // Initial check
    checkDbConnection();

    // Check every 30 seconds
    const interval = setInterval(checkDbConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-danger" />;
    if (dbStatus === 'checking') return <RefreshCw className="w-4 h-4 text-warning animate-spin" />;
    if (dbStatus === 'disconnected') return <AlertTriangle className="w-4 h-4 text-warning" />;
    return <CheckCircle className="w-4 h-4 text-success" />;
  };

  const getStatusText = () => {
    if (!isOnline) return "Hors ligne";
    if (dbStatus === 'checking') return "Vérification...";
    if (dbStatus === 'disconnected') return "Base déconnectée";
    return "Connecté";
  };

  const getStatusColor = () => {
    if (!isOnline || dbStatus === 'disconnected') return "destructive";
    if (dbStatus === 'checking') return "warning";
    return "success";
  };

  const handleRefresh = async () => {
    setDbStatus('checking');
    try {
      const { error } = await supabase.from('rooms').select('id').limit(1);
      setDbStatus(error ? 'disconnected' : 'connected');
      if (!error) setLastSync(new Date());
    } catch {
      setDbStatus('disconnected');
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-2 h-auto px-2 py-1 hover:bg-soft-primary transition-elegant"
        >
          {getStatusIcon()}
          <div className="hidden lg:flex flex-col items-start">
            <Badge 
              variant={getStatusColor() as any}
              className="text-xs h-4 px-1.5"
            >
              {getStatusText()}
            </Badge>
            {isOnline && dbStatus === 'connected' && (
              <span className="text-xs text-muted-foreground">
                Sync: {formatLastSync(lastSync)}
              </span>
            )}
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="glass-card border-accent-gold/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="text-sm">
              Réseau: {isOnline ? "Connecté" : "Déconnecté"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="text-sm">
              Base de données: {getStatusText()}
            </span>
          </div>
          {isOnline && dbStatus === 'connected' && (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">
                Dernière sync: {formatLastSync(lastSync)}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground border-t pt-2">
            Cliquez pour actualiser la connexion
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}