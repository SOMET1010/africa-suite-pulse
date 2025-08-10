// Central Room type definitions - unified from various files
export type RoomStatus = "clean" | "inspected" | "dirty" | "maintenance" | "out_of_order";

export interface Room {
  id?: string;
  org_id: string;
  number: string;
  type: string;
  floor: string | null;
  status: RoomStatus;
  is_fictive?: boolean;
  features?: RoomFeatures;
  created_at?: string;
  updated_at?: string;
  room_type_id?: string;
  user_id?: string;
  room_type?: {
    id: string;
    code: string;
    label: string;
    capacity: number;
  };
}

export interface RoomFeatures {
  balcony?: boolean;
  sea_view?: boolean;
  garden_view?: boolean;
  air_conditioning?: boolean;
  minibar?: boolean;
  safe?: boolean;
  wifi?: boolean;
  bathtub?: boolean;
  shower?: boolean;
  workspace?: boolean;
  [key: string]: boolean | undefined;
}

export interface CreateSeriesData {
  startNumber: number;
  endNumber: number;
  typeCode: string;
  floor: string;
  features: RoomFeatures;
  isFictive: boolean;
  prefix?: string;
  suffix?: string;
}

export interface RoomFilters {
  search: string;
  floor: string;
  type: string;
  status: string;
  fictive: string;
  features: string[];
}

export interface RoomStats {
  total: number;
  real: number;
  fictive: number;
  available: number;
  floors: string[];
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

// For arrivals module - lightweight room info
export type PickableRoom = {
  id: string;
  number: string;
  type: string;
  floor: string | null;
  status: RoomStatus;
};

// For rack module - UI adapted room
export interface UIRoom {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: RoomStatus;
}