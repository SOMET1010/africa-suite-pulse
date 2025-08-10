import type { UIRoom } from "../rack.types";

function roomDotClass(status: UIRoom["status"]) {
  switch (status) {
    case "clean": return "room-dot-clean";
    case "inspected": return "room-dot-inspected";
    case "dirty": return "room-dot-dirty";
    case "maintenance": return "room-dot-maintenance";
    case "out_of_order": return "room-dot-out_of_order";
    default: return "bg-muted";
  }
}

export default function RoomHeader({ room }:{room: UIRoom}){
  return (
    <div className="px-2 sm:px-3 py-2 sm:py-3 sticky left-0 bg-card/95 backdrop-blur-sm z-10 border-r border-border/50 hover-lift transition-all duration-300 touch-manipulation">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${roomDotClass(room.status)} animate-scale-in shadow-sm flex-shrink-0`} />
        <div className="font-display font-semibold text-foreground text-sm sm:text-base truncate">Ch. {room.number}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground mt-0.5 sm:mt-1 truncate">
        <span className="hidden sm:inline">{room.type} • </span>
        <span className="text-primary font-semibold">Ét. {room.floor ?? 0}</span>
      </div>
    </div>
  );
}