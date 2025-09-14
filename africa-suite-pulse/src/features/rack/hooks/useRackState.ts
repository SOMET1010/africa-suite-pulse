import { useState } from "react";
import type { UIRoom, UIReservation } from "../rack.types";

export function useRackState() {
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"compact" | "detailed">("compact");
  const [statusFilter, setStatusFilter] = useState<"all"|"clean"|"inspected"|"dirty"|"maintenance"|"out_of_order">("all");
  const [compact, setCompact] = useState(false);
  const [vivid, setVivid] = useState(false);
  
  // Manuel re-lodging selection state
  const [selectionMode, setSelectionMode] = useState<{
    sourceRoom: UIRoom | null;
    sourceReservation: UIReservation | null;
    destinationRoom: UIRoom | null;
  }>({
    sourceRoom: null,
    sourceReservation: null,
    destinationRoom: null
  });
  
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
    conflictType: "CURRENT" | "FUTURE" | null;
  }>({
    open: false,
    dragged: null,
    targetRoomId: null,
    conflicts: [],
    preview: [],
    conflictType: null
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

  const [manualRelodgeDialog, setManualRelodgeDialog] = useState<{
    open: boolean;
    sourceRoom: UIRoom | null;
    destinationRoom: UIRoom | null;
    conflicts: UIReservation[];
    preview: any[];
  }>({
    open: false,
    sourceRoom: null,
    destinationRoom: null,
    conflicts: [],
    preview: []
  });

  return {
    // UI state
    zoom, setZoom,
    query, setQuery,
    mode, setMode,
    statusFilter, setStatusFilter,
    compact, setCompact,
    vivid, setVivid,
    
    // Selection state
    selectionMode, setSelectionMode,
    
    // Dialog states
    detailSheet, setDetailSheet,
    conflictDialog, setConflictDialog,
    moveConfirmDialog, setMoveConfirmDialog,
    manualRelodgeDialog, setManualRelodgeDialog,
  };
}