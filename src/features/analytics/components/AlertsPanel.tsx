import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartAlert } from "../types/advanced";
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AlertsPanelProps {
  data: SmartAlert[];
  isLoading: boolean;
}

export function AlertsPanel({ data, isLoading }: AlertsPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance': return 'warning';
      case 'opportunity': return 'success';
      case 'risk': return 'destructive';
      case 'anomaly': return 'info';
      default: return 'secondary';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'performance': return 'Performance';
      case 'opportunity': return 'Opportunité';
      case 'risk': return 'Risque';
      case 'anomaly': return 'Anomalie';
      default: return type;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    console.log('Resolving alert:', alertId);
    // TODO: Implement alert resolution
  };

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismissing alert:', alertId);
    // TODO: Implement alert dismissal
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertes Intelligentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeAlerts = data.filter(alert => alert.isActive);
  const resolvedAlerts = data.filter(alert => !alert.isActive);

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertes Actives ({activeAlerts.length})
              </CardTitle>
              <CardDescription>
                Alertes nécessitant votre attention immédiate
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => (
                <Card key={alert.id} className={`p-4 border-l-4 ${
                  alert.severity === 'critical' ? 'border-l-destructive' :
                  alert.severity === 'high' ? 'border-l-destructive' :
                  alert.severity === 'medium' ? 'border-l-warning' :
                  'border-l-secondary'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{alert.title}</h4>
                            <Badge variant={getSeverityColor(alert.severity) as any}>
                              {alert.severity}
                            </Badge>
                            <Badge variant={getTypeColor(alert.type) as any}>
                              {getTypeLabel(alert.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {getTrendIcon(alert.trend)}
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDismissAlert(alert.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Métrique: </span>
                        <span className="font-medium">{alert.metric}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valeur actuelle: </span>
                        <span className="font-medium">{alert.currentValue.toLocaleString()}</span>
                      </div>
                      {alert.expectedValue && (
                        <div>
                          <span className="text-muted-foreground">Valeur attendue: </span>
                          <span className="font-medium">{alert.expectedValue.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Détectée le {format(alert.detectedAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </div>

                    {alert.actionItems.length > 0 && (
                      <div className="pt-2 border-t">
                        <h5 className="text-sm font-medium mb-2">Actions recommandées:</h5>
                        <ul className="text-sm space-y-1">
                          {alert.actionItems.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p>Aucune alerte active</p>
                <p className="text-sm">Toutes vos métriques sont dans les limites normales</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Alertes Résolues ({resolvedAlerts.length})
            </CardTitle>
            <CardDescription>
              Historique des alertes récemment résolues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h5 className="font-medium">{alert.title}</h5>
                    <p className="text-xs text-muted-foreground">
                      Résolue le {alert.resolvedAt && format(alert.resolvedAt, 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <Badge variant="outline">Résolu</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}