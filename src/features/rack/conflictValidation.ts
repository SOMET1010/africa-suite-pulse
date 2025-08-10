import type { Reservation, Room } from "./types";
import { overlapsDay } from "./rack.adapters";

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingReservations: Reservation[];
  targetRoom: Room;
  movingReservation: Reservation;
}

/**
 * Vérifie si deux périodes de réservation se chevauchent
 */
function periodsOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Détecte les conflits lors du déplacement d'une réservation
 */
export function detectConflicts(
  movingReservationId: string,
  targetRoomId: string,
  allReservations: Reservation[],
  allRooms: Room[]
): ConflictInfo {
  
  const movingReservation = allReservations.find(r => r.id === movingReservationId);
  const targetRoom = allRooms.find(r => r.id === targetRoomId);
  
  if (!movingReservation || !targetRoom) {
    return {
      hasConflict: false,
      conflictingReservations: [],
      targetRoom: targetRoom!,
      movingReservation: movingReservation!
    };
  }

  // Chercher les réservations existantes sur la chambre cible
  const existingReservations = allReservations.filter(r => 
    r.roomId === targetRoomId && 
    r.id !== movingReservationId // Exclure la réservation qu'on déplace
  );

  // Vérifier les chevauchements
  const conflictingReservations = existingReservations.filter(r =>
    periodsOverlap(
      movingReservation.start, movingReservation.end,
      r.start, r.end
    )
  );

  return {
    hasConflict: conflictingReservations.length > 0,
    conflictingReservations,
    targetRoom,
    movingReservation
  };
}

/**
 * Vérifie si une chambre est disponible pour une période donnée
 */
export function isRoomAvailable(
  roomId: string,
  startDate: string,
  endDate: string,
  allReservations: Reservation[],
  excludeReservationId?: string
): boolean {
  const existingReservations = allReservations.filter(r => 
    r.roomId === roomId && 
    r.id !== excludeReservationId
  );

  return !existingReservations.some(r =>
    periodsOverlap(startDate, endDate, r.start, r.end)
  );
}

/**
 * Formate les informations de conflit pour l'affichage
 */
export function formatConflictMessage(conflictInfo: ConflictInfo): string {
  const { conflictingReservations, targetRoom, movingReservation } = conflictInfo;
  
  if (conflictingReservations.length === 0) return "";
  
  const conflicts = conflictingReservations.map(r => 
    `${r.guestName} (${r.start} → ${r.end})`
  ).join(", ");
  
  return `La chambre ${targetRoom.number} a déjà une réservation qui chevauche : ${conflicts}. Voulez-vous déloger cette réservation ?`;
}