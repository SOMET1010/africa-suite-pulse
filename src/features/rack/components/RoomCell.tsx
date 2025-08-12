import React, { useMemo, useCallback, useState } from 'react';
import { ReservationCard } from './ReservationCard';
import { RoomTypeIndicator } from './RoomTypeIndicator';
import { EmptyRoomInfo } from './EmptyRoomInfo';
import type { UIRoom, UIReservation } from '../rack.types';

interface RoomCellProps {
  room: UIRoom;
  day: string;
  reservations: UIReservation[];
  compact?: boolean;
  vivid?: boolean;
  zoom?: number;
  onReservationMove: (reservationId: string, targetRoomId: string, targetDay: string) => void;
  onCellClick: (room: UIRoom, day: string, reservation?: UIReservation) => void;
}

export function RoomCell({
  room,
  day,
  reservations,
  compact = false,
  vivid = false,
  zoom = 1,
  onReservationMove,
  onCellClick,
}: RoomCellProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [canDrop, setCanDrop] = useState(false);

  // 📊 Réservations pour cette cellule (room + day)
  const cellReservations = useMemo(() => {
    return reservations.filter(reservation => {
      // Filtrage par chambre
      if (reservation.roomId !== room.id) return false;
      
      // Filtrage par jour (la réservation doit couvrir ce jour)
      const dayDate = new Date(day);
      const arrivalDate = new Date(reservation.start);
      const departureDate = new Date(reservation.end);
      
      // Le jour doit être >= arrivée et < départ
      return dayDate >= arrivalDate && dayDate < departureDate;
    });
  }, [reservations, room.id, day]);

  // Validation du drop - avec logs détaillés pour debug
  const validateDrop = useCallback((reservationId: string) => {
    console.log('🔍 validateDrop appelé:', {
      reservationId,
      targetRoomId: room.id,
      targetDay: day
    });
    
    if (!reservationId) {
      console.log('❌ Pas de reservationId');
      return false;
    }
    
    const draggedReservation = reservations.find(r => r.id === reservationId);
    if (!draggedReservation) {
      console.log('❌ Réservation non trouvée');
      return false;
    }
    
    console.log('🔍 Réservation trouvée:', {
      id: draggedReservation.id,
      currentRoomId: draggedReservation.roomId,
      targetRoomId: room.id,
      guestName: draggedReservation.guestName
    });
    
    // Date passée (comme dans votre code)
    const today = new Date().toISOString().split('T')[0];
    if (day < today) {
      console.log('❌ Impossible de déplacer vers une date passée');
      return false;
    }
    
    // Même chambre = pas de déplacement
    if (draggedReservation.roomId === room.id) {
      console.log('❌ Même chambre:', {
        current: draggedReservation.roomId,
        target: room.id
      });
      return false;
    }
    
    // Chambre hors service ou maintenance (comme dans votre code)
    if (room.status === 'out_of_order' || room.status === 'maintenance') {
      console.log('❌ Chambre non disponible:', room.status);
      return false;
    }
    
    // Conflit avec une réservation existante
    const existingReservation = cellReservations.find(res => res.id !== reservationId);
    if (existingReservation) {
      console.log('❌ Chambre déjà occupée par:', existingReservation.guestName);
      return false;
    }
    
    console.log('✅ Validation réussie - drop autorisé');
    return true;
  }, [room, cellReservations, reservations, day]);

  // Gestion du drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const reservationId = e.dataTransfer.getData('text/reservation-id');
    const isValid = validateDrop(reservationId);
    
    setIsDragOver(true);
    setCanDrop(isValid);
  }, [validateDrop]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setCanDrop(false);
  }, []);

  // Gestion du drop - POINT CENTRAL
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    console.log('🎯 RoomCell handleDrop');
    
    const reservationId = e.dataTransfer.getData('text/reservation-id');
    if (!reservationId) {
      console.log('❌ Pas de reservationId dans le drop');
      return;
    }

    if (validateDrop(reservationId)) {
      console.log('✅ Drop valide - calling onReservationMove:', {
        reservationId,
        roomId: room.id,
        day
      });
      onReservationMove(reservationId, room.id, day);
    } else {
      console.log('❌ Drop invalide');
    }
    
    setIsDragOver(false);
    setCanDrop(false);
  }, [validateDrop, onReservationMove, room.id, day]);

  // Style de la cellule selon le statut
  const getCellStyle = () => {
    const baseStyle = "relative border border-border transition-all duration-200";
    
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
  const getRoomStatusIcon = (status: string) => {
    const icons = {
      'clean': '✨',
      'dirty': '🧹',
      'out_of_order': '🚫',
      'maintenance': '🔧',
      'inspected': '👁️'
    };
    return icons[status] || '🏠';
  };

  return (
    <div
      className={`
        room-cell cell group relative overflow-hidden transition-all duration-200 min-h-[120px] border-2
        ${getCellStyle()}
        ${compact ? 'min-h-[80px]' : ''}
        ${zoom !== 1 ? `scale-${Math.round(zoom * 100)}` : ''}
        ${isDragOver && canDrop ? 'drag-over-valid' : ''}
        ${isDragOver && !canDrop ? 'drag-over-invalid' : ''}
        hover:shadow-sm hover:z-10
      `}
      onClick={() => onCellClick(room, day, cellReservations[0] || null)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Contenu de la cellule */}
      <div className={`p-2 h-full ${compact ? 'space-y-1' : 'space-y-2'}`}>
        {/* Réservations */}
        {cellReservations.map((reservation) => (
          <ReservationCard 
            key={reservation.id}
            reservation={reservation} 
            compact={compact}
            vivid={vivid}
          />
        ))}

        {/* Cellule vide */}
        {cellReservations.length === 0 && (
          <div className={`
            empty-cell text-center text-muted-foreground rounded-md border-2 border-dashed border-muted/30
            flex flex-col items-center justify-center h-full min-h-[48px] gap-1
            ${compact ? 'text-xs' : 'text-sm'}
            transition-all duration-200 hover:border-muted/50 hover:bg-muted/10
            ${isDragOver ? (canDrop ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5') : ''}
          `}>
            <span className="text-lg opacity-60">
              {getRoomStatusIcon(room.status)}
            </span>
            <div className="text-xs opacity-50">
              {room.status === 'out_of_order' || room.status === 'maintenance' 
                ? 'Indisponible' 
                : 'Libre'
              }
            </div>
            {!compact && (
              <RoomTypeIndicator typeCode={room.type} compact />
            )}
          </div>
        )}
      </div>

      {/* Badge de statut dans le coin */}
      {!cellReservations.length && (
        <div className="absolute top-1 right-1 text-xs opacity-50 group-hover:opacity-75 transition-opacity z-20">
          {getRoomStatusIcon(room.status)}
        </div>
      )}
    </div>
  );
}