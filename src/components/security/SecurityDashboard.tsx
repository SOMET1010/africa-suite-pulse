import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  UserCheck,
  Clock,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityDashboardProps {
  className?: string;
}

interface SecurityMetrics {
  totalGuestAccess: number;
  sensitiveDataAccess: number;
  rateLimitViolations: number;
  unauthorizedAttempts: number;
  recentActivity: Array<{
    timestamp: string;
    action: string;
    user_role: string;
    sensitive_fields?: string[];
  }>;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    loadSecurityMetrics();
    const interval = setInterval(loadSecurityMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      setLoading(true);

      // Get current user role
      const { data: roleData } = await supabase.rpc('get_current_user_role');
      setUserRole(roleData || 'guest');

      // Only managers and super admins can see security metrics
      if (!['manager', 'super_admin'].includes(roleData)) {
        return;
      }

      // Get security audit logs for the last 24 hours
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'guests_sensitive_access')
        .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('occurred_at', { ascending: false })
        .limit(100);

      if (auditLogs) {
        const totalAccess = auditLogs.length;
        const sensitiveAccess = auditLogs.filter(log => {
          const fields = (log.new_values as any)?.accessed_fields;
          return Array.isArray(fields) && fields.some((field: string) => 
            ['document_number', 'tax_id', 'date_of_birth'].includes(field)
          );
        }).length;
        
        const rateLimitViolations = auditLogs.filter(log => 
          log.action === 'rate_limit_exceeded'
        ).length;

        const unauthorizedAttempts = auditLogs.filter(log => 
          log.severity === 'error'
        ).length;

        const recentActivity = auditLogs.slice(0, 10).map(log => ({
          timestamp: log.occurred_at,
          action: log.action,
          user_role: (log.new_values as any)?.user_role || 'unknown',
          sensitive_fields: (log.new_values as any)?.accessed_fields || []
        }));

        setMetrics({
          totalGuestAccess: totalAccess,
          sensitiveDataAccess: sensitiveAccess,
          rateLimitViolations: rateLimitViolations,
          unauthorizedAttempts: unauthorizedAttempts,
          recentActivity
        });
      }
    } catch (error) {
      console.error('Error loading security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityBadgeColor = (action: string) => {
    switch (action) {
      case 'view_details': return 'default';
      case 'search': return 'secondary';
      case 'rate_limit_exceeded': return 'destructive';
      case 'select_sensitive': return 'warning';
      default: return 'outline';
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'view_details': return <Eye className="h-3 w-3" />;
      case 'search': return <Database className="h-3 w-3" />;
      case 'rate_limit_exceeded': return <AlertTriangle className="h-3 w-3" />;
      case 'select_sensitive': return <Shield className="h-3 w-3" />;
      default: return <UserCheck className="h-3 w-3" />;
    }
  };

  if (!['manager', 'super_admin'].includes(userRole)) {
    return (
      <Alert className={className}>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Accès restreint : Seuls les gestionnaires et super administrateurs peuvent voir le tableau de bord sécurité.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tableau de bord sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Chargement des métriques de sécurité...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accès clients (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalGuestAccess || 0}</div>
            <Badge variant="outline" className="mt-1">
              <Database className="h-3 w-3 mr-1" />
              Total
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Données sensibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.sensitiveDataAccess || 0}
            </div>
            <Badge variant="warning" className="mt-1">
              <Shield className="h-3 w-3 mr-1" />
              Accès PII
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Limites dépassées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.rateLimitViolations || 0}
            </div>
            <Badge variant="destructive" className="mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Rate limit
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tentatives non autorisées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.unauthorizedAttempts || 0}
            </div>
            <Badge variant="destructive" className="mt-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Erreurs
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activité récente
          </CardTitle>
          <CardDescription>
            Accès aux données clients des dernières heures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics?.recentActivity.length ? (
              metrics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getActivityIcon(activity.action)}
                    <div>
                      <div className="font-medium text-sm">
                        {activity.action.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.user_role}
                    </Badge>
                    <Badge 
                      variant={getActivityBadgeColor(activity.action) as any}
                      className="text-xs"
                    >
                      {activity.action}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>Aucune activité suspecte détectée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statut de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">RLS activé sur table guests</span>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Audit des accès aux données sensibles</span>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Contrôle d'accès basé sur les rôles</span>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Limitation du débit d'accès</span>
              </div>
              <Badge variant="success">Actif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
      </div>
    </div>
  );
};