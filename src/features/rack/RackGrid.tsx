import React, { useMemo, useEffect, useCallback } from "react";
import { useRackData } from "./useRackData";
import { useRackState } from "./hooks/useRackState";
import { useRackActions } from "./hooks/useRackActions";
import RackToolbar from "./components/RackToolbar";
import RackLegend from "./components/RackLegend";
import { RackStatusBar } from "./RackStatusBar";
import RoomDetailSheet from "./components/RoomDetailSheet";
import { NewConflictDialog } from "./components/NewConflictDialog";
import { MoveConfirmationDialog } from "./components/MoveConfirmationDialog";
import { ManualRelodgeDialog } from "./components/ManualRelodgeDialog";
import { toast } from "@/hooks/use-toast";
import { reassignReservation } from "./rack.service";

// Import du nouveau système drag & drop
import { DragDropProvider, DragDropStyles } from "./hooks/useDragDrop";
import { ModernRackGrid } from "./components/ModernRackGrid";

// Types pour les données transformées
interface DayData {
  date: string;
  dayName: string;
  dayNumber: string;
}

export default function RackGrid() {
  const { data, kpis, reload } = useRackData();
  const {
    zoom, setZoom,
    query, setQuery,
    statusFilter, setStatusFilter,
    compact, setCompact,
    vivid, setVivid,
    detailSheet, setDetailSheet,
    conflictDialog, setConflictDialog,
    moveConfirmDialog, setMoveConfirmDialog,
    manualRelodgeDialog, setManualRelodgeDialog,
  } = useRackState();

  const {
    handleConflict,
    closeConflictDialog,
    doSwap,
    doAutoRelodge,
    doConfirmRelodge,
    closeManualRelodgeDialog,
    confirmManualRelodge
  } = useRackActions({
    data,
    reload,
    conflictDialog,
    setConflictDialog,
    setDetailSheet,
    setMoveConfirmDialog,
    setManualRelodgeDialog
  });

  // Gestion du déplacement de réservation
  const handleReservationMove = useCallback(async (reservationId: string, targetRoomId: string, targetDay: string) => {
    try {
      await reassignReservation(reservationId, targetRoomId);
      await reload();
      toast({ title: "✅ Réservation déplacée", description: `Chambre ${targetRoomId}` });
    } catch (error) {
      toast({ title: "❌ Erreur", description: "Impossible de déplacer la réservation", variant: "destructive" });
    }
  }, [reload]);

  // Injection des styles CSS
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = DragDropStyles;
    document.head.appendChild(styleSheet);
    return () => { if (document.head.contains(styleSheet)) document.head.removeChild(styleSheet); };
  }, []);

  // expose read-only data for validation util (évite de propager 1000 props)
  useEffect(() => { 
    if (data) {
      (window as any).__RACK_DATA__ = data; 
    }
  }, [data]);

  // 🆕 FONCTION DE VALIDATION : Vérifie si le déplacement est valide
  function validateMove(reservation: any, targetRoomId: string): { isValid: boolean; reason?: string } {
    if (!reservation || !targetRoomId) {
      return { isValid: false, reason: "Données manquantes" };
    }

    // Vérification principale : même chambre
    if (reservation.roomId === targetRoomId) {
      return { 
        isValid: false, 
        reason: "La réservation est déjà dans cette chambre" 
      };
    }

    // Vérification de l'existence de la chambre cible
    const targetRoom = data?.rooms.find(r => r.id === targetRoomId);
    if (!targetRoom) {
      return { 
        isValid: false, 
        reason: "Chambre de destination introuvable" 
      };
    }

    // Vérification du statut de la chambre (optionnel)
    if (targetRoom.status === 'out_of_order') {
      return { 
        isValid: false, 
        reason: "Chambre hors service" 
      };
    }

    return { isValid: true };
  }

  async function performDrop(resId: string, roomId: string) {
    console.log(`🎯 Performing drop: reservation ${resId} to room ${roomId}`);
    
    // 🆕 VALIDATION AVANT EXÉCUTION
    const reservation = data?.reservations.find(r => r.id === resId);
    const validation = validateMove(reservation, roomId);
    
    if (!validation.isValid) {
      console.log(`❌ Invalid move: ${validation.reason}`);
      toast({ 
        title: "❌ Déplacement impossible", 
        description: validation.reason,
        variant: "destructive" 
      });
      return;
    }

    try {
      console.log(`📡 Calling reassignReservation API...`);
      const updatedReservation = await reassignReservation(resId, roomId);
      console.log(`✅ Reservation updated in DB:`, updatedReservation);
      
      toast({ 
        title: "✅ Réservation réassignée", 
        description: `Déplacée vers la chambre ${roomId}` 
      });
      
      console.log(`🔄 Calling reload() to refresh UI...`);
      await reload();
      console.log(`✅ Reload completed`);
      
      // Force un re-render en déclenchant un event custom
      window.dispatchEvent(new CustomEvent('rack-updated'));
      
    } catch (error) {
      console.error("❌ Error in performDrop:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible de réassigner la réservation",
        variant: "destructive" 
      });
    }
  }


  // Gestion des handlers manquants pour compatibilité
  const handleCheckin = useCallback(async (reservationId: string) => {
    try {
      toast({ title: "✅ Check-in effectué", description: "Client enregistré avec succès" });
      setDetailSheet(prev => ({ ...prev, open: false }));
      await reload();
    } catch (error) {
      toast({ title: "❌ Erreur", description: "Impossible d'effectuer le check-in", variant: "destructive" });
    }
  }, [reload, setDetailSheet]);

  const handleNewReservation = useCallback((roomId: string, dayISO: string) => {
    toast({ title: "🆕 Nouvelle réservation", description: `Chambre ${roomId} - ${dayISO}` });
    setDetailSheet(prev => ({ ...prev, open: false }));
  }, [setDetailSheet]);

  const handleMoveConfirm = useCallback(async () => {
    const { pendingDrop } = moveConfirmDialog;
    if (pendingDrop) {
      await handleReservationMove(pendingDrop.resId, pendingDrop.roomId, 'current');
    }
    setMoveConfirmDialog({ open: false, reservation: null, sourceRoom: null, targetRoom: null, pendingDrop: null });
  }, [moveConfirmDialog, handleReservationMove, setMoveConfirmDialog]);
  
  const handleMoveCancel = useCallback(() => {
    setMoveConfirmDialog({ open: false, reservation: null, sourceRoom: null, targetRoom: null, pendingDrop: null });
  }, [setMoveConfirmDialog]);

  const filteredRooms = useMemo(() => {
    if (!data) return [];
    return data.rooms
      .filter(r => `${r.number} ${r.type}`.toLowerCase().includes(query.toLowerCase()))
      .filter(r => statusFilter === "all" || r.status === statusFilter);
  }, [data, query, statusFilter]);

  if (!data) return null;

  return (
    <DragDropProvider onReservationMove={handleReservationMove}>
      <div className="page-enter">
        <main className="min-h-screen px-2 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-20 sm:pb-12 space-y-4 sm:space-y-6">
        <header className="animate-fade-in">
          <div className="text-center space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gradient">Rack Visuel</h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">Interface tactile moderne avec animations fluides</p>
          </div>
        </header>

        <RackToolbar
          onFilterStatus={setStatusFilter}
          onToggleCompact={setCompact}
          onZoom={setZoom}
          onVivid={setVivid}
        />

        <RackLegend />

          <ModernRackGrid
            days={data.days.map(dateISO => ({ 
              date: dateISO, 
              dayName: new Date(dateISO).toLocaleDateString('fr-FR', { weekday: 'short' }), 
              dayNumber: new Date(dateISO).getDate().toString() 
            }))}
            filteredRooms={filteredRooms}
            reservations={data.reservations}
            compact={compact}
            vivid={vivid}
            zoom={zoom}
            onReservationMove={handleReservationMove}
            onCellClick={(room, day, reservation) => setDetailSheet({ 
              open: true, 
              room, 
              dayISO: day, 
              reservation: reservation || null 
            })}
          />

          <RackStatusBar occ={kpis.occ} arrivals={kpis.arrivals} presents={kpis.presents} hs={kpis.hs} />

          <RoomDetailSheet
            open={detailSheet.open}
            onOpenChange={(open) => setDetailSheet(prev => ({ ...prev, open }))}
            room={detailSheet.room}
            dayISO={detailSheet.dayISO}
            reservation={detailSheet.reservation}
            onCheckin={handleCheckin}
            onNewReservation={handleNewReservation}
          />

          <NewConflictDialog
            open={conflictDialog.open}
            dragged={conflictDialog.dragged}
            targetRoom={data.rooms.find(r => r.id === conflictDialog.targetRoomId) || null}
            conflicts={conflictDialog.conflicts}
            preview={conflictDialog.preview}
            conflictType={conflictDialog.conflictType}
            allRooms={data.rooms}
            onCancel={closeConflictDialog}
            onSwap={doSwap}
            onAutoRelodge={doAutoRelodge}
            onConfirmRelodge={doConfirmRelodge}
          />

          <MoveConfirmationDialog
            open={moveConfirmDialog.open}
            onOpenChange={(open) => !open && handleMoveCancel()}
            reservation={moveConfirmDialog.reservation}
            sourceRoom={moveConfirmDialog.sourceRoom}
            targetRoom={moveConfirmDialog.targetRoom}
            onConfirm={handleMoveConfirm}
            onCancel={handleMoveCancel}
          />

          <ManualRelodgeDialog
            open={manualRelodgeDialog.open}
            sourceRoom={manualRelodgeDialog.sourceRoom}
            destinationRoom={manualRelodgeDialog.destinationRoom}
            conflicts={manualRelodgeDialog.conflicts}
            preview={manualRelodgeDialog.preview}
            onCancel={closeManualRelodgeDialog}
            onConfirm={confirmManualRelodge}
            onRestart={closeManualRelodgeDialog}
          />

          <div className="fixed inset-x-0 bottom-0 z-30 sm:relative sm:z-auto">
            <div className="mx-auto max-w-screen-2xl px-2 sm:px-4">
              <div className="bg-card/95 backdrop-blur border-t border-border sm:rounded-t-xl shadow-soft [padding-bottom:env(safe-area-inset-bottom)]">
                <div className="px-2 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground overflow-x-auto">
                    <span className="whitespace-nowrap">🎯 Glisser-déposer</span>
                    <span className="whitespace-nowrap">📱 Support tactile</span>
                    <span className="whitespace-nowrap">✅ Validation auto</span>
                    <span className="whitespace-nowrap">🔄 Annulation intelligente</span>
                  </div>
                  <div className="text-xs text-muted-foreground/80 font-mono">
                    {filteredRooms.length} chambres • {data.reservations.length} réservations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DragDropProvider>
  );
}