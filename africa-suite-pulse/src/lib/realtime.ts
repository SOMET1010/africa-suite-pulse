import { supabase } from '@/integrations/supabase/client';
import { queryClient, invalidateRackQueries } from './queryClient';

/**
 * Configuration du temps réel pour AfricaSuite PMS
 * Utilise Supabase Realtime pour synchroniser automatiquement les données
 */

// Types des événements temps réel
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimePayload {
  eventType: RealtimeEvent;
  new: any;
  old: any;
  schema: string;
  table: string;
}

// Configuration des listeners temps réel
export function setupRealtimeListeners() {
  console.log("🔴 Setting up realtime listeners");

  // Channel pour les réservations
  const reservationsChannel = supabase
    .channel('reservations-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations'
      },
      (payload) => {
        console.log('🔄 Reservation change detected:', payload);
        handleReservationChange(payload);
      }
    )
    .subscribe();

  // Channel pour les chambres
  const roomsChannel = supabase
    .channel('rooms-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms'
      },
      (payload) => {
        console.log('🏠 Room change detected:', payload);
        handleRoomChange(payload);
      }
    )
    .subscribe();

  // Channel pour les transactions de paiement
  const paymentsChannel = supabase
    .channel('payments-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'payment_transactions'
      },
      (payload) => {
        console.log('💳 Payment change detected:', payload);
        handlePaymentChange(payload);
      }
    )
    .subscribe();

  // Retourner les channels pour cleanup
  return [reservationsChannel, roomsChannel, paymentsChannel];
}

// Gestionnaires d'événements spécifiques

function handleReservationChange(payload: any) {
  const { eventType, new: newData, old: oldData } = payload;
  const orgId = newData?.org_id || oldData?.org_id;

  if (!orgId) return;

  // Invalider les queries liées aux réservations
  invalidateRackQueries(orgId);
  
  // Invalider les queries d'arrivées si la date d'arrivée a changé
  if (newData?.date_arrival || oldData?.date_arrival) {
    const arrivalDate = newData?.date_arrival || oldData?.date_arrival;
    queryClient.invalidateQueries({ 
      queryKey: ['arrivals', orgId, arrivalDate] 
    });
  }

  console.log(`✅ Invalidated cache for reservation ${eventType}`);
}

function handleRoomChange(payload: any) {
  const { eventType, new: newData, old: oldData } = payload;
  const orgId = newData?.org_id || oldData?.org_id;

  if (!orgId) return;

  // Invalider les queries liées aux chambres
  invalidateRackQueries(orgId);
  
  // Invalider les chambres disponibles si le statut a changé
  if (newData?.status !== oldData?.status) {
    queryClient.invalidateQueries({ 
      queryKey: ['pickable-rooms', orgId] 
    });
  }

  console.log(`✅ Invalidated cache for room ${eventType}`);
}

function handlePaymentChange(payload: any) {
  const { eventType, new: newData, old: oldData } = payload;
  const orgId = newData?.org_id || oldData?.org_id;
  const invoiceId = newData?.invoice_id || oldData?.invoice_id;

  if (!orgId || !invoiceId) return;

  // Invalider les queries de paiement
  queryClient.invalidateQueries({ 
    queryKey: ['transactions', invoiceId] 
  });
  queryClient.invalidateQueries({ 
    queryKey: ['payment-summary', invoiceId] 
  });

  console.log(`✅ Invalidated cache for payment ${eventType}`);
}

// Cleanup function
export function cleanupRealtimeListeners(channels: any[]) {
  console.log("🔴 Cleaning up realtime listeners");
  
  channels.forEach(channel => {
    supabase.removeChannel(channel);
  });
}

// Hook pour utiliser le temps réel dans les composants
export function useRealtimeSync() {
  // Cette fonction peut être appelée dans App.tsx ou dans un provider
  // pour configurer automatiquement les listeners temps réel
  return {
    setup: setupRealtimeListeners,
    cleanup: cleanupRealtimeListeners,
  };
}