import React from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import type { UIReservation } from "../rack.types";
import type { Relocation } from "../conflictValidation";

interface ConflictActionsProps {
  conflicts: UIReservation[];
  dragged: UIReservation;
  preview: Relocation[];
  onCancel: () => void;
  onSwap: () => void;
  onAutoRelodge: () => void;
  onConfirmRelodge: (plan: Relocation[]) => void;
}

export function ConflictActions({ conflicts, dragged, preview, onCancel, onSwap, onAutoRelodge, onConfirmRelodge }: ConflictActionsProps) {
  const canDoSwap = conflicts.length === 1 && 
    dragged.start === conflicts[0].start && 
    dragged.end === conflicts[0].end;

  const missing = preview.filter(p => !p.target);
  const canConfirmRelodge = missing.length === 0;

  return (
    <AlertDialogFooter className="flex flex-wrap gap-2">
      <AlertDialogCancel onClick={onCancel}>
        Annuler
      </AlertDialogCancel>
      
      <AlertDialogAction 
        onClick={onSwap}
        disabled={!canDoSwap}
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
      >
        {canDoSwap ? "Échanger les chambres" : "Échanger (impossible)"}
      </AlertDialogAction>

      <AlertDialogAction 
        onClick={onAutoRelodge}
        className="bg-warning/10 hover:bg-warning/20 text-warning-foreground border border-warning/20"
      >
        Déloger (simple)
      </AlertDialogAction>

      <AlertDialogAction 
        onClick={() => onConfirmRelodge(preview)}
        disabled={!canConfirmRelodge}
        className="bg-primary hover:bg-primary/90 disabled:opacity-50"
      >
        Confirmer le plan ({preview.length})
      </AlertDialogAction>
    </AlertDialogFooter>
  );
}