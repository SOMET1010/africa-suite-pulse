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
        const validation = validateDrop(
          (window as any).__RACK_DATA__,
          dragged,
          room.id
        );
        if (!validation.ok && "reason" in validation && validation.reason === "CONFLICT") {
          setOver("conflict");
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          return;
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
    if (!dragged) return;

    // Valide sur l'ensemble de la période de la résa avec la nouvelle logique
    const validation = validateDrop(
      (window as any).__RACK_DATA__,
      dragged,
      room.id
    );

    if (validation.ok) {
      console.log(`✅ No conflict, calling onDropReservation directly`);
      await onDropReservation(resId, room.id);
      return;
    }

    if (!validation.ok && "reason" in validation) {
      if (validation.reason === "BLOCKED") {
        alert("Chambre indisponible (HS/Maintenance).");
        return;
      }

      if (validation.reason === "CONFLICT" && validation.conflicts) {
        console.log(`⚠️ Conflict detected, opening conflict dialog`);
        onConflict({ draggedId: resId, targetRoomId: room.id, conflicts: validation.conflicts });
      }
    }
  }

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}