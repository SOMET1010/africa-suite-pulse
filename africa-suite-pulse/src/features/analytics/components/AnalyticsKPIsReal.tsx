import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Percent } from "lucide-react";
import { KPIData } from "../types";
import { cn } from "@/lib/utils";

interface AnalyticsKPIsRealProps {
  data: KPIData;
  isLoading: boolean;
}

export function AnalyticsKPIsReal({ data, isLoading }: AnalyticsKPIsRealProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Taux d'occupation",
      value: `${data.occupancyRate.toFixed(1)}%`,
      icon: Percent,
      trend: data.trend?.occupancyRate,
      description: "Pourcentage d'occupation des chambres",
      color: "text-brand-primary"
    },
    {
      title: "ADR",
      value: data.adr.toLocaleString('fr-FR', { 
        style: 'currency', 
        currency: 'XOF', 
        minimumFractionDigits: 0 
      }),
      icon: DollarSign,
      trend: data.trend?.adr,
      description: "Tarif moyen journalier",
      color: "text-success"
    },
    {
      title: "RevPAR",
      value: data.revpar.toLocaleString('fr-FR', { 
        style: 'currency', 
        currency: 'XOF', 
        minimumFractionDigits: 0 
      }),
      icon: TrendingUp,
      trend: data.trend?.revpar,
      description: "Revenus par chambre disponible",
      color: "text-info"
    },
    {
      title: "Revenus totaux",
      value: data.totalRevenue.toLocaleString('fr-FR', { 
        style: 'currency', 
        currency: 'XOF', 
        minimumFractionDigits: 0 
      }),
      icon: DollarSign,
      trend: data.trend?.totalRevenue,
      description: "Chiffre d'affaires de la période",
      color: "text-success"
    },
    {
      title: "Réservations",
      value: data.totalReservations.toString(),
      icon: Calendar,
      description: "Nombre total de réservations",
      color: "text-brand-primary"
    },
    {
      title: "Séjour moyen",
      value: `${data.averageStayLength.toFixed(1)} nuits`,
      icon: Users,
      description: "Durée moyenne du séjour",
      color: "text-warning"
    }
  ];

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : (
      <TrendingDown className="h-4 w-4 text-destructive" />
    );
  };

  const getTrendBadge = (trend?: number) => {
    if (!trend) return null;
    const isPositive = trend > 0;
    return (
      <Badge variant={isPositive ? "default" : "secondary"} className="text-xs">
        {isPositive ? '+' : ''}{trend.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-2">
                <CardDescription className="text-xs">
                  {kpi.description}
                </CardDescription>
                {kpi.trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(kpi.trend)}
                    {getTrendBadge(kpi.trend)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <div 
            className={cn(
              "absolute bottom-0 left-0 h-1 w-full",
              kpi.color.replace('text-', 'bg-')
            )}
          />
        </Card>
      ))}
    </div>
  );
}