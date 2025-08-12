import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HotelDateInfo {
  currentHotelDate: string;
  mode: 'noon' | 'midnight';
  autoSwitchTime: string;
  nextSwitchAt: string;
}

export function useHotelDate(orgId: string | null) {
  return useQuery({
    queryKey: ['hotel-date', orgId],
    queryFn: async (): Promise<HotelDateInfo> => {
      if (!orgId) throw new Error('Organization ID required');
      
      // For now, use current date as hotel date
      // This will be replaced when the database migration is approved
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const autoSwitchTime = '12:00';
      const nextSwitch = new Date(`${currentDate}T${autoSwitchTime}:00`);
      
      if (nextSwitch <= now) {
        nextSwitch.setDate(nextSwitch.getDate() + 1);
      }
      
      return {
        currentHotelDate: currentDate,
        mode: 'noon' as const,
        autoSwitchTime: autoSwitchTime,
        nextSwitchAt: nextSwitch.toISOString(),
      };
    },
    enabled: !!orgId,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useSwitchHotelDate(orgId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      // Simulate hotel date switch for now
      // This will be replaced when the database migration is approved
      await new Promise(resolve => setTimeout(resolve, 100));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-date', orgId] });
      toast({
        title: 'Date-hôtel basculée',
        description: 'La date-hôtel a été mise à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de basculer la date-hôtel',
        variant: 'destructive',
      });
    },
  });
}

export function useHotelDateRange(orgId: string | null, hotelDate: string | null) {
  return useQuery({
    queryKey: ['hotel-date-range', orgId, hotelDate],
    queryFn: async () => {
      if (!orgId || !hotelDate) throw new Error('Organization ID and hotel date required');
      
      // Calculate date range using default noon mode for now
      const mode = 'noon';
      const switchTime = '12:00';
      
      const startDateTime = new Date(`${hotelDate}T${switchTime}:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setDate(endDateTime.getDate() + 1);
      
      return {
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      };
    },
    enabled: !!orgId && !!hotelDate,
  });
}

export function useIsPriorData(orgId: string | null) {
  return useMutation({
    mutationFn: async (targetHotelDate: string) => {
      if (!orgId) throw new Error('Organization ID required');
      
      // For now, use current date as comparison
      const currentHotelDate = new Date().toISOString().split('T')[0];
      return new Date(targetHotelDate) < new Date(currentHotelDate);
    },
  });
}