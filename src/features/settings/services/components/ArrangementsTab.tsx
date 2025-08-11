import React, { useState } from 'react';
import { Plus, Download, Edit3, Trash2, Star, Save, X, DollarSign } from 'lucide-react';
import { ServicesService } from '../servicesService';
import type { Arrangement, Service } from '@/types/database';
import { useServices } from '../useServices';
import { useOrgId } from '@/core/auth/useOrg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ArrangementsTabProps {
  arrangements: Arrangement[];
  services: Service[];
  searchQuery: string;
  onExport: () => void;
}

export function ArrangementsTab({ arrangements, services, searchQuery, onExport }: ArrangementsTabProps) {
  const { orgId } = useOrgId();
  const { saveArrangement, deleteArrangement } = useServices(orgId);
  const [editingArrangement, setEditingArrangement] = useState<Partial<Arrangement> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredArrangements = arrangements.filter(arrangement =>
    arrangement.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    arrangement.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateArrangement = () => {
    setEditingArrangement({
      code: '',
      label: '',
      description: '',
      services: [],
      is_active: true
    });
    setIsCreating(true);
  };

  const handleEditArrangement = (arrangement: Arrangement) => {
    setEditingArrangement({ ...arrangement });
    setIsCreating(false);
  };

  const handleSaveArrangement = async () => {
    if (!editingArrangement) return;

    const errors = ServicesService.validateArrangement(editingArrangement, arrangements);
    if (Object.keys(errors).length > 0) {
      // Handle validation errors
      return;
    }

    try {
      await saveArrangement(editingArrangement);
      setEditingArrangement(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving arrangement:', error);
    }
  };

  const handleDeleteArrangement = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet arrangement ?')) {
      await deleteArrangement(id);
    }
  };

  const handleCancel = () => {
    setEditingArrangement(null);
    setIsCreating(false);
  };

  const addServiceToArrangement = () => {
    if (!editingArrangement || services.length === 0) return;
    
    setEditingArrangement({
      ...editingArrangement,
      services: [
        ...(editingArrangement.services || []),
        {
          service_id: services[0].id!,
          quantity: 1,
          is_included: true,
          is_optional: false,
          order_index: editingArrangement.services?.length || 0
        }
      ]
    });
  };

  const removeServiceFromArrangement = (index: number) => {
    if (!editingArrangement) return;
    
    const newServices = [...(editingArrangement.services || [])];
    newServices.splice(index, 1);
    
    setEditingArrangement({
      ...editingArrangement,
      services: newServices
    });
  };

  const updateArrangementService = (index: number, updates: any) => {
    if (!editingArrangement) return;
    
    const newServices = [...(editingArrangement.services || [])];
    newServices[index] = { ...newServices[index], ...updates };
    
    setEditingArrangement({
      ...editingArrangement,
      services: newServices
    });
  };

  const calculateArrangementTotal = (arrangement: Arrangement) => {
    return arrangement.services.reduce((total, arrService) => {
      const service = services.find(s => s.id === arrService.service_id);
      if (service && arrService.is_included) {
        const price = arrService.unit_price || service.price;
        return total + (price * arrService.quantity);
      }
      return total;
    }, arrangement.base_price || 0);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateArrangement} disabled={services.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel arrangement
          </Button>
          {services.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Créez d'abord des services
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
      {editingArrangement && (
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isCreating ? 'Nouvel arrangement' : 'Modifier l\'arrangement'}
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSaveArrangement}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code *</label>
                  <Input
                    value={editingArrangement.code}
                    onChange={(e) => setEditingArrangement({ ...editingArrangement, code: e.target.value })}
                    placeholder="BB"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Libellé *</label>
                  <Input
                    value={editingArrangement.label}
                    onChange={(e) => setEditingArrangement({ ...editingArrangement, label: e.target.value })}
                    placeholder="Bed & Breakfast"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prix de base (optionnel)</label>
                  <Input
                    type="number"
                    value={editingArrangement.base_price || ''}
                    onChange={(e) => setEditingArrangement({ ...editingArrangement, base_price: parseFloat(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={editingArrangement.description || ''}
                  onChange={(e) => setEditingArrangement({ ...editingArrangement, description: e.target.value })}
                  placeholder="Description de l'arrangement..."
                  rows={3}
                />
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Services inclus</h4>
                  <Button size="sm" onClick={addServiceToArrangement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un service
                  </Button>
                </div>

                <div className="space-y-3">
                  {(editingArrangement.services || []).map((arrService, index) => (
                    <Card key={index} className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                        <div>
                          <Select
                            value={arrService.service_id}
                            onValueChange={(value) => updateArrangementService(index, { service_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Service..." />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map(service => (
                                <SelectItem key={service.id} value={service.id!}>
                                  {service.code} - {service.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Input
                            type="number"
                            value={arrService.quantity}
                            onChange={(e) => updateArrangementService(index, { quantity: parseFloat(e.target.value) || 1 })}
                            placeholder="Qté"
                            min="1"
                            step="0.1"
                          />
                        </div>

                        <div>
                          <Input
                            type="number"
                            value={arrService.unit_price || ''}
                            onChange={(e) => updateArrangementService(index, { unit_price: parseFloat(e.target.value) || undefined })}
                            placeholder="Prix unitaire"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={arrService.is_included}
                              onCheckedChange={(checked) => updateArrangementService(index, { is_included: checked })}
                            />
                            <span className="text-sm">Inclus</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={arrService.is_optional}
                              onCheckedChange={(checked) => updateArrangementService(index, { is_optional: checked })}
                            />
                            <span className="text-sm">Optionnel</span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeServiceFromArrangement(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {(!editingArrangement.services || editingArrangement.services.length === 0) && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                      <p className="text-muted-foreground text-sm">Aucun service ajouté</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingArrangement.is_active}
                  onCheckedChange={(checked) => setEditingArrangement({ ...editingArrangement, is_active: checked })}
                />
                <label className="text-sm">Arrangement actif</label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arrangements List */}
      <div className="space-y-4">
        {filteredArrangements.map((arrangement) => (
          <Card key={arrangement.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{arrangement.label}</h3>
                      <Badge variant="outline">{arrangement.code}</Badge>
                      {!arrangement.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    {arrangement.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {arrangement.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Total: {calculateArrangementTotal(arrangement).toLocaleString()} F
                      </span>
                      <span>{arrangement.services.length} service(s)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {arrangement.services.slice(0, 3).map((arrService, index) => {
                        const service = services.find(s => s.id === arrService.service_id);
                        return service ? (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service.code} {arrService.is_included ? '(inclus)' : '(supplément)'}
                          </Badge>
                        ) : null;
                      })}
                      {arrangement.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{arrangement.services.length - 3} autres
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditArrangement(arrangement)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteArrangement(arrangement.id!)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredArrangements.length === 0 && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              {arrangements.length === 0 
                ? 'Aucun arrangement configuré' 
                : 'Aucun arrangement correspondant à la recherche'}
            </p>
            {arrangements.length === 0 && services.length > 0 && (
              <Button onClick={handleCreateArrangement}>
                <Plus className="h-4 w-4 mr-2" />
                Créer le premier arrangement
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}