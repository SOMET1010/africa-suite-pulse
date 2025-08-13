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
    // Simuler des données pour éviter les erreurs de build
    // TODO: Implémenter la vraie API quand les tables seront corrigées
    
    const mockCardex: CardexOverview = {
      reservation_id: reservationId,
      guest_name: "Client Test",
      room_number: "101",
      check_in: "2025-08-13",
      check_out: "2025-08-15",
      total_debit: 125000,
      total_credit: 50000,
      total_balance: 75000,
      folios: FOLIO_DEFINITIONS.map(def => ({
        folio_number: def.number,
        label: def.label,
        description: def.description,
        total_debit: def.number === 1 ? 85000 : def.number === 2 ? 40000 : 0,
        total_credit: def.number === 1 ? 30000 : def.number === 2 ? 20000 : 0,
        balance: def.number === 1 ? 55000 : def.number === 2 ? 20000 : 0,
        item_count: def.number <= 2 ? 3 : 0,
        last_activity: def.number <= 2 ? "2025-08-13T10:30:00Z" : undefined
      })),
      lines: [
        {
          id: "1",
          date: "2025-08-13T08:00:00Z",
          folio_number: 1,
          service_code: "ROOM",
          description: "Hébergement Chambre Standard",
          debit: 45000,
          credit: 0,
          balance: 45000,
          type: "accommodation",
          reference: "Nuit 1"
        },
        {
          id: "2", 
          date: "2025-08-13T10:30:00Z",
          folio_number: 2,
          service_code: "MEAL",
          description: "Petit déjeuner",
          debit: 15000,
          credit: 0,
          balance: 60000,
          type: "service",
          reference: "QTY: 2"
        },
        {
          id: "3",
          date: "2025-08-13T14:00:00Z",
          folio_number: 1,
          service_code: "PAYMENT",
          description: "Paiement Espèces",
          debit: 0,
          credit: 30000,
          balance: 30000,
          type: "payment",
          reference: "ESP001"
        }
      ],
      payment_summary: {
        total_paid: 50000,
        pending_amount: 75000,
        last_payment: "2025-08-13T14:00:00Z"
      }
    };

    return mockCardex;
  },

  // Ajouter une prestation rapide au cardex
  async quickPostService(reservationId: string, item: QuickPostingItem) {
    // Simuler l'ajout d'un service
    const mockService = {
      id: `service_${Date.now()}`,
      reservation_id: reservationId,
      service_id: item.service_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      folio_number: item.folio_number,
      created_at: new Date().toISOString()
    };

    return mockService;
  },

  // Transférer des lignes entre folios
  async transferBetweenFolios(reservationId: string, transfer: FolioTransfer) {
    // Simuler le transfert
    return {
      success: true,
      transfer_id: `transfer_${Date.now()}`,
      from_folio: transfer.from_folio,
      to_folio: transfer.to_folio,
      amount: transfer.amount,
      created_at: new Date().toISOString()
    };
  },

  // Obtenir l'historique des paiements pour une réservation
  async getPaymentHistory(reservationId: string): Promise<CardexPayment[]> {
    // Simuler l'historique des paiements
    return [
      {
        id: "payment_1",
        amount: 30000,
        method: "Espèces",
        reference: "ESP001",
        date: "2025-08-13T14:00:00Z",
        folio_number: 1,
        user_name: "Réceptionniste"
      },
      {
        id: "payment_2",
        amount: 20000,
        method: "Carte Bancaire",
        reference: "CB002",
        date: "2025-08-13T16:30:00Z",
        folio_number: 1,
        user_name: "Réceptionniste"
      }
    ];
  },

  // Rechercher les cardex par client
  async searchCardexByGuest(orgId: string, guestId: string) {
    // Simuler la recherche
    return [
      {
        id: "res_1",
        reference: "RES001",
        date_arrival: "2025-08-13",
        date_departure: "2025-08-15",
        rate_total: 125000,
        room_number: "101"
      }
    ];
  },

  // Obtenir les totaux pour un client sur plusieurs séjours
  async getGuestCardexSummary(orgId: string, guestId: string) {
    return {
      total_stays: 1,
      total_revenue: 125000,
      last_stay: "2025-08-13",
      average_stay_value: 125000
    };
  }
};