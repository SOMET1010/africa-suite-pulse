export interface ReservationGroup {
  id: string;
  org_id: string;
  name: string;
  leader_name: string;
  leader_email?: string;
  leader_phone?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  arrival_date: string;
  departure_date: string;
  group_type: 'tour' | 'business' | 'event' | 'wedding' | 'conference' | 'other';
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  total_rooms: number;
  total_guests: number;
  total_amount: number;
  special_requests?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ReservationGroupInsert {
  org_id: string;
  name: string;
  leader_name: string;
  leader_email?: string;
  leader_phone?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  arrival_date: string;
  departure_date: string;
  group_type: 'tour' | 'business' | 'event' | 'wedding' | 'conference' | 'other';
  status?: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  notes?: string;
  created_by?: string;
}

export interface ReservationGroupUpdate {
  name?: string;
  leader_name?: string;
  leader_email?: string;
  leader_phone?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  arrival_date?: string;
  departure_date?: string;
  group_type?: 'tour' | 'business' | 'event' | 'wedding' | 'conference' | 'other';
  status?: 'draft' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  notes?: string;
}

export interface ReservationGroupFilters {
  status?: string;
  group_type?: string;
  arrival_date_from?: string;
  arrival_date_to?: string;
  departure_date_from?: string;
  departure_date_to?: string;
  min_rooms?: number;
  max_rooms?: number;
  min_guests?: number;
  max_guests?: number;
}

export interface ReservationGroupSearchParams {
  search?: string;
  filters?: ReservationGroupFilters;
  sort_by?: 'name' | 'arrival_date' | 'departure_date' | 'total_rooms' | 'total_amount';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GroupReservation {
  id: string;
  group_id: string;
  guest_name: string;
  room_number?: string;
  room_type?: string;
  status: string;
  arrival_date: string;
  departure_date: string;
  adults: number;
  children: number;
  rate_total: number;
}

export interface ReservationGroupStats {
  total_groups: number;
  confirmed_groups: number;
  draft_groups: number;
  total_rooms: number;
  total_guests: number;
  total_revenue: number;
  avg_group_size: number;
}