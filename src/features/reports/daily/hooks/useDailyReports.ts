import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";

export interface ArrivalGuest {
  id: string;
  reservationId: string;
  reference: string;
  guestName: string;
  company?: string;
  roomNumber?: string;
  roomType: string;
  source: string;
  arrivalTime?: string;
  status: string;
  adults: number;
  children: number;
  notes?: string;
  vipStatus: boolean;
  guestPhone?: string;
  guestEmail?: string;
}

export interface DepartureGuest {
  id: string;
  reservationId: string;
  reference: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkoutTime?: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: string;
  folio: string;
  adults: number;
  children: number;
  nights: number;
}

export interface InHouseGuest {
  id: string;
  reservationId: string;
  reference: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  adults: number;
  children: number;
  folio: string;
  balance: number;
  status: string;
  source: string;
}

export interface NoShowGuest {
  id: string;
  reservationId: string;
  reference: string;
  guestName: string;
  roomType: string;
  expectedArrival: string;
  source: string;
  totalAmount: number;
  depositPaid: number;
  penaltyAmount: number;
  status: string;
  cancellationCode?: string;
  notes?: string;
}

export interface OccupancyData {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  outOfOrderRooms: number;
  occupancyRate: number;
  roomTypes: Array<{
    type: string;
    total: number;
    occupied: number;
    available: number;
    rate: number;
  }>;
  floors: Array<{
    floor: string;
    total: number;
    occupied: number;
    available: number;
    rate: number;
  }>;
}

export function useArrivals(selectedDate: string) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['daily-arrivals', orgId, selectedDate],
    queryFn: async (): Promise<ArrivalGuest[]> => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reference,
          status,
          date_arrival,
          adults,
          children,
          rate_total,
          planned_time,
          guest_name,
          guest_phone,
          guest_email,
          source,
          notes,
          rooms!inner(number, type),
          guests!inner(first_name, last_name, company_name, vip_status)
        `)
        .eq('org_id', orgId)
        .eq('date_arrival', selectedDate)
        .neq('status', 'cancelled');

      if (error) throw error;

      return data?.map((reservation: any) => ({
        id: reservation.id,
        reservationId: reservation.id,
        reference: reservation.reference,
        guestName: `${reservation.guests?.first_name} ${reservation.guests?.last_name}`,
        company: reservation.guests?.company_name,
        roomNumber: reservation.rooms?.number,
        roomType: reservation.rooms?.type || 'Non assigné',
        source: reservation.source || 'Direct',
        arrivalTime: reservation.planned_time,
        status: reservation.status,
        adults: reservation.adults,
        children: reservation.children,
        notes: reservation.notes,
        vipStatus: reservation.guests?.vip_status || false,
        guestPhone: reservation.guest_phone,
        guestEmail: reservation.guest_email,
      })) || [];
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useDepartures(selectedDate: string) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['daily-departures', orgId, selectedDate],
    queryFn: async (): Promise<DepartureGuest[]> => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reference,
          status,
          date_departure,
          date_arrival,
          adults,
          children,
          rate_total,
          guest_name,
          rooms!inner(number, type),
          invoices(id, number, total_amount)
        `)
        .eq('org_id', orgId)
        .eq('date_departure', selectedDate)
        .neq('status', 'cancelled');

      if (error) throw error;

      return data?.map((reservation: any) => {
        const nights = Math.ceil((new Date(reservation.date_departure).getTime() - new Date(reservation.date_arrival).getTime()) / (1000 * 60 * 60 * 24));
        const totalAmount = reservation.rate_total || 0;
        // Calculate paid amount from payment transactions
        const paidAmount = reservation.rate_total || 0; // Simplified for now
        
        return {
          id: reservation.id,
          reservationId: reservation.id,
          reference: reservation.reference,
          guestName: reservation.guest_name,
          roomNumber: reservation.rooms?.number || '',
          roomType: reservation.rooms?.type || '',
          checkoutTime: reservation.date_departure || '',
          totalAmount,
          paidAmount,
          balanceDue: totalAmount - paidAmount,
          status: reservation.status,
          folio: reservation.invoices?.[0]?.number || '',
          adults: reservation.adults,
          children: reservation.children,
          nights,
        };
      }) || [];
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 2 * 60 * 1000,
  });
}

