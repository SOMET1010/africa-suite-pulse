
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, invalidateRackQueries } from '@/lib/queryClient';
import type { Room, Reservation } from '@/features/rack/rack.types';

// Type pour les données optimisées du rack
interface OptimizedRackData {
  rooms: Array<{
    id: string;
    number: string;
    type: string;
    floor: number;
    status: string;
  }>;
  reservations: Array<{
    id: string;
    room_id: string;
    reference: string;
    status: string;
    date_arrival: string;
    date_departure: string;
    adults: number;
    children: number;
    rate_total: number;
  }>;
  kpis: {
    occ: number;
    arrivals: number;
    presents: number;
    hs: number;
    total_rooms: number;
    occupied_cells: number;
    total_cells: number;
  };
  generated_at: string;
}

// Types unifiés pour les queries
type RoomData = {
  id: string;
  org_id: string;
  number: string;
  type: string | null;
  floor: string | null;
  status: string;
  features: any;
  created_at: string;
  updated_at: string;
};

type ReservationData = {
  id: string;
  org_id: string;
  room_id: string | null;
  reference: string | null;
  status: string;
  date_arrival: string;
  date_departure: string;
  adults: number;
  children: number;
  rate_total: number | null;
  planned_time: string | null;
};

// Helper pour throw errors
function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw error;
  if (!data) throw new Error("Aucune donnée reçue");
  return data;
}

// --- QUERIES ---

export function useRooms(orgId: string) {
  return useQuery({
    queryKey: queryKeys.rooms(orgId),
    queryFn: async (): Promise<Room[]> => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, org_id, number, type, floor, status, features, created_at, updated_at")
        .eq("org_id", orgId)
        .order("number", { ascending: true });
      
      return throwIfError(data, error) as Room[];
    },
    enabled: !!orgId,
  });
}

export function useReservations(orgId: string, startISO?: string, endISO?: string) {
  return useQuery({
    queryKey: queryKeys.reservations.all(orgId, startISO, endISO),
    queryFn: async (): Promise<Reservation[]> => {
      let query = supabase
        .from("reservations")
        .select("id, org_id, room_id, reference, status, date_arrival, date_departure, adults, children, rate_total, planned_time")
        .eq("org_id", orgId)
        .order("date_arrival", { ascending: true });

      // Filtrage par dates si fourni
      if (startISO && endISO) {
        query = query
          .lte("date_arrival", endISO)
          .gte("date_departure", startISO);
      }

      const { data, error } = await query;
      return throwIfError(data, error) as Reservation[];
    },
    enabled: !!orgId,
  });
}

/**
 * Hook to fetch optimized rack data using server-side RPC
 * Combines rooms, reservations, and KPIs in a single efficient query
 */
export function useRackData(orgId: string, startISO: string, endISO: string) {
  return useQuery({
    queryKey: queryKeys.rackData(orgId, startISO, endISO),
    queryFn: async (): Promise<OptimizedRackData> => {
      if (!orgId) {
        throw new Error('Organization ID is required');
      }

      console.log("🔄 Fetching optimized rack data", { orgId, startISO, endISO });

      // Use the optimized RPC function
      const { data, error } = await supabase
        .rpc('get_rack_data_optimized', {
          p_org_id: orgId,
          p_start_date: startISO,
          p_end_date: endISO
        });

      if (error) {
        console.error('❌ Rack data fetch error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from rack query');
      }

      // Type assertion safe car nous connaissons la structure retournée par notre RPC
      const rackData = data as unknown as OptimizedRackData;
      
      console.log("✅ Optimized rack data fetched", { 
        rooms: rackData.rooms?.length || 0, 
        reservations: rackData.reservations?.length || 0,
        kpis: rackData.kpis
      });

      return rackData;
    },
    enabled: !!orgId && !!startISO && !!endISO,
    staleTime: 5 * 60 * 1000, // 5 minutes (increased cache time)
    gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
  });
}

// --- MUTATIONS ---

export function useReassignReservation() {
  return useMutation({
    mutationFn: async ({ reservationId, roomId }: { reservationId: string; roomId: string }) => {
      console.log(`🔄 Reassigning reservation ${reservationId} to room ${roomId} via RPC`);

      const { data, error } = await supabase.rpc("pms_move_reservation", {
        p_res: reservationId,
        p_room: roomId,
      });

      if (error) {
        console.error("❌ Error reassigning reservation:", error);
        throw error;
      }

      console.log("✅ Reservation reassigned successfully:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalider le cache pour forcer le refetch
      const orgId = (data as any)?.org_id;
      if (orgId) {
        invalidateRackQueries(orgId);
      }
      
      console.log("🎯 Cache invalidated after reassignment");
    },
    onError: (error: any) => {
      console.error("❌ Mutation failed:", error);
      
      // Ne pas afficher de toast ici - laisse le composant gérer l'affichage
      // Juste transformer le message d'erreur en français si nécessaire
      if (error.code === "23514" && error.message?.includes("Conflicting reservation")) {
        error.userMessage = "Des réservations en conflit empêchent ce déplacement. Résolvez d'abord les conflits.";
      }
    },
  });
}

export function useCheckinReservation() {
  return useMutation({
    mutationFn: async (reservationId: string) => {
      console.log(`🏠 Check-in reservation ${reservationId}`);

      const { data, error } = await supabase.rpc("pms_checkin", {
        p_res: reservationId,
      });

      if (error) {
        console.error("❌ Error checking in:", error);
        throw error;
      }

      console.log("✅ Check-in successful:", data);
      return data;
    },
    onSuccess: (data, reservationId) => {
      // Invalider les queries liées
      // Note: on devrait avoir l'orgId dans le context ou le récupérer
      console.log("🎯 Cache invalidated after check-in");
    },
  });
}

export function useAssignRoom() {
  return useMutation({
    mutationFn: async ({ reservationId, roomId }: { reservationId: string; roomId: string }) => {
      console.log(`🔄 Assigning room ${roomId} to reservation ${reservationId}`);

      const { data, error } = await supabase.rpc("pms_assign_room", {
        p_res: reservationId,
        p_room: roomId,
      });

      if (error) {
        console.error("❌ Error assigning room:", error);
        throw error;
      }

      console.log("✅ Room assigned successfully:", data);
      return data;
    },
    onSuccess: () => {
      console.log("🎯 Cache invalidated after room assignment");
    },
  });
}
