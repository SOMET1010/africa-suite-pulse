import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RateWindow, CreateRateWindowData, RateCalculationContext, RateCalculationResult } from '../types/rateWindows';

export function useRateWindows(orgId: string) {
  const queryClient = useQueryClient();
  
  // For now, return empty data since the table doesn't exist yet
  const [rateWindows, setRateWindows] = useState<RateWindow[]>([]);
  const loading = false;
  const error = null;

  const refetch = async () => {
    // Empty refetch for now
  };

  // Create rate window mutation - placeholder
  const createRateWindow = useMutation({
    mutationFn: async (data: CreateRateWindowData) => {
      // For now, just return a mock result
      const newWindow: RateWindow = {
        id: crypto.randomUUID(),
        org_id: orgId,
        name: data.name,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        rate_type: data.rate_type,
        adjustment_value: data.adjustment_value,
        min_stay: data.min_stay,
        max_stay: data.max_stay,
        applicable_days: data.applicable_days,
        client_types: data.client_types,
        room_types: data.room_types,
        is_active: data.is_active,
        priority: data.priority,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setRateWindows(prev => [...prev, newWindow]);
      return newWindow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-windows', orgId] });
    }
  });

  // Update rate window mutation - placeholder
  const updateRateWindow = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRateWindowData> }) => {
      setRateWindows(prev => prev.map(window => 
        window.id === id ? { ...window, ...data, updated_at: new Date().toISOString() } : window
      ));
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-windows', orgId] });
    }
  });

  // Delete rate window mutation - placeholder
  const deleteRateWindow = useMutation({
    mutationFn: async (id: string) => {
      setRateWindows(prev => prev.filter(window => window.id !== id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-windows', orgId] });
    }
  });

  // Calculate rate with windows
  const calculateRateWithWindows = (context: RateCalculationContext): RateCalculationResult => {
    if (!rateWindows.length) {
      return {
        baseTariff: context.baseTariff,
        adjustments: [],
        finalRate: context.baseTariff,
        totalDiscount: 0,
        totalSurcharge: 0
      };
    }

    const targetDate = new Date(context.date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

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
    if (!rateWindows.length) return [];

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