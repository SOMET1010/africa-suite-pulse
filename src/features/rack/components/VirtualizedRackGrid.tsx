import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { OptimizedRackCell } from './OptimizedRackCell';
import type { UIRoom, UIReservation } from '../rack.types';

interface VirtualizedRackGridProps {
  rooms: UIRoom[];
  days: string[];
  reservations: UIReservation[];
  onDropReservation?: (reservationId: string, roomId: string, day: string) => void;
  onContext?: (e: React.MouseEvent, room: UIRoom, day: string) => void;
  onConflict?: (roomId: string, day: string) => void;
  onLeftClick?: (room: UIRoom, day: string) => void;
  onRightClick?: (e: React.MouseEvent, room: UIRoom, day: string) => void;
  compact?: boolean;
  vividColors?: boolean;
  selectionMode?: 'source' | 'destination' | null;
  filteredRooms?: UIRoom[];
  className?: string;
}

interface RowData {
  rooms: UIRoom[];
  days: string[];
  reservations: UIReservation[];
  onDropReservation?: (reservationId: string, roomId: string, day: string) => void;
  onContext?: (e: React.MouseEvent, room: UIRoom, day: string) => void;
  onConflict?: (roomId: string, day: string) => void;
  onLeftClick?: (room: UIRoom, day: string) => void;
  onRightClick?: (e: React.MouseEvent, room: UIRoom, day: string) => void;
  compact?: boolean;
  vividColors?: boolean;
  selectionMode?: 'source' | 'destination' | null;
}

// Composant pour une ligne de la grille virtualisée
const RackRow = memo<{ index: number; style: React.CSSProperties; data: RowData }>(
  ({ index, style, data }) => {
    const room = data.rooms[index];
    if (!room) return null;

    // Pré-filtrer les réservations pour cette chambre
    const roomReservations = useMemo(() => 
      data.reservations.filter(res => res.roomId === room.id),
      [data.reservations, room.id]
    );

    return (
      <div style={style} className="flex">
        {/* En-tête de la chambre */}
        <div className="flex-shrink-0 w-20 border-r border-border bg-background flex items-center justify-center text-sm font-medium">
          {room.number}
        </div>
        
        {/* Cellules pour chaque jour */}
        <div className="flex flex-1">
          {data.days.map((day) => (
            <OptimizedRackCell
              key={`${room.id}-${day}`}
              room={room}
              day={day}
              reservations={roomReservations}
              onDropReservation={data.onDropReservation}
              onContext={data.onContext}
              onConflict={data.onConflict}
              onLeftClick={data.onLeftClick}
              onRightClick={data.onRightClick}
              compact={data.compact}
              vividColors={data.vividColors}
              selectionMode={data.selectionMode}
              className="flex-1 min-w-[80px]"
            />
          ))}
        </div>
      </div>
    );
  }
);

RackRow.displayName = 'RackRow';

/**
 * Grille virtualisée pour le rack - optimise le rendu pour de nombreuses chambres
 * Utilise react-window pour la virtualisation des lignes
 */
export const VirtualizedRackGrid = memo<VirtualizedRackGridProps>(({
  rooms,
  days,
  reservations,
  onDropReservation,
  onContext,
  onConflict,
  onLeftClick,
  onRightClick,
  compact = false,
  vividColors = false,
  selectionMode,
  filteredRooms,
  className
}) => {
  const displayRooms = filteredRooms || rooms;
  const itemHeight = compact ? 32 : 48; // 8*4=32px ou 12*4=48px en Tailwind
  const maxHeight = Math.min(600, window.innerHeight - 200); // Hauteur maximale
  
  const rowData = useMemo<RowData>(() => ({
    rooms: displayRooms,
    days,
    reservations,
    onDropReservation,
    onContext,
    onConflict,
    onLeftClick,
    onRightClick,
    compact,
    vividColors,
    selectionMode
  }), [
    displayRooms,
    days,
    reservations,
    onDropReservation,
    onContext,
    onConflict,
    onLeftClick,
    onRightClick,
    compact,
    vividColors,
    selectionMode
  ]);

  // Header avec les jours
  const header = useMemo(() => (
    <div className="flex border-b border-border bg-background sticky top-0 z-10">
      <div className="flex-shrink-0 w-20 border-r border-border flex items-center justify-center text-xs font-semibold">
        Chambres
      </div>
      <div className="flex flex-1">
        {days.map((day) => (
          <div
            key={day}
            className="flex-1 min-w-[80px] border-r border-border px-2 py-1 text-center text-xs font-medium"
          >
            {new Date(day + 'T00:00:00').toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </div>
        ))}
      </div>
    </div>
  ), [days]);

  return (
    <div className={className}>
      {header}
      <List
        height={maxHeight}
        width="100%"
        itemCount={displayRooms.length}
        itemSize={itemHeight}
        itemData={rowData}
        overscanCount={5} // Pré-rendre 5 éléments en plus pour la fluidité
        className="border border-border"
      >
        {RackRow}
      </List>
    </div>
  );
});

VirtualizedRackGrid.displayName = 'VirtualizedRackGrid';