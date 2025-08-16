import { toast } from "@/hooks/use-toast";
import { useReassignReservation } from "@/queries/rack.queries";
import { canSwap, findFirstFreeRoom, findBestRelocationRooms, type Relocation } from "../conflictValidation";
import type { UIRoom, UIReservation, RackData } from "../rack.types";
import { logger } from "@/lib/logger";

interface UseRackActionsProps {
  data: RackData | null;
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
  setManualRelodgeDialog: (state: any) => void;
}

export function useRackActions({
  data,
  conflictDialog,
  setConflictDialog,
  setDetailSheet,
  setMoveConfirmDialog,
  setManualRelodgeDialog
}: UseRackActionsProps) {
  
  const reassignMutation = useReassignReservation();
  
  async function onDropReservation(resId: string, roomId: string) {
    // Dropping reservation onto room
    
    if (!data) return;
    
    const reservation = data.reservations.find(r => r.id === resId);
    const targetRoom = data.rooms.find(r => r.id === roomId);
    
    if (!reservation || !targetRoom) {
      // Reservation or room not found
      return;
    }
    
    // Trouver la chambre source basée sur la réservation
    const sourceRoom = reservation.roomId ? data.rooms.find(r => r.id === reservation.roomId) : null;
    
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
    // handleConflict called
    
    const dragged = data?.reservations.find(r => r.id === draggedId) || null;
    
    // CORRIGÉ : Utiliser la logique centralisée de validateDrop pour déterminer le type
    const today = new Date().toISOString().split('T')[0];
    const conflictType = conflicts.length > 0 ? 
      (conflicts.some(c => c.start <= today) ? "CURRENT" : "FUTURE") : null;

    logger.debug('Conflict analysis', { 
      conflictType, 
      today, 
      conflictDates: conflicts.map(c => ({ start: c.start, guest: c.guestName, isCurrent: c.start <= today }))
    });

    // Calculer la preview seulement pour les conflits actuels
    const preview = conflictType === "CURRENT" && data ? 
      findBestRelocationRooms(data, conflicts, { 
        excludeRoomIds: [targetRoomId],
        today 
      }) : [];
      
    logger.debug('Preview calculation', { 
      preview: preview.length, 
      conflictType,
      previewDetails: preview.map(p => ({ 
        guest: p.conflict.guestName, 
        target: p.target?.number || 'NONE', 
        score: p.score 
      }))
    });
    
    setConflictDialog({ 
      open: true, 
      dragged, 
      targetRoomId, 
      conflicts, 
      preview, 
      conflictType 
    });
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
    setConflictDialog({ 
      open: false, 
      dragged: null, 
      targetRoomId: null, 
      conflicts: [], 
      preview: [], 
      conflictType: null 
    });
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
      
      await reassignMutation.mutateAsync({ reservationId: other.id, roomId: dragged.roomId });
      await reassignMutation.mutateAsync({ reservationId: dragged.id, roomId: targetRoomId });

      toast({ 
        title: "✅ Échange effectué", 
        description: "Les réservations ont été échangées" 
      });
      
      closeConflictDialog();
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
        await reassignMutation.mutateAsync({ reservationId: c.id, roomId: free.id });
      }
      await reassignMutation.mutateAsync({ reservationId: dragged.id, roomId: targetRoomId });

      toast({ 
        title: "✅ Délogement effectué", 
        description: `${conflicts.length} réservation${conflicts.length > 1 ? 's' : ''} délogée${conflicts.length > 1 ? 's' : ''} automatiquement` 
      });

      closeConflictDialog();
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
        await reassignMutation.mutateAsync({ reservationId: p.conflict.id, roomId: p.target.id });
      }
      // 2) déplacer la réservation d'origine vers la cible
      await reassignMutation.mutateAsync({ reservationId: dragged.id, roomId: targetRoomId });

      toast({ 
        title: "✅ Plan de délogement exécuté", 
        description: `${plan.length} réservation${plan.length > 1 ? 's' : ''} relocalisée${plan.length > 1 ? 's' : ''} avec succès` 
      });

      closeConflictDialog();
    } catch (error) {
      console.error("❌ Error during plan execution:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible d'exécuter le plan de délogement",
        variant: "destructive" 
      });
    }
  }

  // NOUVEAU: Actions pour le délogement manuel
  function handleManualRelodging(sourceRoom: UIRoom, destinationRoom: UIRoom) {
    if (!data) return;
    
    // Trouver les réservations dans la chambre destination qui causeraient des conflits
    const destinationReservations = data.reservations.filter(r => r.roomId === destinationRoom.id);
    
    if (destinationReservations.length === 0) {
      // Pas de conflit, on peut déplacer directement
      toast({ 
        title: "✅ Délogement sans conflit", 
        description: `Ch. ${sourceRoom.number} → Ch. ${destinationRoom.number}` 
      });
      return;
    }
    
    // Calculer les suggestions de re-lodging pour les conflits
    const preview = findBestRelocationRooms(data, destinationReservations, {
      excludeRoomIds: [sourceRoom.id] // Exclure la chambre source
    });
    
    // Ouvrir le dialog de délogement manuel
    setManualRelodgeDialog({
      open: true,
      sourceRoom,
      destinationRoom,
      conflicts: destinationReservations,
      preview
    });
  }
  
  function closeManualRelodgeDialog() {
    setManualRelodgeDialog({
      open: false,
      sourceRoom: null,
      destinationRoom: null,
      conflicts: [],
      preview: []
    });
  }
  
  async function confirmManualRelodge(plan: Relocation[]) {
    if (!data) return;
    
    try {
      // Exécuter le plan de re-lodging
      for (const relocation of plan) {
        if (relocation.target) {
          logger.info('Re-lodging guest', { 
            guestName: relocation.conflict.guestName, 
            roomNumber: relocation.target.number 
          });
          await reassignMutation.mutateAsync({ reservationId: relocation.conflict.id, roomId: relocation.target.id });
        }
      }
      
      toast({ 
        title: "✅ Délogement manuel réussi", 
        description: `${plan.length} réservations re-logées` 
      });
      
      closeManualRelodgeDialog();
      
    } catch (error) {
      console.error("❌ Error in manual re-lodging:", error);
      toast({ 
        title: "❌ Erreur de délogement", 
        description: "Impossible de compléter le délogement",
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
    doConfirmRelodge,
    // Nouvelles actions manuelles
    handleManualRelodging,
    closeManualRelodgeDialog,
    confirmManualRelodge
  };
}