import { supabase } from '@/integrations/supabase/client';

export async function simulateMetricsForDemo(orgId: string) {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

  // Générer des métriques réalistes pour les 30 dernières minutes
  const metrics = [];
  
  // Métriques toutes les 5 minutes
  for (let i = 0; i < 6; i++) {
    const timestamp = new Date(thirtyMinutesAgo.getTime() + i * 5 * 60 * 1000);
    
    // Simuler des variations réalistes
    const baseResponseTime = 120 + Math.random() * 80; // 120-200ms base
    const responseTimeSpike = i === 4 ? 300 : 0; // Pic à 17h20
    
    metrics.push(
      // Temps de réponse
      {
        org_id: orgId,
        metric_type: 'system' as const,
        metric_name: 'response_time',
        metric_value: baseResponseTime + responseTimeSpike,
        metric_unit: 'ms',
        timestamp: timestamp.toISOString(),
        tags: { source: 'demo_simulation', endpoint: 'api' },
      },
      // Disponibilité
      {
        org_id: orgId,
        metric_type: 'system' as const,
        metric_name: 'uptime',
        metric_value: i === 4 ? 97.5 : 99.8 + Math.random() * 0.2, // Baisse à 17h20
        metric_unit: 'percentage',
        timestamp: timestamp.toISOString(),
        tags: { source: 'demo_simulation' },
      },
      // Taux d'erreur
      {
        org_id: orgId,
        metric_type: 'application' as const,
        metric_name: 'error_rate',
        metric_value: i === 4 ? 2.1 : Math.random() * 0.5, // Pic d'erreurs à 17h20
        metric_unit: 'percentage',
        timestamp: timestamp.toISOString(),
        tags: { source: 'demo_simulation' },
      },
      // Connexions actives
      {
        org_id: orgId,
        metric_type: 'system' as const,
        metric_name: 'active_connections',
        metric_value: 15 + Math.floor(Math.random() * 10),
        metric_unit: 'count',
        timestamp: timestamp.toISOString(),
        tags: { source: 'demo_simulation' },
      },
      // Performance POS
      {
        org_id: orgId,
        metric_type: 'business' as const,
        metric_name: 'pos_transactions_per_minute',
        metric_value: Math.floor(Math.random() * 8) + 2,
        metric_unit: 'count',
        timestamp: timestamp.toISOString(),
        tags: { source: 'demo_simulation', system: 'pos' },
      },
      // Performance base de données
      {
        org_id: orgId,
        metric_type: 'database' as const,
        metric_name: 'db_query_time',
        metric_value: 5 + Math.random() * 15,
        metric_unit: 'ms',
        timestamp: timestamp.toISOString(),
        tags: { source: 'demo_simulation' },
      }
    );
  }

  return metrics;
}

export async function createRealisticAlert(orgId: string) {
  // Créer une alerte basée sur le pic de temps de réponse
  const alert = {
    org_id: orgId,
    alert_definition_id: null, // Sera rempli après création de la définition
    status: 'active' as const,
    current_value: 420,
    threshold_value: 300,
    severity: 'warning' as const,
    message: 'Temps de réponse API élevé détecté (420ms > 300ms)',
    started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Il y a 10 minutes
    escalated: false,
    notification_sent: true,
  };

  return alert;
}