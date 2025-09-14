import { throwIfError, withPerformanceLogging, getTable, callRPC } from './api.core';
import type { Room, Reservation } from '@/features/rack/rack.types';

/**
 * Service modernisé pour la gestion du rack (chambres + réservations)
 */
class RackService {
  // --- ROOMS ---
  
  async getRooms(orgId: string): Promise<Room[]> {
    return withPerformanceLogging('getRooms', async () => {
      const { data, error } = await getTable('rooms')
        .select('*')
        .eq('org_id', orgId)
        .order('number', { ascending: true });
      
      return throwIfError(data, error) as any;
    });
  }

  async updateRoomStatus(roomId: string, status: string) {
    return withPerformanceLogging('updateRoomStatus', async () => {
      const { data, error } = await getTable('rooms')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', roomId)
        .select()
        .single();
      
      return throwIfError(data, error);
    });
  }

  // --- RESERVATIONS ---
  
  async getReservations(
    orgId: string, 
    startISO?: string, 
    endISO?: string
  ): Promise<Reservation[]> {
    return withPerformanceLogging('getReservations', async () => {
      let query = getTable('reservations')
        .select('*')
        .eq('org_id', orgId)
        .order('date_arrival', { ascending: true });

      // Filtrage par dates si fourni (chevauchement)
      if (startISO && endISO) {
        query = query
          .lte('date_arrival', endISO)
          .gte('date_departure', startISO);
      }

      const { data, error } = await query;
      return throwIfError(data, error) as any;
    });
  }

  // --- RACK OPERATIONS (RPC) ---
  
  async moveReservation(reservationId: string, roomId: string) {
    return withPerformanceLogging('moveReservation', async () => {
      const { data, error } = await callRPC('pms_move_reservation', {
        p_res: reservationId,
        p_room: roomId,
      });

      return throwIfError(data, error);
    });
  }

  async validateMove(reservationId: string, roomId: string) {
    return withPerformanceLogging('validateMove', async () => {
      const { data, error } = await callRPC('pms_validate_move', {
        p_res: reservationId,
        p_room: roomId,
      });

      return throwIfError(data, error);
    });
  }

  async assignRoom(reservationId: string, roomId: string) {
    return withPerformanceLogging('assignRoom', async () => {
      const { data, error } = await callRPC('pms_assign_room', {
        p_res: reservationId,
        p_room: roomId,
      });

      return throwIfError(data, error);
    });
  }

  async checkinReservation(reservationId: string) {
    return withPerformanceLogging('checkinReservation', async () => {
      const { data, error } = await callRPC('pms_checkin', {
        p_res: reservationId,
      });

      return throwIfError(data, error);
    });
  }

  // --- COMBINED OPERATIONS ---
  
  async getRackData(orgId: string, startISO: string, endISO: string) {
    return withPerformanceLogging('getRackData', async () => {
      // Fetch parallel pour performance
      const [rooms, reservations] = await Promise.all([
        this.getRooms(orgId),
        this.getReservations(orgId, startISO, endISO),
      ]);

      console.log(`📊 Rack data loaded: ${rooms.length} rooms, ${reservations.length} reservations`);
      
      return { rooms, reservations };
    });
  }

  // --- SEARCH & FILTERS ---
  
  async searchFreeRooms(
    orgId: string, 
    startDate: string, 
    endDate: string,
    excludeRoomIds: string[] = []
  ) {
    return withPerformanceLogging('searchFreeRooms', async () => {
      const { data, error } = await callRPC('pms_search_free_rooms', {
        p_org: orgId,
        p_start: startDate,
        p_end: endDate,
        p_exclude_room_ids: excludeRoomIds,
      });

      return throwIfError(data, error);
    });
  }

  // --- BATCH OPERATIONS ---
  
  async batchUpdateRoomStatuses(updates: Array<{ roomId: string; status: string }>) {
    return withPerformanceLogging('batchUpdateRoomStatuses', async () => {
      const promises = updates.map(({ roomId, status }) => 
        this.updateRoomStatus(roomId, status)
      );
      
      return Promise.all(promises);
    });
  }
}

// Export singleton instance
export const rackService = new RackService();

// Export class for testing
export { RackService };