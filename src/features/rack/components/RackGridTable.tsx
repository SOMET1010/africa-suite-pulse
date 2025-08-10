import React from "react";
import { RackGridHeader } from "./RackGridHeader";
import { RackGridRow } from "./RackGridRow";
import type { UIRoom, UIReservation } from "../rack.types";

interface RackGridTableProps {
  days: string[];
  filteredRooms: UIRoom[];
  reservations: UIReservation[];
  allRooms: UIRoom[];
  compact: boolean;
  mode: "compact" | "detailed";
  vivid: boolean;
  zoom: number;
  onDropReservation: (resId: string, roomId: string) => Promise<void> | void;
  onContext: (room: UIRoom, dayISO: string, res?: UIReservation) => void;
  onConflict: (opts: { draggedId: string; targetRoomId: string; conflicts: UIReservation[] }) => void;
}

export function RackGridTable({
  days,
  filteredRooms,
  reservations,
  allRooms,
  compact,
  mode,
  vivid,
  zoom,
  onDropReservation,
  onContext,
  onConflict
}: RackGridTableProps) {
  return (
    <div className="card-elevated overflow-auto bg-gradient-secondary/30 backdrop-blur-sm animate-fade-in scrollbar-thin touch-pan-x" 
         style={{ fontSize: `${Math.max(10, Math.min(16, (zoom/100)*14))}px` }}>
      <div style={{ width: 'max-content' }}>
        <div className="grid touch-manipulation" 
             style={{ gridTemplateColumns: `${compact ? '200px' : '260px'} repeat(${days.length}, ${compact ? '60px' : '80px'})` }}>
          
          <RackGridHeader days={days} />
          
          {/* Rows avec animations */}
          {filteredRooms.map((room, index) => (
            <RackGridRow
              key={room.id}
              room={room}
              days={days}
              reservations={reservations}
              allRooms={allRooms}
              index={index}
              compact={compact}
              mode={mode}
              vivid={vivid}
              onDropReservation={onDropReservation}
              onContext={onContext}
              onConflict={onConflict}
            />
          ))}
        </div>
      </div>
    </div>
  );
}