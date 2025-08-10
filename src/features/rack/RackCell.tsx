import React, { useRef, useState } from "react";
import type { Room as UIRoom, Reservation as UIReservation } from "./types";
import { DND_MIME, isBlockedRoom, getDragData } from "./rack.dnd";
import { overlapsDay } from "./rack.adapters";
import BookingPill from "./components/BookingPill";

type Props = {
  room: UIRoom;
  dayISO: string;
  reservations: UIReservation[];
  mode: "compact" | "detailed";
  onDropReservation: (reservationId: string, roomId: string) => Promise<void> | void;
  onContext: (room: UIRoom, dayISO: string, res?: UIReservation)=>void;
  vivid?: boolean;
};

export function RackCell({ room, dayISO, reservations, mode, onDropReservation, onContext, vivid }: Props) {
  const [over, setOver] = useState<"ok"|"bad"|null>(null);
  const resForCell = reservations.filter(r => r.roomId === room.id && overlapsDay({ date_arrival: r.start, date_departure: r.end }, dayISO));
  console.log(`🔍 RackCell ${room.number} day ${dayISO}: found ${resForCell.length} reservations for room ${room.id}`, resForCell.map(r => r.id));

  function handleDragOver(e: React.DragEvent) {
    if (isBlockedRoom(room.status)) { setOver("bad"); return; }
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move"; 
    setOver("ok");
  }

  function handleDragLeave() {
    setOver(null);
  }

  async function handleDrop(e: React.DragEvent) {
    const resId = e.dataTransfer.getData(DND_MIME) || getDragData(e);
    setOver(null);
    if (!resId) return;
    if (isBlockedRoom(room.status)) { 
      alert("Chambre indisponible (HS/Maintenance)"); 
      return; 
    }
    await onDropReservation(resId, room.id);
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
    over === "ok"  ? "ring-2 ring-green-500 ring-offset-1"
  : over === "bad" ? "ring-2 ring-red-500 ring-offset-1"
                   : "";

  const baseBg = vivid
    ? "bg-secondary/30"
    : "bg-background";

  return (
    <div
      className={`relative h-14 rounded-lg border border-border ${baseBg} ${dropClass} transition-all`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={(e)=>{e.preventDefault(); onContext(room, dayISO, resForCell[0]);}}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      role="gridcell"
      aria-disabled={isBlockedRoom(room.status)}
      title={isBlockedRoom(room.status) ? "Chambre indisponible" : ""}
    >
      <div className="absolute inset-1 flex gap-1 overflow-hidden">
        {resForCell.map(r => <BookingPill key={r.id} r={r} />)}
      </div>
    </div>
  );
}

