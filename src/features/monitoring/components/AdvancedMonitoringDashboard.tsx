import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, Server, Zap, AlertTriangle, TrendingUp, 
  Database, Clock, Users, RefreshCw, Eye, Settings
} from 'lucide-react';

// Import existing monitoring components
import { POSMetricsCard } from './POSMetricsCard';
import { usePOSMetrics } from '@/features/pos/hooks/usePOSMetrics';
import { useHotelHealthSummary, useActiveAlerts } from '../hooks/useMonitoring';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

interface AdvancedMonitoringDashboardProps {
  outletId?: string;
}

export const AdvancedMonitoringDashboard: React.FC<AdvancedMonitoringDashboardProps> = ({ 
  outletId = 'fe3b78ca-a951-49ab-b01d-335b92220a9e' 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Monitoring hooks
  const { data: hotelHealth, isLoading: hotelLoading } = useHotelHealthSummary();
  const { data: systemAlerts, isLoading: alertsLoading } = useActiveAlerts();
  const { events: securityEvents, loading: securityLoading } = useSecurityMonitoring();
  const { 
    metrics: posMetrics, 
    alerts: posAlerts, 
    resolveAlert, 
    refreshMetrics 
  } = usePOSMetrics(outletId);

  // Calculate overall system health
  const getOverallHealth = () => {
    if (posMetrics.systemHealth === 'critical' || systemAlerts?.length > 0) return 'critical';
    if (posMetrics.systemHealth === 'degraded') return 'degraded';
    return 'healthy';
  };

  const overallHealth = getOverallHealth();
  const totalAlerts = (systemAlerts?.length || 0) + posAlerts.length;
  const criticalEvents = securityEvents?.filter(e => e.severity === 'error').length || 0;

  return (
    <div className="space-y-6">
      {/* Header with Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Dashboard de Monitoring Avancé
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge 
                variant={overallHealth === 'healthy' ? 'default' : overallHealth === 'degraded' ? 'secondary' : 'destructive'}
                className="px-3 py-1"
              >
                <Activity className="h-4 w-4 mr-1" />
                Système {overallHealth === 'healthy' ? 'Sain' : overallHealth === 'degraded' ? 'Dégradé' : 'Critique'}
              </Badge>
              <Button size="sm" variant="outline" onClick={refreshMetrics}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {hotelHealth?.total_hotels || 0}
              </div>
              <div className="text-sm text-muted-foreground">Hôtels Surveillés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {totalAlerts}
              </div>
              <div className="text-sm text-muted-foreground">Alertes Actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {criticalEvents}
              </div>
              <div className="text-sm text-muted-foreground">Événements Critiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {posMetrics.ordersPerMinute.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Commandes/Min</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="pos" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            POS Temps Réel
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Technique
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  État des Systèmes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Infrastructure Hôtelière</span>
                    <Badge variant={hotelHealth?.healthy_hotels === hotelHealth?.total_hotels ? 'default' : 'destructive'}>
                      {hotelHealth?.healthy_hotels || 0}/{hotelHealth?.total_hotels || 0} Sains
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Système POS</span>
                    <Badge variant={posMetrics.systemHealth === 'healthy' ? 'default' : posMetrics.systemHealth === 'degraded' ? 'secondary' : 'destructive'}>
                      {posMetrics.systemHealth}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Base de Données</span>
                    <Badge variant={posMetrics.supabaseLatency < 1000 ? 'default' : 'destructive'}>
                      {posMetrics.supabaseLatency}ms
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sécurité</span>
                    <Badge variant={criticalEvents === 0 ? 'default' : 'destructive'}>
                      {criticalEvents === 0 ? 'Normale' : `${criticalEvents} Alertes`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalAlerts === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Aucune alerte active
                  </div>
                ) : (
                  <div className="space-y-2">
                    {posAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{alert.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pos">
          <POSMetricsCard 
            metrics={posMetrics}
            alerts={posAlerts}
            onResolveAlert={resolveAlert}
          />
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Performance Base de Données
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Latence moyenne</span>
                    <span className="font-mono">{posMetrics.supabaseLatency}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taux d'erreur</span>
                    <span className="font-mono">{posMetrics.errorRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connexions actives</span>
                    <span className="font-mono">{posMetrics.activeConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Métriques Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Dernière mise à jour</span>
                    <span className="text-sm text-muted-foreground">
                      {posMetrics.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Collection active</span>
                    <Badge variant="default">
                      <Activity className="h-3 w-3 mr-1" />
                      En cours
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Événements de Sécurité</CardTitle>
            </CardHeader>
            <CardContent>
              {securityLoading ? (
                <div className="text-center py-4">Chargement...</div>
              ) : securityEvents?.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Aucun événement de sécurité récent
                </div>
              ) : (
                <div className="space-y-2">
                  {securityEvents?.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-background/50 rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{event.action}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.occurred_at).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={event.severity === 'error' ? 'destructive' : 'secondary'}>
                        {event.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics Avancées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Analytics Prédictives</h3>
                <p>Fonctionnalité en développement - Phase 2</p>
                <p className="text-sm mt-2">Incluera ML, prédictions de charge, et recommandations automatiques</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};