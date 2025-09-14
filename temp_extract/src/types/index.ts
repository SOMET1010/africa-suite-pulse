/**
 * 🎯 Types centralisés pour AfricaSuite PMS
 * 
 * Point d'entrée unique pour tous les types de l'application.
 * Utilise le système de types unifié pour éviter la fragmentation.
 */

// Export principal - Types unifiés
export * from './unified';

// Backward compatibility exports (deprecated - avoid name conflicts)
export type { Database } from './database';
export type { Room, RoomStatus } from './room';
export type { RoomType } from './roomType';