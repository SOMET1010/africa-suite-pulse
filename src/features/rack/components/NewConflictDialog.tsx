import React from "react";
import type { UIReservation, UIRoom } from "../rack.types";
import type { Relocation, ConflictType } from "../conflictValidation";
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
  preview: Relocation[];
  conflictType: ConflictType | null;
  allRooms: UIRoom[]; // Add this to get room numbers
  onCancel: () => void;
  onSwap: () => void;
  onAutoRelodge: () => void;
  onConfirmRelodge: (plan: Relocation[]) => void;
};

export function NewConflictDialog({
  open, dragged, conflicts, targetRoom, preview, conflictType, allRooms, onCancel, onSwap, onAutoRelodge, onConfirmRelodge
}: Props) {
  console.log("🏨 NewConflictDialog render:", { open, dragged: dragged?.guestName, conflicts: conflicts.length, conflictType, preview: preview.length });
  
  if (!open || !dragged || !targetRoom) {
    console.log("🚫 NewConflictDialog early return:", { open, hasDragged: !!dragged, hasTargetRoom: !!targetRoom });
    return null;
  }

  const missing = preview.filter(p => !p.target);

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="sm:max-w-[700px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            ⚠️ {conflictType === "FUTURE" ? "Conflit avec réservation future" : "Conflit avec séjour en cours"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {conflictType === "FUTURE" ? (
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning-foreground">
                    Impossible de déloger vers la chambre {targetRoom.number} : conflit avec une réservation future. 
                    Le délogement automatique n'est autorisé que pour les séjours en cours. 
                    Utilisez TopRésa pour gérer manuellement cette situation.
                  </p>
                </div>
              ) : (
                <>
                  <ConflictDescription 
                    dragged={dragged}
                    targetRoom={targetRoom}
                    conflicts={conflicts}
                  />
                  
                  {/* Prévisualisation du plan de délogement */}
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="text-sm font-medium mb-3">Plan de délogement proposé :</div>
                <div className="max-h-60 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="py-2 pr-3">Client en conflit</th>
                        <th className="py-2 pr-3">Tarif actuel</th>
                        <th className="py-2 pr-3">Dates</th>
                        <th className="py-2 pr-3">Depuis</th>
                        <th className="py-2 pr-3">→ Vers</th>
                        <th className="py-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map(p => (
                        <tr key={p.conflict.id} className="border-b border-border/50">
                          <td className="py-2 pr-3 font-medium">{p.conflict.guestName}</td>
                          <td className="py-2 pr-3 text-xs font-mono">{p.conflict.rate}€</td>
                          <td className="py-2 pr-3 text-xs">{p.conflict.start} → {p.conflict.end}</td>
                          <td className="py-2 pr-3">Ch. {allRooms.find(r => r.id === p.conflict.roomId)?.number || "?"}</td>
                          <td className="py-2 pr-3">
                            {p.target ? (
                              <span className="text-sm">
                                Ch. {p.target.number} ({p.target.type} • Ét. {p.target.floor ?? 0})
                              </span>
                            ) : (
                              <span className="text-destructive text-xs">Aucune dispo</span>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            <span className={`text-xs font-mono px-2 py-1 rounded ${
                              p.score >= 5 ? 'bg-success/20 text-success' :
                              p.score >= 2 ? 'bg-primary/20 text-primary' :
                              p.score >= 0 ? 'bg-muted text-muted-foreground' :
                              'bg-warning/20 text-warning'
                            }`}>
                              {p.score >= 0 ? `+${p.score}` : p.score.toString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {missing.length > 0 && (
                  <div className="mt-3 p-3 rounded-md bg-warning/10 text-warning-foreground text-xs border border-warning/20">
                    ⚠️ {missing.length} réservation{missing.length>1?'s':''} sans solution disponible. Ajustez manuellement.
                    </div>
                  )}
                </div>
              </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {conflictType !== "FUTURE" && (
          <ConflictActions
            conflicts={conflicts}
            dragged={dragged}
            preview={preview}
            conflictType={conflictType}
            onCancel={onCancel}
            onSwap={onSwap}
            onAutoRelodge={onAutoRelodge}
            onConfirmRelodge={onConfirmRelodge}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}