import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Monitor, 
  FileText, 
  Printer, 
  Users, 
  Activity, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  Clock,
  DollarSign,
  ShoppingCart,
  TrendingUp
} from "lucide-react";
import { useSystemSettings } from "../hooks/useSystemSettings";

interface SystemStatus {
  component: string;
  status: 'online' | 'offline' | 'warning';
  lastCheck: string;
  details: string;
}

interface RealtimeMetric {
  label: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  description: string;
  isScheduled: boolean;
  lastGenerated: string;
}

export function SupervisionInterface() {
  const { settings, updateSetting, saveSettings, isSaving } = useSystemSettings();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetric[]>([]);

  const getSetting = (key: string, defaultValue: any = "") => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key, value);
  };

  // Simulation des données temps réel
  useEffect(() => {
    const mockSystemStatus: SystemStatus[] = [
      {
        component: "Base de données",
        status: "online",
        lastCheck: new Date().toLocaleTimeString(),
        details: "Connexion stable - 2ms latence"
      },
      {
        component: "Imprimante cuisine",
        status: "warning",
        lastCheck: new Date().toLocaleTimeString(),
        details: "Papier faible - 10% restant"
      },
      {
        component: "Terminal de paiement",
        status: "online",
        lastCheck: new Date().toLocaleTimeString(),
        details: "Connexion sécurisée"
      },
      {
        component: "Serveur FNE",
        status: "offline",
        lastCheck: "Il y a 5 min",
        details: "Impossible de joindre le serveur"
      }
    ];

    const mockMetrics: RealtimeMetric[] = [
      {
        label: "Ventes aujourd'hui",
        value: "247,500 FCFA",
        change: 12.5,
        icon: DollarSign,
        color: "text-green-600"
      },
      {
        label: "Commandes en cours",
        value: 8,
        change: -2,
        icon: ShoppingCart,
        color: "text-blue-600"
      },
      {
        label: "Tables occupées",
        value: "12/20",
        change: 3,
        icon: Users,
        color: "text-orange-600"
      },
      {
        label: "Temps moyen service",
        value: "18 min",
        change: -8,
        icon: Clock,
        color: "text-purple-600"
      }
    ];

    setSystemStatus(mockSystemStatus);
    setRealtimeMetrics(mockMetrics);

    // Mise à jour périodique
    const interval = setInterval(() => {
      setSystemStatus(prev => prev.map(status => ({
        ...status,
        lastCheck: new Date().toLocaleTimeString()
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const reportTemplates: ReportTemplate[] = [
    {
      id: "daily_z",
      name: "Z Journalier",
      type: "daily",
      description: "Rapport de clôture journalière réglementaire",
      isScheduled: true,
      lastGenerated: "Hier 23:45"
    },
    {
      id: "weekly_sales",
      name: "Ventes Hebdomadaires",
      type: "weekly",
      description: "Synthèse des ventes et performances",
      isScheduled: true,
      lastGenerated: "Dimanche 23:59"
    },
    {
      id: "tax_report",
      name: "Rapport TVA",
      type: "monthly",
      description: "Déclaration TVA mensuelle",
      isScheduled: false,
      lastGenerated: "01/01/2024"
    },
    {
      id: "fne_export",
      name: "Export FNE",
      type: "custom",
      description: "Export des données pour FNE DGI",
      isScheduled: false,
      lastGenerated: "Jamais"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'offline':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Interface de Supervision</h2>
            <p className="text-muted-foreground">
              Monitoring temps réel et rapports réglementaires
            </p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard Temps Réel</TabsTrigger>
          <TabsTrigger value="reports">Rapports Réglementaires</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Équipements</TabsTrigger>
          <TabsTrigger value="users">Gestion Utilisateurs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Métriques temps réel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {realtimeMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className={`w-3 h-3 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`text-xs ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </div>
                      </div>
                      <IconComponent className={`w-8 h-8 ${metric.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Graphiques et alertes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Ventes du Jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Objectif journalier</span>
                    <span className="font-medium">300,000 FCFA</span>
                  </div>
                  <Progress value={82} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    247,500 FCFA réalisés (82% de l'objectif)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Alertes Système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 border rounded bg-yellow-50">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Papier imprimante faible</p>
                      <p className="text-xs text-muted-foreground">Cuisine - 10% restant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 border rounded bg-red-50">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Connexion FNE interrompue</p>
                      <p className="text-xs text-muted-foreground">Depuis 5 minutes</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "14:23", action: "Commande #1245 - Table 8", user: "Marie S.", status: "success" },
                  { time: "14:21", action: "Paiement CB - 12,500 FCFA", user: "Jean D.", status: "success" },
                  { time: "14:18", action: "Annulation commande #1244", user: "Admin", status: "warning" },
                  { time: "14:15", action: "Nouvelle réservation - Table 12", user: "Système", status: "info" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user} - {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Rapports Réglementaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <Card key={template.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                        <Badge variant={template.isScheduled ? "default" : "outline"}>
                          {template.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dernière génération:</span>
                          <span>{template.lastGenerated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Planification:</span>
                          <Switch checked={template.isScheduled} />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-3 h-3" />
                          Voir
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="w-3 h-3" />
                          Générer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Configuration des rapports</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Génération automatique Z journalier</Label>
                      <p className="text-sm text-muted-foreground">
                        Génère automatiquement le rapport Z à 23h45
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_daily_z', true)}
                      onCheckedChange={(checked) => handleSettingChange('auto_daily_z', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Archive fiscale mensuelle</Label>
                      <p className="text-sm text-muted-foreground">
                        Génère l'archive NF525 le dernier jour du mois
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('auto_monthly_archive', true)}
                      onCheckedChange={(checked) => handleSettingChange('auto_monthly_archive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sauvegarde cloud</Label>
                      <p className="text-sm text-muted-foreground">
                        Sauvegarde automatique des rapports dans le cloud
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('cloud_backup', false)}
                      onCheckedChange={(checked) => handleSettingChange('cloud_backup', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Monitoring des Équipements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {systemStatus.map((status, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 ${getStatusColor(status.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status.status)}
                        <div>
                          <h5 className="font-medium">{status.component}</h5>
                          <p className="text-sm text-muted-foreground">{status.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={status.status === 'online' ? 'default' : 
                                       status.status === 'warning' ? 'secondary' : 'destructive'}>
                          {status.status === 'online' ? 'En ligne' :
                           status.status === 'warning' ? 'Attention' : 'Hors ligne'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Dernière vérification: {status.lastCheck}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Configuration du monitoring</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="check_interval">Intervalle de vérification</Label>
                    <Select 
                      value={getSetting('monitoring_interval', '30')} 
                      onValueChange={(value) => handleSettingChange('monitoring_interval', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 secondes</SelectItem>
                        <SelectItem value="30">30 secondes</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertes par email</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir les alertes par email
                      </p>
                    </div>
                    <Switch
                      checked={getSetting('email_alerts', false)}
                      onCheckedChange={(checked) => handleSettingChange('email_alerts', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sessions multiples</Label>
                    <p className="text-sm text-muted-foreground">
                      Autoriser plusieurs sessions par utilisateur
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('multiple_sessions', false)}
                    onCheckedChange={(checked) => handleSettingChange('multiple_sessions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit trail</Label>
                    <p className="text-sm text-muted-foreground">
                      Traçabilité complète des actions utilisateurs
                    </p>
                  </div>
                  <Switch
                    checked={getSetting('audit_trail', true)}
                    onCheckedChange={(checked) => handleSettingChange('audit_trail', checked)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="session_timeout">Timeout de session</Label>
                    <Select 
                      value={getSetting('session_timeout', '480')} 
                      onValueChange={(value) => handleSettingChange('session_timeout', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="240">4 heures</SelectItem>
                        <SelectItem value="480">8 heures</SelectItem>
                        <SelectItem value="720">12 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="max_login_attempts">Tentatives de connexion</Label>
                    <Select 
                      value={getSetting('max_login_attempts', '3')} 
                      onValueChange={(value) => handleSettingChange('max_login_attempts', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 tentatives</SelectItem>
                        <SelectItem value="5">5 tentatives</SelectItem>
                        <SelectItem value="10">10 tentatives</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Rôles et permissions granulaires</h4>
                <div className="space-y-3">
                  {[
                    { role: "Caissier", permissions: ["Ventes", "Encaissement", "Rapports de vente"] },
                    { role: "Serveur", permissions: ["Prise de commande", "Modification commande", "Impression cuisine"] },
                    { role: "Manager", permissions: ["Toutes permissions", "Configuration", "Rapports avancés"] },
                    { role: "Cuisinier", permissions: ["Consultation commandes", "Statut préparation"] }
                  ].map((roleInfo, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{roleInfo.role}</h5>
                        <Button variant="outline" size="sm">Modifier</Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {roleInfo.permissions.map((permission, permIndex) => (
                          <Badge key={permIndex} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}