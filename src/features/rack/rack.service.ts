import { supabase } from "@/integrations/supabase/client";
import type { Room, Reservation } from "./rack.types";

const sb = supabase as any;

function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw error;
  if (!data) throw new Error("Aucune donnée reçue");
  return data;
}

export async function fetchRooms(orgId: string): Promise<Room[]> {
  const { data, error } = await sb
    .from("rooms")
    .select("*")
    .eq("org_id", orgId)
    .order("number", { ascending: true });
  return throwIfError(data, error) as Room[];
}

export async function fetchReservationsRange(orgId: string, startISO: string, endISO: string): Promise<Reservation[]> {
  // Réservations qui chevauchent l'intervalle [start, end]
  const { data, error } = await sb
    .from("reservations")
    .select("*")
    .eq("org_id", orgId)
    .lte("date_arrival", endISO)
    .gte("date_departure", startISO)
    .order("date_arrival", { ascending: true });
  return throwIfError(data, error) as Reservation[];
}

/** Réassigner une résa (drag&drop) à une chambre */
export async function reassignReservation(reservationId: string, roomId: string) {
  console.log(`🔄 Reassigning reservation ${reservationId} to room ${roomId} via RPC pms_move_reservation`);

  const { data, error } = await sb.rpc("pms_move_reservation", {
    p_res: reservationId,
    p_room: roomId,
  });

  if (error) {
    console.error("❌ Error reassigning reservation via RPC:", error);
    throw error;
  }

  console.log("✅ Reservation reassigned successfully via RPC:", data);
  return data; // returns the updated reservation row
}