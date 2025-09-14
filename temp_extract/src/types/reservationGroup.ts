export interface ReservationGroup {
  id: string;
  org_id: string;
  group_name: string;
  group_leader_name: string;
  group_leader_email?: string;
  group_leader_phone?: string;
  total_rooms: number;
  total_guests: number;
  group_rate?: number;
  special_requests?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ReservationGroupInsert {
  org_id: string;
  group_name: string;
  group_leader_name: string;
  group_leader_email?: string;
  group_leader_phone?: string;
  total_rooms?: number;
  total_guests?: number;
  group_rate?: number;
  special_requests?: string;
  notes?: string;
  created_by?: string;
}

export interface ReservationGroupUpdate {
  group_name?: string;
  group_leader_name?: string;
  group_leader_email?: string;
  group_leader_phone?: string;
  total_rooms?: number;
  total_guests?: number;
  group_rate?: number;
  special_requests?: string;
  notes?: string;
}

export interface ReservationGroupFilters {
  total_rooms_min?: number;
  total_rooms_max?: number;
  total_guests_min?: number;
  total_guests_max?: number;
  group_rate_min?: number;
  group_rate_max?: number;
}

export interface ReservationGroupSearchParams {
  search?: string;
  filters?: ReservationGroupFilters;
  sort_by?: 'group_name' | 'group_leader_name' | 'total_rooms' | 'group_rate' | 'created_at';
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
  total_rooms: number;
  total_guests: number;
  total_revenue: number;
  avg_group_size: number;
}