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
import type { UIRoom, UIReservation } from "../rack.types";
import type { Relocation } from "../conflictValidation";

interface Props {
  open: boolean;
  sourceRoom: UIRoom | null;
  destinationRoom: UIRoom | null;
  conflicts: UIReservation[];
  preview: Relocation[];
  onCancel: () => void;
  onConfirm: (plan: Relocation[]) => void;
  onRestart: () => void;
}

export function ManualRelodgeDialog({ 
  open, 
  sourceRoom, 
  destinationRoom, 
  conflicts, 
  preview, 
  onCancel, 
  onConfirm, 
  onRestart 
}: Props) {
  if (!open || !sourceRoom || !destinationRoom) return null;

  const canConfirm = preview.every(p => p.target);

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            🏨 Délogement Manuel
          </AlertDialogTitle>
          <AlertDialogDescription>
            Délogement de la chambre <strong>{sourceRoom.number}</strong> vers la chambre <strong>{destinationRoom.number}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Source et destination */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chambre source</p>
              <p className="font-semibold">Ch. {sourceRoom.number} ({sourceRoom.type})</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chambre destination</p>
              <p className="font-semibold">Ch. {destinationRoom.number} ({destinationRoom.type})</p>
            </div>
          </div>

          {/* Conflits détectés */}
          {conflicts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-destructive">
                ⚠️ Conflits détectés ({conflicts.length})
              </h3>
              <div className="space-y-2">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="font-medium">{conflict.guestName}</p>
                    <p className="text-sm text-muted-foreground">
                      {conflict.start} → {conflict.end} ({conflict.nights} nuits)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plan de délogement */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">
                📋 Plan de délogement proposé
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {preview.map((relocation, index) => (
                  <div key={index} className="p-3 bg-card border rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{relocation.conflict.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          {relocation.conflict.start} → {relocation.conflict.end}
                        </p>
                      </div>
                      <div className="text-right">
                        {relocation.target ? (
                          <p className="text-sm font-medium text-primary">
                            → Ch. {relocation.target.number}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-destructive">
                            ❌ Aucune chambre disponible
                          </p>
                        )}
                        {relocation.score !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Score: {relocation.score.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel onClick={onCancel}>
            Non
          </AlertDialogCancel>
          
          <AlertDialogAction 
            onClick={onRestart}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            Recommencer
          </AlertDialogAction>
          
          <AlertDialogAction 
            onClick={() => onConfirm(preview)}
            disabled={!canConfirm}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            Oui - Valider
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}