import type { RackData, UIReservation, UIRoom } from "./rack.types";

/** Vrai si une résa occupe la nuit `dayISO` (arrival <= day < departure) */
export function overlapsDay(startISO: string, endISO: string, dayISO: string) {
  return startISO <= dayISO && dayISO < endISO;
}

/** Conflit si deux résas (mêmes dates ou chevauchement partiel) partagent la même room */
export function overlapsRange(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  // [aStart, aEnd) ∩ [bStart, bEnd) ≠ ∅
  return aStart < bEnd && bStart < aEnd;
}

/** La chambre est bloquée pour l'attribution? */
export function isRoomBlocked(status: UIRoom["status"]) {
  return status === "out_of_order" || status === "maintenance";
}

export type DropValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "BLOCKED" | "CONFLICT";
      conflicts?: UIReservation[];
    };

/**
 * Valide un drop : vérifie blocage de chambre + conflits de dates sur la room cible
 */
export function validateDrop(
  data: RackData,
  dragged: UIReservation,
  targetRoomId: string
): DropValidationResult {
  const room = data.rooms.find(r => r.id === targetRoomId);
  if (!room) return { ok: false, reason: "CONFLICT", conflicts: [] };
  if (isRoomBlocked(room.status)) return { ok: false, reason: "BLOCKED" };

  const conflicts = data.reservations.filter(r =>
    r.roomId === targetRoomId &&
    r.id !== dragged.id &&
    overlapsRange(r.start, r.end, dragged.start, dragged.end)
  );

  if (conflicts.length > 0) return { ok: false, reason: "CONFLICT", conflicts };
  return { ok: true };
}

/**
 * Essaie de trouver une chambre libre pour r (mêmes dates) dans la liste rooms.
 * On choisit la première chambre dont AUCUNE résa n'entre en conflit.
 */
export function findFirstFreeRoom(
  data: RackData,
  r: UIReservation,
  excludeRoomIds: string[] = []
): UIRoom | null {
  for (const room of data.rooms) {
    if (excludeRoomIds.includes(room.id)) continue;
    if (isRoomBlocked(room.status)) continue;
    const hasConflict = data.reservations.some(
      x => x.roomId === room.id && overlapsRange(x.start, x.end, r.start, r.end)
    );
    if (!hasConflict) return room;
  }
  return null;
}

/** Cas spécial : swap simple entre deux chambres si un seul conflit sur la cible */
export function canSwap(dragged: UIReservation, conflicts: UIReservation[]) {
  if (conflicts.length !== 1) return false;
  const c = conflicts[0];
  // mêmes dates exactes → swap pertinent
  return dragged.start === c.start && dragged.end === c.end;
}

// Legacy support - these types and functions are kept for backward compatibility
export interface ConflictInfo {
  hasConflict: boolean;
  conflictingReservations: UIReservation[];
  targetRoom: UIRoom;
  movingReservation: UIReservation;
}

/**
 * Legacy function for existing code compatibility
 */
export function detectConflicts(
  movingReservationId: string,
  targetRoomId: string,
  allReservations: UIReservation[],
  allRooms: UIRoom[]
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
    overlapsRange(
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