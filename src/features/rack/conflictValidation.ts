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

export type ConflictType = "CURRENT" | "FUTURE";

export type DropValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: "BLOCKED" | "CONFLICT" | "FUTURE_CONFLICT";
      conflicts?: UIReservation[];
      conflictType?: ConflictType;
    };

/** Détermine si un conflit concerne un séjour en cours ou futur */
export function getConflictType(conflict: UIReservation, today: string): ConflictType {
  // Si la réservation a déjà commencé (start <= today), c'est un séjour en cours
  return conflict.start <= today ? "CURRENT" : "FUTURE";
}

/** Vérifie si le délogement est autorisé selon les règles TopRésa */
export function isRelodgingAllowed(conflicts: UIReservation[], today: string): boolean {
  // Autoriser uniquement si tous les conflits concernent des séjours en cours
  return conflicts.every(conflict => getConflictType(conflict, today) === "CURRENT");
}

/**
 * Valide un drop : vérifie blocage de chambre + conflits de dates sur la room cible
 * Applique les règles TopRésa pour les délogements
 */
export function validateDrop(
  data: RackData,
  dragged: UIReservation,
  targetRoomId: string,
  today?: string
): DropValidationResult {
  const room = data.rooms.find(r => r.id === targetRoomId);
  if (!room) return { ok: false, reason: "CONFLICT", conflicts: [] };
  if (isRoomBlocked(room.status)) return { ok: false, reason: "BLOCKED" };

  // CRITIQUE : Empêcher le drop sur la même chambre
  if (dragged.roomId === targetRoomId) {
    console.log(`🔄 Same room drop detected: ${dragged.guestName} already in target room`);
    return { ok: false, reason: "BLOCKED" }; // Bloquer complètement le drop
  }

  const conflicts = data.reservations.filter(r =>
    r.roomId === targetRoomId &&
    r.id !== dragged.id &&
    overlapsRange(r.start, r.end, dragged.start, dragged.end)
  );

  if (conflicts.length === 0) return { ok: true };

  // Appliquer les règles TopRésa si date du jour fournie
  if (today) {
    const conflictTypes = conflicts.map(c => getConflictType(c, today));
    const hasFutureConflicts = conflictTypes.some(type => type === "FUTURE");
    
    if (hasFutureConflicts) {
      return { 
        ok: false, 
        reason: "FUTURE_CONFLICT", 
        conflicts,
        conflictType: "FUTURE"
      };
    }
    
    return { 
      ok: false, 
      reason: "CONFLICT", 
      conflicts,
      conflictType: "CURRENT"
    };
  }

  return { ok: false, reason: "CONFLICT", conflicts };
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
function scoreRoomFit(room: UIRoom, conflict: UIReservation, ref?: { type?: string; floor?: number }, allRooms?: UIRoom[]) {
  let s = 0;

  // 1) disponibilité stricte
  // (le filtre d'indisponibilité est géré avant; ici, on score les préférences)
  
  // 2) préférences de matching
  if (ref?.type && room.type === ref.type) s += 3;
  if (ref?.floor != null && room.floor === ref.floor) s += 2;

  // 3) état de chambre (propre/contrôlée > sale > maintenance/hs déjà exclus)
  if (room.status === "clean" || room.status === "inspected") s += 2;
  if (room.status === "dirty") s += 1;

  // 4) proximité par numéro (si format numérique) - CORRIGÉ : utilise les numéros de chambre, pas les IDs
  const rn = parseInt(String(room.number), 10);
  let refRoomNumber: number | null = null;
  
  if (conflict.roomId && allRooms) {
    const originalRoom = allRooms.find(r => r.id === conflict.roomId);
    if (originalRoom) {
      refRoomNumber = parseInt(String(originalRoom.number), 10);
    }
  }
  
  if (!Number.isNaN(rn) && refRoomNumber && !Number.isNaN(refRoomNumber)) {
    const dist = Math.abs(rn - refRoomNumber);
    // plus c'est proche, mieux c'est
    s += Math.max(0, 3 - Math.min(3, Math.floor(dist / 5)));
  }

  return s;
}

/**
 * Score basé sur la différence de prix entre la réservation en conflit et les autres réservations
 * dans la chambre cible. Favorise les chambres avec des tarifs similaires ou supérieurs.
 */
function scorePriceFit(targetRoom: UIRoom, conflict: UIReservation, allReservations: UIReservation[]) {
  // Trouver les autres réservations dans la chambre cible
  const roomReservations = allReservations.filter(r => r.roomId === targetRoom.id && r.id !== conflict.id);
  
  if (roomReservations.length === 0) {
    // Chambre vide, score neutre
    return 0;
  }

  // Calculer le tarif moyen de la chambre cible
  const avgRate = roomReservations.reduce((sum, r) => sum + r.rate, 0) / roomReservations.length;
  
  // Score basé sur la différence de prix
  const priceDiff = avgRate - conflict.rate;
  
  if (priceDiff >= 0) {
    // Chambre avec tarif égal ou supérieur = bonus
    return Math.min(4, Math.floor(priceDiff / 50) + 1); // +1 à +4 points selon l'écart
  } else {
    // Chambre avec tarif inférieur = malus léger
    return Math.max(-2, Math.floor(priceDiff / 100)); // -1 à -2 points selon l'écart
  }
}

export type Relocation = { 
  conflict: UIReservation; 
  target: UIRoom | null; 
  score: number;
  conflictType?: ConflictType;
};

/**
 * Trouve la *meilleure* chambre libre pour chaque conflit, avec un score.
 * - respecte la disponibilité
 * - favorise même type / même étage / état propre/contrôlé / proximité numéro
 * - évite les rooms exclues
 */
export function findBestRelocationRooms(
  data: RackData,
  conflicts: UIReservation[],
  opts?: { excludeRoomIds?: string[]; today?: string }
): Relocation[] {
  const exclude = new Set(opts?.excludeRoomIds ?? []);
  return conflicts.map(conflict => {
    const candidates = data.rooms.filter(room => {
      if (exclude.has(room.id)) return false;
      // CRITIQUE: Exclure la chambre source pour éviter re-lodger sur la même chambre
      if (room.id === conflict.roomId) return false;
      if (isRoomBlocked(room.status)) return false;
      const busy = data.reservations.some(
        x => x.roomId === room.id && overlapsRange(x.start, x.end, conflict.start, conflict.end)
      );
      return !busy;
    });

    // on essaye d'utiliser les attributs de la chambre d'origine comme "référence"
    const refRoom = data.rooms.find(r => r.id === conflict.roomId);
    const candidatesWithScore = candidates.map(room => {
      const baseScore = scoreRoomFit(room, conflict, { type: refRoom?.type, floor: refRoom?.floor }, data.rooms);
      const priceScore = scorePriceFit(room, conflict, data.reservations);
      return { 
        room, 
        score: baseScore + priceScore,
        baseScore,
        priceScore 
      };
    });
    
    const best = candidatesWithScore.sort((a, b) => b.score - a.score)[0];

    const conflictType = opts?.today ? getConflictType(conflict, opts.today) : undefined;
    return best ? 
      { conflict, target: best.room, score: best.score, conflictType } : 
      { conflict, target: null, score: -1, conflictType };
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