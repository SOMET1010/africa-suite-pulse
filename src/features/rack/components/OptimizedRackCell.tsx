import React, { memo } from 'react';
import { cn } from '@/lib/utils';
// import { useDragHandlers } from '../hooks/useDragHandlers';
import BookingPill from './BookingPill';
import type { UIRoom, UIReservation } from '../rack.types';

interface OptimizedRackCellProps {
  room: UIRoom;
  day: string;
  reservations: UIReservation[];
  onDropReservation?: (reservationId: string, roomId: string, day: string) => void;
  onContext?: (e: React.MouseEvent, room: UIRoom, day: string) => void;
  onConflict?: (roomId: string, day: string) => void;
  onLeftClick?: (room: UIRoom, day: string) => void;
  onRightClick?: (e: React.MouseEvent, room: UIRoom, day: string) => void;
  compact?: boolean;
  vividColors?: boolean;
  selectionMode?: 'source' | 'destination' | null;
  isSelected?: boolean;
  hasConflict?: boolean;
  className?: string;
}

/**
 * Cellule optimisée du rack avec React.memo pour éviter les re-renders inutiles
 * Utilisée dans la grille du plan des chambres
 */
export const OptimizedRackCell = memo<OptimizedRackCellProps>(({
  room,
  day,
  reservations,
  onDropReservation,
  onContext,
  onConflict,
  onLeftClick,
  onRightClick,
  compact = false,
  vividColors = false,
  selectionMode,
  isSelected = false,
  hasConflict = false,
  className
}) => {
  // Filtrer les réservations pour cette cellule (memoized dans le composant parent)
  const cellReservations = reservations.filter(reservation => {
    return reservation.roomId === room.id &&
           reservation.start <= day &&
           reservation.end > day;
  });

  // Simplified drag handlers for now
  const dragOver = false;
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDragLeave = () => {};
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.detail === 1) {
      onLeftClick?.(room, day);
    } else if (e.detail === 2) {
      onContext?.(e, room, day);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick?.(e, room, day);
  };

  return (
    <div
      className={cn(
        "relative border-r border-b border-border/50 transition-colors",
        "hover:bg-muted/50 cursor-pointer group",
        {
          "h-8": compact,
          "h-12": !compact,
          "bg-destructive/10 border-destructive/30": hasConflict,
          "bg-primary/10 border-primary/30": isSelected && selectionMode === 'source',
          "bg-secondary/10 border-secondary/30": isSelected && selectionMode === 'destination',
          "bg-accent/20": dragOver,
        },
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      data-room-id={room.id}
      data-day={day}
    >
      {/* Contenu des réservations */}
      {cellReservations.map((reservation, index) => (
        <BookingPill
          key={`${reservation.id}-${index}`}
          r={reservation}
        />
      ))}

      {/* Indicateurs visuels */}
      {hasConflict && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-bl-sm" />
      )}
      
      {selectionMode && isSelected && (
        <div className={cn(
          "absolute inset-0 border-2 pointer-events-none",
          {
            "border-primary": selectionMode === 'source',
            "border-secondary": selectionMode === 'destination',
          }
        )} />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Fonction de comparaison personnalisée pour React.memo
  // Ne re-render que si les props importantes changent
  return (
    prevProps.room.id === nextProps.room.id &&
    prevProps.day === nextProps.day &&
    prevProps.compact === nextProps.compact &&
    prevProps.vividColors === nextProps.vividColors &&
    prevProps.selectionMode === nextProps.selectionMode &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.hasConflict === nextProps.hasConflict &&
    prevProps.reservations.length === nextProps.reservations.length &&
    // Comparaison superficielle des réservations
    prevProps.reservations.every((res, index) => 
      nextProps.reservations[index]?.id === res.id &&
      nextProps.reservations[index]?.status === res.status
    )
  );
});

OptimizedRackCell.displayName = 'OptimizedRackCell';