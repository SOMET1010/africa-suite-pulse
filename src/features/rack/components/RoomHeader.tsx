import type { Room } from "../types";

function roomDotClass(status: Room["status"]) {
  switch (status) {
    case "clean": return "bg-green-200";
    case "inspected": return "bg-blue-200";
    case "dirty": return "bg-yellow-200";
    case "maintenance": return "bg-orange-200";
    case "out_of_order": return "bg-red-200";
    default: return "bg-gray-200";
  }
}

export default function RoomHeader({ room }:{room: Room}){
  return (
    <div className="px-2 py-2 sticky left-0 bg-card z-10 rounded-l-lg border-r border-border">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${roomDotClass(room.status)}`} />
        <div className="font-semibold">Ch. {room.number}</div>
      </div>
      <div className="text-xs text-muted-foreground">{room.type} • Étage {room.floor ?? 0}</div>
    </div>
  );
}