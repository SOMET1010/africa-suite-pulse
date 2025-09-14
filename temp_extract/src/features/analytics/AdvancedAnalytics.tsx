import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastPanel } from "./components/ForecastPanel";
import { SegmentationPanel } from "./components/SegmentationPanel";
import { AlertsPanel } from "./components/AlertsPanel";
import { InsightsPanel } from "./components/InsightsPanel";
import { IntegrationsPanel } from "./components/IntegrationsPanel";
import { useAdvancedAnalytics } from "./hooks/useAdvancedAnalytics";
import { Brain, TrendingUp, Users, AlertTriangle, Lightbulb, Settings } from "lucide-react";

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState("forecasts");
  const { data, isLoading, error } = useAdvancedAnalytics();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Erreur lors du chargement des analytics avancés</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Analytics Avancés
          </h1>
          <p className="text-muted-foreground">
            Intelligence business, prévisions et insights automatiques
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Prévisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <div className="text-xs text-muted-foreground">Modèles actifs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.segments?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Segments clients</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {data?.alerts?.filter(a => a.isActive).length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Alertes actives</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {data?.insights?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Nouvelles insights</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecasts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Prévisions
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Segmentation
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Intégrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts">
          <ForecastPanel data={data?.forecasts || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="segments">
          <SegmentationPanel data={data?.segments || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsPanel data={data?.alerts || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsPanel data={data?.insights || []} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsPanel data={data?.integrations || []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}