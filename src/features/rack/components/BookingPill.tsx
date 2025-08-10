import { setDragData } from "../rack.dnd";
import type { Reservation } from "../types";

function pillStatusClass(s: Reservation["status"]) {
  if (s==="present") return "status-present";
  if (s==="option") return "status-option";
  if (s==="cancelled") return "status-cancelled";
  return "status-confirmed"; // confirmed
}

function statusLabel(s: Reservation["status"]) {
  if (s==="present") return "P";
  if (s==="option") return "O";
  if (s==="cancelled") return "X";
  return "C"; // confirmed
}

export default function BookingPill({ r }:{ r: Reservation }) {
  return (
    <div
      draggable
      onDragStart={(e)=>setDragData(e, r.id)}
      className={`group min-w-0 truncate px-3 py-2 text-xs rounded-xl ${pillStatusClass(r.status)} 
        cursor-move hover-lift hover-glow transition-all duration-300 animate-scale-in`}
      title={`${r.guestName} • ${r.nights} nuit(s) • ${r.rate}€`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold truncate">{r.guestName}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/80 font-mono font-bold backdrop-blur-sm">
          {statusLabel(r.status)}
        </span>
      </div>
      <div className="text-[10px] opacity-75 mt-1 font-medium">
        {r.nights}n • {r.rate}€
      </div>
    </div>
  );
}