import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Package, 
  TrendingUp,
  Calendar,
  DollarSign
} from "lucide-react";
import { useMaintenanceKPIs } from "../hooks/useMaintenanceKPIs";

export function MaintenanceKPIs() {
  const { data: kpis, isLoading } = useMaintenanceKPIs();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Demandes en attente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {kpis?.pendingRequests || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {kpis?.urgentRequests || 0} urgentes
          </p>
        </CardContent>
      </Card>

      {/* Interventions en cours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En cours</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {kpis?.inProgressRequests || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            interventions actives
          </p>
        </CardContent>
      </Card>

      {/* Terminées ce mois */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terminées ce mois</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {kpis?.completedThisMonth || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            +{kpis?.completedGrowth || 0}% vs mois dernier
          </p>
        </CardContent>
      </Card>

      {/* Équipements en panne */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Équipements en panne</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {kpis?.brokenEquipment || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            sur {kpis?.totalEquipment || 0} équipements
          </p>
        </CardContent>
      </Card>

      {/* Pièces en rupture */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pièces en rupture</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {kpis?.lowStockParts || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            réapprovisionnement nécessaire
          </p>
        </CardContent>
      </Card>

      {/* Maintenance préventive */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintenance due</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {kpis?.dueMaintenances || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            équipements à maintenir
          </p>
        </CardContent>
      </Card>

      {/* Temps moyen d'intervention */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis?.averageResponseTime || 0}h
          </div>
          <p className="text-xs text-muted-foreground">
            temps de résolution
          </p>
        </CardContent>
      </Card>

      {/* Coût mensuel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coût ce mois</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {kpis?.monthlyCost?.toLocaleString() || 0} FCFA
          </div>
          <p className="text-xs text-muted-foreground">
            maintenance + pièces
          </p>
        </CardContent>
      </Card>
    </div>
  );
}