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
      
      // Fetch from hotel_dates table
      const { data: hotelDates, error: hotelError } = await supabase
        .from('hotel_dates')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (hotelError) {
        // Fallback to hotel_settings if no hotel_dates entry
        const { data: settings, error: settingsError } = await supabase
          .from('hotel_settings')
          .select('date_hotel_mode, auto_switch_time')
          .eq('org_id', orgId)
          .single();
        
        if (settingsError) throw settingsError;
        
        // Create initial hotel_dates entry
        const currentDate = new Date().toISOString().split('T')[0];
        const mode = (settings.date_hotel_mode as 'noon' | 'midnight') || 'noon';
        const switchTime = settings.auto_switch_time || '12:00';
        
        const nextSwitch = calculateNextSwitch(currentDate, mode, switchTime);
        
        const { data: newHotelDate, error: createError } = await supabase
          .from('hotel_dates')
          .insert({
            org_id: orgId,
            current_hotel_date: currentDate,
            mode: mode,
            switch_time: switchTime,
            next_switch_at: nextSwitch,
          })
          .select()
          .single();
          
        if (createError) throw createError;
        
        return {
          currentHotelDate: newHotelDate.current_hotel_date,
          mode: newHotelDate.mode as 'noon' | 'midnight',
          autoSwitchTime: newHotelDate.switch_time,
          nextSwitchAt: newHotelDate.next_switch_at,
        };
      }
      
      return {
        currentHotelDate: hotelDates.current_hotel_date,
        mode: hotelDates.mode as 'noon' | 'midnight',
        autoSwitchTime: hotelDates.switch_time,
        nextSwitchAt: hotelDates.next_switch_at,
      };
    },
    enabled: !!orgId,
    refetchInterval: 60000, // Refresh every minute
  });
}

function calculateNextSwitch(currentDate: string, mode: 'noon' | 'midnight', switchTime: string): string {
  const now = new Date();
  const todaySwitch = new Date(`${currentDate}T${switchTime}:00`);
  
  if (mode === 'midnight') {
    const nextMidnight = new Date(`${currentDate}T00:00:00`);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    return nextMidnight.toISOString();
  } else {
    // noon mode
    if (todaySwitch <= now) {
      const tomorrowSwitch = new Date(todaySwitch);
      tomorrowSwitch.setDate(tomorrowSwitch.getDate() + 1);
      return tomorrowSwitch.toISOString();
    }
    return todaySwitch.toISOString();
  }
}

export function useSwitchHotelDate(orgId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      // Get current hotel date info
      const { data: currentHotelDate, error: fetchError } = await supabase
        .from('hotel_dates')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Calculate new hotel date
      const currentDateObj = new Date(currentHotelDate.current_hotel_date);
      currentDateObj.setDate(currentDateObj.getDate() + 1);
      const newHotelDate = currentDateObj.toISOString().split('T')[0];
      
      const nextSwitch = calculateNextSwitch(newHotelDate, currentHotelDate.mode as 'noon' | 'midnight', currentHotelDate.switch_time);
      
      // Update hotel date
      const { error: updateError } = await supabase
        .from('hotel_dates')
        .update({
          current_hotel_date: newHotelDate,
          next_switch_at: nextSwitch,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentHotelDate.id);
        
      if (updateError) throw updateError;
      
      return newHotelDate;
    },
    onSuccess: (newDate) => {
      queryClient.invalidateQueries({ queryKey: ['hotel-date', orgId] });
      queryClient.invalidateQueries({ queryKey: ['rackData'] }); // Invalidate rack data too
      toast({
        title: 'Date-hôtel basculée',
        description: `Nouvelle date-hôtel : ${newDate}`,
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
      
      // Get hotel date settings
      const { data: hotelDateSettings, error } = await supabase
        .from('hotel_dates')
        .select('mode, switch_time')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        // Fallback to hotel_settings
        const { data: settings } = await supabase
          .from('hotel_settings')
          .select('date_hotel_mode, auto_switch_time')
          .eq('org_id', orgId)
          .single();
          
        const mode = (settings?.date_hotel_mode as 'noon' | 'midnight') || 'noon';
        const switchTime = settings?.auto_switch_time || '12:00';
        
        return calculateDateRange(hotelDate, mode, switchTime);
      }
      
      return calculateDateRange(hotelDate, hotelDateSettings.mode as 'noon' | 'midnight', hotelDateSettings.switch_time);
    },
    enabled: !!orgId && !!hotelDate,
  });
}

function calculateDateRange(hotelDate: string, mode: 'noon' | 'midnight', switchTime: string) {
  if (mode === 'midnight') {
    // Midnight mode: 00:00 to 00:00 next day
    const start = new Date(`${hotelDate}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  } else {
    // Noon mode: switchTime to switchTime next day
    const start = new Date(`${hotelDate}T${switchTime}:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }
}

export function useIsPriorData(orgId: string | null) {
  return useMutation({
    mutationFn: async (targetHotelDate: string) => {
      if (!orgId) throw new Error('Organization ID required');
      
      // Get current hotel date from database
      const { data: hotelDateInfo, error } = await supabase
        .from('hotel_dates')
        .select('current_hotel_date')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) {
        // Fallback to current system date
        const currentHotelDate = new Date().toISOString().split('T')[0];
        return new Date(targetHotelDate) < new Date(currentHotelDate);
      }
      
      return new Date(targetHotelDate) < new Date(hotelDateInfo.current_hotel_date);
    },
  });
}