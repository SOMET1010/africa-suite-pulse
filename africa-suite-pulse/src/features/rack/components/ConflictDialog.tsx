import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ConflictInfo } from "../conflictValidation";

interface ConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictInfo: ConflictInfo | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConflictDialog({
  open,
  onOpenChange,
  conflictInfo,
  onConfirm,
  onCancel
}: ConflictDialogProps) {
  if (!conflictInfo) return null;

  const { conflictingReservations, targetRoom, movingReservation } = conflictInfo;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-warning">
            ⚠️ Conflit de réservation détecté
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              <strong>Réservation à déplacer :</strong><br />
              {movingReservation.guestName} ({movingReservation.start} → {movingReservation.end})
            </div>
            
            <div>
              <strong>Chambre cible :</strong> {targetRoom.number}
            </div>
            
            <div>
              <strong>Réservation(s) en conflit :</strong>
              <ul className="mt-1 space-y-1">
                {conflictingReservations.map(r => (
                  <li key={r.id} className="text-sm bg-destructive/10 p-2 rounded">
                    {r.guestName} - {r.start} → {r.end} ({r.nights} nuit{r.nights > 1 ? 's' : ''})
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-destructive font-medium">
              Cette action va déloger {conflictingReservations.length} réservation{conflictingReservations.length > 1 ? 's' : ''} existante{conflictingReservations.length > 1 ? 's' : ''}.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-warning hover:bg-warning/90 text-warning-foreground"
          >
            Déloger et déplacer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}