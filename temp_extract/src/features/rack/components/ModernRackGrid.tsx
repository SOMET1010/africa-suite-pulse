import React, { useState } from 'react';
import { RoomCell } from './RoomCell';
import { RoomPhotoGallery } from './RoomPhotoGallery';
import type { UIRoom, UIReservation } from '../rack.types';

interface ModernRackGridProps {
  days: Array<{ date: string; dayName: string; dayNumber: string }>;
  filteredRooms: UIRoom[];
  reservations: UIReservation[];
  compact: boolean;
  vivid: boolean;
  zoom: number;
  onReservationMove: (reservationId: string, targetRoomId: string, targetDay: string) => void;
  onCellClick: (room: UIRoom, day: string, reservation?: UIReservation) => void;
}

export function ModernRackGrid({ 
  days, 
  filteredRooms, 
  reservations, 
  compact, 
  vivid, 
  zoom, 
  onReservationMove,
  onCellClick 
}: ModernRackGridProps) {
  const [photoGallery, setPhotoGallery] = useState<{
    room: UIRoom | null;
    open: boolean;
  }>({ room: null, open: false });

  const handleRoomDoubleClick = (room: UIRoom) => {
    setPhotoGallery({ room, open: true });
  };
  return (
    <div className="rack-grid-container overflow-auto border border-border rounded-lg bg-card shadow-soft">
      <div className="grid-wrapper" style={{ minWidth: 'fit-content' }}>
        {/* En-tête des jours */}
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <div 
            className="grid gap-1 p-2" 
            style={{
              gridTemplateColumns: `220px repeat(${days.length}, minmax(${compact ? '100px' : '140px'}, 1fr))`
            }}
          >
            <div className="font-semibold text-foreground px-3 py-2 text-left">
              Chambres ({filteredRooms.length})
            </div>
            {days.map((day) => (
              <div key={day.date} className="font-semibold text-center text-foreground px-2 py-2">
                <div className="text-sm">{day.dayName}</div>
                <div className="text-xs text-muted-foreground">{day.dayNumber}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Corps de la grille */}
        <div className="grid-body">
          {filteredRooms.map((room, roomIndex) => (
            <div 
              key={room.id} 
              className={`
                grid gap-1 border-b border-border/50 last:border-b-0
                hover:bg-muted/20 transition-colors duration-200
                ${roomIndex % 2 === 0 ? 'bg-card' : 'bg-muted/5'}
              `}
              style={{
                gridTemplateColumns: `220px repeat(${days.length}, minmax(${compact ? '100px' : '140px'}, 1fr))`
              }}
            >
              {/* En-tête chambre */}
              <div className="sticky left-0 z-10 bg-inherit border-r border-border px-3 py-2 flex items-center">
                <div className="w-full">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                      {room.number}
                    </span>
                    <span>Ch. {room.number}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <span className="capitalize">{room.type}</span>
                    {room.floor && (
                      <>
                        <span className="mx-1">•</span>
                        <span>Étage {room.floor}</span>
                      </>
                    )}
                  </div>
                  {/* Indicateur de statut */}
                  <div className="mt-1">
                    <span className={`
                      inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium
                      ${room.status === 'clean' ? 'bg-success/10 text-success' : ''}
                      ${room.status === 'dirty' ? 'bg-warning/10 text-warning' : ''}
                      ${room.status === 'out_of_order' ? 'bg-destructive/10 text-destructive' : ''}
                      ${room.status === 'maintenance' ? 'bg-warning/10 text-warning' : ''}
                      ${room.status === 'inspected' ? 'bg-info/10 text-info' : ''}
                    `}>
                      {room.status === 'clean' && '✨ Propre'}
                      {room.status === 'dirty' && '🧹 Sale'}
                      {room.status === 'out_of_order' && '🚫 HS'}
                      {room.status === 'maintenance' && '🔧 Maintenance'}
                      {room.status === 'inspected' && '👁️ Contrôlé'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cellules des jours */}
              {days.map((day) => (
                <div key={`${room.id}-${day.date}`} className="p-1 group">
                  <RoomCell
                    room={room}
                    day={day.date}
                    reservations={reservations}
                    compact={compact}
                    vivid={vivid}
                    zoom={zoom}
                    onReservationMove={onReservationMove}
                    onCellClick={onCellClick}
                    onDoubleClick={handleRoomDoubleClick}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Message si aucune chambre */}
        {filteredRooms.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <div className="text-4xl mb-2">🏨</div>
            <div className="font-medium">Aucune chambre trouvée</div>
            <div className="text-sm mt-1">Modifiez vos filtres pour voir plus de résultats</div>
          </div>
        )}
      </div>

      {/* Photo Gallery */}
      <RoomPhotoGallery
        room={photoGallery.room}
        open={photoGallery.open}
        onOpenChange={(open) => setPhotoGallery({ room: null, open })}
      />
    </div>
  );
}