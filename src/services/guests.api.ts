import { supabase } from "@/integrations/supabase/client";
import type { Guest, GuestInsert, GuestUpdate, GuestStayHistory, GuestFilters } from "@/types/guest";
import { ApiHelpers, FilterBuilder } from "./api.core";

/**
 * API Service pour la gestion des clients/hôtes
 */

export const guestsApi = {
  // Lister les clients avec filtres
  async list(orgId: string, filters?: GuestFilters) {
    let query = supabase
      .from("guests")
      .select("*")
      .eq("org_id", orgId)
      .order("last_name")
      .order("first_name");

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    if (filters?.guest_type) {
      query = query.eq("guest_type", filters.guest_type);
    }

    if (filters?.vip_status !== undefined) {
      query = query.eq("vip_status", filters.vip_status);
    }

    if (filters?.nationality) {
      query = query.eq("nationality", filters.nationality);
    }

    return query;
  },

  // Obtenir un client par ID
  async getById(id: string) {
    return supabase
      .from("guests")
      .select("*")
      .eq("id", id)
      .single();
  },

  // Créer un nouveau client
  async create(guest: GuestInsert) {
    return supabase
      .from("guests")
      .insert(guest)
      .select()
      .single();
  },

  // Mettre à jour un client
  async update(id: string, updates: GuestUpdate) {
    return supabase
      .from("guests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
  },

  // Supprimer un client
  async delete(id: string) {
    return supabase
      .from("guests")
      .delete()
      .eq("id", id);
  },

  // Rechercher des clients par nom/email/téléphone
  async search(orgId: string, searchTerm: string) {
    return supabase
      .from("guests")
      .select("id, first_name, last_name, email, phone, guest_type, vip_status")
      .eq("org_id", orgId)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order("last_name")
      .limit(10);
  },

  // Historique des séjours d'un client
  async getStayHistory(guestId: string) {
    return supabase
      .from("guest_stay_history")
      .select("*")
      .eq("guest_id", guestId)
      .order("date_arrival", { ascending: false });
  },

  // Vérifier si un client existe par email
  async findByEmail(orgId: string, email: string) {
    return supabase
      .from("guests")
      .select("*")
      .eq("org_id", orgId)
      .eq("email", email)
      .maybeSingle();
  },

  // Statistiques des clients
  async getStats(orgId: string) {
    const { data: total } = await supabase
      .from("guests")
      .select("id", { count: "exact" })
      .eq("org_id", orgId);

    const { data: vips } = await supabase
      .from("guests")
      .select("id", { count: "exact" })
      .eq("org_id", orgId)
      .eq("vip_status", true);

    const { data: corporate } = await supabase
      .from("guests")
      .select("id", { count: "exact" })
      .eq("org_id", orgId)
      .eq("guest_type", "corporate");

    return {
      total: total?.length || 0,
      vips: vips?.length || 0,
      corporate: corporate?.length || 0,
    };
  }
};