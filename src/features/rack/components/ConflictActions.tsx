import React from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import type { UIReservation } from "../rack.types";

interface ConflictActionsProps {
  conflicts: UIReservation[];
  dragged: UIReservation;
  onCancel: () => void;
  onSwap: () => void;
  onAutoRelodge: () => void;
}

export function ConflictActions({ conflicts, dragged, onCancel, onSwap, onAutoRelodge }: ConflictActionsProps) {
  const canDoSwap = conflicts.length === 1 && 
    dragged.start === conflicts[0].start && 
    dragged.end === conflicts[0].end;

  return (
    <AlertDialogFooter className="flex gap-2">
      <AlertDialogCancel onClick={onCancel}>
        Annuler
      </AlertDialogCancel>
      
      <AlertDialogAction 
        onClick={onAutoRelodge}
        className="bg-warning/10 hover:bg-warning/20 text-warning-foreground border border-warning/20"
      >
        Déloger automatiquement
      </AlertDialogAction>

      <AlertDialogAction 
        onClick={onSwap}
        disabled={!canDoSwap}
        className="bg-primary hover:bg-primary/90"
      >
        {canDoSwap ? "Échanger les chambres" : "Échanger (impossible)"}
      </AlertDialogAction>
    </AlertDialogFooter>
  );
}