import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPIData } from "../types";
import { TrendingUp, TrendingDown, DollarSign, Users, Percent, Calendar } from "lucide-react";

interface AnalyticsKPIsProps {
  data?: KPIData;
  isLoading: boolean;
}

export function AnalyticsKPIs({ data, isLoading }: AnalyticsKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      title: "Taux d'occupation",
      value: `${data.occupancyRate.toFixed(1)}%`,
      icon: Percent,
      trend: data.trend?.occupancyRate,
      color: "primary"
    },
    {
      title: "ADR (Tarif moyen)",
      value: `${data.adr.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      trend: data.trend?.adr,
      color: "success"
    },
    {
      title: "RevPAR",
      value: `${data.revpar.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}`,
      icon: TrendingUp,
      trend: data.trend?.revpar,
      color: "accent"
    },
    {
      title: "Revenus totaux",
      value: `${data.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      trend: data.trend?.totalRevenue,
      color: "info"
    }
  ];

  const additionalKpis = [
    {
      title: "Réservations",
      value: data.totalReservations.toString(),
      icon: Users,
      color: "warning"
    },
    {
      title: "Séjour moyen",
      value: `${data.averageStayLength.toFixed(1)} nuits`,
      icon: Calendar,
      color: "secondary"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          const trendValue = kpi.trend;
          const isPositive = trendValue && trendValue > 0;
          const isNegative = trendValue && trendValue < 0;

          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`
                    p-2 rounded-lg
                    ${kpi.color === 'primary' ? 'bg-primary/10 text-primary' : ''}
                    ${kpi.color === 'success' ? 'bg-success/10 text-success' : ''}
                    ${kpi.color === 'accent' ? 'bg-accent/10 text-accent' : ''}
                    ${kpi.color === 'info' ? 'bg-info/10 text-info' : ''}
                  `}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </div>
                  {trendValue !== undefined && (
                    <div className="flex items-center gap-1">
                      {isPositive && <TrendingUp className="h-3 w-3 text-success" />}
                      {isNegative && <TrendingDown className="h-3 w-3 text-destructive" />}
                      <Badge 
                        variant={isPositive ? "default" : isNegative ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {isPositive && "+"}
                        {trendValue.toFixed(1)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {additionalKpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`
                    p-2 rounded-lg
                    ${kpi.color === 'warning' ? 'bg-warning/10 text-warning' : ''}
                    ${kpi.color === 'secondary' ? 'bg-secondary/10 text-secondary-foreground' : ''}
                  `}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}