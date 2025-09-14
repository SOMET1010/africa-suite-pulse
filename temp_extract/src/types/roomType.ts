// Room Type definitions - moved from settings/types.ts
export interface RoomType {
  id: string;
  org_id: string;
  code: string;
  label: string;
  capacity: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomTypeWithStock extends RoomType {
  stock?: number;
}