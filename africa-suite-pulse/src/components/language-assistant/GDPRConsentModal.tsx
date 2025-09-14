import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Mic, FileText, Clock, Trash2 } from 'lucide-react';

interface GDPRConsentModalProps {
  open: boolean;
  onConsent: (consents: ConsentPreferences) => void;
  onDecline: () => void;
}

export interface ConsentPreferences {
  voiceProcessing: boolean;
  conversationStorage: boolean;
  dataSharing: boolean;
  analytics: boolean;
  privateMode: boolean;
}

export const GDPRConsentModal: React.FC<GDPRConsentModalProps> = ({
  open,
  onConsent,
  onDecline
}) => {
  const [consents, setConsents] = useState<ConsentPreferences>({
    voiceProcessing: false,
    conversationStorage: false,
    dataSharing: false,
    analytics: false,
    privateMode: true
  });

  const [allRequired, setAllRequired] = useState(false);

  const handleConsentChange = (key: keyof ConsentPreferences, value: boolean) => {
    const newConsents = { ...consents, [key]: value };
    setConsents(newConsents);
    
    // Check if required consents are given
    setAllRequired(newConsents.voiceProcessing && newConsents.conversationStorage);
  };

  const handleAccept = () => {
    if (allRequired) {
      onConsent(consents);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Protection des Données - Assistant Linguistique
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Avant d'utiliser l'assistant linguistique, nous devons obtenir votre consentement 
              pour le traitement de certaines données personnelles conformément au RGPD.
            </div>

            <div className="space-y-4">
              {/* Voice Processing */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id="voice"
                  checked={consents.voiceProcessing}
                  onCheckedChange={(checked) => 
                    handleConsentChange('voiceProcessing', checked as boolean)
                  }
                />
                <div className="space-y-2 flex-1">
                  <Label htmlFor="voice" className="flex items-center gap-2 font-medium">
                    <Mic className="h-4 w-4" />
                    Traitement des données vocales *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Autoriser l'enregistrement et le traitement de votre voix pour la reconnaissance 
                    vocale. Ces données biométriques sont traitées localement et supprimées après usage.
                  </p>
                </div>
              </div>

              {/* Conversation Storage */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id="storage"
                  checked={consents.conversationStorage}
                  onCheckedChange={(checked) => 
                    handleConsentChange('conversationStorage', checked as boolean)
                  }
                />
                <div className="space-y-2 flex-1">
                  <Label htmlFor="storage" className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4" />
                    Stockage des conversations *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sauvegarder les conversations pour améliorer le service. Les données sont 
                    chiffrées et automatiquement supprimées après 30 jours.
                  </p>
                </div>
              </div>

              {/* Data Sharing */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id="sharing"
                  checked={consents.dataSharing}
                  onCheckedChange={(checked) => 
                    handleConsentChange('dataSharing', checked as boolean)
                  }
                />
                <div className="space-y-2 flex-1">
                  <Label htmlFor="sharing" className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4" />
                    Partage avec services de traduction
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre l'envoi de textes anonymisés vers des services de traduction externes 
                    pour améliorer la qualité (Google Translate, OpenAI). Données PII supprimées.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border">
                <Checkbox
                  id="analytics"
                  checked={consents.analytics}
                  onCheckedChange={(checked) => 
                    handleConsentChange('analytics', checked as boolean)
                  }
                />
                <div className="space-y-2 flex-1">
                  <Label htmlFor="analytics" className="flex items-center gap-2 font-medium">
                    Analytics et amélioration
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Collecter des statistiques d'usage anonymes pour améliorer l'assistant 
                    (langues utilisées, types de phrases, durée des sessions).
                  </p>
                </div>
              </div>

              {/* Private Mode */}
              <div className="flex items-start space-x-3 p-4 rounded-lg border bg-muted/50">
                <Checkbox
                  id="private"
                  checked={consents.privateMode}
                  onCheckedChange={(checked) => 
                    handleConsentChange('privateMode', checked as boolean)
                  }
                />
                <div className="space-y-2 flex-1">
                  <Label htmlFor="private" className="flex items-center gap-2 font-medium">
                    <Trash2 className="h-4 w-4" />
                    Mode privé (Recommandé)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ne pas sauvegarder les conversations. Toutes les données sont supprimées 
                    à la fermeture de l'assistant. Fonctionnalité limitée mais confidentialité maximale.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>* Consentements obligatoires pour utiliser l'assistant</p>
              <p>
                Vous pouvez modifier ces préférences à tout moment dans les paramètres. 
                Vos données sont traitées selon notre politique de confidentialité et le RGPD.
              </p>
              <p>
                <strong>Vos droits :</strong> accès, rectification, suppression, portabilité, 
                opposition au traitement. Contact : dpo@hotel.com
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onDecline}>
            Refuser
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!allRequired}
            className="min-w-24"
          >
            Accepter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};