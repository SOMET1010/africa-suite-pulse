export type RoomStatus = "clean" | "inspected" | "dirty" | "maintenance" | "out_of_order";
export type ReservationStatus = "option" | "confirmed" | "present" | "cancelled" | "noshow";

// Database types (from Supabase)
export type Room = {
  id: string;
  org_id: string;
  number: string;
  type: string;
  floor: string | null;
  status: RoomStatus;
};

export type Reservation = {
  id: string;
  org_id: string;
  client_id: string;
  room_id: string | null;
  status: ReservationStatus;
  date_arrival: string;   // ISO
  date_departure: string; // ISO
  planned_time: string | null;
  adults: number | null;
  children: number | null;
  rate_total: number | null;
  reference: string | null;
};

// UI adapted types
export interface UIRoom {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: RoomStatus;
}

export interface UIReservation {
  id: string;
  guestName: string;
  status: ReservationStatus;
  ae: "A" | "E";
  nights: number;
  rate: number;
  roomId: string | null;
  start: string; // ISO date
  end: string; // ISO date (exclusive)
}

export interface RackData {
  days: string[]; // 7 days ISO
  rooms: UIRoom[];
  reservations: UIReservation[];
}
