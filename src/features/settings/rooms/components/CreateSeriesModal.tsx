import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CreateSeriesData } from '../roomsCatalogService';
import { RoomTypeWithStock } from '../roomTypesService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateSeriesModalProps {
  roomTypes: RoomTypeWithStock[];
  onClose: () => void;
  onConfirm: (data: CreateSeriesData) => Promise<any>;
}

export function CreateSeriesModal({ roomTypes, onClose, onConfirm }: CreateSeriesModalProps) {
  const [formData, setFormData] = useState<CreateSeriesData>({
    startNumber: 101,
    endNumber: 110,
    typeCode: roomTypes[0]?.code || '',
    floor: '1',
    features: {
      air_conditioning: true,
      wifi: true
    },
    isFictive: false,
    prefix: '',
    suffix: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof CreateSeriesData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFeature = (feature: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: value }
    }));
  };

  const generatePreview = () => {
    const preview = [];
    const count = Math.min(5, formData.endNumber - formData.startNumber + 1);
    
    for (let i = 0; i < count; i++) {
      const number = formData.startNumber + i;
      preview.push(`${formData.prefix}${number.toString().padStart(3, '0')}${formData.suffix}`);
    }
    
    if (formData.endNumber - formData.startNumber + 1 > 5) {
      preview.push(`... (+${formData.endNumber - formData.startNumber + 1 - 5} autres)`);
    }
    
    return preview;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onConfirm(formData);
      onClose();
    } catch (error) {
      console.error('Error creating series:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRooms = formData.endNumber - formData.startNumber + 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Création en série</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Numbering */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startNumber">Numéro de début *</Label>
              <Input
                id="startNumber"
                type="number"
                value={formData.startNumber}
                onChange={(e) => updateField('startNumber', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="endNumber">Numéro de fin *</Label>
              <Input
                id="endNumber"
                type="number"
                value={formData.endNumber}
                onChange={(e) => updateField('endNumber', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Prefix/Suffix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prefix">Préfixe (optionnel)</Label>
              <Input
                id="prefix"
                value={formData.prefix}
                onChange={(e) => updateField('prefix', e.target.value)}
                placeholder="Ex: A"
              />
            </div>

            <div>
              <Label htmlFor="suffix">Suffixe (optionnel)</Label>
              <Input
                id="suffix"
                value={formData.suffix}
                onChange={(e) => updateField('suffix', e.target.value)}
                placeholder="Ex: B"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Aperçu des numéros :</p>
            <div className="flex flex-wrap gap-2">
              {generatePreview().map((number, index) => (
                <Badge key={index} variant="secondary">
                  {number}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: {totalRooms} chambre(s)
            </p>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type de chambre *</Label>
              <Select value={formData.typeCode} onValueChange={(value) => updateField('typeCode', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.code} - {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="floor">Étage *</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => updateField('floor', e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          {/* Nature */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fictive"
              checked={formData.isFictive}
              onCheckedChange={(checked) => updateField('isFictive', checked)}
            />
            <Label htmlFor="fictive" className="text-sm font-medium">
              Chambres fictives (pour TO)
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Les chambres fictives permettent la gestion de fourchettes pour les tours opérateurs
          </p>

          {/* Features */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Caractéristiques</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'air_conditioning', label: 'Climatisation' },
                { key: 'wifi', label: 'WiFi' },
                { key: 'balcony', label: 'Balcon' },
                { key: 'sea_view', label: 'Vue mer' },
                { key: 'minibar', label: 'Minibar' },
                { key: 'safe', label: 'Coffre-fort' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={formData.features[key] || false}
                    onCheckedChange={(checked) => updateFeature(key, !!checked)}
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || totalRooms <= 0}>
              {isSubmitting ? 'Création...' : `Créer ${totalRooms} chambre(s)`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}