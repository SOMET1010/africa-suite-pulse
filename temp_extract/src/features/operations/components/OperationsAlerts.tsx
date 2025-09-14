import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock,
  Package,
  Wrench,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOperationsAlerts } from '../hooks/useOperationsAlerts';

export function OperationsAlerts() {
  const navigate = useNavigate();
  const { data: alerts, isLoading } = useOperationsAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertes et Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'maintenance':
        return Wrench;
      case 'housekeeping':
        return Sparkles;
      case 'inventory':
        return Package;
      default:
        return AlertCircle;
    }
  };

  const criticalAlerts = alerts?.filter(alert => alert.severity === 'critical') || [];
  const otherAlerts = alerts?.filter(alert => alert.severity !== 'critical') || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes et Notifications
          </CardTitle>
          {criticalAlerts.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              {criticalAlerts.length} critique{criticalAlerts.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Alertes Critiques
                </h4>
                {criticalAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity);
                  const ModuleIcon = getModuleIcon(alert.module);
                  
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                          <SeverityIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{alert.title}</p>
                            <Badge variant="outline" className="gap-1 text-xs">
                              <ModuleIcon className="h-3 w-3" />
                              {alert.module}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(alert.actionUrl)}
                        className="gap-1"
                      >
                        Traiter
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Other Alerts */}
            {otherAlerts.length > 0 && (
              <div className="space-y-3">
                {criticalAlerts.length > 0 && (
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Autres Notifications
                  </h4>
                )}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {otherAlerts.map((alert) => {
                    const SeverityIcon = getSeverityIcon(alert.severity);
                    const ModuleIcon = getModuleIcon(alert.module);
                    
                    return (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-full ${getSeverityColor(alert.severity)}`}>
                            <SeverityIcon className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">{alert.title}</p>
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <ModuleIcon className="h-3 w-3" />
                                {alert.module}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{alert.description}</p>
                            <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate(alert.actionUrl)}
                          className="gap-1 text-xs"
                        >
                          Voir
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune alerte</h3>
            <p className="text-muted-foreground">
              Toutes les opérations fonctionnent normalement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
