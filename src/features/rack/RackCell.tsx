import React, { useRef, useState } from "react";
import type { UIRoom, UIReservation } from "./rack.types";
import { DND_MIME, isBlockedRoom, getDragData } from "./rack.dnd";
import { overlapsDay } from "./rack.adapters";
import { validateDrop } from "./conflictValidation";
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
};

export function RackCell({ room, dayISO, reservations, allRooms, mode, onDropReservation, onContext, onConflict, vivid }: Props) {
  const [over, setOver] = useState<"ok"|"bad"|"conflict"|null>(null);
  const resForCell = reservations.filter(r => r.roomId === room.id && overlapsDay({ date_arrival: r.start, date_departure: r.end }, dayISO));
  
  // Log pour debug le re-render
  console.log(`🔍 RackCell ${room.number} day ${dayISO}: found ${resForCell.length} reservations for room ${room.id}`, resForCell.map(r => r.id));

  function handleDoubleClick() {
    onContext(room, dayISO, resForCell[0]);
  }

  function handleDragOver(e: React.DragEvent) {
    console.log(`🟡 Drag over room ${room.number}`);
    if (isBlockedRoom(room.status)) { 
      console.log(`❌ Room ${room.number} is blocked: ${room.status}`);
      setOver("bad"); 
      return; 
    }
    
    // Vérifier les conflits potentiels avec la nouvelle logique
    const resId = getDragData(e);
    if (resId) {
      const dragged = reservations.find(r => r.id === resId);
      if (dragged) {
        const validation = validateDrop(
          (window as any).__RACK_DATA__,
          dragged,
          room.id
        );
        if (!validation.ok && "reason" in validation && validation.reason === "CONFLICT") {
          setOver("conflict");
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          return;
        }
      }
    }
    
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move"; 
    setOver("ok");
  }

  function handleDragLeave() {
    setOver(null);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    console.log(`🔵 Drop event triggered on room ${room.number} (${room.id})`);
    
    const resId = getDragData(e);
    console.log(`📍 Drop event on room ${room.id}: resId=${resId}`);
    
    setOver(null);
    
    if (!resId) {
      console.warn("❌ No reservation ID found in drop data");
      return;
    }
    
    if (isBlockedRoom(room.status)) { 
      console.warn(`❌ Cannot drop on blocked room ${room.number} (${room.status})`);
      alert("Chambre indisponible (HS/Maintenance)"); 
      return; 
    }
    
    const dragged = reservations.find(r => r.id === resId);
    if (!dragged) return;

    // Valide sur l'ensemble de la période de la résa avec la nouvelle logique
    const validation = validateDrop(
      (window as any).__RACK_DATA__,
      dragged,
      room.id
    );

    if (validation.ok) {
      console.log(`✅ No conflict, calling onDropReservation directly`);
      await onDropReservation(resId, room.id);
      return;
    }

    if (!validation.ok && "reason" in validation) {
      if (validation.reason === "BLOCKED") {
        alert("Chambre indisponible (HS/Maintenance).");
        return;
      }

      if (validation.reason === "CONFLICT" && validation.conflicts) {
        console.log(`⚠️ Conflict detected, opening conflict dialog`);
        onConflict({ draggedId: resId, targetRoomId: room.id, conflicts: validation.conflicts });
      }
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

  const baseBg = vivid
    ? "bg-gradient-secondary/50 backdrop-blur-sm"
    : "bg-card/80 backdrop-blur-sm";

  return (
    <div
      className={`relative h-12 sm:h-16 rounded-lg border border-border/50 ${baseBg} ${dropClass} 
        transition-all duration-300 hover:shadow-soft group touch-manipulation tap-target
        ${resForCell.length > 0 ? 'hover-lift active:scale-95' : 'hover:bg-card/90 active:bg-card'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDoubleClick={handleDoubleClick}
      onContextMenu={(e)=>{e.preventDefault(); onContext(room, dayISO, resForCell[0]);}}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      role="gridcell"
      aria-disabled={isBlockedRoom(room.status)}
      title={isBlockedRoom(room.status) ? "Chambre indisponible" : ""}
    >
      <div className="absolute inset-0.5 sm:inset-1 flex gap-0.5 sm:gap-1 overflow-hidden">
        {resForCell.length === 0 && (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            <span className="text-xs font-medium hidden sm:inline">Libre</span>
            <span className="text-xs font-medium sm:hidden">•</span>
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

