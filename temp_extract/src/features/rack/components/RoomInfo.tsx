import React from "react";
import { MapPin, Users } from "lucide-react";
import type { UIRoom } from "../rack.types";

interface RoomInfoProps {
  room: UIRoom;
}

export function RoomInfo({ room }: RoomInfoProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Informations chambre</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>Étage {room.floor || "0"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{room.type || "Standard"}</span>
        </div>
      </div>
    </div>
  );
}