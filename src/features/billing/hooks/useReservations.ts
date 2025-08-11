import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReservationForBilling {
  id: string;
  reference: string | null;
  guest_name: string;
  room_number: string | null;
  room_type: string | null;
  date_arrival: string;
  date_departure: string;
  adults: number;
  children: number;
  rate_total: number | null;
  status: string;
}

export function useReservationsForBilling(orgId: string) {
  return useQuery({
    queryKey: ['reservations-billing', orgId],
    queryFn: async (): Promise<ReservationForBilling[]> => {
      const { data, error } = await supabase
        .from('reservations_view_arrivals')
        .select('*')
        .eq('org_id', orgId)
        .order('date_arrival', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(res => ({
        id: res.id,
        reference: res.reference,
        guest_name: res.guest_name || 'Client',
        room_number: res.room_number,
        room_type: null, // Will be added when we have room type info
        date_arrival: res.date_arrival,
        date_departure: res.date_arrival, // Using single date for now as view only has arrival
        adults: res.adults || 1,
        children: res.children || 0,
        rate_total: res.rate_total,
        status: res.status
      }));
    },
    enabled: !!orgId,
  });
}

export function useReservationById(reservationId: string | null) {
  return useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: async (): Promise<ReservationForBilling | null> => {
      if (!reservationId) return null;
      
      const { data, error } = await supabase
        .from('reservations_view_arrivals')
        .select('*')
        .eq('id', reservationId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        reference: data.reference,
        guest_name: data.guest_name || 'Client',
        room_number: data.room_number,
        room_type: null,
        date_arrival: data.date_arrival,
        date_departure: data.date_arrival, // Using single date for now as view only has arrival
        adults: data.adults || 1,
        children: data.children || 0,
        rate_total: data.rate_total,
        status: data.status
      };
    },
    enabled: !!reservationId,
  });
}