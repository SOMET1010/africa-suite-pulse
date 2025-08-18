import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package, Check, X, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/unified-toast';
import { cn } from '@/lib/utils';

interface StockAlert {
  id: string;
  alert_type: string;
  current_quantity: number;
  threshold_quantity: number;
  message: string;
  is_active: boolean;
  created_at: string;
  pos_products: {
    name: string;
    code: string;
  };
}

interface StockAlertsPanelProps {
  outletId: string;
  className?: string;
}

export function StockAlertsPanel({ outletId, className }: StockAlertsPanelProps) {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['stock-alerts', outletId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_stock_alerts')
        .select(`
          id,
          alert_type,
          current_quantity,
          threshold_quantity,
          message,
          is_active,
          created_at,
          product_id
        `)
        .eq('outlet_id', outletId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Get product names separately
      const alertsWithProducts = await Promise.all(
        data.map(async (alert) => {
          const { data: product } = await supabase
            .from('pos_products')
            .select('name, code')
            .eq('id', alert.product_id)
            .single();
            
          return {
            ...alert,
            pos_products: product || { name: 'Produit inconnu', code: '' }
          };
        })
      );
      
      return alertsWithProducts as StockAlert[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('pos_stock_alerts')
        .update({
          is_active: false,
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-alerts', outletId] });
      toast({
        title: "Alerte acquittée",
        description: "L'alerte de stock a été marquée comme traitée",
        variant: "success"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'acquitter l'alerte",
        variant: "destructive"
      });
    }
  });

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock':
        return <X className="h-4 w-4 text-destructive" />;
      case 'low_stock':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertVariant = (alertType: string): "default" | "destructive" => {
    switch (alertType) {
      case 'out_of_stock':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAlertPriority = (alertType: string) => {
    switch (alertType) {
      case 'out_of_stock':
        return 'Critique';
      case 'low_stock':
        return 'Attention';
      default:
        return 'Info';
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Alertes Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-success" />
            Alertes Stock
            <Badge variant="outline" className="text-success border-success">
              Tout va bien
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              Aucune alerte de stock active. Tous les produits sont disponibles.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Alertes Stock
          <Badge variant="secondary">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {alerts.map(alert => (
            <Alert key={alert.id} variant={getAlertVariant(alert.alert_type)} className="relative">
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.alert_type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {alert.pos_products?.name || 'Produit inconnu'}
                    </span>
                    <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                      {alert.pos_products?.code}
                    </Badge>
                    <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                      {getAlertPriority(alert.alert_type)}
                    </Badge>
                  </div>
                  <AlertDescription className="text-xs">
                    {alert.message}
                  </AlertDescription>
                  <div className="text-xs text-muted-foreground">
                    Stock actuel: {alert.current_quantity}
                    {alert.threshold_quantity && ` • Seuil: ${alert.threshold_quantity}`}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => acknowledgeAlert.mutate(alert.id)}
                  disabled={acknowledgeAlert.isPending}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}