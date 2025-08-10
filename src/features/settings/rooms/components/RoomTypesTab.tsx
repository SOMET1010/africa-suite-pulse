import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomTypes } from '../useRoomTypes';
import { RoomTypeStats } from './RoomTypeStats';
import { RoomTypeRow } from './RoomTypeRow';
import { RoomTypesService } from '../roomTypesService';
import { useOrgId } from '@/core/auth/useOrg';
import type { RoomTypeWithStock } from '@/types/roomType';

interface EditableRoomType extends RoomTypeWithStock {
  hasErrors?: boolean;
  errors?: Record<string, string>;
  isNew?: boolean;
}

export default function RoomTypesTab() {
  const { orgId } = useOrgId();
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
      id: '',
      org_id: orgId,
      code: '',
      label: '',
      capacity: 2,
      note: '',
      stock: 0,
      isNew: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const errors = validateType(newType, editableTypes);
    newType.hasErrors = Object.keys(errors).length > 0;
    newType.errors = errors;

    setEditableTypes(prev => [...prev, newType]);
    setHasChanges(true);
  }, [editableTypes, orgId, validateType]);

  const removeType = useCallback((index: number) => {
    setEditableTypes(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  }, []);

  const save = useCallback(async () => {
    const validTypes = editableTypes.filter(type => 
      !type.hasErrors && type.code && type.label
    );
    
    if (validTypes.length === 0) return;
    
    try {
      await saveRoomTypes(validTypes);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
    }
  }, [editableTypes, saveRoomTypes]);

  const reset = useCallback(() => {
    setEditableTypes(originalTypes.map(type => ({ ...type })));
    setHasChanges(false);
  }, [originalTypes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des types...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: editableTypes.length,
    withStock: editableTypes.filter(t => (t.stock || 0) > 0).length,
    withoutStock: editableTypes.filter(t => (t.stock || 0) === 0).length,
    averageCapacity: editableTypes.length > 0 
      ? Math.round(editableTypes.reduce((sum, t) => sum + (t.capacity || 0), 0) / editableTypes.length * 10) / 10
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <RoomTypeStats 
        totalTypes={stats.total}
        totalRooms={stats.withStock + stats.withoutStock}
        totalCapacity={editableTypes.reduce((sum, t) => sum + (t.capacity || 0) * (t.stock || 0), 0)}
        averageCapacity={stats.averageCapacity}
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={addType} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un type
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importer
          </Button>
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Code</div>
            <div className="col-span-3">Libellé</div>
            <div className="col-span-2">Capacité</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Note</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        <div className="divide-y">
          {editableTypes.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground">
              <div className="text-lg font-medium mb-2">Aucun type de chambre</div>
              <p className="text-sm">Cliquez sur "Ajouter un type" pour commencer</p>
            </div>
          ) : (
            editableTypes.map((type, index) => (
              <RoomTypeRow
                key={`${type.id || 'new'}-${index}`}
                type={type}
                index={index}
                onUpdate={updateType}
                onDelete={() => type.id ? deleteRoomType(type.id) : removeType(index)}
              />
            ))
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Vous avez des modifications non sauvegardées
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={reset} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}