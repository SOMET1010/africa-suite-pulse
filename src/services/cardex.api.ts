import { supabase } from "@/integrations/supabase/client";
import type { 
  CardexOverview, 
  CardexLine, 
  FolioSummary, 
  CardexFilters,
  QuickPostingItem,
  FolioTransfer,
  CardexPayment
} from "@/types/cardex";
import { FOLIO_DEFINITIONS } from "@/types/billing";

/**
 * API Service pour le module Cardex
 */

export const cardexApi = {
  // Obtenir l'aperçu complet du cardex d'une réservation
  async getCardexOverview(reservationId: string): Promise<CardexOverview> {
    // Récupérer les services de réservation
    const { data: services, error: servicesError } = await supabase
      .from("reservation_services")
      .select(`
        *,
        service:services(code, label, price)
      `)
      .eq("reservation_id", reservationId)
      .order("created_at");

    if (servicesError) throw servicesError;

    // Récupérer les paiements
    const { data: payments, error: paymentsError } = await supabase
      .from("payment_transactions")
      .select(`
        *,
        payment_methods(label, code)
      `)
      .eq("reservation_id", reservationId)
      .order("created_at");

    if (paymentsError) throw paymentsError;

    // Récupérer les informations de la réservation
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations_view_arrivals")
      .select("*")
      .eq("id", reservationId)
      .single();

    if (reservationError) throw reservationError;

    // Construire les lignes du cardex
    const lines: CardexLine[] = [];
    
    // Ajouter les services
    services?.forEach(service => {
      lines.push({
        id: service.id,
        date: service.created_at,
        folio_number: service.folio_number,
        service_code: service.service?.code || 'UNKNOWN',
        description: service.service?.label || 'Service inconnu',
        debit: service.total_price,
        credit: 0,
        balance: service.total_price,
        type: 'service',
        reference: `QTY: ${service.quantity}`
      });
    });

    // Ajouter les paiements
    payments?.forEach(payment => {
      lines.push({
        id: payment.id,
        date: payment.created_at,
        folio_number: 1, // Les paiements vont généralement au folio 1
        service_code: 'PAYMENT',
        description: `Paiement ${payment.payment_methods?.label}`,
        debit: 0,
        credit: payment.amount,
        balance: -payment.amount,
        type: 'payment',
        reference: payment.reference || undefined
      });
    });

    // Trier par date
    lines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculer les balances cumulées
    let runningBalance = 0;
    lines.forEach(line => {
      runningBalance += line.debit - line.credit;
      line.balance = runningBalance;
    });

    // Calculer les résumés par folio
    const folios: FolioSummary[] = FOLIO_DEFINITIONS.map(def => {
      const folioLines = lines.filter(l => l.folio_number === def.number);
      const totalDebit = folioLines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = folioLines.reduce((sum, l) => sum + l.credit, 0);
      
      return {
        folio_number: def.number,
        label: def.label,
        description: def.description,
        total_debit: totalDebit,
        total_credit: totalCredit,
        balance: totalDebit - totalCredit,
        item_count: folioLines.length,
        last_activity: folioLines.length > 0 ? folioLines[folioLines.length - 1].date : undefined
      };
    });

    const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
    const totalPaid = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
      reservation_id: reservationId,
      guest_name: reservation.guest_name || 'Client',
      room_number: reservation.room_number,
      check_in: reservation.date_arrival,
      check_out: reservation.date_departure || reservation.date_arrival,
      total_debit: totalDebit,
      total_credit: totalCredit,
      total_balance: totalDebit - totalCredit,
      folios,
      lines,
      payment_summary: {
        total_paid: totalPaid,
        pending_amount: totalDebit - totalPaid,
        last_payment: payments?.length > 0 ? payments[payments.length - 1].created_at : undefined
      }
    };
  },

  // Ajouter une prestation rapide au cardex
  async quickPostService(reservationId: string, item: QuickPostingItem) {
    const { data, error } = await supabase
      .from("reservation_services")
      .insert({
        reservation_id: reservationId,
        service_id: item.service_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        folio_number: item.folio_number,
        billing_condition: 'stay',
        valid_from: new Date().toISOString(),
        valid_until: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Transférer des lignes entre folios
  async transferBetweenFolios(reservationId: string, transfer: FolioTransfer) {
    // Cette fonctionnalité nécessiterait une procédure stockée pour maintenir l'intégrité
    // Pour l'instant, on simule en créant des lignes d'ajustement
    const adjustments = transfer.line_ids.map(lineId => ({
      reservation_id: reservationId,
      service_id: 'TRANSFER',
      quantity: 1,
      unit_price: transfer.amount / transfer.line_ids.length,
      total_price: transfer.amount / transfer.line_ids.length,
      folio_number: transfer.to_folio,
      billing_condition: 'stay' as const,
      valid_from: new Date().toISOString(),
      valid_until: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from("reservation_services")
      .insert(adjustments)
      .select();

    if (error) throw error;
    return data;
  },

  // Obtenir l'historique des paiements pour une réservation
  async getPaymentHistory(reservationId: string): Promise<CardexPayment[]> {
    const { data, error } = await supabase
      .from("payment_transactions")
      .select(`
        *,
        payment_methods(label, code),
        app_users(full_name)
      `)
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(payment => ({
      id: payment.id,
      amount: payment.amount,
      method: payment.payment_methods?.label || 'Inconnu',
      reference: payment.reference,
      date: payment.created_at,
      folio_number: 1, // Les paiements vont généralement au folio 1
      user_name: payment.app_users?.full_name
    }));
  },

  // Rechercher les cardex par client
  async searchCardexByGuest(orgId: string, guestId: string) {
    const { data, error } = await supabase
      .from("reservations_view_arrivals")
      .select("id, reference, date_arrival, date_departure, rate_total, room_number")
      .eq("org_id", orgId)
      .eq("guest_id", guestId)
      .order("date_arrival", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtenir les totaux pour un client sur plusieurs séjours
  async getGuestCardexSummary(orgId: string, guestId: string) {
    // Cette requête nécessiterait des fonctions SQL personnalisées
    // Pour l'instant, on retourne un résumé basique
    const reservations = await this.searchCardexByGuest(orgId, guestId);
    
    const totalStays = reservations.length;
    const totalRevenue = reservations.reduce((sum, r) => sum + (r.rate_total || 0), 0);
    
    return {
      total_stays: totalStays,
      total_revenue: totalRevenue,
      last_stay: reservations[0]?.date_arrival,
      average_stay_value: totalStays > 0 ? totalRevenue / totalStays : 0
    };
  }
};