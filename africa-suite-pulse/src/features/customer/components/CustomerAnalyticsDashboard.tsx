import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomerAnalytics } from '../hooks/useCustomerAnalytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Target, 
  Brain,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface CustomerAnalyticsDashboardProps {
  orgId: string;
  timeframe?: string;
  className?: string;
}

export const CustomerAnalyticsDashboard: React.FC<CustomerAnalyticsDashboardProps> = ({
  orgId,
  timeframe = '30d',
  className = ""
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  const {
    behaviorAnalytics,
    satisfactionAnalytics,
    churnAnalytics,
    lifetimeValueAnalytics,
    segmentationAnalytics,
    refreshAllAnalytics,
    isAnyLoading,
    hasErrors
  } = useCustomerAnalytics({
    orgId,
    timeframe: selectedTimeframe
  });

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const timeframeOptions = [
    { value: '7d', label: '7 jours' },
    { value: '30d', label: '30 jours' },
    { value: '90d', label: '3 mois' },
    { value: '365d', label: '1 an' }
  ];

  const renderLoadingCard = (title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Client Avancées</h2>
          <p className="text-muted-foreground">
            Insights comportementaux et prédictions IA
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sélecteur de période */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {timeframeOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedTimeframe === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshAllAnalytics}
            disabled={isAnyLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isAnyLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="behavior" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="behavior">Comportement</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="churn">Rétention</TabsTrigger>
          <TabsTrigger value="lifetime_value">Valeur Vie</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
        </TabsList>

        {/* Analyse Comportementale */}
        <TabsContent value="behavior" className="space-y-4">
          {behaviorAnalytics.isLoading ? renderLoadingCard("Analyse Comportementale") : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Patterns de Fréquentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {behaviorAnalytics.data?.patterns?.length > 0 ? (
                    <div className="space-y-2">
                      {behaviorAnalytics.data.patterns.map((pattern: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun pattern détecté</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Insights IA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {behaviorAnalytics.data?.insights?.length > 0 ? (
                    <div className="space-y-2">
                      {behaviorAnalytics.data.insights.map((insight: string, index: number) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-2">
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Analyse en cours...</p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recommandations d'Amélioration</CardTitle>
                </CardHeader>
                <CardContent>
                  {behaviorAnalytics.data?.recommendations?.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {behaviorAnalytics.data.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                          <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune recommandation disponible</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analyse de Satisfaction */}
        <TabsContent value="satisfaction" className="space-y-4">
          {satisfactionAnalytics.isLoading ? renderLoadingCard("Analyse de Satisfaction") : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Score de Satisfaction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {satisfactionAnalytics.data?.score || 0}%
                      </div>
                      <p className="text-muted-foreground">Score moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Facteurs d'Influence</CardTitle>
                </CardHeader>
                <CardContent>
                  {satisfactionAnalytics.data?.factors?.length > 0 ? (
                    <div className="space-y-2">
                      {satisfactionAnalytics.data.factors.map((factor: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-chart-1 rounded-full" />
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun facteur identifié</p>
                  )}
                </CardContent>
              </Card>

              {satisfactionAnalytics.data?.alerts?.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Alertes Satisfaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {satisfactionAnalytics.data.alerts.map((alert: string, index: number) => (
                        <div key={index} className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                          <span className="text-sm">{alert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Analyse de Rétention/Churn */}
        <TabsContent value="churn" className="space-y-4">
          {churnAnalytics.isLoading ? renderLoadingCard("Analyse de Rétention") : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Risque de Churn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-destructive">
                        {churnAnalytics.data?.riskScore || 0}%
                      </div>
                      <p className="text-muted-foreground">Risque moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Indicateurs Clés</CardTitle>
                </CardHeader>
                <CardContent>
                  {churnAnalytics.data?.indicators?.length > 0 ? (
                    <div className="space-y-2">
                      {churnAnalytics.data.indicators.map((indicator: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-destructive rounded-full" />
                          <span className="text-sm">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucun indicateur critique</p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Stratégies de Rétention</CardTitle>
                </CardHeader>
                <CardContent>
                  {churnAnalytics.data?.strategies?.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {churnAnalytics.data.strategies.map((strategy: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                          <Target className="h-4 w-4 text-success mt-0.5 shrink-0" />
                          <span className="text-sm">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Aucune stratégie recommandée</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analyse Valeur Vie Client */}
        <TabsContent value="lifetime_value" className="space-y-4">
          {lifetimeValueAnalytics.isLoading ? renderLoadingCard("Valeur Vie Client") : (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    CLV Actuelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-success">
                        {lifetimeValueAnalytics.data?.currentCLV || 0}€
                      </div>
                      <p className="text-muted-foreground">Valeur moyenne</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    CLV Prédite 12M
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">
                        {lifetimeValueAnalytics.data?.predictedCLV || 0}€
                      </div>
                      <p className="text-muted-foreground">Prédiction IA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Segments de Valeur</CardTitle>
                </CardHeader>
                <CardContent>
                  {lifetimeValueAnalytics.data?.segments?.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-3">
                      {lifetimeValueAnalytics.data.segments.map((segment: string, index: number) => (
                        <Badge key={index} variant="outline" className="justify-center p-2">
                          {segment}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Segmentation en cours...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Segmentation Client */}
        <TabsContent value="segmentation" className="space-y-4">
          {segmentationAnalytics.isLoading ? renderLoadingCard("Segmentation Client") : (
            <div className="space-y-4">
              {segmentationAnalytics.data?.segments?.length > 0 ? (
                <div className="grid gap-4">
                  {segmentationAnalytics.data.segments.map((segment: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{segment.name}</CardTitle>
                          <Badge variant="secondary">{segment.size}</Badge>
                        </div>
                        <CardDescription>{segment.criteria}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <h5 className="font-medium mb-2">Caractéristiques</h5>
                            <p className="text-sm text-muted-foreground">{segment.characteristics}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Stratégie Recommandée</h5>
                            <p className="text-sm text-muted-foreground">{segment.strategy}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Segmentation automatique en cours d'analyse...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};