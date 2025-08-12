import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RateWindow, CreateRateWindowData, RateCalculationContext, RateCalculationResult } from '../types/rateWindows';

export function useRateWindows(orgId: string) {
  const queryClient = useQueryClient();

  // Fetch rate windows
  const {
    data: rateWindows,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['rate-windows', orgId],
    queryFn: async () => {
      if (!orgId || orgId === "null") return [];
      
      const { data, error } = await supabase
        .from('rate_windows')
        .select('*')
        .eq('org_id', orgId)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as RateWindow[];
    },
    enabled: !!orgId && orgId !== "null"
  });

  // Create rate window mutation
  const createRateWindow = useMutation({
    mutationFn: async (data: CreateRateWindowData) => {
      const { data: result, error } = await supabase
        .from('rate_windows')
        .insert({ ...data, org_id: orgId })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-windows', orgId] });
    }
  });

  // Update rate window mutation
  const updateRateWindow = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRateWindowData> }) => {
      const { data: result, error } = await supabase
        .from('rate_windows')
        .update(data)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-windows', orgId] });
    }
  });

  // Delete rate window mutation
  const deleteRateWindow = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rate_windows')
        .delete()
        .eq('id', id)
        .eq('org_id', orgId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-windows', orgId] });
    }
  });

  // Calculate rate with windows
  const calculateRateWithWindows = (context: RateCalculationContext): RateCalculationResult => {
    if (!rateWindows) {
      return {
        baseTariff: context.baseTariff,
        adjustments: [],
        finalRate: context.baseTariff,
        totalDiscount: 0,
        totalSurcharge: 0
      };
    }

    const targetDate = new Date(context.date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Find applicable rate windows
    const applicableWindows = rateWindows.filter(window => {
      if (!window.is_active) return false;
      
      const startDate = new Date(window.start_date);
      const endDate = new Date(window.end_date);
      
      // Check date range
      if (targetDate < startDate || targetDate > endDate) return false;
      
      // Check day of week
      if (!window.applicable_days.includes(dayOfWeek)) return false;
      
      // Check client type
      if (!window.client_types.includes(context.clientType)) return false;
      
      // Check room type (if specified)
      if (window.room_types.length > 0 && !window.room_types.includes(context.roomType)) return false;
      
      // Check stay duration
      if (window.min_stay && context.nightsCount < window.min_stay) return false;
      if (window.max_stay && context.nightsCount > window.max_stay) return false;
      
      return true;
    });

    // Sort by priority (highest first)
    const sortedWindows = applicableWindows.sort((a, b) => b.priority - a.priority);

    let finalRate = context.baseTariff;
    const adjustments = [];
    let totalDiscount = 0;
    let totalSurcharge = 0;

    // Apply adjustments
    for (const window of sortedWindows) {
      let adjustmentAmount = 0;
      
      if (window.rate_type === 'percentage') {
        adjustmentAmount = (finalRate * window.adjustment_value) / 100;
      } else {
        adjustmentAmount = window.adjustment_value;
      }

      adjustments.push({
        windowId: window.id,
        windowName: window.name,
        type: window.rate_type,
        value: window.adjustment_value,
        amount: adjustmentAmount,
        priority: window.priority
      });

      finalRate += adjustmentAmount;

      if (adjustmentAmount < 0) {
        totalDiscount += Math.abs(adjustmentAmount);
      } else {
        totalSurcharge += adjustmentAmount;
      }
    }

    return {
      baseTariff: context.baseTariff,
      adjustments,
      finalRate: Math.max(0, finalRate), // Ensure rate is not negative
      totalDiscount,
      totalSurcharge
    };
  };

  // Get active rate windows for a specific date range
  const getActiveWindowsForPeriod = (startDate: string, endDate: string) => {
    if (!rateWindows) return [];

    return rateWindows.filter(window => {
      if (!window.is_active) return false;
      
      const windowStart = new Date(window.start_date);
      const windowEnd = new Date(window.end_date);
      const periodStart = new Date(startDate);
      const periodEnd = new Date(endDate);
      
      // Check if there's any overlap
      return windowStart <= periodEnd && windowEnd >= periodStart;
    });
  };

  return {
    rateWindows,
    loading,
    error,
    refetch,
    createRateWindow,
    updateRateWindow,
    deleteRateWindow,
    calculateRateWithWindows,
    getActiveWindowsForPeriod
  };
}