import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RoomType } from '@/types/roomType';

export function useRoomTypesLookup(orgId: string) {
  const [roomTypes, setRoomTypes] = useState<Record<string, RoomType>>({});
  const [loading, setLoading] = useState(true);

  const loadRoomTypes = useCallback(async () => {
    if (!orgId || orgId === "null") {
      setRoomTypes({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .eq('org_id', orgId);

      if (error) throw error;

      // Create a lookup map by code
      const lookup = (data || []).reduce((acc, type) => {
        acc[type.code] = type;
        return acc;
      }, {} as Record<string, RoomType>);

      setRoomTypes(lookup);
    } catch (error) {
      console.error('Error loading room types:', error);
      setRoomTypes({});
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadRoomTypes();
  }, [loadRoomTypes]);

  const getRoomTypeName = useCallback((typeCode: string) => {
    return roomTypes[typeCode]?.label || typeCode;
  }, [roomTypes]);

  const getRoomType = useCallback((typeCode: string) => {
    return roomTypes[typeCode];
  }, [roomTypes]);

  return {
    roomTypes,
    loading,
    getRoomTypeName,
    getRoomType,
    refresh: loadRoomTypes
  };
}