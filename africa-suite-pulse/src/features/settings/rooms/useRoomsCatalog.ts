import { useState, useEffect, useCallback, useMemo } from 'react';
import { RoomsCatalogService } from './roomsCatalogService';
import type { Room, RoomFilters, RoomStats, CreateSeriesData } from '@/types/room';
import { useToast } from '@/hooks/use-toast';

const LS_KEY = 'roomsCatalog.filters.v1';

export function useRoomsCatalog(orgId: string) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<RoomFilters>({
    search: '',
    floor: 'all',
    type: 'all',
    status: 'all',
    fictive: 'all',
    features: []
  });
  const { toast } = useToast();

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setFilters(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn('Failed to read filters from localStorage', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist filters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(filters));
    } catch (e) {
      console.warn('Failed to save filters to localStorage', e);
    }
  }, [filters]);

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      // Vérifier que orgId est valide avant de faire la requête
      if (!orgId || orgId === "null") {
        console.warn('Invalid orgId:', orgId);
        setRooms([]);
        return;
      }
      const data = await RoomsCatalogService.getAll(orgId);
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les chambres',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, toast]);

  const createRoom = useCallback(async (room: Partial<Room>) => {
    try {
      setSaving(true);
      const created = await RoomsCatalogService.create(orgId, room);
      setRooms(prev => [...prev, created]);
      toast({
        title: 'Succès',
        description: 'Chambre créée avec succès'
      });
      return created;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la chambre',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [orgId, toast]);

  const updateRoom = useCallback(async (id: string, updates: Partial<Room>) => {
    try {
      setSaving(true);
      const updated = await RoomsCatalogService.update(id, updates);
      setRooms(prev => prev.map(room => room.id === id ? updated : room));
      toast({
        title: 'Succès',
        description: 'Chambre mise à jour'
      });
      return updated;
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la chambre',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const deleteRoom = useCallback(async (id: string) => {
    try {
      await RoomsCatalogService.delete(id);
      setRooms(prev => prev.filter(room => room.id !== id));
      setSelectedRooms(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast({
        title: 'Succès',
        description: 'Chambre supprimée'
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la chambre',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const createSeries = useCallback(async (data: CreateSeriesData) => {
    try {
      setSaving(true);
      const created = await RoomsCatalogService.createSeries(orgId, data);
      setRooms(prev => [...prev, ...created]);
      toast({
        title: 'Succès',
        description: `${created.length} chambre(s) créée(s) en série`
      });
      return created;
    } catch (error) {
      console.error('Error creating series:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la série',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setSaving(false);
    }
  }, [orgId, toast]);

  const bulkUpdate = useCallback(async (roomIds: string[], updates: Partial<Room>) => {
    try {
      setSaving(true);
      const updated = await RoomsCatalogService.bulkUpdate(roomIds, updates);
      const updatedMap = new Map(updated.map(room => [room.id!, room]));
      setRooms(prev => prev.map(room => updatedMap.get(room.id!) || room));
      setSelectedRooms(new Set());
      toast({
        title: 'Succès',
        description: `${roomIds.length} chambre(s) mise(s) à jour`
      });
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les chambres',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const bulkDelete = useCallback(async (roomIds: string[]) => {
    try {
      await RoomsCatalogService.bulkDelete(roomIds);
      setRooms(prev => prev.filter(room => !roomIds.includes(room.id!)));
      setSelectedRooms(new Set());
      toast({
        title: 'Succès',
        description: `${roomIds.length} chambre(s) supprimée(s)`
      });
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer les chambres',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const exportToCSV = useCallback(() => {
    const filteredRooms = RoomsCatalogService.filterRooms(rooms, filters);
    RoomsCatalogService.exportToCSV(filteredRooms);
    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé'
    });
  }, [rooms, filters, toast]);

  // Computed values
  const filteredRooms = useMemo(() => {
    return RoomsCatalogService.filterRooms(rooms, filters);
  }, [rooms, filters]);

  const stats = useMemo((): RoomStats => {
    const total = filteredRooms.length;
    const real = filteredRooms.filter(r => !r.is_fictive).length;
    const fictive = filteredRooms.filter(r => r.is_fictive).length;
    const available = filteredRooms.filter(r => r.status === 'clean' || r.status === 'inspected').length;
    const floors = [...new Set(filteredRooms.map(r => r.floor).filter(Boolean))].sort();
    
    const byType = filteredRooms.reduce((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = filteredRooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, real, fictive, available, floors, byType, byStatus };
  }, [filteredRooms]);

  // Selection management
  const toggleSelection = useCallback((roomId: string) => {
    setSelectedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) {
        next.delete(roomId);
      } else {
        next.add(roomId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedRooms(new Set(filteredRooms.map(r => r.id!)));
  }, [filteredRooms]);

  const clearSelection = useCallback(() => {
    setSelectedRooms(new Set());
  }, []);

  const updateFilters = useCallback((newFilters: Partial<RoomFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setSelectedRooms(new Set());
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      floor: 'all',
      type: 'all',
      status: 'all',
      fictive: 'all',
      features: []
    });
    setSelectedRooms(new Set());
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    // Data
    rooms: filteredRooms,
    allRooms: rooms,
    stats,
    
    // State
    loading,
    saving,
    selectedRooms,
    filters,
    
    // Actions
    createRoom,
    updateRoom,
    deleteRoom,
    createSeries,
    bulkUpdate,
    bulkDelete,
    exportToCSV,
    refresh: loadRooms,
    
    // Selection
    toggleSelection,
    selectAll,
    clearSelection,
    
    // Filters
    updateFilters,
    resetFilters
  };
}