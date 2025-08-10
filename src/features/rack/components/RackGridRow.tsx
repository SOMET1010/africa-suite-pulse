import React from "react";
import { RackCell } from "../RackCell";
import RoomHeader from "./RoomHeader";
import type { UIRoom, UIReservation } from "../rack.types";

interface RackGridRowProps {
  room: UIRoom;
  days: string[];
  reservations: UIReservation[];
  allRooms: UIRoom[];
  index: number;
  compact: boolean;
  mode: "compact" | "detailed";
  vivid: boolean;
  onDropReservation: (resId: string, roomId: string) => Promise<void> | void;
  onContext: (room: UIRoom, dayISO: string, res?: UIReservation) => void;
  onConflict: (opts: { draggedId: string; targetRoomId: string; conflicts: UIReservation[] }) => void;
}

export function RackGridRow({
  room,
  days,
  reservations,
  allRooms,
  index,
  compact,
  mode,
  vivid,
  onDropReservation,
  onContext,
  onConflict
}: RackGridRowProps) {
  return (
    <React.Fragment key={room.id}>
      <div className={`animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
        <RoomHeader room={room} />
      </div>
      {days.map((day, dayIndex) => {
        // Générer une clé unique basée sur les réservations pour forcer le re-render
        const cellReservations = reservations.filter(r => 
          r.roomId === room.id && 
          ((r.start <= day && r.end > day) || (r.start === day))
        );
        const cellKey = `${room.id}-${day}-${cellReservations.map(r => r.id).sort().join(',')}`;
        
        return (
          <div key={cellKey} 
               className={`animate-fade-in`} 
               style={{ animationDelay: `${(index * 50) + (dayIndex * 10)}ms` }}>
             <RackCell
               room={room}
               dayISO={day}
               reservations={reservations}
               allRooms={allRooms}
               mode={compact ? "compact" : mode}
               onDropReservation={onDropReservation}
               onContext={onContext}
               onConflict={onConflict}
               vivid={vivid}
             />
          </div>
        );
      })}
    </React.Fragment>
  );
}