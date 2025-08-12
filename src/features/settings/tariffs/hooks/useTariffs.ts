import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';

export interface Tariff {
  id: string;
  org_id: string;
  code: string;
  label: string;
  description?: string;
  base_rate: number;
  client_type?: 'individual' | 'corporate' | 'group';
  room_types?: string[];
  min_nights?: number;
  max_nights?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTariffData {
  code: string;
  label: string;
  description?: string;
  base_rate: number;
  client_type?: 'individual' | 'corporate' | 'group';
  room_types?: string[];
  min_nights?: number;
  max_nights?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export function useTariffs(orgId: string) {
  const queryClient = useQueryClient();

  // Fetch tariffs
  const {
    data: tariffs,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tariffs', orgId],
    queryFn: async () => {
      if (!orgId || orgId === "null") return [];
      
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Tariff[];
    },
    enabled: !!orgId && orgId !== "null"
  });

  // Create tariff mutation
  const createTariff = useMutation({
    mutationFn: async (data: CreateTariffData) => {
      const { data: result, error } = await supabase
        .from('tariffs')
        .insert({ ...data, org_id: orgId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs', orgId] });
    }
  });

  // Update tariff mutation
  const updateTariff = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTariffData> }) => {
      const { data: result, error } = await supabase
        .from('tariffs')
        .update(data)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs', orgId] });
    }
  });

  // Delete tariff mutation
  const deleteTariff = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tariffs')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs', orgId] });
    }
  });

  // Get tariff by room type and date
  const getTariffForRoom = (roomType: string, dateArrival: string, dateDeparture: string) => {
    if (!tariffs) return null;

    const applicableTariffs = tariffs.filter(tariff => 
      tariff.is_active &&
      tariff.room_types?.includes(roomType) &&
      tariff.valid_from <= dateArrival &&
      tariff.valid_until >= dateDeparture
    );

    // Return the tariff with highest base rate (most premium)
    return applicableTariffs.sort((a, b) => b.base_rate - a.base_rate)[0] || null;
  };

  return {
    tariffs,
    loading,
    error,
    refetch,
    createTariff,
    updateTariff,
    deleteTariff,
    getTariffForRoom
  };
}