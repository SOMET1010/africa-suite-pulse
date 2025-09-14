import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, Target, Zap, Activity, BarChart3, Users } from 'lucide-react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { useAIInsights } from '@/features/ai/hooks/useAIInsights';
import { AnalyticsKPIs } from './AnalyticsKPIs';
import { AIInsightsWidget } from '@/features/ai/components/AIInsightsWidget';

interface AIEnhancedAnalyticsProps {
  filters: {
    startDate: Date;
    endDate: Date;
    compareWithPrevious: boolean;
  };
}

export function AIEnhancedAnalytics({ filters }: AIEnhancedAnalyticsProps) {
  const analyticsFilters = {
    dateRange: {
      from: filters.startDate,
      to: filters.endDate
    },
    compareWithPreviousPeriod: filters.compareWithPrevious
  };
  
  const { data: analyticsData, isLoading, error } = useAnalyticsData(analyticsFilters);
  const kpis = analyticsData?.kpis;
  const occupancy = analyticsData?.occupancy;
  const revenue = analyticsData?.revenue;
  const sources = analyticsData?.sources;
  const stayLength = analyticsData?.stayLength;
  const { insights, generateInsights, isLoading: aiLoading } = useAIInsights();
  const [smartAlerts, setSmartAlerts] = useState<any[]>([]);

  // Generate AI insights when data changes
  useEffect(() => {
    if (kpis && revenue && occupancy && !aiLoading) {
      const analyticsData = {
        kpis,
        revenue,
        occupancy,
        sources,
        stayLength,
        dateRange: {
          startDate: filters.startDate.toISOString(),
          endDate: filters.endDate.toISOString()
        }
      };
      generateInsights(analyticsData, 'week');
    }
  }, [kpis, revenue, occupancy, filters, generateInsights, aiLoading]);

  // Mock smart alerts based on data patterns
  useEffect(() => {
    if (kpis) {
      const alerts = [];
      
      if (kpis.occupancyRate > 85) {
        alerts.push({
          id: '1',
          type: 'opportunity',
          severity: 'high',
          title: 'Forte demande détectée',
          message: `Taux d'occupation à ${kpis.occupancyRate.toFixed(1)}%. Opportunité d'augmenter les tarifs.`,
          action: 'Optimiser les prix',
          recommendation: 'Augmenter les tarifs de 10-15% pour maximiser le RevPAR'
        });
      }
      
      if (kpis.adr < 45000) {
        alerts.push({
          id: '2',
          type: 'warning',
          severity: 'medium',
          title: 'ADR sous les attentes',
          message: `ADR actuel : ${kpis.adr.toLocaleString()} F CFA. Objectif : 50,000 F CFA`,
          action: 'Analyser la stratégie tarifaire',
          recommendation: 'Revoir la grille tarifaire et les promotions actives'
        });
      }
      
      if (kpis.occupancyRate < 60) {
        alerts.push({
          id: '3',
          type: 'risk',
          severity: 'high',
          title: 'Occupation faible',
          message: `Taux d'occupation à ${kpis.occupancyRate.toFixed(1)}%. Action urgente requise.`,
          action: 'Lancer des promotions',
          recommendation: 'Activer les offres last-minute et contacter les TO'
        });
      }
      
      setSmartAlerts(alerts);
    }
  }, [kpis]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Erreur lors du chargement des données d'analyse
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-destructive bg-destructive/5';
      case 'medium': return 'border-warning bg-warning/5';
      case 'low': return 'border-success bg-success/5';
      default: return 'border-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced KPIs with AI insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Avancées avec IA
          </h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            IA Activée
          </Badge>
        </div>
        <AnalyticsKPIs data={kpis} isLoading={isLoading} />
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="alerts">Alertes Intelligentes</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <AIInsightsWidget 
            analyticsData={{
              kpis,
              revenue,
              occupancy,
              sources,
              stayLength
            }} 
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Alertes Intelligentes
                <Badge variant="outline">{smartAlerts.length} actives</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {smartAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune alerte active</p>
                  <p className="text-sm">L'IA surveille vos performances en continu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {smartAlerts.map((alert) => (
                    <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(alert.type)}
                              <h3 className="font-semibold">{alert.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{alert.message}</p>
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <div className="text-sm font-medium mb-1">Recommandation IA:</div>
                              <p className="text-sm">{alert.recommendation}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="ml-4">
                            {alert.action}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Prédictions IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-4 text-success" />
                  <div className="text-2xl font-bold text-success">89%</div>
                  <div className="text-sm text-muted-foreground">Occupation prévue (7j)</div>
                  <Badge variant="outline" className="mt-2">+12% vs semaine actuelle</Badge>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <div className="text-2xl font-bold text-primary">156</div>
                  <div className="text-sm text-muted-foreground">Nouvelles réservations prévues</div>
                  <Badge variant="outline" className="mt-2">Confiance: 82%</Badge>
                </div>
                
                <div className="text-center p-6 border rounded-lg">
                  <BarChart3 className="h-8 w-8 mx-auto mb-4 text-info" />
                  <div className="text-2xl font-bold text-info">2.8M</div>
                  <div className="text-sm text-muted-foreground">Revenus prévus (F CFA)</div>
                  <Badge variant="outline" className="mt-2">+18% vs prévisions</Badge>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium mb-2">Analyse Prédictive IA:</div>
                <p className="text-sm text-muted-foreground">
                  Tendance haussière détectée pour les 7 prochains jours. L'algorithme recommande 
                  d'optimiser les tarifs en milieu de semaine et de préparer l'équipe pour une forte 
                  affluence le week-end. Probabilité de dépassement des objectifs : 76%.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}