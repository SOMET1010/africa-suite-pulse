import { supabase } from '@/integrations/supabase/client';

export class RoomTypeValidationService {
  /**
   * Audit des données existantes - trouve les chambres avec des types non configurés
   */
  static async auditRoomTypes(orgId: string) {
    // Récupérer toutes les chambres
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, number, type, floor')
      .eq('org_id', orgId);

    if (roomsError) throw roomsError;

    // Récupérer tous les types configurés
    const { data: roomTypes, error: typesError } = await supabase
      .from('room_types')
      .select('code')
      .eq('org_id', orgId);

    if (typesError) throw typesError;

    const configuredTypes = new Set(roomTypes.map(rt => rt.code));
    
    // Trouver les chambres avec des types non configurés
    const orphanedRooms = rooms.filter(room => !configuredTypes.has(room.type));
    
    // Trouver les types utilisés mais non configurés
    const usedTypes = new Set(rooms.map(room => room.type));
    const missingTypes = [...usedTypes].filter(type => !configuredTypes.has(type));

    return {
      totalRooms: rooms.length,
      orphanedRooms,
      missingTypes,
      configuredTypes: [...configuredTypes],
      isValid: orphanedRooms.length === 0
    };
  }

  /**
   * Migration automatique des types manquants
   */
  static async migrateOrphanedTypes(orgId: string, missingTypes: string[]) {
    const migrations = missingTypes.map(typeCode => ({
      org_id: orgId,
      code: typeCode,
      label: typeCode, // Utiliser le code comme label par défaut
      capacity: 2, // Capacité par défaut
      note: 'Migré automatiquement depuis les chambres existantes'
    }));

    const { data, error } = await supabase
      .from('room_types')
      .insert(migrations)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Validation d'un type de chambre lors de la création/modification
   */
  static async validateRoomTypeExists(orgId: string, typeCode: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('room_types')
      .select('id')
      .eq('org_id', orgId)
      .eq('code', typeCode)
      .single();

    return !error && !!data;
  }

  /**
   * Suggestions de types de chambres basées sur les données existantes
   */
  static async suggestRoomTypes(orgId: string) {
    // Récupérer les types utilisés actuellement
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('type')
      .eq('org_id', orgId);

    if (error) throw error;

    // Compter les occurrences
    const typeCount = rooms.reduce((acc, room) => {
      acc[room.type] = (acc[room.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }
}