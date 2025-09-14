import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, Clock, Users, DollarSign, 
  ChefHat, Zap, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import type { POSMetrics, POSAlert } from '@/features/pos/hooks/usePOSMetrics';

interface POSMetricsCardProps {
  metrics: POSMetrics;
  alerts: POSAlert[];
  onResolveAlert: (alertId: string) => void;
}

export const POSMetricsCard: React.FC<POSMetricsCardProps> = ({ 
  metrics, 
  alerts, 
  onResolveAlert 
}) => {
  const { formatCurrency } = useCurrency();

  const getHealthColor = (health: POSMetrics['systemHealth']) => {
    switch (health) {
      case 'healthy': return 'bg-success text-success-foreground';
      case 'degraded': return 'bg-warning text-warning-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getHealthIcon = (health: POSMetrics['systemHealth']) => {
    switch (health) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Métriques POS Temps Réel
          </CardTitle>
          <Badge className={getHealthColor(metrics.systemHealth)}>
            {getHealthIcon(metrics.systemHealth)}
            {metrics.systemHealth.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-success" />
            <div className="text-sm text-muted-foreground">Ventes Aujourd'hui</div>
            <div className="text-lg font-bold">{formatCurrency(metrics.totalSalesToday)}</div>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-sm text-muted-foreground">Commandes/Min</div>
            <div className="text-lg font-bold">{metrics.ordersPerMinute.toFixed(1)}</div>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-info" />
            <div className="text-sm text-muted-foreground">Commandes Actives</div>
            <div className="text-lg font-bold">{metrics.currentOrders}</div>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <ChefHat className="h-5 w-5 mx-auto mb-1 text-warning" />
            <div className="text-sm text-muted-foreground">File Cuisine</div>
            <div className="text-lg font-bold">{metrics.kitchenQueue}</div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Latence Supabase</div>
            <div className="text-lg font-bold">
              {metrics.supabaseLatency}ms
              {metrics.supabaseLatency > 1000 && (
                <TrendingDown className="inline h-4 w-4 ml-1 text-destructive" />
              )}
            </div>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <Zap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Ticket Moyen</div>
            <div className="text-lg font-bold">{formatCurrency(metrics.averageOrderValue)}</div>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Alertes Critiques ({criticalAlerts.length})
            </div>
            {criticalAlerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResolveAlert(alert.id)}
                  className="ml-2"
                >
                  Résoudre
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* System Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Dernière mise à jour: {metrics.lastUpdated.toLocaleTimeString()}</span>
          <span>Connexions actives: {metrics.activeConnections}</span>
        </div>
      </CardContent>
    </Card>
  );
};