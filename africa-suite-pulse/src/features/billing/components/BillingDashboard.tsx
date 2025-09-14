// Dashboard facturation avec métriques business - Phase 1
import { FileText, Euro, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BillingStats } from "../types/billing.types";

interface BillingDashboardProps {
  stats: BillingStats | null | undefined;
  loading: boolean;
}

export function BillingDashboard({ stats, loading }: BillingDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Factures du jour",
      value: stats?.today.invoices_count?.toString() || "0",
      icon: FileText,
      trend: "+12% vs hier",
      color: "text-primary"
    },
    {
      label: "Encaissements",
      value: `${stats?.today.paid_amount?.toLocaleString() || "0"} XOF`,
      icon: Euro,
      trend: `${stats?.today.pending_count || 0} en attente`,
      color: "text-success"
    },
    {
      label: "Impayés",
      value: stats?.overdue.invoices_count?.toString() || "0",
      icon: AlertTriangle,
      trend: `${stats?.overdue.total_amount?.toLocaleString() || "0"} XOF`,
      color: "text-warning"
    },
    {
      label: "Ce mois",
      value: `${stats?.this_month.total_amount?.toLocaleString() || "0"} XOF`,
      icon: TrendingUp,
      trend: `${stats?.this_month.invoices_count || 0} factures`,
      color: "text-info"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    {metric.label}
                  </p>
                  <p className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.trend}
                  </p>
                </div>
                <Icon className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}