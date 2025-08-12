import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import type { UIReservation, UIRoom } from '../rack.types';

// Types pour le système drag & drop
interface DragState {
  isDragging: boolean;
  draggedReservation: UIReservation | null;
  dragOverRoom: string | null;
  canDrop: boolean;
  dragOffset: { x: number; y: number };
}

interface DragDropContextValue {
  dragState: DragState;
  startDrag: (reservation: UIReservation, offset: { x: number; y: number }) => void;
  endDrag: () => void;
  setDragOver: (roomId: string | null, canDrop: boolean) => void;
  onDrop: (targetRoom: UIRoom, targetDay: string) => void;
}

// Context pour partager l'état drag & drop
const DragDropContext = createContext<DragDropContextValue | null>(null);

// Styles CSS injectés dynamiquement
export const DragDropStyles = `
/* Animations drag & drop */
@keyframes drop-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.8; }
}

@keyframes drag-wobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}

/* États de drag */
.dragging {
  cursor: grabbing !important;
  user-select: none;
}

.drag-source {
  opacity: 0.6 !important;
  transform: scale(0.95) rotate(3deg) !important;
  z-index: 1000;
  animation: drag-wobble 0.3s ease-in-out;
}

.drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  transition: none;
}

/* Zones de drop */
.drag-over-valid {
  background: hsl(var(--success) / 0.1) !important;
  border: 2px dashed hsl(var(--success)) !important;
  animation: drop-pulse 1s ease-in-out infinite;
  box-shadow: 0 0 20px hsl(var(--success) / 0.3);
}

.drag-over-invalid {
  background: hsl(var(--destructive) / 0.1) !important;
  border: 2px dashed hsl(var(--destructive)) !important;
  animation: drop-pulse 1s ease-in-out infinite;
  box-shadow: 0 0 20px hsl(var(--destructive) / 0.3);
}

/* Feedback visuel mobile */
.touch-feedback {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  animation: scale-in 0.2s ease-out;
}

/* Ghost personnalisé */
.reservation-ghost {
  background: white;
  border: 2px solid hsl(var(--primary));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--primary));
}

.reservation-ghost::before {
  content: "📦 ";
  margin-right: 6px;
}
`;

