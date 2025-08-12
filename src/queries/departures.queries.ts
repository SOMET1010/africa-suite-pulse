import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, invalidateRackQueries } from '@/lib/queryClient';
import type { DepartureRow, CheckoutInput } from '@/features/departures/departures.types';

// Helper pour throw errors
function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw error;
  if (!data) throw new Error("Aucune donnée reçue");
  return data;
}

// --- QUERIES ---

export function useDepartures(orgId: string, dateISO: string) {
  return useQuery({
    queryKey: queryKeys.departures(orgId, dateISO),
    queryFn: async (): Promise<DepartureRow[]> => {
      console.log("🔄 Fetching departures with React Query", { orgId, dateISO });
      
      // For now, using the same view as arrivals with departure logic
      // TODO: Create a dedicated departures view in the database
      const { data, error } = await supabase
        .from("reservations_view_arrivals")
        .select("*")
        .eq("org_id", orgId)
        .eq("date_arrival", dateISO)
        .order("planned_time", { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Transform to match DepartureRow structure
      const transformedData = (data || []).map(item => ({
        id: item.id,
        org_id: item.org_id,
        date_departure: item.date_arrival,
        planned_time: item.planned_time,
        status: (item.status === "present" ? "checked_in" : 
                item.status === "confirmed" ? "checked_in" : 
                "cancelled") as "checked_in" | "checked_out" | "cancelled",
        room_id: item.room_id,
        room_number: item.room_number,
        guest_name: item.guest_name,
        adults: item.adults,
        children: item.children,
        rate_total: item.rate_total,
        balance_due: 0, // TODO: Calculate from billing
        reference: item.reference,
      })) as DepartureRow[];

      return transformedData;
    },
    enabled: !!orgId && !!dateISO,
    staleTime: 60 * 1000, // 1 minute (données très volatiles pour les départs)
  });
}

// --- MUTATIONS ---

export function useCheckoutReservation() {
  return useMutation({
    mutationFn: async ({ reservationId }: CheckoutInput) => {
      console.log(`🏃‍♂️ Checking out reservation ${reservationId}`);

      // For now, using checkin RPC as placeholder
      // TODO: Create a dedicated pms_checkout RPC in the database
      const { data, error } = await supabase.rpc("pms_checkin", {
        p_res: reservationId,
      });

      if (error) {
        console.error("❌ Error checking out:", error);
        throw error;
      }

      console.log("✅ Check-out successful");
      return data;
    },
    onSuccess: () => {
      console.log("🎯 Invalidating cache after check-out");
    },
  });
}