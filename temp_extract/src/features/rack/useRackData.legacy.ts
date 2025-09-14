/**
 * 🗑️ FICHIER LEGACY - À SUPPRIMER APRÈS MIGRATION
 * 
 * Ce fichier contient l'ancien système de gestion des données rack.
 * Il a été remplacé par useRackDataModern.ts qui utilise React Query.
 * 
 * ❌ NE PLUS UTILISER - Utilisez useRackDataModern à la place
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import type { RackData, UIRoom, UIReservation } from "./rack.types";
// Ancien service supprimé - maintenant dans @/services/rack.service
import type { Room as SBRoom, Reservation as SBReservation } from "./rack.types";
import { useOrgId } from "@/core/auth/useOrg";
import { overlapsDay } from "./rack.adapters";

// DEPRECATED: Ce hook est legacy, utilisez useRackDataModern à la place
// @deprecated Use useRackDataModern instead
export function useRackData() {
  console.warn("⚠️ useRackData is deprecated. Use useRackDataModern instead.");
  
  // Redirection vers le nouveau hook
  throw new Error("useRackData is deprecated. Please use useRackDataModern from './useRackDataModern'");
}