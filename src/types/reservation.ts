/**
 * Types pour la gestion des réservations
 */

export type ReservationStatus = "option" | "confirmed" | "present" | "cancelled" | "noshow";

export interface Reservation {
  id: string;
  org_id: string;
  
  // Références
  reference?: string;
  
  // Client
  guest_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  
  // Chambre et dates
  room_id?: string;
  room_number?: string;
  room_type?: string;
  date_arrival: string;
  date_departure: string;
  planned_time?: string;
  
  // Occupants
  adults: number;
  children: number;
  
  // Tarification
  rate_total?: number;
  currency?: string;
  arrangement_id?: string;
  
  // Statut et workflow
  status: ReservationStatus;
  notes?: string;
  special_requests?: string;
  
  // Source de réservation
  source?: 'walk_in' | 'phone' | 'email' | 'website' | 'booking_com' | 'airbnb' | 'other';
  source_reference?: string;
  
  // Confirmation
  confirmed_at?: string;
  confirmed_by?: string;
  
  // Check-in/out
  checked_in_at?: string;
  checked_out_at?: string;
  
  // Système
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ReservationInsert {
  org_id: string;
  reference?: string;
  guest_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  room_id?: string;
  date_arrival: string;
  date_departure: string;
  planned_time?: string;
  adults: number;
  children: number;
  rate_total?: number;
  currency?: string;
  arrangement_id?: string;
  status: ReservationStatus;
  notes?: string;
  special_requests?: string;
  source?: string;
  source_reference?: string;
  created_by?: string;
}

export interface ReservationUpdate {
  reference?: string;
  guest_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  room_id?: string;
  date_arrival?: string;
  date_departure?: string;
  planned_time?: string;
  adults?: number;
  children?: number;
  rate_total?: number;
  currency?: string;
  arrangement_id?: string;
  status?: ReservationStatus;
  notes?: string;
  special_requests?: string;
  source?: string;
  source_reference?: string;
  confirmed_at?: string;
  confirmed_by?: string;
  checked_in_at?: string;
  checked_out_at?: string;
}

export interface ReservationFilters {
  status?: ReservationStatus | ReservationStatus[];
  date_arrival_from?: string;
  date_arrival_to?: string;
  date_departure_from?: string;
  date_departure_to?: string;
  room_type?: string;
  guest_type?: 'individual' | 'corporate' | 'group';
  source?: string;
  has_special_requests?: boolean;
  adults_min?: number;
  adults_max?: number;
  rate_min?: number;
  rate_max?: number;
}

export interface ReservationStats {
  total: number;
  options: number;
  confirmed: number;
  present: number;
  cancelled: number;
  noshow: number;
  total_revenue: number;
  avg_rate: number;
  occupancy_rate: number;
}

export interface ReservationSearchParams {
  search?: string;
  status?: ReservationStatus;
  date_from?: string;
  date_to?: string;
  room_type?: string;
  guest_type?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export interface AvailabilityCheck {
  date_arrival: string;
  date_departure: string;
  adults: number;
  children: number;
  room_type?: string;
}

export interface AvailableRoom {
  id: string;
  number: string;
  type: string;
  floor?: string;
  features?: Record<string, any>;
  base_rate?: number;
}

export interface RateCalculation {
  base_rate: number;
  total_rate: number;
  nights: number;
  breakdown: {
    date: string;
    rate: number;
    special_rate?: boolean;
    reason?: string;
  }[];
  discounts?: {
    type: string;
    amount: number;
    reason: string;
  }[];
  taxes?: {
    type: string;
    rate: number;
    amount: number;
  }[];
}