export function useInHouse(selectedDate: string) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['daily-inhouse', orgId, selectedDate],
    queryFn: async (): Promise<InHouseGuest[]> => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reference,
          status,
          date_arrival,
          date_departure,
          adults,
          children,
          rate_total,
          guest_name,
          source,
          rooms!inner(number, type)
        `)
        .eq('org_id', orgId)
        .lte('date_arrival', selectedDate)
        .gt('date_departure', selectedDate)
        .eq('status', 'checked_in');

      if (error) throw error;

      return data?.map((reservation: any) => {
        const nights = Math.ceil((new Date(reservation.date_departure).getTime() - new Date(reservation.date_arrival).getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: reservation.id,
          reservationId: reservation.id,
          reference: reservation.reference,
          guestName: reservation.guest_name,
          roomNumber: reservation.rooms?.number || '',
          roomType: reservation.rooms?.type || '',
          arrivalDate: reservation.date_arrival,
          departureDate: reservation.date_departure,
          nights,
          adults: reservation.adults,
          children: reservation.children,
          folio: `F-${reservation.reference}`,
          balance: Math.max(0, (reservation.rate_total || 0) - (reservation.paid_amount || 0)),
          status: reservation.status,
          source: reservation.source || 'Direct',
        };
      }) || [];
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 2 * 60 * 1000,
  });
}

export function useNoShows(selectedDate: string) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['daily-noshows', orgId, selectedDate],
    queryFn: async (): Promise<NoShowGuest[]> => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reference,
          status,
          date_arrival,
          adults,
          children,
          rate_total,
          guest_name,
          source,
          notes,
          room_type
        `)
        .eq('org_id', orgId)
        .eq('date_arrival', selectedDate)
        .eq('status', 'no_show');

      if (error) throw error;

      return data?.map((reservation: any) => ({
        id: reservation.id,
        reservationId: reservation.id,
        reference: reservation.reference,
        guestName: reservation.guest_name,
        roomType: reservation.room_type || 'Non spécifié',
        expectedArrival: reservation.date_arrival,
        source: reservation.source || 'Direct',
        totalAmount: reservation.rate_total || 0,
        depositPaid: reservation.deposit_amount || 0,
        penaltyAmount: reservation.penalty_amount || 0,
        status: reservation.status,
        cancellationCode: reservation.cancellation_code || '',
        notes: reservation.notes,
      })) || [];
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 2 * 60 * 1000,
  });
}

export function useOccupancy(selectedDate: string) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['daily-occupancy', orgId, selectedDate],
    queryFn: async (): Promise<OccupancyData> => {
      if (!orgId) throw new Error('Organization ID required');

      // Get all rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('id, number, type, floor, status')
        .eq('org_id', orgId);

      if (roomsError) throw roomsError;

      // Get reservations for the date
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('room_id, status')
        .eq('org_id', orgId)
        .lte('date_arrival', selectedDate)
        .gt('date_departure', selectedDate)
        .eq('status', 'checked_in');

      if (resError) throw resError;

      const occupiedRoomIds = new Set(reservations?.map(r => r.room_id) || []);
      const totalRooms = rooms?.length || 0;
      const occupiedRooms = occupiedRoomIds.size;
      const outOfOrderRooms = rooms?.filter(r => r.status === 'out_of_order').length || 0;
      const availableRooms = totalRooms - occupiedRooms - outOfOrderRooms;

      // Group by room type
      const roomTypeStats = rooms?.reduce((acc: any, room) => {
        const type = room.type || 'Non spécifié';
        if (!acc[type]) {
          acc[type] = { type, total: 0, occupied: 0, available: 0 };
        }
        acc[type].total++;
        if (occupiedRoomIds.has(room.id)) {
          acc[type].occupied++;
        } else if (room.status !== 'out_of_order') {
          acc[type].available++;
        }
        return acc;
      }, {}) || {};

      // Group by floor
      const floorStats = rooms?.reduce((acc: any, room) => {
        const floor = room.floor || '0';
        if (!acc[floor]) {
          acc[floor] = { floor, total: 0, occupied: 0, available: 0 };
        }
        acc[floor].total++;
        if (occupiedRoomIds.has(room.id)) {
          acc[floor].occupied++;
        } else if (room.status !== 'out_of_order') {
          acc[floor].available++;
        }
        return acc;
      }, {}) || {};

      return {
        totalRooms,
        occupiedRooms,
        availableRooms,
        outOfOrderRooms,
        occupancyRate: totalRooms > 0 ? (occupiedRooms / (totalRooms - outOfOrderRooms)) * 100 : 0,
        roomTypes: Object.values(roomTypeStats).map((stats: any) => ({
          ...stats,
          rate: stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0,
        })),
        floors: Object.values(floorStats).map((stats: any) => ({
          ...stats,
          rate: stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0,
        })),
      };
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 2 * 60 * 1000,
  });
}