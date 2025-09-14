import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsKPIs } from "./components/AnalyticsKPIs";
import { AnalyticsKPIsReal } from "./components/AnalyticsKPIsReal";
import { OccupancyChart } from "./components/OccupancyChart";
import { RevenueChart } from "./components/RevenueChart";
import { ReservationSourceChart } from "./components/ReservationSourceChart";
import { FilterControls } from "./components/FilterControls";
import { useAnalyticsData } from "./hooks/useAnalyticsData";
import { AnalyticsFilters } from "./types";
import { BarChart3, TrendingUp, Users, Calendar, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date()
    },
    compareWithPreviousPeriod: true
  });

  const { data, isLoading, error } = useAnalyticsData(filters);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Erreur lors du chargement des données analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Tableaux de bord et métriques de performance en temps réel
          </p>
        </div>
        <Link to="/analytics/advanced">
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            Analytics Avancés
          </Button>
        </Link>
      </div>

      <FilterControls 
        filters={filters} 
        onChange={setFilters}
        isLoading={isLoading}
      />

      {/* KPIs Section */}
      <AnalyticsKPIs data={data?.kpis} isLoading={isLoading} />

      {/* Charts Section */}
      <Tabs defaultValue="occupancy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="occupancy" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Occupation
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Revenus
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Sources
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="space-y-6">
          <div className="grid gap-6">
            <OccupancyChart 
              data={data?.occupancy || []} 
              isLoading={isLoading}
              showComparison={filters.compareWithPreviousPeriod}
            />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6">
            <RevenueChart 
              data={data?.revenue || []} 
              isLoading={isLoading}
              showComparison={filters.compareWithPreviousPeriod}
            />
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid gap-6">
            <ReservationSourceChart 
              data={data?.sources || []} 
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyse des durées de séjour</CardTitle>
                <CardDescription>
                  Répartition des réservations par nombre de nuits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse">Chargement des données...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data?.stayLength?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-sm font-medium">
                          {item.nights} {item.nights === 1 ? 'nuit' : 'nuits'}
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="w-20 text-sm text-right">
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}