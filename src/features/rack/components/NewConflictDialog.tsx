import React from "react";
import type { UIReservation, UIRoom } from "../rack.types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConflictDescription } from "./ConflictDescription";
import { ConflictActions } from "./ConflictActions";

type Props = {
  open: boolean;
  dragged: UIReservation | null;
  conflicts: UIReservation[];
  targetRoom: UIRoom | null;
  onCancel: () => void;
  onSwap: () => void;
  onAutoRelodge: () => void;
};

export function NewConflictDialog({
  open, dragged, conflicts, targetRoom, onCancel, onSwap, onAutoRelodge
}: Props) {
  if (!open || !dragged || !targetRoom) return null;

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            ⚠️ Conflit de réservation détecté
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <ConflictDescription 
              dragged={dragged}
              targetRoom={targetRoom}
              conflicts={conflicts}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ConflictActions
          conflicts={conflicts}
          dragged={dragged}
          onCancel={onCancel}
          onSwap={onSwap}
          onAutoRelodge={onAutoRelodge}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}