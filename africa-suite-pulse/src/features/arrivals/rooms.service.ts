import { supabase } from "@/integrations/supabase/client";

import type { PickableRoom } from '@/types/room';

export type { PickableRoom };

export async function fetchPickableRooms(q = ""): Promise<PickableRoom[]> {
  const sb = supabase as any;
  let req = sb.from("rooms")
    .select(`
      id,
      number,
      type,
      floor,
      status,
      room_types!inner(
        code,
        label,
        capacity
      )
    `)
    .order("number");
  const { data, error } = await req;
  if (error) throw error;
  
  const rows = (data ?? []).map(room => ({
    id: room.id,
    number: room.number,
    type: room.type,
    floor: room.floor,
    status: room.status,
    room_type: room.room_types ? {
      code: room.room_types.code,
      label: room.room_types.label,
      capacity: room.room_types.capacity
    } : undefined
  })) as PickableRoom[];
  
  if (!q) return rows;
  const qq = q.toLowerCase();
  return rows.filter(r =>
    `${r.number} ${r.type} ${r.room_type?.label ?? ""} ${r.floor ?? ""}`.toLowerCase().includes(qq)
  );
}