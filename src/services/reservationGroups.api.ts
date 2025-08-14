import { supabase } from '@/integrations/supabase/client';
import type { 
  ReservationGroup, 
  ReservationGroupInsert, 
  ReservationGroupUpdate,
  ReservationGroupSearchParams,
  ReservationGroupStats,
  GroupReservation
} from '@/types/reservationGroup';

export const reservationGroupsApi = {
  async list(orgId: string, params: ReservationGroupSearchParams = {}) {
    let query = supabase
      .from('reservation_groups')
      .select('*')
      .eq('org_id', orgId);

    // Apply search
    if (params.search) {
      query = query.or(`group_name.ilike.%${params.search}%,group_leader_name.ilike.%${params.search}%`);
    }

    // Apply filters
    if (params.filters) {
      const { filters } = params;
      if (filters.total_rooms_min) query = query.gte('total_rooms', filters.total_rooms_min);
      if (filters.total_rooms_max) query = query.lte('total_rooms', filters.total_rooms_max);
      if (filters.total_guests_min) query = query.gte('total_guests', filters.total_guests_min);
      if (filters.total_guests_max) query = query.lte('total_guests', filters.total_guests_max);
      if (filters.group_rate_min) query = query.gte('group_rate', filters.group_rate_min);
      if (filters.group_rate_max) query = query.lte('group_rate', filters.group_rate_max);
    }

    // Apply sorting
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const limit = params.limit || 50;
    const offset = ((params.page || 1) - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return data as ReservationGroup[];
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('reservation_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ReservationGroup;
  },

  async create(group: ReservationGroupInsert) {
    const { data, error } = await supabase
      .from('reservation_groups')
      .insert({
        ...group,
        total_rooms: group.total_rooms || 0,
        total_guests: group.total_guests || 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as ReservationGroup;
  },

  async update(id: string, updates: ReservationGroupUpdate) {
    const { data, error } = await supabase
      .from('reservation_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ReservationGroup;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('reservation_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStats(orgId: string): Promise<ReservationGroupStats> {
    const { data: groups, error } = await supabase
      .from('reservation_groups')
      .select('total_rooms, total_guests, group_rate')
      .eq('org_id', orgId);

    if (error) throw error;

    const totalGroups = groups?.length || 0;
    const totalRooms = groups?.reduce((sum, group) => sum + (group.total_rooms || 0), 0) || 0;
    const totalGuests = groups?.reduce((sum, group) => sum + (group.total_guests || 0), 0) || 0;
    const totalRevenue = groups?.reduce((sum, group) => sum + (group.group_rate || 0), 0) || 0;

    return {
      total_groups: totalGroups,
      total_rooms: totalRooms,
      total_guests: totalGuests,
      total_revenue: totalRevenue,
      avg_group_size: totalGroups > 0 ? totalRooms / totalGroups : 0
    };
  },

  async getGroupReservations(groupId: string): Promise<GroupReservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('id, group_id, status, date_arrival, date_departure, adults, children, rate_total')
      .eq('group_id', groupId);

    if (error) throw error;

    return data?.map(res => ({
      id: res.id,
      group_id: res.group_id,
      guest_name: 'N/A', // Will be populated later
      room_number: '',
      room_type: '',
      status: res.status,
      arrival_date: res.date_arrival,
      departure_date: res.date_departure,
      adults: res.adults || 0,
      children: res.children || 0,
      rate_total: res.rate_total || 0
    })) || [];
  },

  async linkReservation(reservationId: string, groupId: string) {
    const { error } = await supabase
      .from('reservations')
      .update({ group_id: groupId })
      .eq('id', reservationId);

    if (error) throw error;
  },

  async unlinkReservation(reservationId: string) {
    const { error } = await supabase
      .from('reservations')
      .update({ group_id: null })
      .eq('id', reservationId);

    if (error) throw error;
  }
};