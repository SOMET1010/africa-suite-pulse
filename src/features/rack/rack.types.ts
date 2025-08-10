// Re-export for backwards compatibility
export type { RoomStatus } from '@/types/room';
export type ReservationStatus = "option" | "confirmed" | "present" | "cancelled" | "noshow";

// Import unified Room type and re-export what we need for backwards compatibility
import type { Room as UnifiedRoom, RoomStatus } from '@/types/room';

export type Room = UnifiedRoom;

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
