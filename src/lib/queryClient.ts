import { QueryClient } from '@tanstack/react-query';

// Configuration globale React Query pour AfricaSuite PMS
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache 5 minutes par défaut
      staleTime: 5 * 60 * 1000,
      // Garde en cache 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry une fois seulement
      retry: 1,
      // Refetch en cas de focus window
      refetchOnWindowFocus: false,
      // Refetch en cas de reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry les mutations échouées
      retry: 1,
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
  reservations: (orgId: string, start?: string, end?: string) => 
    ['reservations', orgId, start, end] as const,
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
  queryClient.invalidateQueries({ queryKey: queryKeys.reservations(orgId) });
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