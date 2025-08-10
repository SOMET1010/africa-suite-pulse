import { supabase } from "@/integrations/supabase/client";
import type { ArrivalRow, AssignRoomInput, CheckinInput } from "./arrivals.types";

const sb = supabase as any;

function throwIfError<T>(data: T | null, error: any): T {
  if (error) throw error;
  if (!data) throw new Error("Aucune donnée reçue");
  return data;
}

/** Récupère les arrivées pour une date (ISO) */
export async function fetchArrivals(dateISO: string): Promise<ArrivalRow[]> {
  const { data, error } = await sb
    .from("reservations_view_arrivals")
    .select("*")
    .eq("date_arrival", dateISO)
    .order("planned_time", { ascending: true, nullsFirst: true });
  return throwIfError(data, error) as ArrivalRow[];
}

/** Assigner une chambre à une réservation */
export async function assignRoom(input: AssignRoomInput) {
  const { error } = await sb.rpc("pms_assign_room", {
    p_res: input.reservationId,
    p_room: input.roomId,
  });
  if (error) throw error;
  return true;
}

/** Effectuer le check-in (met status=present + crée une facture si absente) */
export async function checkin(input: CheckinInput) {
  const { error } = await sb.rpc("pms_checkin", {
    p_res: input.reservationId,
  });
  if (error) throw error;
  return true;
}
