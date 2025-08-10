import React, { useState } from 'react';
import { Plus, Download, Edit3, Trash2, Tags, Save, X, DollarSign } from 'lucide-react';
import { Service, ServiceFamily, ServicesService } from '../servicesService';
import { useServices } from '../useServices';
import { useOrgId } from '@/core/auth/useOrg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServicesTabProps {
  services: Service[];
  families: ServiceFamily[];
  searchQuery: string;
  onExport: () => void;
}

export function ServicesTab({ services, families, searchQuery, onExport }: ServicesTabProps) {
  const orgId = useOrgId();
  const { saveService, deleteService } = useServices(orgId);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredServices = services.filter(service =>
    service.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.family?.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const units = [
    'unité', 'pers', 'nuit', 'jour', 'séance', 'bouteille', 
    'kg', 'litre', 'heure', 'forfait', 'mois', 'année'
  ];

  const handleCreateService = () => {
    setEditingService({
      family_id: families[0]?.id || '',
      code: '',
      label: '',
      description: '',
      price: 0,
      vat_rate: 18,
      unit: 'unité',
      is_active: true,
      is_free_price: false
    });
    setIsCreating(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService({ ...service });
    setIsCreating(false);
  };

  const handleSaveService = async () => {
    if (!editingService) return;

    const errors = ServicesService.validateService(editingService, services);
    if (Object.keys(errors).length > 0) {
      // Handle validation errors
      return;
    }

    try {
      await saveService(editingService);
      setEditingService(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      await deleteService(id);
    }
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateService} disabled={families.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau service
          </Button>
          {families.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Créez d'abord une famille de services
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {editingService && (
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isCreating ? 'Nouveau service' : 'Modifier le service'}
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSaveService}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Famille *</label>
                  <Select
                    value={editingService.family_id}
                    onValueChange={(value) => setEditingService({ ...editingService, family_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {families.map(family => (
                        <SelectItem key={family.id} value={family.id!}>
                          {family.code} - {family.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Code *</label>
                  <Input
                    value={editingService.code}
                    onChange={(e) => setEditingService({ ...editingService, code: e.target.value })}
                    placeholder="PDJ"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Libellé *</label>
                  <Input
                    value={editingService.label}
                    onChange={(e) => setEditingService({ ...editingService, label: e.target.value })}
                    placeholder="Petit-déjeuner"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prix (F CFA) {editingService.is_free_price && '(Prix libre)'}
                  </label>
                  <Input
                    type="number"
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    disabled={editingService.is_free_price}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">TVA (%)</label>
                  <Input
                    type="number"
                    value={editingService.vat_rate}
                    onChange={(e) => setEditingService({ ...editingService, vat_rate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unité</label>
                  <Select
                    value={editingService.unit}
                    onValueChange={(value) => setEditingService({ ...editingService, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prix de revient</label>
                  <Input
                    type="number"
                    value={editingService.cost_price || ''}
                    onChange={(e) => setEditingService({ ...editingService, cost_price: parseFloat(e.target.value) || undefined })}
                    placeholder="Optionnel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantité min.</label>
                  <Input
                    type="number"
                    value={editingService.min_quantity || ''}
                    onChange={(e) => setEditingService({ ...editingService, min_quantity: parseFloat(e.target.value) || undefined })}
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantité max.</label>
                  <Input
                    type="number"
                    value={editingService.max_quantity || ''}
                    onChange={(e) => setEditingService({ ...editingService, max_quantity: parseFloat(e.target.value) || undefined })}
                    placeholder="Illimité"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Description du service..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingService.is_active}
                    onCheckedChange={(checked) => setEditingService({ ...editingService, is_active: checked })}
                  />
                  <label className="text-sm">Service actif</label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingService.is_free_price}
                    onCheckedChange={(checked) => setEditingService({ ...editingService, is_free_price: checked })}
                  />
                  <label className="text-sm">Prix libre à la saisie</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${service.family?.color || '#6b7280'}20` }}
                  >
                    <Tags className="h-6 w-6" style={{ color: service.family?.color || '#6b7280' }} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{service.label}</h3>
                      <Badge variant="outline">{service.code}</Badge>
                      <Badge variant="secondary">{service.family?.code}</Badge>
                      {!service.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                      {service.is_free_price && (
                        <Badge variant="outline">Prix libre</Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {service.is_free_price ? 'Prix libre' : `${service.price.toLocaleString()} F`}
                      </span>
                      <span>TVA: {service.vat_rate}%</span>
                      <span>Unité: {service.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.id!)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              {services.length === 0 
                ? 'Aucun service configuré' 
                : 'Aucun service correspondant à la recherche'}
            </p>
            {services.length === 0 && families.length > 0 && (
              <Button onClick={handleCreateService}>
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier service
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}