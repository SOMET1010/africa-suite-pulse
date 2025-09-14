import { supabase } from '@/integrations/supabase/client';
import type { CreateTransactionInput } from '@/types/payments';

// ============================================================================
// CONSTANTS
// ============================================================================
const PAYMENT_METHOD_CODES = {
  ROOM_CHARGE: 'ROOM_CHARGE',
} as const;

const RESERVATION_STATUS = {
  PRESENT: 'present',
} as const;

const INVOICE_STATUS = {
  PENDING: 'pending',
} as const;

const SERVICE_CODES = {
  RESTO: 'RESTO',
} as const;

const DEFAULT_FOLIO_NUMBER = 2; // Folio extras par défaut

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface RoomChargeData {
  roomNumber: string;
  guestName: string;
  amount: number;
  orderItems: OrderItem[];
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
  org_id: string; // Ajouté pour éviter une requête supplémentaire
}

export interface RoomChargeResult {
  success: boolean;
  transactionId?: string;
  invoiceId?: string;
  error?: string;
  errorCode?: string;
}

export interface RoomChargeHistoryItem {
  id: string;
  amount: number;
  reference: string;
  created_at: string;
  metadata: Record<string, any>;
  payment_method: {
    code: string;
    label: string;
  };
}

// ============================================================================
// ERROR CODES
// ============================================================================
export const ERROR_CODES = {
  RESERVATION_NOT_FOUND: 'RESERVATION_NOT_FOUND',
  PAYMENT_METHOD_NOT_CONFIGURED: 'PAYMENT_METHOD_NOT_CONFIGURED',
  INVOICE_CREATION_FAILED: 'INVOICE_CREATION_FAILED',
  INVOICE_ITEMS_CREATION_FAILED: 'INVOICE_ITEMS_CREATION_FAILED',
  TRANSACTION_CREATION_FAILED: 'TRANSACTION_CREATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================
function validateRoomChargeData(data: RoomChargeData): string | null {
  if (!data.roomNumber?.trim()) {
    return 'Le numéro de chambre est requis';
  }
  
  if (!data.guestName?.trim()) {
    return 'Le nom du client est requis';
  }
  
  if (!data.amount || data.amount <= 0) {
    return 'Le montant doit être supérieur à zéro';
  }
  
  if (!data.orderItems || data.orderItems.length === 0) {
    return 'Au moins un article est requis';
  }
  
  // Validation des items
  for (const item of data.orderItems) {
    if (!item.product_name?.trim()) {
      return 'Tous les articles doivent avoir un nom';
    }
    if (!item.quantity || item.quantity <= 0) {
      return 'Tous les articles doivent avoir une quantité valide';
    }
    if (!item.unit_price || item.unit_price <= 0) {
      return 'Tous les articles doivent avoir un prix unitaire valide';
    }
    if (item.total_price !== item.quantity * item.unit_price) {
      return 'Le prix total des articles ne correspond pas au calcul quantité × prix unitaire';
    }
  }
  
  // Vérification du montant total
  const calculatedTotal = data.orderItems.reduce((sum, item) => sum + item.total_price, 0);
  if (Math.abs(calculatedTotal - data.amount) > 0.01) { // Tolérance pour les erreurs d'arrondi
    return 'Le montant total ne correspond pas à la somme des articles';
  }
  
  return null;
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Recherche une réservation active par numéro de chambre
 * @param roomNumber - Numéro de chambre à rechercher
 * @returns Promise<ActiveReservation | null>
 */
export async function searchActiveReservation(roomNumber: string): Promise<ActiveReservation | null> {
  try {
    if (!roomNumber?.trim()) {
      return null;
    }

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_id,
        room_id,
        reference,
        status,
        org_id,
        guests!guest_id(first_name, last_name),
        rooms!room_id(number)
      `)
      .eq('rooms.number', roomNumber.trim())
      .eq('status', RESERVATION_STATUS.PRESENT)
      .maybeSingle(); // Utilise maybeSingle au lieu de single pour éviter les erreurs si aucun résultat

    if (error) {
      console.error('Erreur lors de la recherche de réservation:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      guest_id: data.guest_id,
      room_id: data.room_id,
      guest_name: `${data.guests.first_name} ${data.guests.last_name}`,
      room_number: data.rooms.number,
      reference: data.reference,
      status: data.status,
      org_id: data.org_id,
    };
  } catch (error) {
    console.error('Erreur lors de la recherche de réservation:', error);
    return null;
  }
}

/**
 * Récupère ou crée une facture pour la réservation
 */
async function getOrCreateInvoice(
  reservation: ActiveReservation,
  chargeData: RoomChargeData
): Promise<{ invoiceId: string; error?: string }> {
  try {
    // Chercher une facture existante
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('reservation_id', reservation.id)
      .eq('status', INVOICE_STATUS.PENDING)
      .maybeSingle();

    if (existingInvoice) {
      return { invoiceId: existingInvoice.id.toString() };
    }

    // Créer une nouvelle facture
    const { data: newInvoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        org_id: reservation.org_id,
        reservation_id: reservation.id,
        guest_name: chargeData.guestName,
        room_number: chargeData.roomNumber,
        status: INVOICE_STATUS.PENDING,
        subtotal: chargeData.amount,
        total_amount: chargeData.amount,
        description: 'Facturation chambre - Commande POS'
      })
      .select('id')
      .single();

    if (invoiceError || !newInvoice) {
      console.error('Erreur lors de la création de la facture:', invoiceError);
      return { 
        invoiceId: '',
        error: 'Erreur lors de la création de la facture'
      };
    }

    return { invoiceId: newInvoice.id.toString() };
  } catch (error) {
    console.error('Erreur lors de la gestion de la facture:', error);
    return { 
      invoiceId: '',
      error: 'Erreur interne lors de la gestion de la facture'
    };
  }
}

/**
 * Ajoute les items à la facture
 */
async function addInvoiceItems(
  orgId: string,
  invoiceId: string,
  orderItems: OrderItem[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const invoiceItems = orderItems.map(item => ({
      org_id: orgId,
      invoice_id: parseInt(invoiceId),
      service_code: SERVICE_CODES.RESTO,
      description: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      folio_number: DEFAULT_FOLIO_NUMBER
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Erreur lors de l\'ajout des items:', itemsError);
      return { 
        success: false, 
        error: 'Erreur lors de l\'ajout des items à la facture'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ajout des items:', error);
    return { 
      success: false, 
      error: 'Erreur interne lors de l\'ajout des items'
    };
  }
}

/**
 * Crée la transaction de paiement
 */
async function createPaymentTransaction(
  reservation: ActiveReservation,
  chargeData: RoomChargeData,
  invoiceId: string,
  paymentMethodId: string
): Promise<{ transactionId?: string; error?: string }> {
  try {
    const transactionData = {
      org_id: reservation.org_id,
      invoice_id: invoiceId,
      method_id: paymentMethodId,
      amount: chargeData.amount,
      reference: `ROOM-${chargeData.roomNumber}-${Date.now()}`,
      metadata: {
        room_number: chargeData.roomNumber,
        guest_name: chargeData.guestName,
        signature: chargeData.signature,
        items_count: chargeData.orderItems.length,
        reservation_id: reservation.id // Ajouté pour faciliter les recherches
      } as any
    };

    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .insert(transactionData)
      .select('id')
      .single();

    if (txError || !transaction) {
      console.error('Erreur lors de la création de la transaction:', txError);
      return { error: 'Erreur lors de la création de la transaction' };
    }

    return { transactionId: transaction.id };
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    return { error: 'Erreur interne lors de la création de la transaction' };
  }
}

/**
 * Traite un room charge en créant les enregistrements nécessaires
 * @param reservationId - ID de la réservation
 * @param chargeData - Données de la charge
 * @returns Promise<RoomChargeResult>
 */
export async function processRoomCharge(
  reservationId: string,
  chargeData: RoomChargeData
): Promise<RoomChargeResult> {
  try {
    // 1. Validation des données d'entrée
    const validationError = validateRoomChargeData(chargeData);
    if (validationError) {
      return { 
        success: false, 
        error: validationError,
        errorCode: ERROR_CODES.INVALID_INPUT
      };
    }

    // 2. Récupérer la méthode de paiement Room Charge
    const { data: paymentMethod, error: methodError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('code', PAYMENT_METHOD_CODES.ROOM_CHARGE)
      .eq('active', true)
      .maybeSingle();

    if (methodError || !paymentMethod) {
      console.error('Méthode de paiement non trouvée:', methodError);
      return { 
        success: false, 
        error: 'Méthode de paiement Room Charge non configurée',
        errorCode: ERROR_CODES.PAYMENT_METHOD_NOT_CONFIGURED
      };
    }

    // 3. Récupérer les informations de la réservation
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('org_id, id')
      .eq('id', reservationId)
      .maybeSingle();

    if (resError || !reservation) {
      console.error('Réservation non trouvée:', resError);
      return { 
        success: false, 
        error: 'Réservation non trouvée',
        errorCode: ERROR_CODES.RESERVATION_NOT_FOUND
      };
    }

    const reservationData: ActiveReservation = {
      ...reservation,
      guest_name: chargeData.guestName,
      room_number: chargeData.roomNumber,
      guest_id: '', // Ces champs ne sont pas nécessaires pour le processus
      room_id: '',
      reference: '',
      status: ''
    };

    // 4. Gérer la facture
    const { invoiceId, error: invoiceError } = await getOrCreateInvoice(
      reservationData,
      chargeData
    );

    if (invoiceError) {
      return { 
        success: false, 
        error: invoiceError,
        errorCode: ERROR_CODES.INVOICE_CREATION_FAILED
      };
    }

    // 5. Ajouter les items à la facture
    const { success: itemsSuccess, error: itemsError } = await addInvoiceItems(
      reservation.org_id,
      invoiceId,
      chargeData.orderItems
    );

    if (!itemsSuccess) {
      return { 
        success: false, 
        error: itemsError,
        errorCode: ERROR_CODES.INVOICE_ITEMS_CREATION_FAILED
      };
    }

    // 6. Créer la transaction de paiement
    const { transactionId, error: txError } = await createPaymentTransaction(
      reservationData,
      chargeData,
      invoiceId,
      paymentMethod.id
    );

    if (txError) {
      return { 
        success: false, 
        error: txError,
        errorCode: ERROR_CODES.TRANSACTION_CREATION_FAILED
      };
    }

    return { 
      success: true, 
      transactionId,
      invoiceId
    };

  } catch (error) {
    console.error('Erreur lors du traitement du room charge:', error);
    return { 
      success: false, 
      error: 'Erreur interne lors du traitement',
      errorCode: ERROR_CODES.INTERNAL_ERROR
    };
  }
}

/**
 * Récupère l'historique des room charges pour une réservation
 * @param reservationId - ID de la réservation
 * @returns Promise<RoomChargeHistoryItem[]>
 */
export async function getRoomChargeHistory(reservationId: string): Promise<RoomChargeHistoryItem[]> {
  try {
    if (!reservationId?.trim()) {
      return [];
    }

    const { data, error } = await supabase
      .from('payment_transactions')
      .select(`
        id,
        amount,
        reference,
        created_at,
        metadata,
        payment_methods!method_id(code, label)
      `)
      .eq('payment_methods.code', PAYMENT_METHOD_CODES.ROOM_CHARGE)
      .eq('metadata->>reservation_id', reservationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      amount: item.amount,
      reference: item.reference,
      created_at: item.created_at,
      metadata: item.metadata as Record<string, any>,
      payment_method: {
        code: (item.payment_methods as any)?.code || '',
        label: (item.payment_methods as any)?.label || ''
      }
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
}

/**
 * Récupère les statistiques des room charges pour une période donnée
 * @param orgId - ID de l'organisation
 * @param startDate - Date de début (optionnel)
 * @param endDate - Date de fin (optionnel)
 */
export async function getRoomChargeStats(
  orgId: string,
  startDate?: string,
  endDate?: string
) {
  try {
    let query = supabase
      .from('payment_transactions')
      .select(`
        amount,
        created_at,
        payment_methods!inner(code)
      `)
      .eq('org_id', orgId)
      .eq('payment_methods.code', PAYMENT_METHOD_CODES.ROOM_CHARGE);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }

    const transactions = data || [];
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const count = transactions.length;
    const averageAmount = count > 0 ? totalAmount / count : 0;

    return {
      totalAmount,
      count,
      averageAmount,
      transactions
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return null;
  }
}