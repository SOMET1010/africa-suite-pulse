import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Clock, CheckCircle } from 'lucide-react';
import { useMonitoringIncidents } from '../hooks/useMonitoring';
import { IncidentStatus, AlertSeverity } from '../types';

export default function MonitoringIncidents() {
  const { data: incidents, isLoading } = useMonitoringIncidents();

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'investigating':
        return 'secondary';
      case 'monitoring':
        return 'outline';
      case 'resolved':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: IncidentStatus) => {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'investigating':
        return 'Investigation';
      case 'monitoring':
        return 'Surveillance';
      case 'resolved':
        return 'Résolu';
      default:
        return status;
    }
  };

  return (
    <UnifiedLayout 
      title="Gestion des Incidents"
      headerAction={
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Incident
        </Button>
      }
      showStatusBar={true}
    >
      <div className="space-y-6">
        {/* Incidents Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {incidents?.filter(i => i.status === 'open').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Incidents Ouverts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {incidents?.filter(i => i.status === 'investigating').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">En Investigation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-info">
                {incidents?.filter(i => i.status === 'monitoring').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">En Surveillance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">
                {incidents?.filter(i => i.status === 'resolved').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Résolus (30j)</p>
            </CardContent>
          </Card>
        </div>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Liste des Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : incidents && incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusColor(incident.status)}>
                            {getStatusLabel(incident.status)}
                          </Badge>
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            #{incident.org_id.slice(-8)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{incident.title}</h3>
                        {incident.description && (
                          <p className="text-muted-foreground mb-2">{incident.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                        {incident.status !== 'resolved' && (
                          <Button size="sm">
                            Gérer
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Créé le {new Date(incident.created_at).toLocaleString('fr-FR')}
                      </div>
                      {incident.resolved_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-success" />
                          Résolu le {new Date(incident.resolved_at).toLocaleString('fr-FR')}
                        </div>
                      )}
                    </div>

                    {incident.impact_description && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <h4 className="font-medium mb-1">Impact:</h4>
                        <p className="text-sm">{incident.impact_description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                <p>Aucun incident signalé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
}