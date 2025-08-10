import { getDragData } from "../rack.dnd";
import { isBlockedRoom } from "../rack.dnd";
import { validateDrop } from "../conflictValidation";
import type { UIReservation } from "../rack.types";

export function useDragHandlers(
  room: any,
  reservations: UIReservation[],
  setOver: (state: "ok" | "bad" | "conflict" | null) => void,
  onDropReservation: (resId: string, roomId: string) => Promise<void> | void,
  onConflict: (opts: { draggedId: string; targetRoomId: string; conflicts: UIReservation[] }) => void
) {
  
  function handleDragOver(e: React.DragEvent) {
    console.log(`🟡 Drag over room ${room.number}`);
    if (isBlockedRoom(room.status)) { 
      console.log(`❌ Room ${room.number} is blocked: ${room.status}`);
      setOver("bad"); 
      return; 
    }
    
    // Vérifier les conflits potentiels avec la nouvelle logique
    const resId = getDragData(e);
    if (resId) {
      const dragged = reservations.find(r => r.id === resId);
      if (dragged) {
        // CRITIQUE : Empêcher le drag sur la même chambre (en gérant les null)
        if (dragged.roomId && dragged.roomId === room.id) {
          console.log(`🔄 Same room drag detected for ${room.number}, ignoring`);
          setOver(null);
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        const validation = validateDrop(
          (window as any).__RACK_DATA__,
          dragged,
          room.id,
          today
        );
        console.log(`🔍 Drag validation for ${room.number}:`, validation);
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
    console.log(`🔵 Drop event triggered on room ${room.number} (${room.id})`);
    
    const resId = getDragData(e);
    console.log(`📍 Drop event on room ${room.id}: resId=${resId}`);
    
    setOver(null);
    
    if (!resId) {
      console.warn("❌ No reservation ID found in drop data");
      return;
    }
    
    if (isBlockedRoom(room.status)) { 
      console.warn(`❌ Cannot drop on blocked room ${room.number} (${room.status})`);
      alert("Chambre indisponible (HS/Maintenance)"); 
      return; 
    }
    
    const dragged = reservations.find(r => r.id === resId);
    if (!dragged) {
      console.warn(`❌ Dragged reservation not found: ${resId}`);
      return;
    }

    // CRITIQUE : Empêcher le drop sur la même chambre (en gérant les null)
    if (dragged.roomId && dragged.roomId === room.id) {
      console.log(`🔄 Cannot drop reservation on its own room ${room.number}, ignoring`);
      return;
    }

    console.log(`🔍 Validating drop for reservation ${dragged.guestName} (${dragged.start} → ${dragged.end}) on room ${room.number}`);

    // Valide sur l'ensemble de la période de la résa avec la nouvelle logique
    const today = new Date().toISOString().split('T')[0];
    const validation = validateDrop(
      (window as any).__RACK_DATA__,
      dragged,
      room.id,
      today
    );

    console.log(`📊 Drop validation result:`, validation);

    if (validation.ok) {
      console.log(`✅ No conflict, calling onDropReservation directly`);
      await onDropReservation(resId, room.id);
      return;
    }

    if (!validation.ok && "reason" in validation) {
      if (validation.reason === "BLOCKED") {
        console.log(`🚫 Room blocked`);
        alert("Chambre indisponible (HS/Maintenance).");
        return;
      }

      if (validation.reason === "CONFLICT" && validation.conflicts) {
        console.log(`⚠️ CONFLICT detected, opening conflict dialog with ${validation.conflicts.length} conflicts`);
        onConflict({ draggedId: resId, targetRoomId: room.id, conflicts: validation.conflicts });
        return;
      }
      
      if (validation.reason === "FUTURE_CONFLICT" && validation.conflicts) {
        console.log(`🔮 FUTURE_CONFLICT detected, opening conflict dialog`);
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