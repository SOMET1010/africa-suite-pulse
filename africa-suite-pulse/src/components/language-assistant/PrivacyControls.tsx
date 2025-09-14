import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Trash2, 
  Shield, 
  Clock, 
  Eye, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useGDPRCompliance } from '@/hooks/useGDPRCompliance';

interface PrivacyControlsProps {
  onSettingsChange?: () => void;
}

export const PrivacyControls: React.FC<PrivacyControlsProps> = ({ onSettingsChange }) => {
  const {
    gdprSettings,
    isLoading,
    exportUserData,
    revokeConsent,
    hasValidConsent,
    canStoreConversations,
    canUseVoiceProcessing
  } = useGDPRCompliance();

  const getConsentStatus = () => {
    if (!gdprSettings) return { status: 'none', color: 'destructive', icon: AlertTriangle };
    if (hasValidConsent()) return { status: 'valid', color: 'success', icon: CheckCircle };
    return { status: 'expired', color: 'warning', icon: Clock };
  };

  const consentStatus = getConsentStatus();

  if (!gdprSettings) {
    return (
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Consentement RGPD requis
          </CardTitle>
          <CardDescription>
            Vous devez accepter les conditions RGPD pour utiliser l'assistant linguistique.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Consent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statut du Consentement
            <Badge variant={consentStatus.color as any} className="ml-auto">
              <consentStatus.icon className="h-3 w-3 mr-1" />
              {consentStatus.status === 'valid' ? 'Valide' : 
               consentStatus.status === 'expired' ? 'Expiré' : 'Aucun'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Consentement donné le {gdprSettings.consentDate.toLocaleDateString('fr-FR')}
            {gdprSettings.dataRetentionDays > 0 && 
              ` • Conservation: ${gdprSettings.dataRetentionDays} jours`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${canUseVoiceProcessing() ? 'bg-success' : 'bg-muted'}`} />
              Traitement vocal
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${canStoreConversations() ? 'bg-success' : 'bg-muted'}`} />
              Stockage conversations
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${gdprSettings.consents.dataSharing ? 'bg-success' : 'bg-muted'}`} />
              Services externes
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${gdprSettings.consents.privateMode ? 'bg-warning' : 'bg-muted'}`} />
              Mode privé
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Gestion des Données
          </CardTitle>
          <CardDescription>
            Exercez vos droits RGPD sur vos données personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={exportUserData}
            disabled={isLoading}
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter mes données (Portabilité)
          </Button>
          
          <Button
            variant="outline"
            onClick={onSettingsChange}
            disabled={isLoading}
            className="w-full justify-start"
          >
            <Shield className="h-4 w-4 mr-2" />
            Modifier mes préférences
          </Button>
          
          <Button
            variant="destructive"
            onClick={revokeConsent}
            disabled={isLoading}
            className="w-full justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Révoquer le consentement et supprimer tout
          </Button>
        </CardContent>
      </Card>

      {/* Information */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium">Vos droits RGPD :</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>Accès :</strong> Consulter vos données</li>
              <li>• <strong>Rectification :</strong> Corriger vos données</li>
              <li>• <strong>Suppression :</strong> Effacer vos données</li>
              <li>• <strong>Portabilité :</strong> Récupérer vos données</li>
              <li>• <strong>Opposition :</strong> Refuser le traitement</li>
            </ul>
            <p className="pt-2">
              <strong>Contact DPO :</strong> dpo@hotel.com
            </p>
            <p>
              Les données sont automatiquement supprimées après la période de rétention 
              ou immédiatement en mode privé.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};