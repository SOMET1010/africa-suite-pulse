import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";
import { useToast } from "@/hooks/use-toast";

// Enhanced interfaces with additional fields
export interface EnhancedArrivalGuest {
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
  guaranteeType: 'credit_card' | 'deposit' | 'company' | 'none';
  confirmationTime?: string;
  assignmentStatus: 'assigned' | 'unassigned' | 'blocked';
  channelType: 'direct' | 'ota' | 'agency' | 'walk_in';
  totalAmount: number;
  depositPaid: number;
  specialRequests?: string;
}

export interface EnhancedDepartureGuest {
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
  paymentMethod: string;
  invoicePrinted: boolean;
  lateDeparture: boolean;
  services: Array<{ name: string; amount: number }>;
}

export interface EnhancedNoShowGuest {
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
  contactAttempts: number;
  lastContactTime?: string;
  penaltyApplied: boolean;
  blacklisted: boolean;
}

export interface DailyKPIs {
  occupancy: {
    rate: number;
    totalRooms: number;
    occupied: number;
    available: number;
    ooo: number;
  };
  revenue: {
    total: number;
    projected: number;
    variance: number;
  };
  arrivals: {
    total: number;
    assigned: number;
    unassigned: number;
    vip: number;
  };
  departures: {
    total: number;
    settled: number;
    pending: number;
    overdue: number;
  };
  noShows: {
    count: number;
    lostRevenue: number;
    penaltiesCollected: number;
  };
}

// Enhanced Arrivals Hook
export function useEnhancedArrivals(selectedDate: string, filters?: {
  status?: string;
  source?: string;
  roomType?: string;
  vipOnly?: boolean;
}) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['enhanced-arrivals', orgId, selectedDate, filters],
    queryFn: async (): Promise<EnhancedArrivalGuest[]> => {
      if (!orgId) throw new Error('Organization ID required');

      let query = supabase
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
          special_requests,
          created_at,
          rooms(number, type),
          guests(first_name, last_name, company_name, vip_status),
          payment_transactions(payment_method, amount, status)
        `)
        .eq('org_id', orgId)
        .eq('date_arrival', selectedDate)
        .neq('status', 'cancelled');

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }
      if (filters?.roomType) {
        query = query.eq('room_type', filters.roomType);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map((reservation: any) => {
        const depositPaid = reservation.payment_transactions
          ?.filter((pt: any) => pt.status === 'completed')
          ?.reduce((sum: number, pt: any) => sum + pt.amount, 0) || 0;

        return {
          id: reservation.id,
          reservationId: reservation.id,
          reference: reservation.reference,
          guestName: `${reservation.guests?.first_name || ''} ${reservation.guests?.last_name || ''}`.trim(),
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
          guaranteeType: depositPaid > 0 ? 'deposit' : 'none',
          confirmationTime: reservation.created_at,
          assignmentStatus: reservation.rooms ? 'assigned' : 'unassigned',
          channelType: mapSourceToChannel(reservation.source),
          totalAmount: reservation.rate_total || 0,
          depositPaid,
          specialRequests: reservation.special_requests,
        };
      }) || [];
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 1 * 60 * 1000, // 1 minute for real-time feel
  });
}

// Enhanced Departures Hook
export function useEnhancedDepartures(selectedDate: string, filters?: {
  paymentStatus?: string;
  paymentMethod?: string;
}) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['enhanced-departures', orgId, selectedDate, filters],
    queryFn: async (): Promise<EnhancedDepartureGuest[]> => {
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
          checkout_time,
          rooms!inner(number, type),
          invoices(id, number, total_amount, status),
          payment_transactions(payment_method, amount, status),
          invoice_items(service_code, description, total_price)
        `)
        .eq('org_id', orgId)
        .eq('date_departure', selectedDate)
        .neq('status', 'cancelled');

      if (error) throw error;

      return data?.map((reservation: any) => {
        const nights = Math.ceil((new Date(reservation.date_departure).getTime() - new Date(reservation.date_arrival).getTime()) / (1000 * 60 * 60 * 24));
        const totalAmount = reservation.rate_total || 0;
        const paidAmount = reservation.payment_transactions
          ?.filter((pt: any) => pt.status === 'completed')
          ?.reduce((sum: number, pt: any) => sum + pt.amount, 0) || 0;
        
        const services = reservation.invoice_items?.map((item: any) => ({
          name: item.description,
          amount: item.total_price,
        })) || [];

        const checkoutTime = reservation.checkout_time;
        const lateDeparture = checkoutTime ? new Date(checkoutTime).getHours() >= 14 : false;

        return {
          id: reservation.id,
          reservationId: reservation.id,
          reference: reservation.reference,
          guestName: reservation.guest_name,
          roomNumber: reservation.rooms?.number || '',
          roomType: reservation.rooms?.type || '',
          checkoutTime,
          totalAmount,
          paidAmount,
          balanceDue: totalAmount - paidAmount,
          status: reservation.status,
          folio: reservation.invoices?.[0]?.number || '',
          adults: reservation.adults,
          children: reservation.children,
          nights,
          paymentMethod: reservation.payment_transactions?.[0]?.payment_method || '',
          invoicePrinted: !!reservation.invoices?.[0]?.id,
          lateDeparture,
          services,
        };
      }) || [];
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 1 * 60 * 1000,
  });
}

