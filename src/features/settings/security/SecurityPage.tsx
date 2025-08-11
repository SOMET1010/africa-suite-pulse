import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, AlertTriangle, Key, Eye, Clock } from "lucide-react";

export default function SecurityPage() {
  const auditLogs = [
    {
      id: 1,
      action: "Connexion utilisateur",
      user: "admin@hotel.com",
      timestamp: "Il y a 5 minutes",
      status: "Succès"
    },
    {
      id: 2,
      action: "Modification chambre #205",
      user: "manager@hotel.com",
      timestamp: "Il y a 1 heure",
      status: "Succès"
    },
    {
      id: 3,
      action: "Tentative connexion échouée",
      user: "unknown@email.com",
      timestamp: "Il y a 2 heures",
      status: "Échec"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sécurité & Audit</h1>
        <p className="text-muted-foreground">Configuration de la sécurité et suivi des activités</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentification
            </CardTitle>
            <CardDescription>Paramètres de sécurité des connexions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="2fa" />
              <Label htmlFor="2fa">Authentification à 2 facteurs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="strong-password" defaultChecked />
              <Label htmlFor="strong-password">Mots de passe forts obligatoires</Label>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="session-timeout">Timeout de session (minutes)</Label>
              <Input id="session-timeout" type="number" placeholder="30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Surveillance
            </CardTitle>
            <CardDescription>Monitoring et alertes de sécurité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="login-monitoring" defaultChecked />
              <Label htmlFor="login-monitoring">Surveillance des connexions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="failed-attempts" defaultChecked />
              <Label htmlFor="failed-attempts">Alerte tentatives échouées</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="audit-logs" defaultChecked />
              <Label htmlFor="audit-logs">Logs d'audit détaillés</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Clés API & Accès
          </CardTitle>
          <CardDescription>Gestion des accès API et intégrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">API Principale</h4>
                <p className="text-sm text-muted-foreground">sk-***************************</p>
                <p className="text-xs text-muted-foreground">Dernière utilisation: Il y a 10 minutes</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="default">Active</Badge>
                <Button variant="outline" size="sm">Révoquer</Button>
              </div>
            </div>
            <Button variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Générer Nouvelle Clé
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Journal d'Audit
          </CardTitle>
          <CardDescription>Historique des actions importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.user} • {log.timestamp}
                  </p>
                </div>
                <Badge variant={log.status === "Succès" ? "default" : "destructive"}>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              Voir tout l'historique
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Recommandations de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <ul className="space-y-2 text-sm">
            <li>• Activez l'authentification à 2 facteurs pour tous les comptes administrateurs</li>
            <li>• Configurez des sauvegardes automatiques chiffrées</li>
            <li>• Vérifiez régulièrement les logs d'audit pour détecter des activités suspectes</li>
            <li>• Renouvelez les clés API tous les 90 jours</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}