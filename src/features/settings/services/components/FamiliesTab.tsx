import React, { useState } from 'react';
import { Plus, Download, Edit3, Trash2, Package, Save, X } from 'lucide-react';
import { ServiceFamily, ServicesService } from '../servicesService';
import { useServices } from '../useServices';
import { useOrgId } from '@/core/auth/useOrg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FamiliesTabProps {
  families: ServiceFamily[];
  searchQuery: string;
  onExport: () => void;
}

export function FamiliesTab({ families, searchQuery, onExport }: FamiliesTabProps) {
  const orgId = useOrgId();
  const { saveFamily, deleteFamily } = useServices(orgId);
  const [editingFamily, setEditingFamily] = useState<Partial<ServiceFamily> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredFamilies = families.filter(family =>
    family.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    family.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const familyIcons = [
    { value: 'bed', label: 'Hébergement', emoji: '🛏️' },
    { value: 'utensils', label: 'Restauration', emoji: '🍽️' },
    { value: 'wine', label: 'Bar', emoji: '🍷' },
    { value: 'sparkles', label: 'Bien-être', emoji: '✨' },
    { value: 'gamepad2', label: 'Loisirs', emoji: '🎮' },
    { value: 'car', label: 'Transport', emoji: '🚗' },
    { value: 'wifi', label: 'Technologie', emoji: '📶' },
    { value: 'package', label: 'Autres', emoji: '📦' }
  ];

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#6366f1'
  ];

  const handleCreateFamily = () => {
    setEditingFamily({
      code: '',
      label: '',
      description: '',
      icon: 'package',
      color: predefinedColors[0],
      order_index: families.length,
      is_active: true
    });
    setIsCreating(true);
  };

  const handleEditFamily = (family: ServiceFamily) => {
    setEditingFamily({ ...family });
    setIsCreating(false);
  };

  const handleSaveFamily = async () => {
    if (!editingFamily) return;

    const errors = ServicesService.validateFamily(editingFamily, families);
    if (Object.keys(errors).length > 0) {
      // Handle validation errors
      return;
    }

    try {
      await saveFamily(editingFamily);
      setEditingFamily(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving family:', error);
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette famille ?')) {
      await deleteFamily(id);
    }
  };

  const handleCancel = () => {
    setEditingFamily(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateFamily}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle famille
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      {editingFamily && (
        <Card className="border-primary">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {isCreating ? 'Nouvelle famille' : 'Modifier la famille'}
                </h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSaveFamily}>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code *</label>
                  <Input
                    value={editingFamily.code}
                    onChange={(e) => setEditingFamily({ ...editingFamily, code: e.target.value })}
                    placeholder="HEB"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Libellé *</label>
                  <Input
                    value={editingFamily.label}
                    onChange={(e) => setEditingFamily({ ...editingFamily, label: e.target.value })}
                    placeholder="Hébergement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Icône</label>
                  <Select
                    value={editingFamily.icon}
                    onValueChange={(value) => setEditingFamily({ ...editingFamily, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {familyIcons.map(icon => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <span>{icon.emoji}</span>
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Couleur</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingFamily.color}
                      onChange={(e) => setEditingFamily({ ...editingFamily, color: e.target.value })}
                      className="w-12 h-10 border border-border rounded-lg"
                    />
                    <div className="flex gap-1">
                      {predefinedColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditingFamily({ ...editingFamily, color })}
                          className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={editingFamily.description || ''}
                  onChange={(e) => setEditingFamily({ ...editingFamily, description: e.target.value })}
                  placeholder="Description de la famille de services..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingFamily.is_active}
                  onCheckedChange={(checked) => setEditingFamily({ ...editingFamily, is_active: checked })}
                />
                <label className="text-sm">Famille active</label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Families List */}
      <div className="space-y-4">
        {filteredFamilies.map((family) => (
          <Card key={family.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${family.color}20` }}
                  >
                    <Package className="h-6 w-6" style={{ color: family.color }} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{family.label}</h3>
                      <Badge variant="outline">{family.code}</Badge>
                      {!family.is_active && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    {family.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {family.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditFamily(family)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFamily(family.id!)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredFamilies.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              {families.length === 0 
                ? 'Aucune famille de services configurée' 
                : 'Aucune famille correspondant à la recherche'}
            </p>
            {families.length === 0 && (
              <Button onClick={handleCreateFamily}>
                <Plus className="h-4 w-4 mr-2" />
                Créer la première famille
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}