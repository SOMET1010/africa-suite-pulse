import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomTypes } from './useRoomTypes';
import { RoomTypeStats } from './components/RoomTypeStats';
import { RoomTypeRow } from './components/RoomTypeRow';
import { RoomTypesService, RoomTypeWithStock } from './roomTypesService';

interface EditableRoomType extends RoomTypeWithStock {
  hasErrors?: boolean;
  errors?: Record<string, string>;
  isNew?: boolean;
}

export default function RoomTypesPage() {
  const orgId = 'demo-org'; // TODO: Get from auth context
  const {
    roomTypes: originalTypes,
    loading,
    saving,
    saveRoomTypes,
    deleteRoomType,
    exportToCSV
  } = useRoomTypes(orgId);

  const [editableTypes, setEditableTypes] = useState<EditableRoomType[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with original data
  useEffect(() => {
    setEditableTypes(originalTypes.map(type => ({ ...type })));
    setHasChanges(false);
  }, [originalTypes]);

  const validateType = useCallback((type: EditableRoomType, allTypes: EditableRoomType[]) => {
    return RoomTypesService.validateType(type, allTypes);
  }, []);

  const updateType = useCallback((index: number, updates: Partial<RoomTypeWithStock>) => {
    setEditableTypes(prev => {
      const newTypes = [...prev];
      const updated = { ...newTypes[index], ...updates };
      const errors = validateType(updated, newTypes);
      
      newTypes[index] = {
        ...updated,
        hasErrors: Object.keys(errors).length > 0,
        errors
      };
      
      return newTypes;
    });
    setHasChanges(true);
  }, [validateType]);

  const addType = useCallback(() => {
    const newType: EditableRoomType = {
      id: `temp-${Date.now()}`,
      code: '',
      label: '',
      capacity: 2,
      note: '',
      org_id: orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true,
      hasErrors: true,
      errors: { code: 'Code obligatoire', label: 'Libellé obligatoire' }
    };
    
    setEditableTypes(prev => [...prev, newType]);
    setHasChanges(true);
  }, [orgId]);

  const removeType = useCallback((index: number) => {
    setEditableTypes(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  }, []);

  const save = useCallback(async () => {
    const validTypes = editableTypes.filter(type => !type.hasErrors && type.code && type.label);
    await saveRoomTypes(validTypes);
    setHasChanges(false);
  }, [editableTypes, saveRoomTypes]);

  const reset = useCallback(() => {
    setEditableTypes(originalTypes.map(type => ({ ...type })));
    setHasChanges(false);
  }, [originalTypes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  const stats = {
    totalTypes: editableTypes.length,
    totalRooms: editableTypes.reduce((sum, type) => sum + (type.stock || 0), 0),
    totalCapacity: editableTypes.reduce((sum, type) => sum + (type.stock || 0) * (type.capacity || 0), 0),
    averageCapacity: editableTypes.length > 0 
      ? editableTypes.reduce((sum, type) => sum + (type.capacity || 0), 0) / editableTypes.length 
      : 0
  };

  const canSave = hasChanges && editableTypes.some(type => !type.hasErrors && type.code && type.label);
  const hasErrors = editableTypes.some(type => type.hasErrors);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <nav className="text-sm mb-2">
            <span className="text-muted-foreground">Paramétrage</span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="font-medium text-foreground">Types de Chambres</span>
          </nav>
          <h1 className="text-2xl font-bold text-foreground">Types de Chambres</h1>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Statistics */}
        <RoomTypeStats {...stats} />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button onClick={addType} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un type
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Libellé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Capacité</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Note</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {editableTypes.map((type, index) => (
                  <RoomTypeRow
                    key={type.id || index}
                    type={type}
                    index={index}
                    onUpdate={updateType}
                    onDelete={removeType}
                  />
                ))}
                {editableTypes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Aucun type de chambre configuré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action bar */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card rounded-lg shadow-lg border border-border px-4 py-3 flex gap-3">
            <Button
              variant="outline"
              onClick={reset}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              onClick={save}
              disabled={!canSave || saving || hasErrors}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}