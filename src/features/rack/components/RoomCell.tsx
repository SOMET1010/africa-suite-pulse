import React, { useCallback } from 'react';
import { DraggableReservation, DropZoneRoom, useDragDrop } from '../hooks/useDragDrop';
import { ReservationCard } from './ReservationCard';
import { RoomTypeIndicator } from './RoomTypeIndicator';
import type { UIRoom, UIReservation } from '../rack.types';

interface RoomCellProps {
  room: UIRoom;
  day: string;
  reservations: UIReservation[];
  compact: boolean;
  vivid: boolean;
  zoom: number;
  onReservationMove: (reservationId: string, targetRoomId: string, targetDay: string) => void;
  onCellClick: (room: UIRoom, day: string, reservation?: UIReservation) => void;
}

export function RoomCell({ 
  room, 
  day, 
  reservations, 
  compact, 
  vivid, 
  zoom,
  onReservationMove,
  onCellClick 
}: RoomCellProps) {
  const { dragState } = useDragDrop();

  // Filtrer les réservations pour ce jour et cette chambre
  const dayReservations = reservations.filter(r => {
    // Vérifier si la réservation concerne cette chambre et ce jour
    const start = new Date(r.start);
    const end = new Date(r.end);
    const currentDay = new Date(day);
    
    return r.roomId === room.id && 
           currentDay >= start && 
           currentDay < end;
  });

  // Validation du drop
  const canAcceptDrop = useCallback((reservation: UIReservation, targetRoom: UIRoom, targetDay: string): boolean => {
    // Empêcher drop sur même chambre
    if (reservation.roomId === targetRoom.id) {
      return false;
    }

    // Interdire drop en dehors de la période du séjour
    const resStart = new Date(reservation.start);
    const resEnd = new Date(reservation.end);
    const dayDate = new Date(targetDay);
    if (dayDate < resStart || dayDate >= resEnd) {
      return false;
    }

    // Vérifier statut chambre
    if (targetRoom.status === 'out_of_order' || targetRoom.status === 'maintenance') {
      return false;
    }

    // Vérifier disponibilité (pas de conflit)
    const existingReservations = reservations.filter(r => {
      const rStart = new Date(r.start);
      const rEnd = new Date(r.end);
      return r.roomId === targetRoom.id && 
             r.id !== reservation.id &&
             dayDate >= rStart && 
             dayDate < rEnd;
    });

    return existingReservations.length === 0;
  }, [reservations]);

  // Gestion du drop
  const handleReservationDrop = useCallback((reservation: UIReservation, targetRoom: UIRoom, targetDay: string) => {
    if (!canAcceptDrop(reservation, targetRoom, targetDay)) {
      // Drop invalide: en dehors du séjour ou conflit
      return;
    }

    console.log('🎯 Drop validé:', {
      reservation: reservation.id,
      guest: reservation.guestName,
      from: reservation.roomId,
      to: targetRoom.id,
      day: targetDay
    });
    // Le déplacement effectif est déclenché par onDrop() du provider pour éviter des appels en double
  }, [canAcceptDrop]);

  // Style de la cellule selon le statut
  const getCellStyle = () => {
    const baseStyle = "relative border border-border transition-all duration-200 min-h-[60px] rounded-md";
    
    switch (room.status) {
      case 'clean':
        return `${baseStyle} bg-success/5 border-success/20`;
      case 'dirty':
        return `${baseStyle} bg-warning/5 border-warning/20`;
      case 'out_of_order':
        return `${baseStyle} bg-destructive/5 border-destructive/20`;
      case 'maintenance':
        return `${baseStyle} bg-warning/10 border-warning/30`;
      case 'inspected':
        return `${baseStyle} bg-info/5 border-info/20`;
      default:
        return `${baseStyle} bg-card hover:bg-muted/30`;
    }
  };

  // Obtenir l'icône de statut de la chambre
  const getRoomStatusIcon = () => {
    const icons = {
      'clean': '✨',
      'dirty': '🧹',
      'out_of_order': '🚫',
      'maintenance': '🔧',
      'inspected': '👁️'
    };
    return icons[room.status] || '🏠';
  };

  const isDraggedOver = dragState.dragOverRoom === `${room.id}-${day}`;

  return (
    <DropZoneRoom
      room={room}
      day={day}
      onReservationDrop={handleReservationDrop}
      canAcceptDrop={canAcceptDrop}
    >
      <div 
        className={`${getCellStyle()} ${isDraggedOver ? 'ring-2 ring-primary/50' : ''}`}
        style={{ 
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left'
        }}
        onClick={(e) => {
          if (dragState.isDragging) { e.preventDefault(); e.stopPropagation(); return; }
          onCellClick(room, day, dayReservations[0]);
        }}
      >
        {/* Contenu de la cellule */}
        <div className={`p-1.5 ${compact ? 'space-y-1' : 'space-y-2'} h-full`}>
          {dayReservations.map((reservation) => (
            <DraggableReservation
              key={reservation.id}
              reservation={reservation}
              onDragStart={() => {
                console.log('🎯 Début drag:', reservation.guestName);
                // Feedback haptique
                if ('vibrate' in navigator) {
                  navigator.vibrate(50);
                }
              }}
            >
              <ReservationCard 
                reservation={reservation} 
                compact={compact}
                vivid={vivid}
              />
            </DraggableReservation>
          ))}

          {/* Cellule vide */}
          {dayReservations.length === 0 && (
            <div className={`
              empty-cell text-center text-muted-foreground rounded-md border-2 border-dashed border-muted/30
              flex items-center justify-center h-full min-h-[48px]
              ${compact ? 'text-xs' : 'text-sm'}
              transition-all duration-200 hover:border-muted/50 hover:bg-muted/10
              ${isDraggedOver ? 'border-primary/50 bg-primary/5' : ''}
            `}>
            <div className="flex flex-col items-center gap-1 opacity-60">
              <span className="text-lg">{getRoomStatusIcon()}</span>
              <span className="text-xs">
                {room.status === 'out_of_order' || room.status === 'maintenance' 
                  ? 'Indisponible' 
                  : 'Libre'
                }
              </span>
              <RoomTypeIndicator typeCode={room.type} compact />
            </div>
            </div>
          )}
        </div>

        {/* Indicateur de statut chambre - coin */}
        <div className="absolute bottom-1 right-1 text-xs opacity-40 hover:opacity-60 transition-opacity">
          {getRoomStatusIcon()}
        </div>

        {/* Overlay de feedback pour drag over */}
        {isDraggedOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary/50 rounded-md animate-pulse" />
        )}
      </div>
    </DropZoneRoom>
  );
}