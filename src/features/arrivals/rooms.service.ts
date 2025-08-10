import { supabase } from "@/integrations/supabase/client";

export type PickableRoom = {
  id: string;
  number: string;
  type: string;
  floor: string | null;
  status: "clean" | "inspected" | "dirty" | "maintenance" | "out_of_order";
};

export async function fetchPickableRooms(q = ""): Promise<PickableRoom[]> {
  const sb = supabase as any;
  let req = sb.from("rooms").select("id,number,type,floor,status").order("number");
  const { data, error } = await req;
  if (error) throw error;
  const rows = (data ?? []) as PickableRoom[];
  if (!q) return rows;
  const qq = q.toLowerCase();
  return rows.filter(r =>
    `${r.number} ${r.type} ${r.floor ?? ""}`.toLowerCase().includes(qq)
  );
}