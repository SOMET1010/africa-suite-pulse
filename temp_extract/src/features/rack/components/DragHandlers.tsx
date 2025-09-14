import { getDragData } from "../rack.dnd";
import { isBlockedRoom } from "../rack.dnd";
import { validateDrop } from "../conflictValidation";
import type { UIReservation } from "../rack.types";
import { logger } from "@/lib/logger";

export function useDragHandlers(
  room: any,
  reservations: UIReservation[],
  setOver: (state: "ok" | "bad" | "conflict" | null) => void,
  onDropReservation: (resId: string, roomId: string) => Promise<void> | void,
  onConflict: (opts: { draggedId: string; targetRoomId: string; conflicts: UIReservation[] }) => void
) {
  
  function handleDragOver(e: React.DragEvent) {
    logger.debug('Drag over room', { roomNumber: room.number });
    if (isBlockedRoom(room.status)) { 
      logger.debug('Room is blocked', { roomNumber: room.number, status: room.status });
      setOver("bad"); 
      return; 
    }
    
    // Vérifier les conflits potentiels avec la nouvelle logique
    const resId = getDragData(e);
    if (resId) {
      const dragged = reservations.find(r => r.id === resId);
      if (dragged) {
         logger.debug('Drag over debug', { 
           draggedRoomId: dragged.roomId, 
           targetRoomId: room.id, 
           targetRoomNumber: room.number 
         });
        
        // CRITIQUE : Empêcher complètement le drag sur la même chambre
        if (dragged.roomId === room.id) {
          logger.debug('Blocked: same room drag', { 
            guestName: dragged.guestName, 
            roomNumber: room.number 
          });
          setOver("bad");
          e.preventDefault();
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const validation = validateDrop(
          (window as any).__RACK_DATA__,
          dragged,
          room.id,
          today
        );
        logger.debug('Drag validation result', { roomNumber: room.number, validation });
        if (!validation.ok && "reason" in validation) {
          if (validation.reason === "CONFLICT" || validation.reason === "FUTURE_CONFLICT") {
            setOver("conflict");
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            return;
          }
        }
      }
    }
    
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move"; 
    setOver("ok");
  }

  function handleDragLeave() {
    setOver(null);
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    logger.debug('Drop event triggered', { roomNumber: room.number, roomId: room.id });
    
    const resId = getDragData(e);
    logger.debug('Drop event details', { roomId: room.id, resId });
    
    setOver(null);
    
    if (!resId) {
      logger.warn('No reservation ID found in drop data');
      return;
    }
    
    if (isBlockedRoom(room.status)) { 
      logger.warn('Cannot drop on blocked room', { roomNumber: room.number, status: room.status });
      alert("Chambre indisponible (HS/Maintenance)"); 
      return; 
    }
    
    const dragged = reservations.find(r => r.id === resId);
    if (!dragged) {
      logger.warn('Dragged reservation not found', { resId });
      return;
    }

    logger.debug('Drop validation', { 
      draggedRoomId: dragged.roomId, 
      targetRoomId: room.id, 
      targetRoomNumber: room.number 
    });

    // CRITIQUE : Empêcher complètement le drop sur la même chambre
    if (dragged.roomId === room.id) {
      logger.debug('Blocked: same room drop', { guestName: dragged.guestName, roomNumber: room.number });
      alert(`⚠️ La réservation de ${dragged.guestName} est déjà dans la chambre ${room.number}`);
      return;
    }

    logger.debug('Validating drop for reservation', { 
      guestName: dragged.guestName, 
      period: `${dragged.start} → ${dragged.end}`,
      roomNumber: room.number 
    });

    // Valide sur l'ensemble de la période de la résa avec la nouvelle logique
    const today = new Date().toISOString().split('T')[0];
    const validation = validateDrop(
      (window as any).__RACK_DATA__,
      dragged,
      room.id,
      today
    );

    logger.debug('Drop validation result', { validation });

    if (validation.ok) {
      logger.debug('No conflict, calling onDropReservation directly');
      await onDropReservation(resId, room.id);
      return;
    }

    if (!validation.ok && "reason" in validation) {
      if (validation.reason === "BLOCKED") {
        logger.debug('Room blocked');
        alert("Chambre indisponible (HS/Maintenance).");
        return;
      }

      if (validation.reason === "CONFLICT" && validation.conflicts) {
        logger.debug('Conflict detected', { conflictCount: validation.conflicts.length });
        onConflict({ draggedId: resId, targetRoomId: room.id, conflicts: validation.conflicts });
        return;
      }
      
      if (validation.reason === "FUTURE_CONFLICT" && validation.conflicts) {
        logger.debug('Future conflict detected');
        onConflict({ draggedId: resId, targetRoomId: room.id, conflicts: validation.conflicts });
        return;
      }
    }
  }

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}