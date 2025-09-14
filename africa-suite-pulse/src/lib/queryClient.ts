import { QueryClient } from '@tanstack/react-query';

// Configuration globale React Query pour AfricaSuite PMS - Optimisée Phase 2C
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache optimisé selon la charte - 1 minute stale, 5 minutes GC
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      // Retry stratégique pour éviter les surcharges
      retry: (failureCount, error: any) => {
        // Ne pas retry les erreurs 4xx (bad request, unauthorized, etc.)
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2; // Max 2 retries
      },
      // Performance optimisée - pas de refetch sur focus
      refetchOnWindowFocus: false,
      // Reconnect intelligent
      refetchOnReconnect: 'always',
      // Background refetch désactivé par défaut
      refetchInterval: false,
      // Smart mounting - évite les refetch inutiles
      refetchOnMount: (query) => {
        // Ne refetch que si les données sont vraiment stale
        return query.state.dataUpdatedAt < Date.now() - (2 * 60 * 1000); // 2 minutes
      },
    },
    mutations: {
      // Retry les mutations échouées 1 fois seulement
      retry: 1,
      // Network mode online pour éviter les mutations hors ligne
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