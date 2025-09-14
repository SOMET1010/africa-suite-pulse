export type DepartureRow = {
  id: string;
  org_id: string;
  date_departure: string;       // ISO date
  planned_time: string | null;
  status: "checked_in" | "checked_out" | "cancelled";
  room_id: string | null;
  room_number: string | null;
  guest_name: string;          // "Nom Prénom"
  adults: number | null;
  children: number | null;
  rate_total: number | null;
  balance_due: number | null;
  reference: string | null;
};

export type CheckoutInput = { reservationId: string };