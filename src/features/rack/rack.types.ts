/**
 * 🔄 DEPRECATED - Use @/types/unified instead
 * 
 * These types are kept for backwards compatibility only.
 * New code should import from @/types/unified.ts
 */

export type {
  ReservationStatus,
  UIRoom,
  UIReservation,
  RackData,
  Reservation
} from '@/types/unified';

// Re-export Room for backwards compatibility
export type { Room, RoomStatus } from '@/types/room';
