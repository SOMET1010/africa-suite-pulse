import React from "react";
import type { UIReservation, UIRoom } from "../rack.types";
import type { Relocation } from "../conflictValidation";
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
  onCancel: () => void;
  onSwap: () => void;
  onAutoRelodge: () => void;
  onConfirmRelodge: (plan: Relocation[]) => void;
};

export function NewConflictDialog({
  open, dragged, conflicts, targetRoom, preview, onCancel, onSwap, onAutoRelodge, onConfirmRelodge
}: Props) {
  if (!open || !dragged || !targetRoom) return null;

  const missing = preview.filter(p => !p.target);

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="sm:max-w-[700px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            ⚠️ Conflit de réservation détecté
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
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
                          <td className="py-2 pr-3 text-xs">{p.conflict.start} → {p.conflict.end}</td>
                          <td className="py-2 pr-3">Ch. {p.conflict.roomId || "?"}</td>
                          <td className="py-2 pr-3">
                            {p.target ? (
                              <span className="text-sm">
                                Ch. {p.target.number} ({p.target.type} • Ét. {p.target.floor ?? 0})
                              </span>
                            ) : (
                              <span className="text-destructive text-xs">Aucune dispo</span>
                            )}
                          </td>
                          <td className="py-2 text-right text-xs font-mono">
                            {p.score >= 0 ? p.score : "-"}
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
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <ConflictActions
          conflicts={conflicts}
          dragged={dragged}
          preview={preview}
          onCancel={onCancel}
          onSwap={onSwap}
          onAutoRelodge={onAutoRelodge}
          onConfirmRelodge={onConfirmRelodge}
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}