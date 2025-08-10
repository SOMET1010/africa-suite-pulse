export type Room = {
  id: string;
  org_id: string;
  number: string;
  type: string;
  floor: string | null;
  status: "clean" | "inspected" | "dirty" | "maintenance" | "out_of_order";
};

export type Reservation = {
  id: string;
  org_id: string;
  client_id: string;
  room_id: string | null;
  status: "option" | "confirmed" | "present" | "cancelled" | "noshow";
  date_arrival: string;   // ISO
  date_departure: string; // ISO
  planned_time: string | null;
  adults: number | null;
  children: number | null;
  rate_total: number | null;
  reference: string | null;
};
