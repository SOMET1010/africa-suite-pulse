import { supabase } from '@/integrations/supabase/client';
import type { Room, RoomFeatures, CreateSeriesData, RoomFilters, RoomStats } from '@/types/room';

export class RoomsCatalogService {
  static async getAll(orgId: string): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types!inner(id, code, label, capacity)
      `)
      .eq('org_id', orgId)
      .order('number');

    if (error) throw error;
    
    return (data || []).map(this.transformRoom);
  }

  static async getById(id: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types!inner(id, code, label, capacity)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return data ? this.transformRoom(data) : null;
  }

  static async create(orgId: string, room: Partial<Room>): Promise<Room> {
    // Get room type ID
    const { data: roomType, error: typeError } = await supabase
      .from('room_types')
      .select('id')
      .eq('code', room.type!)
      .eq('org_id', orgId)
      .single();

    if (typeError || !roomType) {
      throw new Error(`Type de chambre '${room.type}' introuvable`);
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        org_id: orgId,
        number: room.number!,
        room_type_id: roomType.id,
        type: room.type!,
        floor: room.floor,
        status: room.status || 'clean',
        is_fictive: room.is_fictive || false,
        features: room.features || {}
      })
      .select()
      .single();

    if (error) throw error;
    
    return this.transformRoom(data);
  }

  static async update(id: string, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .update({
        number: updates.number,
        type: updates.type,
        floor: updates.floor,
        status: updates.status,
        is_fictive: updates.is_fictive,
        features: updates.features
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return this.transformRoom(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async createSeries(orgId: string, data: CreateSeriesData): Promise<Room[]> {
    // First get the room type to get its ID
    const { data: roomType, error: typeError } = await supabase
      .from('room_types')
      .select('id')
      .eq('code', data.typeCode)
      .eq('org_id', orgId)
      .single();

    if (typeError || !roomType) {
      throw new Error(`Type de chambre '${data.typeCode}' introuvable`);
    }

    const newRooms = [];
    
    for (let i = data.startNumber; i <= data.endNumber; i++) {
      const number = `${data.prefix || ''}${i.toString().padStart(3, '0')}${data.suffix || ''}`;
      
      newRooms.push({
        org_id: orgId,
        number,
        room_type_id: roomType.id,
        type: data.typeCode, // Keep for compatibility
        floor: data.floor,
        status: 'clean' as const,
        is_fictive: data.isFictive,
        features: { ...data.features }
      });
    }

    const { data: created, error } = await supabase
      .from('rooms')
      .insert(newRooms)
      .select(`
        *,
        room_types!inner(id, code, label, capacity)
      `);

    if (error) throw error;
    
    return (created || []).map(this.transformRoom);
  }

  static async bulkUpdate(roomIds: string[], updates: Partial<Room>): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .update({
        type: updates.type,
        floor: updates.floor,
        status: updates.status,
        is_fictive: updates.is_fictive,
        features: updates.features
      })
      .in('id', roomIds)
      .select();

    if (error) throw error;
    
    return (data || []).map(this.transformRoom);
  }

  static async bulkDelete(roomIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .in('id', roomIds);

    if (error) throw error;
  }

  static async getStats(orgId: string): Promise<RoomStats> {
    const rooms = await this.getAll(orgId);
    
    const total = rooms.length;
    const real = rooms.filter(r => !r.is_fictive).length;
    const fictive = rooms.filter(r => r.is_fictive).length;
    const available = rooms.filter(r => r.status === 'clean' || r.status === 'inspected').length;
    const floors = [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort();
    
    const byType = rooms.reduce((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = rooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, real, fictive, available, floors, byType, byStatus };
  }

  static filterRooms(rooms: Room[], filters: RoomFilters): Room[] {
    return rooms.filter(room => {
      // Search
      if (filters.search && !room.number.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Floor
      if (filters.floor !== 'all' && room.floor !== filters.floor) {
        return false;
      }
      
      // Type
      if (filters.type !== 'all' && room.type !== filters.type) {
        return false;
      }
      
      // Status
      if (filters.status !== 'all' && room.status !== filters.status) {
        return false;
      }
      
      // Fictive
      if (filters.fictive !== 'all') {
        if (filters.fictive === 'fictive' && !room.is_fictive) return false;
        if (filters.fictive === 'real' && room.is_fictive) return false;
      }
      
      // Features
      if (filters.features.length > 0) {
        return filters.features.every(feature => room.features?.[feature]);
      }
      
      return true;
    });
  }

  static exportToCSV(rooms: Room[]): void {
    const headers = ['Numéro', 'Type', 'Étage', 'Statut', 'Nature', 'Caractéristiques'];
    const rows = rooms.map(room => [
      room.number,
      room.type,
      room.floor || '',
      room.status,
      room.is_fictive ? 'Fictive' : 'Réelle',
      Object.entries(room.features || {})
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `catalogue-chambres-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  private static transformRoom(data: any): Room {
    return {
      id: data.id,
      org_id: data.org_id,
      number: data.number,
      type: data.type,
      floor: data.floor,
      status: data.status,
      is_fictive: data.is_fictive || false,
      features: data.features || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
      room_type: data.room_types ? {
        id: data.room_types.id,
        code: data.room_types.code,
        label: data.room_types.label,
        capacity: data.room_types.capacity
      } : undefined
    };
  }

  static validateRoom(room: Partial<Room>): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!room.number?.trim()) {
      errors.number = 'Numéro obligatoire';
    } else if (room.number.length > 10) {
      errors.number = 'Numéro trop long (10 max)';
    }

    if (!room.type?.trim()) {
      errors.type = 'Type obligatoire';
    }

    if (!room.status) {
      errors.status = 'Statut obligatoire';
    }

    return errors;
  }
}