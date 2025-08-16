import { QueryClient } from '@tanstack/react-query';

// Configuration globale React Query pour AfricaSuite PMS - Optimisée Phase 2C
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache 5 minutes par défaut (stale time optimisé pour performance)
      staleTime: 5 * 60 * 1000,
      // Garde en cache 10 minutes (garbage collection optimisé)
      gcTime: 10 * 60 * 1000,
      // Retry 1 seule fois en production pour éviter les surcharges
      retry: (failureCount, error: any) => {
        // Ne pas retry les erreurs 4xx (bad request, unauthorized, etc.)
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1;
      },
      // Pas de refetch sur focus (performance critique)
      refetchOnWindowFocus: false,
      // Refetch en cas de reconnect avec throttling
      refetchOnReconnect: 'always',
      // Background refetch pour les données critiques
      refetchInterval: false, // Désactivé par défaut, activé par query
      // Stale-while-revalidate pour UX optimale
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry les mutations échouées 1 fois seulement
      retry: 1,
      // Timeout optimisé pour les mutations
      networkMode: 'online',
    },
  },
});

// Query keys centralisés pour éviter les doublons
export const queryKeys = {
  // Auth & Organization
  org: ['org'] as const,
  orgId: ['org', 'id'] as const,
  
  // Rooms & Reservations (Rack)
  rooms: (orgId: string) => ['rooms', orgId] as const,
  reservations: {
    all: (orgId: string, start?: string, end?: string) => 
      ['reservations', orgId, start, end] as const,
    groups: (orgId: string) => ['reservation-groups', orgId] as const,
    groupStats: (orgId: string) => ['reservation-group-stats', orgId] as const,
  },
  rackData: (orgId: string, start: string, end: string) => 
    ['rack', orgId, start, end] as const,
  
  // Arrivals & Departures
  arrivals: (orgId: string, date: string) => ['arrivals', orgId, date] as const,
  departures: (orgId: string, date: string) => ['departures', orgId, date] as const,
  pickableRooms: (orgId: string, query?: string) => 
    ['pickable-rooms', orgId, query] as const,
  
  // Payments
  paymentMethods: (orgId: string) => ['payment-methods', orgId] as const,
  paymentTerminals: (orgId: string) => ['payment-terminals', orgId] as const,
  currencies: (orgId: string) => ['currencies', orgId] as const,
  transactions: (invoiceId: string) => ['transactions', invoiceId] as const,
  paymentSummary: (invoiceId: string) => ['payment-summary', invoiceId] as const,
  
  // Settings
  hotelSettings: (orgId: string) => ['hotel-settings', orgId] as const,
  roomTypes: (orgId: string) => ['room-types', orgId] as const,
  services: (orgId: string) => ['services', orgId] as const,
  serviceFamilies: (orgId: string) => ['service-families', orgId] as const,
  arrangements: (orgId: string) => ['arrangements', orgId] as const,
  
  // Users
  users: (orgId: string) => ['users', orgId] as const,
  profiles: (orgId: string) => ['profiles', orgId] as const,
  permissions: ['permissions'] as const,
  
  // Loyalty
  customerLoyalty: (guestId: string) => ['customer-loyalty', guestId] as const,
  loyaltyTransactions: (guestId: string) => ['loyalty-transactions', guestId] as const,
  loyaltyProgram: (orgId: string) => ['loyalty-program', orgId] as const,
} as const;

// Helper pour invalider les queries liées au rack
export const invalidateRackQueries = (orgId: string) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.rooms(orgId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all(orgId) });
  queryClient.invalidateQueries({ queryKey: ['rack', orgId] });
};

// Helper pour invalider les queries de paiement
export const invalidatePaymentQueries = (orgId: string, invoiceId?: string) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods(orgId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.currencies(orgId) });
  if (invoiceId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions(invoiceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.paymentSummary(invoiceId) });
  }
};