/**
 * Services centralisés pour AfricaSuite PMS
 * 
 * Architecture unifiée :
 * - BaseService pour les opérations communes
 * - Services spécialisés par domaine métier
 * - Integration avec React Query via les fichiers queries/
 * - Logging et performance monitoring intégrés
 */

export { throwIfError, handleError, FilterBuilder } from './api.core';
export { rackService, RackService } from './rack.service';

// Types exportés
export type { ApiResponse, ApiMultiResponse, DateFilter, PaginationFilter, SearchFilter } from './api.core';

// Constantes exportées  
export { CommonStatuses, RoomStatuses, ReservationStatuses } from './api.core';