export type RoomStatus = "clean" | "inspected" | "dirty" | "maintenance" | "out_of_order";
export type ReservationStatus = "confirmed" | "present" | "option" | "cancelled";

export interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: RoomStatus;
}

export interface DayCell {
  date: string; // ISO
  reservationId?: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  status: ReservationStatus;
  ae: "A" | "E";
  nights: number;
  rate: number;
  roomId: string;
  start: string; // ISO date
  end: string; // ISO date (exclusive)
}

export interface RackData {
  days: string[]; // 7 days ISO
  rooms: Room[];
  reservations: Reservation[];
}
