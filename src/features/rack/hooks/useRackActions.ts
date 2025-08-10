import { toast } from "@/hooks/use-toast";
import { reassignReservation } from "../rack.service";
import { canSwap, findFirstFreeRoom, findBestRelocationRooms, type Relocation } from "../conflictValidation";
import type { UIRoom, UIReservation, RackData } from "../rack.types";

interface UseRackActionsProps {
  data: RackData | null;
  reload: () => Promise<void>;
  conflictDialog: {
    open: boolean;
    dragged: UIReservation | null;
    targetRoomId: string | null;
    conflicts: UIReservation[];
    preview: Relocation[];
  };
  setConflictDialog: (state: any) => void;
  setDetailSheet: (state: any) => void;
  setMoveConfirmDialog: (state: any) => void;
}

export function useRackActions({
  data,
  reload,
  conflictDialog,
  setConflictDialog,
  setDetailSheet,
  setMoveConfirmDialog
}: UseRackActionsProps) {
  
  async function onDropReservation(resId: string, roomId: string) {
    console.log(`🎯 Dropping reservation ${resId} onto room ${roomId}`);
    
    if (!data) return;
    
    const reservation = data.reservations.find(r => r.id === resId);
    const targetRoom = data.rooms.find(r => r.id === roomId);
    const sourceRoom = reservation ? data.rooms.find(r => r.id === reservation.roomId) : null;
    
    if (!reservation || !targetRoom) {
      console.error("❌ Reservation or room not found");
      return;
    }
    
    // Afficher le dialog de confirmation (pas de conflit car déjà validé)
    setMoveConfirmDialog({
      open: true,
      reservation,
      sourceRoom,
      targetRoom,
      pendingDrop: { resId, roomId }
    });
  }

  function handleConflict({ draggedId, targetRoomId, conflicts }: { 
    draggedId: string; 
    targetRoomId: string; 
    conflicts: UIReservation[] 
  }) {
    const dragged = data?.reservations.find(r => r.id === draggedId) || null;
    // calcule la preview dès l'ouverture
    const preview = data ? findBestRelocationRooms(data, conflicts, { excludeRoomIds: [targetRoomId] }) : [];
    setConflictDialog({ open: true, dragged, targetRoomId, conflicts, preview });
  }

  function onContext(room: UIRoom, dayISO: string, res?: UIReservation) {
    setDetailSheet({
      open: true,
      room,
      dayISO,
      reservation: res
    });
  }

  function closeConflictDialog() {
    setConflictDialog({ open: false, dragged: null, targetRoomId: null, conflicts: [], preview: [] });
  }

  async function doSwap() {
    const { dragged, targetRoomId, conflicts } = conflictDialog;
    if (!dragged || !targetRoomId || !data) return;
    
    if (!canSwap(dragged, conflicts)) {
      toast({ 
        title: "❌ Échange impossible", 
        description: "Plusieurs conflits ou dates différentes",
        variant: "destructive"
      });
      return;
    }
    
    const other = conflicts[0];

    try {
      if (!dragged.roomId) {
        toast({ title: "❌ Erreur", description: "Ancienne chambre introuvable", variant: "destructive" });
        return;
      }
      
      await reassignReservation(other.id, dragged.roomId);
      await reassignReservation(dragged.id, targetRoomId);

      toast({ 
        title: "✅ Échange effectué", 
        description: "Les réservations ont été échangées" 
      });
      
      closeConflictDialog();
      await reload();
    } catch (error) {
      console.error("❌ Error during swap:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible d'effectuer l'échange",
        variant: "destructive" 
      });
    }
  }

  async function doAutoRelodge() {
    const { dragged, targetRoomId, conflicts } = conflictDialog;
    if (!dragged || !targetRoomId || !data) return;

    try {
      for (const c of conflicts) {
        const free = findFirstFreeRoom(data, c, [targetRoomId]);
        if (!free) {
          toast({ 
            title: "❌ Délogement impossible", 
            description: `Aucune chambre libre trouvée pour ${c.guestName}`,
            variant: "destructive"
          });
          return;
        }
        await reassignReservation(c.id, free.id);
      }
      await reassignReservation(dragged.id, targetRoomId);

      toast({ 
        title: "✅ Délogement effectué", 
        description: `${conflicts.length} réservation${conflicts.length > 1 ? 's' : ''} délogée${conflicts.length > 1 ? 's' : ''} automatiquement` 
      });

      closeConflictDialog();
      await reload();
    } catch (error) {
      console.error("❌ Error during auto relodge:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible d'effectuer le délogement automatique",
        variant: "destructive" 
      });
    }
  }

  /** Exécute le plan validé (avec preview déjà affichée) */
  async function doConfirmRelodge(plan: Relocation[]) {
    const { dragged, targetRoomId } = conflictDialog;
    if (!dragged || !targetRoomId) return;

    try {
      // 1) déplacer tous les conflits selon le plan
      for (const p of plan) {
        if (!p.target) {
          toast({
            title: "❌ Erreur",
            description: `Aucune solution pour ${p.conflict.guestName}`,
            variant: "destructive"
          });
          return;
        }
        await reassignReservation(p.conflict.id, p.target.id);
      }
      // 2) déplacer la réservation d'origine vers la cible
      await reassignReservation(dragged.id, targetRoomId);

      toast({ 
        title: "✅ Plan de délogement exécuté", 
        description: `${plan.length} réservation${plan.length > 1 ? 's' : ''} relocalisée${plan.length > 1 ? 's' : ''} avec succès` 
      });

      closeConflictDialog();
      await reload();
    } catch (error) {
      console.error("❌ Error during plan execution:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible d'exécuter le plan de délogement",
        variant: "destructive" 
      });
    }
  }

  return {
    onDropReservation,
    handleConflict,
    onContext,
    closeConflictDialog,
    doSwap,
    doAutoRelodge,
    doConfirmRelodge
  };
}