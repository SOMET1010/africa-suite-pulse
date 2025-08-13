import { QrCode } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card';
import { Label } from '@/core/ui/label';
import { Switch } from '@/core/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/ui/select';
import { Input } from '@/core/ui/input';
import { Textarea } from '@/core/ui/textarea';
import type { TemplateQRCode } from '@/types/templates';

interface QRCodeConfigProps {
  qrConfig: TemplateQRCode;
  onChange: (config: TemplateQRCode) => void;
}

export function QRCodeConfig({ qrConfig, onChange }: QRCodeConfigProps) {
  const updateConfig = (updates: Partial<TemplateQRCode>) => {
    onChange({ ...qrConfig, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Configuration du QR Code
        </CardTitle>
        <CardDescription>
          Ajoutez un QR code à vos documents pour permettre la vérification et le suivi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={qrConfig.enabled}
            onCheckedChange={(enabled) => updateConfig({ enabled })}
          />
          <Label>Activer le QR code</Label>
        </div>

        {qrConfig.enabled && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Type de contenu</Label>
                <Select
                  value={qrConfig.content}
                  onValueChange={(content: 'document_url' | 'verification_url' | 'payment_url' | 'custom') =>
                    updateConfig({ content })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document_url">URL du document</SelectItem>
                    <SelectItem value="verification_url">URL de vérification</SelectItem>
                    <SelectItem value="payment_url">URL de paiement</SelectItem>
                    <SelectItem value="custom">Contenu personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={qrConfig.position}
                  onValueChange={(position: 'header' | 'footer' | 'top_right' | 'bottom_right') =>
                    updateConfig({ position })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">En-tête</SelectItem>
                    <SelectItem value="footer">Pied de page</SelectItem>
                    <SelectItem value="top_right">Coin supérieur droit</SelectItem>
                    <SelectItem value="bottom_right">Coin inférieur droit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Taille</Label>
                <Select
                  value={qrConfig.size}
                  onValueChange={(size: 'small' | 'medium' | 'large') =>
                    updateConfig({ size })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petit (64px)</SelectItem>
                    <SelectItem value="medium">Moyen (96px)</SelectItem>
                    <SelectItem value="large">Grand (128px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {qrConfig.content === 'custom' && (
              <div className="space-y-2">
                <Label>Contenu personnalisé</Label>
                <Textarea
                  value={qrConfig.custom_content || ''}
                  onChange={(e) => updateConfig({ custom_content: e.target.value })}
                  placeholder="Entrez le contenu du QR code..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez utiliser des variables comme {'{document_id}'}, {'{document_number}'}, {'{amount}'}, etc.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
              <div className="text-center space-y-2">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Aperçu du QR code - Taille: {qrConfig.size} - Position: {qrConfig.position}
                </p>
                <p className="text-xs text-muted-foreground">
                  {qrConfig.content === 'custom' 
                    ? qrConfig.custom_content || 'Contenu personnalisé'
                    : {
                        document_url: 'https://example.com/document/{id}',
                        verification_url: 'https://example.com/verify/{id}',
                        payment_url: 'https://example.com/pay/{id}'
                      }[qrConfig.content]
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}