import { useState } from "react";
import type { UIRoom, UIReservation } from "../rack.types";

export function useRackState() {
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"compact" | "detailed">("compact");
  const [statusFilter, setStatusFilter] = useState<"all"|"clean"|"inspected"|"dirty"|"maintenance"|"out_of_order">("all");
  const [compact, setCompact] = useState(false);
  const [vivid, setVivid] = useState(false);
  
  const [detailSheet, setDetailSheet] = useState<{
    open: boolean;
    room: UIRoom | null;
    dayISO: string;
    reservation?: UIReservation;
  }>({
    open: false,
    room: null,
    dayISO: "",
    reservation: undefined
  });
  
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    dragged: UIReservation | null;
    targetRoomId: string | null;
    conflicts: UIReservation[];
    preview: any[];
  }>({
    open: false,
    dragged: null,
    targetRoomId: null,
    conflicts: [],
    preview: []
  });

  const [moveConfirmDialog, setMoveConfirmDialog] = useState<{
    open: boolean;
    reservation: UIReservation | null;
    sourceRoom: UIRoom | null;
    targetRoom: UIRoom | null;
    pendingDrop: { resId: string; roomId: string } | null;
  }>({
    open: false,
    reservation: null,
    sourceRoom: null,
    targetRoom: null,
    pendingDrop: null
  });

  return {
    // UI state
    zoom, setZoom,
    query, setQuery,
    mode, setMode,
    statusFilter, setStatusFilter,
    compact, setCompact,
    vivid, setVivid,
    
    // Dialog states
    detailSheet, setDetailSheet,
    conflictDialog, setConflictDialog,
    moveConfirmDialog, setMoveConfirmDialog,
  };
}