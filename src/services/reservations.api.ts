import { supabase } from "@/integrations/supabase/client";
import type { 
  Reservation, 
  ReservationInsert, 
  ReservationUpdate, 
  ReservationFilters, 
  ReservationStats,
  ReservationSearchParams,
  AvailabilityCheck,
  AvailableRoom,
  RateCalculation
} from "@/types/reservation";

export const reservationsApi = {
  async list(orgId: string, params: ReservationSearchParams = {}) {
    let query = supabase
      .from('reservations')
      .select('*')
      .eq('org_id', orgId)
      .order('date_arrival', { ascending: false });

    // Filtres
    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.date_from) {
      query = query.gte('date_arrival', params.date_from);
    }

    if (params.date_to) {
      query = query.lte('date_arrival', params.date_to);
    }

    if (params.search) {
      query = query.or(`reference.ilike.%${params.search}%`);
    }

    // Pagination
    if (params.page && params.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Enrichir les données
    const enrichedData = (data || []).map(reservation => ({
      ...reservation,
      guest_name: (reservation as any).guests 
        ? `${(reservation as any).guests.first_name} ${(reservation as any).guests.last_name}`
        : 'Client Anonyme',
      guest_email: (reservation as any).guests?.email,
      guest_phone: (reservation as any).guests?.phone,
      room_number: (reservation as any).rooms?.number,
      room_type: (reservation as any).rooms?.type,
      // Ajouter des timestamps par défaut car la table n'a pas ces colonnes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return { data: enrichedData, error: null };
  },

  async get(id: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      // Enrichir les données
      const enrichedData = {
        ...data,
        guest_name: (data as any).guests 
          ? `${(data as any).guests.first_name} ${(data as any).guests.last_name}`
          : 'Client Anonyme',
        guest_email: (data as any).guests?.email,
        guest_phone: (data as any).guests?.phone,
        room_number: (data as any).rooms?.number,
        room_type: (data as any).rooms?.type,
        // Ajouter des timestamps par défaut car la table n'a pas ces colonnes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { data: enrichedData, error: null };
    }

    return { data: null, error: null };
  },

  async create(reservation: ReservationInsert) {
    // Générer une référence si pas fournie
    if (!reservation.reference) {
      const date = new Date();
      const ref = `RES${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      reservation.reference = ref;
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  async update(id: string, updates: ReservationUpdate) {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { data: null, error: null };
  },

  async getStats(orgId: string): Promise<ReservationStats> {
    const { data, error } = await supabase
      .from('reservations')
      .select('status, rate_total')
      .eq('org_id', orgId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      options: data?.filter(r => r.status === 'option').length || 0,
      confirmed: data?.filter(r => r.status === 'confirmed').length || 0,
      present: data?.filter(r => r.status === 'present').length || 0,
      cancelled: data?.filter(r => r.status === 'cancelled').length || 0,
      noshow: data?.filter(r => r.status === 'noshow').length || 0,
      total_revenue: data?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0,
      avg_rate: 0,
      occupancy_rate: 0,
    };

    stats.avg_rate = stats.total > 0 ? stats.total_revenue / stats.total : 0;

    return stats;
  },

  async checkAvailability(orgId: string, check: AvailabilityCheck): Promise<AvailableRoom[]> {
    const { data, error } = await supabase.rpc('pms_search_free_rooms', {
      p_org: orgId,
      p_start: check.date_arrival,
      p_end: check.date_departure,
      p_exclude_room_ids: []
    });

    if (error) throw error;

    return data || [];
  },

  async calculateRate(orgId: string, roomId: string, dateArrival: string, dateDeparture: string): Promise<RateCalculation> {
    // Pour l'instant, logique simplifiée
    // Plus tard, intégrer avec un système de tarification dynamique
    
    const startDate = new Date(dateArrival);
    const endDate = new Date(dateDeparture);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Tarif de base fictif - à remplacer par la vraie logique
    const baseRate = 50000; // 50,000 XOF par nuit
    
    const breakdown = [];
    for (let i = 0; i < nights; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      breakdown.push({
        date: currentDate.toISOString().split('T')[0],
        rate: baseRate,
        special_rate: false,
      });
    }

    return {
      base_rate: baseRate,
      total_rate: baseRate * nights,
      nights,
      breakdown,
    };
  },

  async confirm(id: string, confirmedBy: string) {
    return this.update(id, {
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: confirmedBy,
    });
  },

  async cancel(id: string, reason?: string) {
    return this.update(id, {
      status: 'cancelled',
      notes: reason ? `Annulée: ${reason}` : 'Annulée',
    });
  },

  async checkin(id: string) {
    return this.update(id, {
      status: 'present',
      checked_in_at: new Date().toISOString(),
    });
  },

  async checkout(id: string) {
    return this.update(id, {
      checked_out_at: new Date().toISOString(),
    });
  },

  async markNoShow(id: string) {
    return this.update(id, {
      status: 'noshow',
    });
  }
};