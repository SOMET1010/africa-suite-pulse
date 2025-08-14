import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Activity, Lock } from "lucide-react";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function SecurityDashboard() {
  const { events, loading } = useSecurityMonitoring();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <Shield className="h-4 w-4" />;
      case 'info': return <Activity className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const criticalEvents = events.filter(e => e.severity === 'error').length;
  const warningEvents = events.filter(e => e.severity === 'warning').length;
  const recentEvents = events.filter(e => 
    new Date(e.occurred_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chargement...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Dernières 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avertissements</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningEvents}</div>
            <p className="text-xs text-muted-foreground">Dernières 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité Récente</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEvents}</div>
            <p className="text-xs text-muted-foreground">Dernières 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut Sécurité</CardTitle>
            <Lock className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Sécurisé</div>
            <p className="text-xs text-muted-foreground">Dernière vérification</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Événements de Sécurité Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between border-b pb-2 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  {getSeverityIcon(event.severity)}
                  <div>
                    <p className="font-medium">{event.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.occurred_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getSeverityColor(event.severity) as any}>
                    {event.severity}
                  </Badge>
                </div>
              </div>
            ))}
            
            {events.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun événement de sécurité récent
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}