// Provider du contexte drag & drop
export function DragDropProvider({ 
  children, 
  onReservationMove 
}: { 
  children: React.ReactNode;
  onReservationMove: (reservationId: string, targetRoomId: string, targetDay: string) => void;
}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedReservation: null,
    dragOverRoom: null,
    canDrop: false,
    dragOffset: { x: 0, y: 0 }
  });

  const ghostRef = useRef<HTMLDivElement | null>(null);

  // Démarrer le drag
  const startDrag = useCallback((reservation: UIReservation, offset: { x: number; y: number }) => {
    console.log('🎯 Starting drag:', reservation.guestName);
    
    setDragState({
      isDragging: true,
      draggedReservation: reservation,
      dragOverRoom: null,
      canDrop: false,
      dragOffset: offset
    });

    // Feedback haptique sur mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Créer le ghost element
    if (!ghostRef.current) {
      const ghost = document.createElement('div');
      ghost.className = 'reservation-ghost';
      ghost.textContent = reservation.guestName;
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '10000';
      ghost.style.left = '-9999px';
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
    }

    document.body.classList.add('dragging');
  }, []);

  // Terminer le drag
  const endDrag = useCallback(() => {
    console.log('🎯 Ending drag');
    
    setDragState({
      isDragging: false,
      draggedReservation: null,
      dragOverRoom: null,
      canDrop: false,
      dragOffset: { x: 0, y: 0 }
    });

    // Nettoyage
    document.body.classList.remove('dragging');
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
  }, []);

  // Définir zone de survol
  const setDragOver = useCallback((roomId: string | null, canDrop: boolean) => {
    setDragState(prev => ({
      ...prev,
      dragOverRoom: roomId,
      canDrop
    }));
  }, []);

  // Exécuter le drop
  const onDrop = useCallback((targetRoom: UIRoom, targetDay: string) => {
    if (dragState.draggedReservation && dragState.canDrop) {
      console.log('🎯 Executing drop:', {
        reservation: dragState.draggedReservation.guestName,
        targetRoom: targetRoom.number,
        targetDay
      });

      onReservationMove(
        dragState.draggedReservation.id,
        targetRoom.id,
        targetDay
      );
    }
    endDrag();
  }, [dragState, onReservationMove, endDrag]);

  // Suivre la souris pour positionner le ghost
  useEffect(() => {
    if (!dragState.isDragging || !ghostRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX}px`;
        ghostRef.current.style.top = `${e.clientY}px`;
        ghostRef.current.style.transform = 'translate(-50%, -50%)';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [dragState.isDragging]);

  const contextValue: DragDropContextValue = {
    dragState,
    startDrag,
    endDrag,
    setDragOver,
    onDrop
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
}

// Hook pour utiliser le contexte drag & drop
export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}

// Composant pour les réservations draggables
export function DraggableReservation({ 
  reservation, 
  children, 
  onDragStart 
}: {
  reservation: UIReservation;
  children: React.ReactNode;
  onDragStart?: () => void;
}) {
  const { startDrag, endDrag, dragState } = useDragDrop();
  const elementRef = useRef<HTMLDivElement>(null);

  const isDragSource = dragState.draggedReservation?.id === reservation.id;

  // Gestion souris
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click

    e.preventDefault();
    onDragStart?.();

    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    startDrag(reservation, offset);

    const handleMouseUp = () => {
      endDrag();
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };

    const handleMouseLeave = () => {
      endDrag();
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
  }, [reservation, startDrag, endDrag, onDragStart]);

  // Gestion tactile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onDragStart?.();

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    startDrag(reservation, offset);

    const handleTouchEnd = () => {
      endDrag();
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };

    const handleTouchCancel = () => {
      endDrag();
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };

    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel);
  }, [reservation, startDrag, endDrag, onDragStart]);

  return (
    <div
      ref={elementRef}
      className={`cursor-grab select-none transition-all duration-200 ${
        isDragSource ? 'drag-source' : ''
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ 
        touchAction: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
}

// Composant pour les zones de drop
export function DropZoneRoom({ 
  room, 
  day, 
  children, 
  onReservationDrop,
  canAcceptDrop 
}: {
  room: UIRoom;
  day: string;
  children: React.ReactNode;
  onReservationDrop: (reservation: UIReservation, targetRoom: UIRoom, targetDay: string) => void;
  canAcceptDrop: (reservation: UIReservation, targetRoom: UIRoom, targetDay: string) => boolean;
}) {
  const { dragState, setDragOver, onDrop } = useDragDrop();

  const isDragOver = dragState.dragOverRoom === room.id;
  const canDrop = dragState.draggedReservation ? 
    canAcceptDrop(dragState.draggedReservation, room, day) : false;

  // Gestion du survol
  const handleMouseEnter = useCallback(() => {
    if (dragState.isDragging && dragState.draggedReservation) {
      setDragOver(room.id, canDrop);
    }
  }, [dragState.isDragging, dragState.draggedReservation, room.id, canDrop, setDragOver]);

  const handleMouseMove = useCallback(() => {
    if (dragState.isDragging && dragState.draggedReservation) {
      setDragOver(room.id, canDrop);
    }
  }, [dragState.isDragging, dragState.draggedReservation, room.id, canDrop, setDragOver]);

  const handleMouseLeave = useCallback(() => {
    if (dragState.isDragging) {
      setDragOver(null, false);
    }
  }, [dragState.isDragging, setDragOver]);

  // Gestion du drop
  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && isDragOver && canDrop && dragState.draggedReservation) {
      onReservationDrop(dragState.draggedReservation, room, day);
      onDrop(room, day);
    }
  }, [dragState, isDragOver, canDrop, room, day, onReservationDrop, onDrop]);

  // Gestion tactile pour le drop
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragState.isDragging) return;

    const touch = e.touches[0];
    const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementFromPoint?.closest('[data-drop-zone]');
    
    if (dropZone && dropZone.getAttribute('data-room-id') === room.id) {
      setDragOver(room.id, canDrop);
    }
  }, [dragState.isDragging, room.id, canDrop, setDragOver]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!dragState.isDragging) return;

    const touch = e.changedTouches[0];
    const elementFromPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementFromPoint?.closest('[data-drop-zone]');
    
    if (dropZone && dropZone.getAttribute('data-room-id') === room.id && canDrop && dragState.draggedReservation) {
      onReservationDrop(dragState.draggedReservation, room, day);
      onDrop(room, day);
    }
  }, [dragState, room, day, canDrop, onReservationDrop, onDrop]);

  return (
    <div
      data-drop-zone
      data-room-id={room.id}
      className={`transition-all duration-200 ${
        isDragOver 
          ? canDrop 
            ? 'drag-over-valid' 
            : 'drag-over-invalid'
          : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}