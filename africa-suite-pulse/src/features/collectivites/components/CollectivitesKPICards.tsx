import React from 'react';
import { Users, UtensilsCrossed, DollarSign, TrendingUp, CreditCard, Target } from 'lucide-react';
import { DataCard } from '@/core/ui/DataCard';
import { CollectivitesStats } from '../types/stats';

interface CollectivitesKPICardsProps {
  stats?: CollectivitesStats;
  isLoading: boolean;
}

export function CollectivitesKPICards({ stats, isLoading }: CollectivitesKPICardsProps) {
  const kpiData = [
    {
      title: "Repas servis",
      value: isLoading ? "..." : (stats?.totalMeals.toLocaleString() || "0"),
      subtitle: "repas aujourd'hui",
      icon: UtensilsCrossed,
      trend: {
        value: isLoading ? 0 : (stats?.mealsGrowth || 0),
        label: "vs hier",
        positive: (stats?.mealsGrowth || 0) >= 0
      },
      variant: "primary" as const
    },
    {
      title: "Bénéficiaires actifs",
      value: isLoading ? "..." : (stats?.activeBeneficiaries.toLocaleString() || "0"),
      subtitle: "utilisateurs",
      icon: Users,
      trend: {
        value: isLoading ? 0 : (stats?.beneficiariesGrowth || 0),
        label: "ce mois",
        positive: (stats?.beneficiariesGrowth || 0) >= 0
      },
      variant: "success" as const
    },
    {
      title: "Subventions versées",
      value: isLoading ? "..." : `${(stats?.totalSubsidies || 0).toLocaleString()} FCFA`,
      subtitle: "aujourd'hui",
      icon: DollarSign,
      trend: {
        value: isLoading ? 0 : (stats?.subsidiesGrowth || 0),
        label: "vs hier",
        positive: (stats?.subsidiesGrowth || 0) >= 0
      },
      variant: "warning" as const
    },
    {
      title: "Participation usagers",
      value: isLoading ? "..." : `${(stats?.userContributions || 0).toLocaleString()} FCFA`,
      subtitle: "payé par les usagers",
      icon: CreditCard,
      trend: {
        value: isLoading ? 0 : (stats?.contributionsGrowth || 0),
        label: "vs hier",
        positive: (stats?.contributionsGrowth || 0) >= 0
      },
      variant: "default" as const
    },
    {
      title: "Coût moyen/repas",
      value: isLoading ? "..." : `${(stats?.averageCostPerMeal || 0).toLocaleString()} FCFA`,
      subtitle: "coût total par repas",
      icon: Target,
      trend: {
        value: isLoading ? 0 : (stats?.costGrowth || 0),
        label: "vs semaine dernière",
        positive: (stats?.costGrowth || 0) <= 0 // Lower cost is better
      },
      variant: "default" as const
    },
    {
      title: "Taux de fréquentation",
      value: isLoading ? "..." : `${(stats?.attendanceRate || 0)}%`,
      subtitle: "des bénéficiaires inscrits",
      icon: TrendingUp,
      trend: {
        value: isLoading ? 0 : (stats?.attendanceGrowth || 0),
        label: "vs semaine dernière",
        positive: (stats?.attendanceGrowth || 0) >= 0
      },
      variant: "primary" as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiData.map((kpi, index) => (
        <DataCard
          key={index}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          icon={kpi.icon}
          trend={kpi.trend}
          variant={kpi.variant}
          className="hover:shadow-lg transition-shadow"
        />
      ))}
    </div>
  );
}