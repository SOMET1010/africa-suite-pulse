import { supabase } from '@/integrations/supabase/client';
import { RoomType } from '../types';

export interface RoomTypeWithStock extends RoomType {
  stock?: number;
}

export class RoomTypesService {
  static async getAll(orgId: string): Promise<RoomTypeWithStock[]> {
    const { data, error } = await supabase
      .from('room_types')
      .select(`
        *,
        stock:rooms(count)
      `)
      .eq('org_id', orgId)
      .order('code');

    if (error) throw error;
    
    // Transform the data to include stock count
    return (data || []).map(item => ({
      ...item,
      stock: Array.isArray(item.stock) ? item.stock[0]?.count || 0 : 0
    }));
  }

  static async save(roomTypes: Partial<RoomType>[], orgId: string): Promise<RoomTypeWithStock[]> {
    const typesToInsert = roomTypes.filter(rt => !rt.id && rt.code && rt.label);
    const typesToUpdate = roomTypes.filter(rt => rt.id);

    // Insert new types
    if (typesToInsert.length > 0) {
      const insertsData = typesToInsert.map(rt => ({
        code: rt.code!,
        label: rt.label!,
        capacity: rt.capacity || 2,
        note: rt.note || '',
        org_id: orgId
      }));
      
      const { error: insertError } = await supabase
        .from('room_types')
        .insert(insertsData);
      
      if (insertError) throw insertError;
    }

    // Update existing types
    for (const type of typesToUpdate) {
      const { error: updateError } = await supabase
        .from('room_types')
        .update({
          code: type.code,
          label: type.label,
          capacity: type.capacity,
          note: type.note
        })
        .eq('id', type.id);
      
      if (updateError) throw updateError;
    }

    return this.getAll(orgId);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('room_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static validateType(type: Partial<RoomType>, allTypes: Partial<RoomType>[] = []): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!type.code?.trim()) {
      errors.code = 'Code obligatoire';
    } else if (type.code.length !== 1) {
      errors.code = '1 caractère seulement';
    } else if (!/^[A-Z]$/i.test(type.code)) {
      errors.code = 'Lettre uniquement';
    } else {
      const duplicate = allTypes.find(t => 
        t.id !== type.id && 
        t.code?.toUpperCase() === type.code.toUpperCase()
      );
      if (duplicate) {
        errors.code = 'Code déjà utilisé';
      }
    }

    if (!type.label?.trim()) {
      errors.label = 'Libellé obligatoire';
    } else if (type.label.length < 2) {
      errors.label = 'Trop court (2 min)';
    } else if (type.label.length > 50) {
      errors.label = 'Trop long (50 max)';
    }

    if (!type.capacity || type.capacity < 1) {
      errors.capacity = 'Min. 1 personne';
    } else if (type.capacity > 10) {
      errors.capacity = 'Max. 10 personnes';
    }

    return errors;
  }

  static exportToCSV(roomTypes: RoomTypeWithStock[]): void {
    const headers = ['Code', 'Libellé', 'Capacité', 'Stock', 'Note'];
    const rows = roomTypes.map(rt => [
      rt.code,
      rt.label,
      rt.capacity.toString(),
      (rt.stock || 0).toString(),
      rt.note || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `types-chambres-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}