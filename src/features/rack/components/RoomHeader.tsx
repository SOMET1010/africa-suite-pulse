import type { Room } from "../types";

function roomDotClass(status: Room["status"]) {
  switch (status) {
    case "clean": return "room-dot-clean";
    case "inspected": return "room-dot-inspected";
    case "dirty": return "room-dot-dirty";
    case "maintenance": return "room-dot-maintenance";
    case "out_of_order": return "room-dot-out_of_order";
    default: return "bg-muted";
  }
}

export default function RoomHeader({ room }:{room: Room}){
  return (
    <div className="px-3 py-3 sticky left-0 bg-card/95 backdrop-blur-sm z-10 border-r border-border/50 hover-lift transition-all duration-300">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${roomDotClass(room.status)} animate-scale-in shadow-sm`} />
        <div className="font-display font-semibold text-foreground">Ch. {room.number}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground mt-1">
        {room.type} • <span className="text-primary font-semibold">Étage {room.floor ?? 0}</span>
      </div>
    </div>
  );
}