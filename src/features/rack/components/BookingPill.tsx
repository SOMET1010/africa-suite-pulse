import { setDragData } from "../rack.dnd";
import type { Reservation } from "../types";

function borderByStatus(s: Reservation["status"]) {
  if (s==="present") return "border-green-500";
  if (s==="option") return "border-purple-500";
  if (s==="cancelled") return "border-red-500";
  return "border-blue-500"; // confirmed
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
      className={`min-w-0 truncate px-2 py-1 text-xs rounded-md border-l-4 ${borderByStatus(r.status)} 
        border border-border bg-card/80 cursor-grab active:cursor-grabbing hover:shadow-md transition-all`}
      title={`${r.guestName} • ${r.nights} nuit(s) • ${r.rate}€`}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium truncate">{r.guestName}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border bg-background/50">
          {statusLabel(r.status)}
        </span>
      </div>
    </div>
  );
}