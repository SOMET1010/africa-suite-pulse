import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Activity, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { simulateMetricsForDemo } from '../utils/simulateMetrics';

interface ActivateMonitoringButtonProps {
  currentOrgId?: string;
  onActivated?: () => void;
}

export default function ActivateMonitoringButton({ currentOrgId, onActivated }: ActivateMonitoringButtonProps) {
  const [isActivating, setIsActivating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const activateMonitoring = async () => {
    if (!currentOrgId) {
      toast({
        title: "Erreur",
        description: "Impossible de déterminer l'organisation courante.",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    try {
      // 1. Activer le monitoring pour cette organisation
      const { error: healthError } = await supabase
        .from('hotel_health_status')
        .upsert({
          org_id: currentOrgId,
          status: 'healthy',
          uptime_percentage: 100,
          error_rate: 0,
          active_incidents: 0,
        });

      if (healthError) throw healthError;

      // 2. Insérer des métriques de démonstration réalistes
      const demoMetrics = await simulateMetricsForDemo(currentOrgId);
      const { error: metricsError } = await supabase
        .from('monitoring_metrics')
        .insert(demoMetrics);

      if (metricsError) throw metricsError;

      // 3. Créer des alertes par défaut
      const defaultAlerts = [
        {
          org_id: currentOrgId,
          name: 'Temps de réponse élevé',
          description: 'Alerte quand le temps de réponse dépasse 5 secondes',
          metric_name: 'response_time',
          condition_operator: 'gt',
          threshold_value: 5000,
          severity: 'warning' as const,
          evaluation_window_minutes: 5,
          notification_channels: ['email'],
        },
        {
          org_id: currentOrgId,
          name: 'Taux d\'erreur critique',
          description: 'Alerte quand le taux d\'erreur dépasse 5%',
          metric_name: 'error_rate',
          condition_operator: 'gt',
          threshold_value: 5,
          severity: 'critical' as const,
          evaluation_window_minutes: 2,
          notification_channels: ['email', 'sms'],
        },
        {
          org_id: currentOrgId,
          name: 'Disponibilité faible',
          description: 'Alerte quand la disponibilité tombe sous 95%',
          metric_name: 'uptime',
          condition_operator: 'lt',
          threshold_value: 95,
          severity: 'error' as const,
          evaluation_window_minutes: 10,
          notification_channels: ['email'],
        },
      ];

      const { error: alertsError } = await supabase
        .from('alert_definitions')
        .insert(defaultAlerts);

      if (alertsError) throw alertsError;

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['hotel-health-status'] });
      queryClient.invalidateQueries({ queryKey: ['hotel-health-summary'] });

      toast({
        title: "Surveillance activée !",
        description: `Le monitoring a été activé pour votre hôtel. Les métriques sont maintenant collectées en temps réel.`,
      });

      onActivated?.();
    } catch (error) {
      console.error('Erreur lors de l\'activation du monitoring:', error);
      toast({
        title: "Erreur d'activation",
        description: "Impossible d'activer le monitoring. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Activer le Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Activez la surveillance pour votre hôtel et commencez à collecter des métriques en temps réel.
        </p>
        
        <div className="space-y-2">
          <Badge variant="outline" className="mr-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Métriques automatiques
          </Badge>
          <Badge variant="outline" className="mr-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Alertes par défaut
          </Badge>
          <Badge variant="outline">
            <CheckCircle className="h-3 w-3 mr-1" />
            Surveillance 24/7
          </Badge>
        </div>

        <Button 
          onClick={activateMonitoring}
          disabled={isActivating}
          className="w-full"
        >
          {isActivating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Activation en cours...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Activer la Surveillance
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}