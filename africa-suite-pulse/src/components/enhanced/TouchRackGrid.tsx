import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoomStatusCard } from './RoomStatusCard';
import { GuestInfoPanel } from './GuestInfoPanel';
import { cn } from '@/lib/utils';
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  List,
  Calendar,
  User,
  Settings
} from 'lucide-react';

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: 'clean' | 'dirty' | 'maintenance' | 'inspected' | 'out_of_order';
}

interface Reservation {
  id: string;
  room_id: string;
  guest_name: string;
  date_arrival: string;
  date_departure: string;
  status: 'confirmed' | 'present' | 'option' | 'cancelled';
  adults: number;
  children: number;
}

interface Day {
  date: string;
  dayName: string;
  dayNumber: string;
}

interface TouchRackGridProps {
  rooms: Room[];
  days: Day[];
  reservations: Reservation[];
  onReservationMove: (reservationId: string, roomId: string, date: string) => void;
  onCellClick: (room: Room, day: Day) => void;
  onCellLongPress?: (room: Room, day: Day) => void;
  className?: string;
}

export function TouchRackGrid({
  rooms,
  days,
  reservations,
  onReservationMove,
  onCellClick,
  onCellLongPress,
  className
}: TouchRackGridProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const gridRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cellSize = Math.max(60, (zoomLevel / 100) * 80);
  const roomHeaderWidth = Math.max(100, (zoomLevel / 100) * 120);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(200, prev + 25));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(50, prev - 25));

  // Get reservations for a specific room and date
  const getReservationForCell = useCallback((roomId: string, date: string) => {
    return reservations.find(res => 
      res.room_id === roomId && 
      res.date_arrival <= date && 
      res.date_departure > date
    );
  }, [reservations]);

  // Touch handling for gestures
  const handleTouchStart = (e: React.TouchEvent, room: Room, day: Day) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      handleLongPress(room, day);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current || !isPanning) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: touchStartRef.current.time };
  };

  const handleTouchEnd = (e: React.TouchEvent, room: Room, day: Day) => {
    // Cancel long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;

    // If it's a tap (minimal movement, short duration)
    if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
      handleCellClick(room, day);
    }

    touchStartRef.current = null;
    setIsPanning(false);
  };

  const handleCellClick = (room: Room, day: Day) => {
    const cellKey = `${room.id}-${day.date}`;
    
    if (multiSelectMode) {
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cellKey)) {
          newSet.delete(cellKey);
        } else {
          newSet.add(cellKey);
        }
        return newSet;
      });
    } else {
      const reservation = getReservationForCell(room.id, day.date);
      if (reservation) {
        setSelectedReservation(reservation);
      } else {
        setSelectedRoom(room);
      }
      onCellClick(room, day);
    }
  };

  const handleLongPress = (room: Room, day: Day) => {
    setMultiSelectMode(true);
    const cellKey = `${room.id}-${day.date}`;
    setSelectedCells(new Set([cellKey]));
    onCellLongPress?.(room, day);
  };

  // Render cell content
  const renderCell = (room: Room, day: Day) => {
    const reservation = getReservationForCell(room.id, day.date);
    const cellKey = `${room.id}-${day.date}`;
    const isSelected = selectedCells.has(cellKey);
    const isToday = day.date === new Date().toISOString().split('T')[0];

    return (
      <div
        key={cellKey}
        className={cn(
          "relative border border-border/50 transition-all duration-200 cursor-pointer",
          "hover:border-primary/50 hover:shadow-sm",
          isSelected && "ring-2 ring-primary bg-primary/10",
          isToday && "bg-soft-primary/20",
          viewMode === 'compact' ? "h-12" : `h-16`
        )}
        style={{ width: cellSize }}
        onTouchStart={(e) => handleTouchStart(e, room, day)}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => handleTouchEnd(e, room, day)}
        onClick={() => handleCellClick(room, day)}
      >
        {reservation ? (
          <div className={cn(
            "h-full w-full p-1 text-xs rounded",
            reservation.status === 'present' && "bg-success text-white",
            reservation.status === 'confirmed' && "bg-primary text-white",
            reservation.status === 'option' && "bg-warning text-white",
            reservation.status === 'cancelled' && "bg-muted text-muted-foreground line-through"
          )}>
            {viewMode === 'grid' ? (
              <>
                <div className="font-medium truncate">{reservation.guest_name}</div>
                <div className="text-xs opacity-80">
                  {reservation.adults}
                  {reservation.children > 0 && `+${reservation.children}`}
                </div>
              </>
            ) : (
              <div className="font-medium truncate text-center leading-tight">
                {reservation.guest_name.split(' ')[0]}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            {room.status === 'maintenance' && (
              <div className="w-2 h-2 bg-warning rounded-full" />
            )}
            {room.status === 'dirty' && (
              <div className="w-2 h-2 bg-danger rounded-full" />
            )}
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
        )}
      </div>
    );
  };

  return (
    <div className={cn("touch-rack-grid", className)}>
      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'compact' : 'grid')}
                className="p-2 rounded-lg bg-soft-muted hover:bg-muted/50 transition-colors"
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </button>
              
              {multiSelectMode && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {selectedCells.size} sélectionnées
                  </Badge>
                  <button
                    onClick={() => {
                      setMultiSelectMode(false);
                      setSelectedCells(new Set());
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-lg bg-soft-muted hover:bg-muted/50 transition-colors"
                disabled={zoomLevel <= 50}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              
              <span className="text-sm font-medium w-12 text-center">
                {zoomLevel}%
              </span>
              
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-lg bg-soft-muted hover:bg-muted/50 transition-colors"
                disabled={zoomLevel >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid Container */}
      <div className="relative overflow-auto border border-border rounded-lg">
        <div
          ref={gridRef}
          className="min-w-max"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
          }}
        >
          {/* Header Row */}
          <div className="flex sticky top-0 bg-background z-20 border-b border-border">
            <div
              className="flex-shrink-0 p-3 bg-soft-muted font-medium border-r border-border"
              style={{ width: roomHeaderWidth }}
            >
              Chambres
            </div>
            {days.map((day) => (
              <div
                key={day.date}
                className="flex-shrink-0 p-2 text-center font-medium border-r border-border"
                style={{ width: cellSize }}
              >
                <div className="text-xs text-muted-foreground">{day.dayName}</div>
                <div className="text-sm">{day.dayNumber}</div>
              </div>
            ))}
          </div>

          {/* Room Rows */}
          {rooms.map((room) => (
            <div key={room.id} className="flex border-b border-border">
              <div
                className="flex-shrink-0 border-r border-border"
                style={{ width: roomHeaderWidth }}
              >
                <RoomStatusCard
                  room={room}
                  compact={viewMode === 'compact'}
                  onClick={() => setSelectedRoom(room)}
                />
              </div>
              {days.map((day) => renderCell(room, day))}
            </div>
          ))}
        </div>
      </div>

      {/* Guest Info Panel */}
      {selectedReservation && (
        <GuestInfoPanel
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          className="mt-4"
        />
      )}
    </div>
  );
}