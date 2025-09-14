import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Brain, TrendingUp, DollarSign, Users, Target, 
  Calendar, Activity, AlertTriangle, Zap, Eye, Settings 
} from 'lucide-react';
import { AIEnhancedAnalytics } from '@/features/analytics/components/AIEnhancedAnalytics';
import { RevenueManagementDashboard } from '@/features/revenue-management/RevenueManagementDashboard';
import { useAnalyticsData } from '@/features/analytics/hooks/useAnalyticsData';

export function UnifiedBIDashboard() {
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    compareWithPrevious: true,
  });

  const analyticsFilters = {
    dateRange: {
      from: filters.startDate,
      to: filters.endDate
    },
    compareWithPreviousPeriod: filters.compareWithPrevious
  };
  
  const { data: analyticsData, isLoading } = useAnalyticsData(analyticsFilters);
  const kpis = analyticsData?.kpis;

  const dashboardStats = {
    totalRevenue: kpis?.totalRevenue || 0,
    occupancyRate: kpis?.occupancyRate || 0,
    adr: kpis?.adr || 0,
    revpar: kpis?.revpar || 0,
    totalReservations: kpis?.totalReservations || 0,
    averageStayLength: kpis?.averageStayLength || 0
  };

  const executiveSummary = [
    {
      title: 'Performance Globale',
      value: '92%',
      change: '+5.2%',
      trend: 'up',
      description: 'Score de performance calculé par l\'IA',
      color: 'success'
    },
    {
      title: 'Efficacité Tarifaire',
      value: '87%',
      change: '+12.1%',
      trend: 'up',
      description: 'Optimisation des revenus vs potentiel',
      color: 'primary'
    },
    {
      title: 'Satisfaction Client',
      value: '4.8/5',
      change: '+0.3',
      trend: 'up',
      description: 'Score moyen basé sur les commentaires',
      color: 'info'
    },
    {
      title: 'Prédictions IA',
      value: '94%',
      change: '+2.1%',
      trend: 'up',
      description: 'Fiabilité des prévisions automatiques',
      color: 'accent'
    }
  ];

  const aiRecommendations = [
    {
      id: '1',
      title: 'Optimiser les prix weekend',
      description: 'Augmenter les tarifs de 15% pour le prochain weekend en raison d\'une forte demande prévue.',
      impact: 'high',
      potential: '+450,000 F CFA',
      confidence: 89,
      category: 'Revenue'
    },
    {
      id: '2',
      title: 'Campagne marketing ciblée',
      description: 'Lancer une campagne pour les séjours midweek auprès des voyageurs d\'affaires.',
      impact: 'medium',
      potential: '+280,000 F CFA',
      confidence: 76,
      category: 'Marketing'
    },
    {
      id: '3',
      title: 'Ajustement staffing',
      description: 'Prévoir du personnel supplémentaire pour gérer l\'affluence du weekend.',
      impact: 'medium',
      potential: 'Amélioration service',
      confidence: 82,
      category: 'Operations'
    }
  ];

  const kpiCards = [
    {
      title: 'Revenus Totaux',
      value: dashboardStats.totalRevenue.toLocaleString('fr-FR') + ' F CFA',
      icon: DollarSign,
      trend: '+12.3%',
      color: 'primary'
    },
    {
      title: 'Taux d\'Occupation',
      value: dashboardStats.occupancyRate.toFixed(1) + '%',
      icon: Users,
      trend: '+8.7%',
      color: 'success'
    },
    {
      title: 'ADR Moyen',
      value: dashboardStats.adr.toLocaleString('fr-FR') + ' F CFA',
      icon: Target,
      trend: '+5.4%',
      color: 'info'
    },
    {
      title: 'RevPAR',
      value: dashboardStats.revpar.toLocaleString('fr-FR') + ' F CFA',
      icon: TrendingUp,
      trend: '+15.2%',
      color: 'accent'
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Revenue': return 'bg-primary/10 text-primary';
      case 'Marketing': return 'bg-success/10 text-success';
      case 'Operations': return 'bg-warning/10 text-warning';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Business Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Analytics avancées avec intelligence artificielle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Données en temps réel
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {executiveSummary.map((stat, index) => (
          <Card key={index} className="glass-card">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </div>
                  <Badge variant="outline" className={`text-${stat.color}`}>
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      {kpi.title}
                    </div>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-sm text-success">{kpi.trend}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-${kpi.color}/10`}>
                    <IconComponent className={`h-6 w-6 text-${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Recommendations Panel */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Recommandations IA Prioritaires
            <Badge variant="outline">{aiRecommendations.length} actives</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {aiRecommendations.map((rec) => (
              <div key={rec.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <Badge className={getCategoryColor(rec.category)}>
                      {rec.category}
                    </Badge>
                    <Badge variant="outline" className={getImpactColor(rec.impact)}>
                      Impact {rec.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Potentiel: </span>
                      <span className="font-medium text-success">{rec.potential}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Confiance: </span>
                      <span className="font-medium">{rec.confidence}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Appliquer</Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics Détaillées</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Management</TabsTrigger>
          <TabsTrigger value="operations">Opérations</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AIEnhancedAnalytics filters={filters} />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueManagementDashboard />
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Indicateurs Opérationnels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <div className="text-2xl font-bold">95%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction équipe</div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-4 text-success" />
                  <div className="text-2xl font-bold">12min</div>
                  <div className="text-sm text-muted-foreground">Temps check-in moyen</div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-4 text-info" />
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-muted-foreground">Taux de résolution</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}