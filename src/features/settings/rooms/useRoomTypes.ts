import { useState, useEffect, useCallback } from 'react';
import { RoomTypesService } from './roomTypesService';
import type { RoomTypeWithStock } from '@/types/roomType';
import { useToast } from '@/hooks/use-toast';

export function useRoomTypes(orgId: string) {
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const loadRoomTypes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RoomTypesService.getAll(orgId);
      setRoomTypes(data);
    } catch (error) {
      console.error('Error loading room types:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les types de chambres',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, toast]);

  const saveRoomTypes = useCallback(async (types: Partial<RoomTypeWithStock>[]) => {
    try {
      setSaving(true);
      const saved = await RoomTypesService.save(types, orgId);
      setRoomTypes(saved);
      toast({
        title: 'Succès',
        description: 'Types de chambres sauvegardés'
      });
      return saved;
    } catch (error) {
      console.error('Error saving room types:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [orgId, toast]);

  const deleteRoomType = useCallback(async (id: string) => {
    try {
      await RoomTypesService.delete(id);
      await loadRoomTypes();
      toast({
        title: 'Succès',
        description: 'Type de chambre supprimé'
      });
    } catch (error) {
      console.error('Error deleting room type:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer ce type',
        variant: 'destructive'
      });
    }
  }, [loadRoomTypes, toast]);

  const exportToCSV = useCallback(() => {
    RoomTypesService.exportToCSV(roomTypes);
  }, [roomTypes]);

  useEffect(() => {
    loadRoomTypes();
  }, [loadRoomTypes]);

  return {
    roomTypes,
    loading,
    saving,
    saveRoomTypes,
    deleteRoomType,
    exportToCSV,
    refresh: loadRoomTypes
  };
}