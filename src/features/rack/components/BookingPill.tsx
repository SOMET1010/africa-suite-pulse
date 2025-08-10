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
      className={`group min-w-0 truncate px-2 sm:px-3 py-1 sm:py-2 text-xs rounded-xl ${pillStatusClass(r.status)} 
        cursor-move hover-lift hover-glow transition-all duration-300 animate-scale-in touch-manipulation tap-target active:scale-95`}
      title={`${r.guestName} • ${r.nights} nuit(s) • ${r.rate}€`}
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="font-semibold truncate text-xs sm:text-sm leading-tight">{r.guestName}</span>
        <span className="text-[9px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full bg-background/80 font-mono font-bold backdrop-blur-sm flex-shrink-0">
          {statusLabel(r.status)}
        </span>
      </div>
      <div className="text-[9px] sm:text-[10px] opacity-75 mt-0.5 sm:mt-1 font-medium hidden sm:block leading-tight">
        {r.nights}n • {r.rate}€
      </div>
    </div>
  );
}