import React, { useState } from "react";
import type { Room as UIRoom, Reservation as UIReservation } from "./types";
import { Badge } from "@/core/ui/Badge";
import { toast } from "@/hooks/use-toast";
import { DND_MIME, isBlockedRoom, setDragData, getDragData } from "./rack.dnd";
import { overlapsDay } from "./rack.adapters";

type Props = {
  room: UIRoom;
  dayISO: string;
  reservations: UIReservation[]; // résas (toutes) pour calculer celles qui chevauchent ce jour/room
  mode: "compact" | "detailed";
  onDropReservation: (reservationId: string, roomId: string) => Promise<void> | void;
};

export function RackCell({ room, dayISO, reservations, mode, onDropReservation }: Props) {
  const [over, setOver] = useState<"ok"|"bad"|null>(null);

  const resForCell = reservations.filter(r => r.roomId === room.id && overlapsDay({ date_arrival: r.start, date_departure: r.end }, dayISO));

  function handleDragStart(e: React.DragEvent, resId: string) {
    setDragData(e, resId);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).style.opacity = '1';
  }

  function handleDragOver(e: React.DragEvent) {
    // autoriser le drop uniquement si chambre non bloquée
    const ok = !isBlockedRoom(room.status);
    if (!ok) { setOver("bad"); return; }
    e.preventDefault(); // important pour permettre drop
    e.dataTransfer.dropEffect = "move";
    setOver("ok");
  }

  function handleDragLeave() {
    setOver(null);
  }

  async function handleDrop(e: React.DragEvent) {
    const resId = getDragData(e);
    setOver(null);
    if (!resId) return;

    if (isBlockedRoom(room.status)) {
      toast({ title: "Drop interdit", description: "Impossible de réassigner vers une chambre HS / maintenance." });
      return;
    }

    try {
      await onDropReservation(resId, room.id);
      // le reload est géré dans le parent (RackGrid via hook)
    } catch (err:any) {
      toast({ title: "Erreur réassignation", description: err.message });
    }
  }

  const colorVar = room.status === 'clean'
    ? '--status-confirmed'
    : room.status === 'dirty'
    ? '--status-option'
    : room.status === 'maintenance'
    ? '--status-present'
    : room.status === 'inspected'
    ? '--status-present'
    : '--status-cancelled';

  const dropClass =
    over === "ok"  ? "ring-2 ring-[hsl(var(--status-confirmed))] ring-offset-1"
  : over === "bad" ? "ring-2 ring-[hsl(var(--status-cancelled))] ring-offset-1"
                   : "";

  const stateDot = (
    <span
      className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: `hsl(var(${colorVar}))` }}
      aria-hidden
    />
  );

  return (
    <div
      className={`relative h-14 bg-background border-b border-l border-border px-3 py-2 ${dropClass} ${resForCell.length === 0 ? 'cursor-pointer hover:bg-secondary/40' : ''} transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (resForCell.length === 0) {
          toast({ title: "Créer réservation", description: `Chambre ${room.number} - ${dayISO}` });
        }
      }}
      // accessibilité minimale clavier (optionnel)
      role="gridcell"
      aria-disabled={isBlockedRoom(room.status)}
      title={isBlockedRoom(room.status) ? "Chambre indisponible" : ""}
    >
      {stateDot}
      {/* cartes résa présentes sur cette cellule */}
      <div className="absolute inset-1 flex gap-1 overflow-hidden">
        {resForCell.map(r => {
          const badgeVariant = r.status === 'present' ? 'present' : r.status === 'confirmed' ? 'confirmed' : r.status === 'option' ? 'option' : 'cancelled';
          return (
            <div
              key={r.id}
              draggable
              onDragStart={(e) => handleDragStart(e, r.id)}
              onDragEnd={handleDragEnd}
              className="flex-1 min-w-0 truncate px-2 py-1 rounded-md text-xs border border-border bg-card cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:scale-[1.02]"
              onClick={(e) => {
                e.stopPropagation();
                toast({ title: "Détails réservation", description: `${r.guestName} (${r.id})` });
              }}
            >
              <div className="flex items-center gap-1">
                <Badge variant={badgeVariant as any} className="text-xs px-1 py-0">
                  {r.status === 'present' ? 'P' : r.status === 'confirmed' ? 'C' : r.status === 'option' ? 'O' : 'X'}
                </Badge>
                <span className="truncate">{r.guestName}</span>
              </div>
              {mode === 'detailed' && (
                <div className="text-xs text-muted-foreground mt-1">{r.ae} · {r.nights}n · {r.rate.toFixed(2)} €</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