// Enhanced No-Shows Hook
export function useEnhancedNoShows(selectedDate: string) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['enhanced-noshows', orgId, selectedDate],
    queryFn: async (): Promise<EnhancedNoShowGuest[]> => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          reference,
          status,
          date_arrival,
          rate_total,
          guest_name,
          source,
          notes,
          room_type,
          cancellation_policies(rules),
          payment_transactions(amount, status)
        `)
        .eq('org_id', orgId)
        .eq('date_arrival', selectedDate)
        .eq('status', 'no_show');

      if (error) throw error;

      return data?.map((reservation: any) => {
        const depositPaid = reservation.payment_transactions
          ?.filter((pt: any) => pt.status === 'completed')
          ?.reduce((sum: number, pt: any) => sum + pt.amount, 0) || 0;

        const contactAttempts = 0; // TODO: Add guest communications tracking
        const lastContact = undefined;
        
        // Calculate penalty based on cancellation policy
        const penaltyAmount = calculateNoShowPenalty(reservation.rate_total, depositPaid);

        return {
          id: reservation.id,
          reservationId: reservation.id,
          reference: reservation.reference,
          guestName: reservation.guest_name,
          roomType: reservation.room_type || 'Non spécifié',
          expectedArrival: reservation.date_arrival,
          source: reservation.source || 'Direct',
          totalAmount: reservation.rate_total || 0,
          depositPaid,
          penaltyAmount,
          status: reservation.status,
          cancellationCode: '', // TODO: Add cancellation codes
          notes: reservation.notes,
          contactAttempts,
          lastContactTime: lastContact,
          penaltyApplied: false, // TODO: Track penalty application
          blacklisted: false, // TODO: Track blacklist status
        };
      }) || [];
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 1 * 60 * 1000,
  });
}

// Daily KPIs Hook
export function useDailyKPIs(selectedDate: string) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['daily-kpis', orgId, selectedDate],
    queryFn: async (): Promise<DailyKPIs> => {
      if (!orgId) throw new Error('Organization ID required');

      // Parallel queries for efficiency
      const [roomsResult, reservationsResult, paymentsResult] = await Promise.all([
        supabase.from('rooms').select('id, status, type').eq('org_id', orgId),
        supabase
          .from('reservations')
          .select('id, status, date_arrival, date_departure, rate_total, room_id')
          .eq('org_id', orgId)
          .or(`date_arrival.eq.${selectedDate},date_departure.eq.${selectedDate},and(date_arrival.lte.${selectedDate},date_departure.gt.${selectedDate})`),
        supabase
          .from('payment_transactions')
          .select('amount, status, created_at')
          .eq('org_id', orgId)
          .gte('created_at', `${selectedDate}T00:00:00`)
          .lt('created_at', `${selectedDate}T23:59:59`)
      ]);

      const rooms = roomsResult.data || [];
      const reservations = reservationsResult.data || [];
      const payments = paymentsResult.data || [];

      const totalRooms = rooms.length;
      const oooRooms = rooms.filter(r => r.status === 'out_of_order').length;
      const occupiedRooms = reservations.filter(r => 
        r.status === 'checked_in' && 
        r.date_arrival <= selectedDate && 
        r.date_departure > selectedDate
      ).length;

      const arrivals = reservations.filter(r => r.date_arrival === selectedDate);
      const departures = reservations.filter(r => r.date_departure === selectedDate);
      const noShows = reservations.filter(r => r.date_arrival === selectedDate && r.status === 'no_show');

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        occupancy: {
          rate: totalRooms > 0 ? (occupiedRooms / (totalRooms - oooRooms)) * 100 : 0,
          totalRooms,
          occupied: occupiedRooms,
          available: totalRooms - occupiedRooms - oooRooms,
          ooo: oooRooms,
        },
        revenue: {
          total: totalRevenue,
          projected: arrivals.reduce((sum, r) => sum + (r.rate_total || 0), 0),
          variance: 0, // TODO: Calculate against budget/forecast
        },
        arrivals: {
          total: arrivals.length,
          assigned: arrivals.filter(r => r.room_id).length,
          unassigned: arrivals.filter(r => !r.room_id).length,
          vip: 0, // TODO: Add VIP status calculation
        },
        departures: {
          total: departures.length,
          settled: departures.filter(r => r.status === 'checked_out').length,
          pending: departures.filter(r => r.status === 'checked_in').length,
          overdue: 0, // TODO: Calculate overdue checkouts
        },
        noShows: {
          count: noShows.length,
          lostRevenue: noShows.reduce((sum, r) => sum + (r.rate_total || 0), 0),
          penaltiesCollected: 0, // TODO: Calculate collected penalties
        },
      };
    },
    enabled: !!orgId && !!selectedDate,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Action Hooks
export function useReservationActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignRoom = useMutation({
    mutationFn: async ({ reservationId, roomId }: { reservationId: string; roomId: string }) => {
      const { error } = await supabase
        .from('reservations')
        .update({ room_id: roomId })
        .eq('id', reservationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-arrivals'] });
      toast({ title: "Succès", description: "Chambre assignée avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'assigner la chambre", variant: "destructive" });
    },
  });

  const checkIn = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'checked_in',
          actual_arrival_time: new Date().toISOString()
        })
        .eq('id', reservationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-arrivals'] });
      queryClient.invalidateQueries({ queryKey: ['daily-kpis'] });
      toast({ title: "Succès", description: "Check-in effectué" });
    },
  });

  const checkOut = useMutation({
    mutationFn: async (reservationId: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: 'checked_out',
          checkout_time: new Date().toISOString()
        })
        .eq('id', reservationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-departures'] });
      queryClient.invalidateQueries({ queryKey: ['daily-kpis'] });
      toast({ title: "Succès", description: "Check-out effectué" });
    },
  });

  const applyNoShowPenalty = useMutation({
    mutationFn: async ({ reservationId, amount }: { reservationId: string; amount: number }) => {
      // TODO: Implement penalty application logic
      const { error } = await supabase
        .from('reservations')
        .update({
          notes: `No-show penalty applied: ${amount}€`
        })
        .eq('id', reservationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-noshows'] });
      toast({ title: "Succès", description: "Pénalité appliquée" });
    },
  });

  return {
    assignRoom,
    checkIn,
    checkOut,
    applyNoShowPenalty,
  };
}

// Utility functions
function mapSourceToChannel(source?: string): 'direct' | 'ota' | 'agency' | 'walk_in' {
  if (!source) return 'direct';
  if (source.toLowerCase().includes('booking') || source.toLowerCase().includes('expedia')) return 'ota';
  if (source.toLowerCase().includes('agence')) return 'agency';
  if (source.toLowerCase().includes('walk')) return 'walk_in';
  return 'direct';
}

function calculateNoShowPenalty(totalAmount: number, depositPaid: number): number {
  // Simple penalty calculation - 50% of first night or deposit forfeited
  return Math.max(depositPaid, totalAmount * 0.5);
}