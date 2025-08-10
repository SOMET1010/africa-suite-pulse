export type ArrivalRow = {
  id: string;
  org_id: string;
  date_arrival: string;       // ISO date
  planned_time: string | null;
  status: "confirmed" | "present" | "option" | "cancelled" | "noshow";
  room_id: string | null;
  room_number: string | null;
  guest_name: string;         // "Nom Prénom"
  adults: number | null;
  children: number | null;
  rate_total: number | null;
  reference: string | null;
};

export type AssignRoomInput = { reservationId: string; roomId: string };
export type CheckinInput = { reservationId: string };
