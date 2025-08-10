import React, { useRef, useState } from "react";
import type { UIRoom, UIReservation } from "./rack.types";
import { overlapsDay } from "./rack.adapters";
import { useDragHandlers } from "./components/DragHandlers";
import BookingPill from "./components/BookingPill";

type Props = {
  room: UIRoom;
  dayISO: string;
  reservations: UIReservation[];
  allRooms: UIRoom[];
  mode: "compact" | "detailed";
  onDropReservation: (reservationId: string, roomId: string) => Promise<void> | void;
  onContext: (room: UIRoom, dayISO: string, res?: UIReservation)=>void;
  onConflict: (opts: { draggedId: string; targetRoomId: string; conflicts: UIReservation[] }) => void;
  vivid?: boolean;
  // Manual re-lodging props
  selectionMode?: {
    sourceRoom: UIRoom | null;
    sourceReservation: UIReservation | null;
    destinationRoom: UIRoom | null;
  };
  onLeftClick?: (room: UIRoom, reservation?: UIReservation) => void;
  onRightClick?: (room: UIRoom) => void;
};

export function RackCell({ room, dayISO, reservations, allRooms, mode, onDropReservation, onContext, onConflict, vivid, selectionMode, onLeftClick, onRightClick }: Props) {
  const [over, setOver] = useState<"ok"|"bad"|"conflict"|null>(null);
  const resForCell = reservations.filter(r => r.roomId === room.id && overlapsDay({ date_arrival: r.start, date_departure: r.end }, dayISO));
  
  // Log pour debug le re-render
  console.log(`🔍 RackCell ${room.number} day ${dayISO}: found ${resForCell.length} reservations for room ${room.id}`, resForCell.map(r => r.id));
  
  // CRITIQUE : Détecter et signaler les conflits existants dans les données
  const hasConflict = resForCell.length > 1;
  if (hasConflict) {
    console.warn(`⚠️ CONFLIT DÉTECTÉ: Chambre ${room.number} le ${dayISO} a ${resForCell.length} réservations simultanées:`, 
      resForCell.map(r => ({ id: r.id, guest: r.guestName, dates: `${r.start} → ${r.end}` })));
  }

  const {
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragHandlers(room, reservations, setOver, onDropReservation, onConflict);

  function handleDoubleClick() {
    onContext(room, dayISO, resForCell[0]);
  }

  function handleLeftClick(e: React.MouseEvent) {
    if (onLeftClick) {
      e.preventDefault();
      onLeftClick(room, resForCell[0]);
    }
  }

  function handleRightClick(e: React.MouseEvent) {
    if (onRightClick) {
      e.preventDefault();
      onRightClick(room);
    } else {
      e.preventDefault(); 
      onContext(room, dayISO, resForCell[0]);
    }
  }

  // long-press tactile : ouvre menu
  const pressRef = useRef<number|undefined>(undefined);
  const startPress = () => { 
    pressRef.current = window.setTimeout(()=> onContext(room, dayISO, resForCell[0]), 450); 
  };
  const endPress = () => { 
    if (pressRef.current) window.clearTimeout(pressRef.current); 
  };

  const dropClass =
    over === "ok"       ? "drop-zone-valid animate-scale-in"
  : over === "bad"      ? "drop-zone-invalid animate-scale-in"  
  : over === "conflict" ? "drop-zone-conflict animate-scale-in"
                        : "";

  // Selection styling
  const isSourceSelected = selectionMode?.sourceRoom?.id === room.id;
  const isDestinationSelected = selectionMode?.destinationRoom?.id === room.id;
  
  const baseBg = hasConflict
    ? "bg-destructive/20 border-destructive/50" // Style spécial pour les conflits
    : vivid
      ? "bg-gradient-secondary/50 backdrop-blur-sm"
      : "bg-card/80 backdrop-blur-sm";

  const selectionClasses = isSourceSelected
    ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5 animate-pulse"
    : isDestinationSelected
      ? "border-2 border-dashed border-secondary ring-offset-2 ring-offset-background bg-secondary/5 animate-pulse"
      : "";

  return (
    <div
      className={`relative h-12 sm:h-16 rounded-lg border border-border/50 ${baseBg} ${dropClass} ${selectionClasses}
        transition-all duration-300 hover:shadow-soft group touch-manipulation tap-target
        ${resForCell.length > 0 ? 'hover-lift active:scale-95' : 'hover:bg-card/90 active:bg-card'}
        ${hasConflict ? 'ring-2 ring-destructive/30 animate-pulse' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDoubleClick={handleDoubleClick}
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      role="gridcell"
      aria-disabled={room.status === "out_of_order" || room.status === "maintenance"}
      title={hasConflict 
        ? `⚠️ CONFLIT: ${resForCell.length} réservations simultanées dans cette chambre` 
        : isSourceSelected
          ? "🎯 Chambre source sélectionnée"
        : isDestinationSelected
          ? "📍 Chambre destination sélectionnée"
        : room.status === "out_of_order" || room.status === "maintenance" 
          ? "Chambre indisponible" 
          : ""}
    >
      {/* Selection badges */}
      {isSourceSelected && (
        <div className="absolute -top-1 -left-1 bg-primary text-primary-foreground px-1 py-0.5 rounded text-xs font-bold animate-bounce">
          SOURCE
        </div>
      )}
      {isDestinationSelected && (
        <div className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground px-1 py-0.5 rounded text-xs font-bold animate-bounce">
          DEST
        </div>
      )}
      
      <div className="absolute inset-0.5 sm:inset-1 flex gap-0.5 sm:gap-1 overflow-hidden">
        {resForCell.length === 0 && (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            <span className="text-xs font-medium hidden sm:inline">Libre</span>
            <span className="text-xs font-medium sm:hidden">•</span>
          </div>
        )}
        {hasConflict && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-destructive rounded-full animate-pulse border border-destructive-foreground/20" 
               title={`⚠️ ${resForCell.length} réservations en conflit`}>
          </div>
        )}
        {resForCell.map((r, index) => (
          <div key={r.id} className="animate-scale-in touch-manipulation" style={{ animationDelay: `${index * 100}ms` }}>
            <BookingPill r={r} />
          </div>
        ))}
      </div>
    </div>
  );
}