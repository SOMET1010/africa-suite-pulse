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
      .select(`
        *,
        reservations:reservations(count)
      `)
      .eq('org_id', orgId);

    // Apply search
    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,leader_name.ilike.%${params.search}%,contact_person.ilike.%${params.search}%`);
    }

    // Apply filters
    if (params.filters) {
      const { filters } = params;
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.group_type) query = query.eq('group_type', filters.group_type);
      if (filters.arrival_date_from) query = query.gte('arrival_date', filters.arrival_date_from);
      if (filters.arrival_date_to) query = query.lte('arrival_date', filters.arrival_date_to);
      if (filters.departure_date_from) query = query.gte('departure_date', filters.departure_date_from);
      if (filters.departure_date_to) query = query.lte('departure_date', filters.departure_date_to);
      if (filters.min_rooms) query = query.gte('total_rooms', filters.min_rooms);
      if (filters.max_rooms) query = query.lte('total_rooms', filters.max_rooms);
      if (filters.min_guests) query = query.gte('total_guests', filters.min_guests);
      if (filters.max_guests) query = query.lte('total_guests', filters.max_guests);
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

    // Calculate totals for each group
    return data?.map(group => ({
      ...group,
      total_rooms: group.reservations?.[0]?.count || 0,
      total_guests: 0, // Will be calculated from reservations
      total_amount: 0  // Will be calculated from reservations
    })) as ReservationGroup[];
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('reservation_groups')
      .select(`
        *,
        reservations:reservations(
          id, guest_id, room_id, status,
          date_arrival, date_departure,
          adults, children, rate_total,
          guests:guests(first_name, last_name),
          rooms:rooms(number, type)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Calculate totals from linked reservations
    const reservations = data.reservations || [];
    const totalRooms = reservations.length;
    const totalGuests = reservations.reduce((sum, res) => sum + (res.adults || 0) + (res.children || 0), 0);
    const totalAmount = reservations.reduce((sum, res) => sum + (res.rate_total || 0), 0);

    return {
      ...data,
      total_rooms: totalRooms,
      total_guests: totalGuests,
      total_amount: totalAmount
    } as ReservationGroup;
  },

  async create(group: ReservationGroupInsert) {
    const { data, error } = await supabase
      .from('reservation_groups')
      .insert(group)
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
      .select(`
        status,
        reservations:reservations(adults, children, rate_total)
      `)
      .eq('org_id', orgId);

    if (error) throw error;

    const totalGroups = groups?.length || 0;
    const confirmedGroups = groups?.filter(g => g.status === 'confirmed').length || 0;
    const draftGroups = groups?.filter(g => g.status === 'draft').length || 0;
    
    let totalRooms = 0;
    let totalGuests = 0;
    let totalRevenue = 0;

    groups?.forEach(group => {
      const reservations = group.reservations || [];
      totalRooms += reservations.length;
      reservations.forEach(res => {
        totalGuests += (res.adults || 0) + (res.children || 0);
        totalRevenue += res.rate_total || 0;
      });
    });

    return {
      total_groups: totalGroups,
      confirmed_groups: confirmedGroups,
      draft_groups: draftGroups,
      total_rooms,
      total_guests,
      total_revenue: totalRevenue,
      avg_group_size: totalGroups > 0 ? totalRooms / totalGroups : 0
    };
  },

  async getGroupReservations(groupId: string): Promise<GroupReservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id, group_id, status, date_arrival, date_departure,
        adults, children, rate_total,
        guests:guests(first_name, last_name),
        rooms:rooms(number, type)
      `)
      .eq('group_id', groupId);

    if (error) throw error;

    return data?.map(res => ({
      id: res.id,
      group_id: res.group_id,
      guest_name: res.guests ? `${res.guests.first_name} ${res.guests.last_name}` : 'N/A',
      room_number: res.rooms?.number,
      room_type: res.rooms?.type,
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