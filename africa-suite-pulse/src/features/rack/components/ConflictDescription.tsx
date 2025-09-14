import React from "react";
import type { UIReservation, UIRoom } from "../rack.types";

interface ConflictDescriptionProps {
  dragged: UIReservation;
  targetRoom: UIRoom;
  conflicts: UIReservation[];
}

export function ConflictDescription({ dragged, targetRoom, conflicts }: ConflictDescriptionProps) {
  const canDoSwap = conflicts.length === 1 && 
    dragged.start === conflicts[0].start && 
    dragged.end === conflicts[0].end;

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="font-medium text-foreground mb-2">Réservation à déplacer :</div>
        <div className="text-sm">
          <strong>{dragged.guestName}</strong> - {dragged.start} → {dragged.end} ({dragged.nights} nuit{dragged.nights > 1 ? 's' : ''})
        </div>
      </div>
      
      <div className="bg-muted/50 p-3 rounded-lg">
        <div className="font-medium text-foreground mb-2">Chambre cible :</div>
        <div className="text-sm">
          <strong>Chambre {targetRoom.number}</strong> ({targetRoom.type})
        </div>
      </div>
      
      <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
        <div className="font-medium text-destructive mb-2">
          Réservation{conflicts.length > 1 ? 's' : ''} en conflit :
        </div>
        <ul className="space-y-1">
          {conflicts.map(c => (
            <li key={c.id} className="text-sm flex items-center justify-between">
              <span>
                <strong>{c.guestName}</strong> - {c.start} → {c.end}
              </span>
              <span className="text-xs text-muted-foreground">
                {c.nights} nuit{c.nights > 1 ? 's' : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="text-sm text-muted-foreground bg-warning/10 p-3 rounded-lg">
        <strong>Actions possibles :</strong>
        <ul className="mt-2 space-y-1 list-disc pl-4">
          <li><strong>Échanger :</strong> Les deux réservations échangent de chambre{!canDoSwap ? " (impossible - dates différentes)" : ""}</li>
          <li><strong>Déloger automatiquement :</strong> Déplace les conflits vers la première chambre libre disponible</li>
          <li><strong>Annuler :</strong> Annule l'opération</li>
        </ul>
      </div>
    </div>
  );
}