import { supabase } from '@/integrations/supabase/client';
import type { CreateTransactionInput } from '@/types/payments';

export interface RoomChargeData {
  roomNumber: string;
  guestName: string;
  amount: number;
  orderItems: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  signature: string;
}

export interface ActiveReservation {
  id: string;
  guest_id: string;
  room_id: string;
  guest_name: string;
  room_number: string;
  reference: string;
  status: string;
}

/**
 * Recherche une réservation active par numéro de chambre
 */
export async function searchActiveReservation(roomNumber: string): Promise<ActiveReservation | null> {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id,
      guest_id,
      room_id,
      reference,
      status,
      guests!guest_id(first_name, last_name),
      rooms!room_id(number)
    `)
    .eq('rooms.number', roomNumber)
    .eq('status', 'present')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    guest_id: data.guest_id,
    room_id: data.room_id,
    guest_name: `${data.guests.first_name} ${data.guests.last_name}`,
    room_number: data.rooms.number,
    reference: data.reference,
    status: data.status
  };
}

/**
 * Traite un room charge en créant les enregistrements nécessaires
 */
export async function processRoomCharge(
  reservationId: string,
  chargeData: RoomChargeData
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // 1. Récupérer la méthode de paiement Room Charge
    const { data: paymentMethod, error: methodError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('code', 'ROOM_CHARGE')
      .eq('active', true)
      .single();

    if (methodError || !paymentMethod) {
      return { success: false, error: 'Méthode de paiement Room Charge non configurée' };
    }

    // 2. Récupérer les informations de la réservation
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('org_id, id')
      .eq('id', reservationId)
      .single();

    if (resError || !reservation) {
      return { success: false, error: 'Réservation non trouvée' };
    }

    // 3. Créer une facture ou récupérer la facture existante
    let invoiceId: string;
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('reservation_id', reservationId)
      .eq('status', 'pending')
      .single();

    if (existingInvoice) {
      invoiceId = existingInvoice.id.toString();
    } else {
      // Créer une nouvelle facture
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          org_id: reservation.org_id,
          reservation_id: reservationId,
          guest_name: chargeData.guestName,
          room_number: chargeData.roomNumber,
          status: 'pending',
          subtotal: chargeData.amount,
          total_amount: chargeData.amount,
          description: 'Facturation chambre - Commande POS'
        })
        .select('id')
        .single();

      if (invoiceError || !newInvoice) {
        return { success: false, error: 'Erreur lors de la création de la facture' };
      }
      invoiceId = newInvoice.id.toString();
    }

    // 4. Ajouter les items à la facture
    const invoiceItems = chargeData.orderItems.map(item => ({
      org_id: reservation.org_id,
      invoice_id: parseInt(invoiceId),
      service_code: 'RESTO',
      description: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      folio_number: 2 // Folio extras par défaut
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      return { success: false, error: 'Erreur lors de l\'ajout des items' };
    }

    // 5. Créer la transaction de paiement
    const transactionData = {
      org_id: reservation.org_id,
      invoice_id: invoiceId,
      method_id: paymentMethod.id,
      amount: chargeData.amount,
      reference: `ROOM-${chargeData.roomNumber}-${Date.now()}`,
      metadata: {
        room_number: chargeData.roomNumber,
        guest_name: chargeData.guestName,
        signature: chargeData.signature,
        items_count: chargeData.orderItems.length
      } as any
    };

    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select('id')
      .single();

    if (txError || !transaction) {
      return { success: false, error: 'Erreur lors de la création de la transaction' };
    }

    return { 
      success: true, 
      transactionId: transaction.id 
    };

  } catch (error) {
    console.error('Erreur lors du traitement du room charge:', error);
    return { 
      success: false, 
      error: 'Erreur interne lors du traitement' 
    };
  }
}

/**
 * Récupère l'historique des room charges pour une réservation
 */
export async function getRoomChargeHistory(reservationId: string) {
  const { data, error } = await supabase
    .from('payment_transactions')
    .select(`
      id,
      amount,
      reference,
      created_at,
      metadata,
      payment_methods!inner(code, label)
    `)
    .eq('payment_methods.code', 'ROOM_CHARGE')
    .eq('metadata->>reservation_id', reservationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }

  return data || [];
}