import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Activity, AlertTriangle, Settings, Network, Database } from 'lucide-react';

export default function MonitoringGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Comment activer le monitoring pour votre hôtel ?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Activation Automatique
            </h3>
            <p className="text-muted-foreground">
              Cliquez simplement sur le bouton "Activer la Surveillance" et le système configurera automatiquement :
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Database className="h-3 w-3" />
                  Métriques
                </Badge>
                <span className="text-sm">Collection automatique des données</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Alertes
                </Badge>
                <span className="text-sm">Seuils pré-configurés par défaut</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Network className="h-3 w-3" />
                  Surveillance
                </Badge>
                <span className="text-sm">Monitoring 24/7 en temps réel</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-warning" />
              Configuration Manuelle (Avancée)
            </h3>
            <p className="text-muted-foreground">
              Pour les utilisateurs expérimentés, vous pouvez configurer manuellement :
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Seuils d'alerte personnalisés</li>
              <li>• Métriques spécifiques à surveiller</li>
              <li>• Canaux de notification (email, SMS)</li>
              <li>• Fenêtres d'évaluation des alertes</li>
              <li>• Endpoints réseau à surveiller</li>
            </ul>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Métriques surveillées par défaut :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Système :</strong>
              <ul className="text-muted-foreground">
                <li>• Temps de réponse</li>
                <li>• Disponibilité</li>
                <li>• Taux d'erreur</li>
              </ul>
            </div>
            <div>
              <strong>Application :</strong>
              <ul className="text-muted-foreground">
                <li>• Connexions actives</li>
                <li>• Performance DB</li>
                <li>• Transactions POS</li>
              </ul>
            </div>
            <div>
              <strong>Réseau :</strong>
              <ul className="text-muted-foreground">
                <li>• Connectivité</li>
                <li>• Latence réseau</li>
                <li>• Bande passante</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            Important :
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Une fois le monitoring activé, les données seront collectées en continu. 
            Assurez-vous que votre système est prêt et que vous avez configuré les 
            notifications pour recevoir les alertes importantes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}