import { supabase } from "@/integrations/supabase/client";
import type { Room, Reservation } from "./rack.types";

const sb = supabase as any;

function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw error;
  if (!data) throw new Error("Aucune donnée reçue");
  return data;
}

export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await sb
    .from("rooms")
    .select("*")
    .order("number", { ascending: true });
  return throwIfError(data, error) as Room[];
}

export async function fetchReservationsRange(startISO: string, endISO: string): Promise<Reservation[]> {
  // Réservations qui chevauchent l’intervalle [start, end]
  const { data, error } = await sb
    .from("reservations")
    .select("*")
    .lte("date_arrival", endISO)
    .gte("date_departure", startISO)
    .order("date_arrival", { ascending: true });
  return throwIfError(data, error) as Reservation[];
}

/** Réassigner une résa (drag&drop) à une chambre */
export async function reassignReservation(reservationId: string, roomId: string) {
  const { error } = await sb.rpc("pms_assign_room", { p_res: reservationId, p_room: roomId });
  if (error) throw error;
  return true;
}
