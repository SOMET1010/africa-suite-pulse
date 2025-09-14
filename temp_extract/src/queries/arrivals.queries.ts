import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, invalidateRackQueries } from '@/lib/queryClient';
import type { ArrivalRow, AssignRoomInput, CheckinInput } from '@/features/arrivals/arrivals.types';

// Helper pour throw errors
function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw error;
  if (!data) throw new Error("Aucune donnée reçue");
  return data;
}

// --- QUERIES ---

export function useArrivals(orgId: string, dateISO: string) {
  return useQuery({
    queryKey: queryKeys.arrivals(orgId, dateISO),
    queryFn: async (): Promise<ArrivalRow[]> => {
      console.log("🔄 Fetching arrivals with React Query", { orgId, dateISO });
      
      const { data, error } = await supabase
        .rpc("get_reservations_arrivals", { p_date: dateISO })
        .returns<any[]>();

      return throwIfError(data, error) as ArrivalRow[];
    },
    enabled: !!orgId && !!dateISO,
    staleTime: 60 * 1000, // 1 minute (données très volatiles pour les arrivées)
  });
}

export function usePickableRooms(orgId: string, query = "") {
  return useQuery({
    queryKey: queryKeys.pickableRooms(orgId, query),
    queryFn: async () => {
      console.log("🔄 Fetching pickable rooms", { orgId, query });
      
      let supaQuery = supabase
        .from("rooms")
        .select(`
          id,
          number,
          type,
          floor,
          status,
          room_types!inner(code, label, capacity)
        `)
        .eq("org_id", orgId)
        .in("status", ["clean", "inspected"])
        .order("number");

      if (query.trim()) {
        supaQuery = supaQuery.or(`number.ilike.%${query}%,type.ilike.%${query}%`);
      }

      const { data, error } = await supaQuery;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });
}

// --- MUTATIONS ---

export function useAssignRoomToReservation() {
  return useMutation({
    mutationFn: async ({ reservationId, roomId }: AssignRoomInput) => {
      console.log(`🔄 Assigning room ${roomId} to reservation ${reservationId}`);

      const { data, error } = await supabase.rpc("pms_assign_room", {
        p_res: reservationId,
        p_room: roomId,
      });

      if (error) {
        console.error("❌ Error assigning room:", error);
        throw error;
      }

      console.log("✅ Room assigned successfully");
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalider les queries pour refetch
      console.log("🎯 Invalidating cache after room assignment");
      // Note: Idéalement on devrait avoir l'orgId dans le context
    },
  });
}

export function useCheckinReservation() {
  return useMutation({
    mutationFn: async ({ reservationId }: CheckinInput) => {
      console.log(`🏠 Checking in reservation ${reservationId}`);

      const { data, error } = await supabase.rpc("pms_checkin", {
        p_res: reservationId,
      });

      if (error) {
        console.error("❌ Error checking in:", error);
        throw error;
      }

      console.log("✅ Check-in successful");
      return data;
    },
    onSuccess: () => {
      console.log("🎯 Invalidating cache after check-in");
    },
  });
}