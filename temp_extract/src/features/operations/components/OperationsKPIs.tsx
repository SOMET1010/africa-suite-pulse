import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useOperationsKPIs } from '../hooks/useOperationsKPIs';

export function OperationsKPIs() {
  const { data: kpis, isLoading } = useOperationsKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiData = [
    {
      title: 'Alertes Critiques',
      value: kpis?.criticalAlerts || 0,
      description: 'Nécessitent une action immédiate',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: kpis?.alertTrend === 'up' ? 'up' : kpis?.alertTrend === 'down' ? 'down' : 'stable',
      change: kpis?.alertChange || 0
    },
    {
      title: 'Tâches Terminées',
      value: kpis?.completedTasks || 0,
      description: 'Aujourd\'hui',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: kpis?.completionTrend === 'up' ? 'up' : kpis?.completionTrend === 'down' ? 'down' : 'stable',
      change: kpis?.completionChange || 0
    },
    {
      title: 'En Attente',
      value: kpis?.pendingTasks || 0,
      description: 'Toutes opérations confondues',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: kpis?.pendingTrend === 'up' ? 'up' : kpis?.pendingTrend === 'down' ? 'down' : 'stable',
      change: kpis?.pendingChange || 0
    },
    {
      title: 'Efficacité',
      value: `${kpis?.efficiency || 0}%`,
      description: 'Performance globale',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: kpis?.efficiencyTrend === 'up' ? 'up' : kpis?.efficiencyTrend === 'down' ? 'down' : 'stable',
      change: kpis?.efficiencyChange || 0
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string, isPositive: boolean = true) => {
    if (trend === 'stable') return 'text-muted-foreground';
    if (trend === 'up') return isPositive ? 'text-green-600' : 'text-red-600';
    if (trend === 'down') return isPositive ? 'text-red-600' : 'text-green-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        const TrendIcon = getTrendIcon(kpi.trend);
        const isPositiveMetric = index === 1 || index === 3; // Completed tasks and efficiency
        
        return (
          <Card key={kpi.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <p className="text-sm text-muted-foreground">{kpi.description}</p>
                </div>
                {kpi.change !== 0 && (
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-3 w-3 ${getTrendColor(kpi.trend, isPositiveMetric)}`} />
                    <span className={`text-xs ${getTrendColor(kpi.trend, isPositiveMetric)}`}>
                      {Math.abs(kpi.change)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}