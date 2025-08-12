import React, { createContext, useContext, useState } from 'react';
import type { UIReservation } from '../rack.types';

// État global simple pour le drag
interface SimpleDragState {
  isDragging: boolean;
  draggedReservation: UIReservation | null;
}

interface SimpleDragDropContextValue {
  dragState: SimpleDragState;
  startDrag: (reservation: UIReservation) => void;
  endDrag: () => void;
}

const SimpleDragDropContext = createContext<SimpleDragDropContextValue | null>(null);

export function SimpleDragDropProvider({ 
  children, 
  onReservationMove 
}: { 
  children: React.ReactNode;
  onReservationMove: (reservationId: string, targetRoomId: string, targetDay: string) => void;
}) {
  const [dragState, setDragState] = useState<SimpleDragState>({
    isDragging: false,
    draggedReservation: null,
  });

  const startDrag = (reservation: UIReservation) => {
    console.log('🎯 Simple drag started:', reservation.id);
    setDragState({
      isDragging: true,
      draggedReservation: reservation,
    });
  };

  const endDrag = () => {
    console.log('🎯 Simple drag ended');
    setDragState({
      isDragging: false,
      draggedReservation: null,
    });
  };

  return (
    <SimpleDragDropContext.Provider value={{ dragState, startDrag, endDrag }}>
      {children}
    </SimpleDragDropContext.Provider>
  );
}

export function useSimpleDragDrop() {
  const context = useContext(SimpleDragDropContext);
  if (!context) {
    throw new Error('useSimpleDragDrop must be used within SimpleDragDropProvider');
  }
  return context;
}

// CSS simplifié pour le drag & drop
export const SimpleDragDropStyles = `
.reservation-card.dragging {
  opacity: 0.5;
  transform: scale(0.95);
  z-index: 1000;
  cursor: grabbing;
}

.room-cell.drag-over-valid {
  background-color: rgba(34, 197, 94, 0.1);
  border-color: rgb(34, 197, 94);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.room-cell.drag-over-invalid {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgb(239, 68, 68);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
`;