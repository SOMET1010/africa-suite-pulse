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
import type { Room, Reservation } from "../types";

interface MoveConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  sourceRoom: Room | null;
  targetRoom: Room | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MoveConfirmationDialog({
  open,
  onOpenChange,
  reservation,
  sourceRoom,
  targetRoom,
  onConfirm,
  onCancel
}: MoveConfirmationDialogProps) {
  if (!reservation || !targetRoom) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary flex items-center gap-2">
            🔄 Confirmation de déplacement
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="bg-card p-4 rounded-lg border space-y-3">
              <div>
                <strong className="text-foreground">Client :</strong>
                <div className="text-lg font-semibold text-primary">{reservation.guestName}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-foreground">Période :</strong>
                  <div className="text-sm">
                    Du {new Date(reservation.start).toLocaleDateString('fr-FR')} 
                    au {new Date(reservation.end).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}
                  </div>
                </div>
                
                <div>
                  <strong className="text-foreground">Tarif :</strong>
                  <div className="text-lg font-semibold text-success">
                    {reservation.rate}€
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Chambre actuelle :</strong>
                  <div className="text-sm text-muted-foreground">
                    {sourceRoom ? `Ch. ${sourceRoom.number} (${sourceRoom.type})` : 'Non assignée'}
                  </div>
                </div>
                <div className="text-2xl">→</div>
                <div>
                  <strong>Nouvelle chambre :</strong>
                  <div className="text-sm text-primary font-semibold">
                    Ch. {targetRoom.number} ({targetRoom.type})
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Voulez-vous confirmer ce transfert de rooming ?
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Confirmer le déplacement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}