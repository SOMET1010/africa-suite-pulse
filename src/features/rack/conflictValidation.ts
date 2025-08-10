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

/** score d'aptitude d'une chambre pour reloger une résa */
function scoreRoomFit(room: UIRoom, r: UIReservation, ref?: { type?: string; floor?: number }) {
  let s = 0;

  // 1) disponibilité stricte
  // (le filtre d'indisponibilité est géré avant; ici, on score les préférences)
  // 2) préférences de matching
  if (ref?.type && room.type === ref.type) s += 3;
  if (ref?.floor != null && room.floor === ref.floor) s += 2;

  // 3) état de chambre (propre/contrôlée > sale > maintenance/hs déjà exclus)
  if (room.status === "clean" || room.status === "inspected") s += 2;
  if (room.status === "dirty") s += 1;

  // 4) proximité par numéro (si format numérique)
  const rn = parseInt(String(room.number), 10);
  const base = parseInt(String(r.roomId ?? ""), 10);
  if (!Number.isNaN(rn) && !Number.isNaN(base)) {
    const dist = Math.abs(rn - base);
    // plus c'est proche, mieux c'est
    s += Math.max(0, 3 - Math.min(3, Math.floor(dist / 5)));
  }

  return s;
}

export type Relocation = { conflict: UIReservation; target: UIRoom | null; score: number };

/**
 * Trouve la *meilleure* chambre libre pour chaque conflit, avec un score.
 * - respecte la disponibilité
 * - favorise même type / même étage / état propre/contrôlé / proximité numéro
 * - évite les rooms exclues
 */
export function findBestRelocationRooms(
  data: RackData,
  conflicts: UIReservation[],
  opts?: { excludeRoomIds?: string[] }
): Relocation[] {
  const exclude = new Set(opts?.excludeRoomIds ?? []);
  return conflicts.map(conflict => {
    const candidates = data.rooms.filter(room => {
      if (exclude.has(room.id)) return false;
      if (isRoomBlocked(room.status)) return false;
      const busy = data.reservations.some(
        x => x.roomId === room.id && overlapsRange(x.start, x.end, conflict.start, conflict.end)
      );
      return !busy;
    });

    // on essaye d'utiliser les attributs de la chambre d'origine comme "référence"
    const refRoom = data.rooms.find(r => r.id === conflict.roomId);
    const best = candidates
      .map(room => ({ room, score: scoreRoomFit(room, conflict, { type: refRoom?.type, floor: refRoom?.floor }) }))
      .sort((a, b) => b.score - a.score)[0];

    return best ? { conflict, target: best.room, score: best.score } : { conflict, target: null, score: -1 };
  });
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