import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Calendar, Users } from "lucide-react";

export default function AnalyticsPage() {
  const reports = [
    {
      id: 1,
      name: "Rapport d'Occupation",
      description: "Taux d'occupation mensuel par type de chambre",
      icon: BarChart3,
      frequency: "Mensuel",
      status: "Actif"
    },
    {
      id: 2,
      name: "Revenus & Performance",
      description: "Analyse des revenus et KPIs financiers",
      icon: TrendingUp,
      frequency: "Hebdomadaire",
      status: "Actif"
    },
    {
      id: 3,
      name: "Planning & Réservations",
      description: "Suivi des réservations et prévisions",
      icon: Calendar,
      frequency: "Quotidien",
      status: "Inactif"
    },
    {
      id: 4,
      name: "Analyse Clientèle",
      description: "Profils clients et segmentation",
      icon: Users,
      frequency: "Mensuel",
      status: "Actif"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Rapports</h1>
        <p className="text-muted-foreground">Configuration des rapports automatiques et analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Générale</CardTitle>
          <CardDescription>Paramètres globaux des analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="analytics-enabled" defaultChecked />
            <Label htmlFor="analytics-enabled">Analytics Activé</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="auto-reports" defaultChecked />
            <Label htmlFor="auto-reports">Rapports Automatiques</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="data-retention" defaultChecked />
            <Label htmlFor="data-retention">Conservation Données (2 ans)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rapports Configurés</CardTitle>
          <CardDescription>Gestion des rapports automatiques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Fréquence: {report.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={report.status === "Actif" ? "default" : "secondary"}>
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intégrations</CardTitle>
          <CardDescription>Connexions avec des outils d'analyse externe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Google Analytics</h4>
              <p className="text-sm text-muted-foreground">Suivi avancé des performances web</p>
            </div>
            <Button variant="outline" size="sm">Connecter</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Power BI</h4>
              <p className="text-sm text-muted-foreground">Tableaux de bord personnalisés</p>
            </div>
            <Button variant="outline" size="sm">Connecter</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}