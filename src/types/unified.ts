/**
 * 🎯 Types unifiés pour AfricaSuite PMS
 * 
 * Centralise tous les types de l'application pour éviter la fragmentation
 * et assurer la cohérence entre les différents modules.
 */

// Re-export des types Supabase
export type { Database } from '@/integrations/supabase/types';

// === TYPES CORE ===
export type { Room, RoomStatus } from '@/types/room';
export type { RoomType } from '@/types/roomType';

// === TYPES UTILISATEURS ===
export type { 
  Profile, 
  ProfileInsert, 
  ProfileUpdate,
  Permission,
  ProfilePermission,
  ProfilePermissionInsert,
  AppUser,
  AppUserInsert,
  AppUserUpdate,
  StaffInvitation,
  StaffInvitationInsert,
  InvitationPayload
} from '@/types/database';

// === TYPES PAIEMENTS ===
export type {
  PaymentMethod,
  PaymentMethodInsert,
  PaymentMethodUpdate,
  PaymentTerminal,
  PaymentTerminalInsert,
  PaymentTerminalUpdate,
  Currency,
  CurrencyInsert,
  CurrencyUpdate,
  PaymentTransaction,
  PaymentTransactionInsert,
  PaymentTransactionUpdate,
  PaymentTransactionWithMethod
} from '@/types/database';

// === TYPES SERVICES ===
export type {
  ServiceFamily,
  ServiceFamilyInsert,
  ServiceFamilyUpdate,
  Service,
  ServiceInsert,
  ServiceUpdate,
  ArrangementService,
  Arrangement,
  ArrangementInsert,
  ArrangementUpdate,
  ServiceStats
} from '@/types/database';

// === TYPES RACK (UI optimisés) ===
export type ReservationStatus = "option" | "confirmed" | "present" | "cancelled" | "noshow";

export type UIRoom = {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: import('@/types/room').RoomStatus;
};

export type UIReservation = {
  id: string;
  guestName: string;
  status: ReservationStatus;
  ae: "A" | "E";
  nights: number;
  rate: number;
  roomId: string | null;
  start: string; // ISO date
  end: string; // ISO date (exclusive)
};

export type RackData = {
  days: string[]; // 7 days ISO
  rooms: UIRoom[];
  reservations: UIReservation[];
};

export type Reservation = {
  id: string;
  org_id: string;
  guest_id?: string;
  room_id: string | null;
  status: ReservationStatus;
  date_arrival: string;   // ISO
  date_departure: string; // ISO
  planned_time: string | null;
  adults: number | null;
  children: number | null;
  rate_total: number | null;
  reference: string | null;
  // Champs système (optionnels selon contexte)
  created_at?: string;
  updated_at?: string;
};

// === TYPES API ===
export type {
  HasPermissionResponse,
  SupabaseResponse,
  SupabaseMultiResponse
} from '@/types/database';

// === TYPES FILTERS ===
export type DateFilter = {
  start?: string;
  end?: string;
};

export type PaginationFilter = {
  page?: number;
  limit?: number;
};

export type SearchFilter = {
  query?: string;
  fields?: string[];
};

// === TYPES COMMON ===
export type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

export type ApiMultiResponse<T> = {
  data: T[] | null;
  error: Error | null;
  loading: boolean;
  count?: number;
};