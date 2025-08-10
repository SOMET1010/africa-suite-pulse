import React, { useMemo, useEffect } from "react";
import { useRackData } from "./useRackData";
import { useRackState } from "./hooks/useRackState";
import { useRackActions } from "./hooks/useRackActions";
import RackToolbar from "./components/RackToolbar";
import RackLegend from "./components/RackLegend";
import { RackStatusBar } from "./RackStatusBar";
import { RackGridTable } from "./components/RackGridTable";
import RoomDetailSheet from "./components/RoomDetailSheet";
import { NewConflictDialog } from "./components/NewConflictDialog";
import { MoveConfirmationDialog } from "./components/MoveConfirmationDialog";
import { ManualRelodgeDialog } from "./components/ManualRelodgeDialog";
import { toast } from "@/hooks/use-toast";
import { reassignReservation } from "./rack.service";

export default function RackGrid() {
  const { data, kpis, reload } = useRackData();
  const {
    zoom, setZoom,
    query, setQuery,
    mode, setMode,
    statusFilter, setStatusFilter,
    compact, setCompact,
    vivid, setVivid,
    selectionMode, setSelectionMode,
    detailSheet, setDetailSheet,
    conflictDialog, setConflictDialog,
    moveConfirmDialog, setMoveConfirmDialog,
    manualRelodgeDialog, setManualRelodgeDialog,
  } = useRackState();

  const {
    onDropReservation,
    handleConflict,
    onContext,
    closeConflictDialog,
    doSwap,
    doAutoRelodge,
    doConfirmRelodge,
    handleManualRelodging,
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

  // expose read-only data for validation util (évite de propager 1000 props)
  useEffect(() => { 
    if (data) {
      (window as any).__RACK_DATA__ = data; 
    }
  }, [data]);

  async function performDrop(resId: string, roomId: string) {
    console.log(`🎯 Performing drop: reservation ${resId} to room ${roomId}`);
    try {
      console.log(`📡 Calling reassignReservation API...`);
      const updatedReservation = await reassignReservation(resId, roomId);
      console.log(`✅ Reservation updated in DB:`, updatedReservation);
      
      toast({ 
        title: "✅ Réservation réassignée", 
        description: `Déplacée vers la chambre ${updatedReservation?.room_id || roomId}` 
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

  function handleMoveConfirm() {
    const { pendingDrop } = moveConfirmDialog;
    if (pendingDrop) {
      performDrop(pendingDrop.resId, pendingDrop.roomId);
    }
    setMoveConfirmDialog({ 
      open: false, 
      reservation: null, 
      sourceRoom: null, 
      targetRoom: null, 
      pendingDrop: null 
    });
  }
  
  function handleMoveCancel() {
    setMoveConfirmDialog({ 
      open: false, 
      reservation: null, 
      sourceRoom: null, 
      targetRoom: null, 
      pendingDrop: null 
    });
  }

  async function handleCheckin(reservationId: string) {
    try {
      console.log("🏨 Check-in reservation:", reservationId);
      toast({ 
        title: "✅ Check-in effectué", 
        description: "Client enregistré avec succès" 
      });
      setDetailSheet(prev => ({ ...prev, open: false }));
      await reload();
    } catch (error) {
      console.error("❌ Error during checkin:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible d'effectuer le check-in",
        variant: "destructive" 
      });
    }
  }

  function handleNewReservation(roomId: string, dayISO: string) {
    console.log("📝 New reservation for room:", roomId, "on", dayISO);
    toast({ 
      title: "🆕 Nouvelle réservation", 
      description: `Chambre ${roomId} - ${dayISO}` 
    });
    setDetailSheet(prev => ({ ...prev, open: false }));
  }

  useEffect(() => {
    document.title = "Rack visuel - AfricaSuite";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Rack visuel moderne: grille chambres x jours, réservations et états.");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      
      if (e.key === 'F1') { e.preventDefault(); toast({ title: "[F1] Check-in (Rack)", description: "Action de démonstration" }); }
      if (e.key === 'F2') { e.preventDefault(); toast({ title: "[F2] Assigner (Rack)", description: "Action de démonstration" }); }
      if (e.key === 'F5') { e.preventDefault(); toast({ title: "[F5] Note (Rack)", description: "Action de démonstration" }); }
      
      // NOUVEAU: Délogement manuel avec touche 'D'
      if (e.key === 'D' || e.key === 'd') {
        e.preventDefault();
        if (selectionMode.sourceRoom && selectionMode.destinationRoom) {
          handleManualRelodging(selectionMode.sourceRoom, selectionMode.destinationRoom);
        } else {
          toast({ 
            title: "🎯 Délogement manuel", 
            description: "Sélectionnez d'abord une chambre source (clic gauche) et une destination (clic droit)" 
          });
        }
      }
      
      // Annuler la sélection avec Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        if (selectionMode.sourceRoom || selectionMode.destinationRoom) {
          setSelectionMode({
            sourceRoom: null,
            sourceReservation: null,
            destinationRoom: null
          });
          toast({ title: "❌ Sélection annulée", description: "Mode de délogement manuel désactivé" });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectionMode, handleManualRelodging, setSelectionMode]);

  const filteredRooms = useMemo(() => {
    if (!data) return [];
    return data.rooms
      .filter(r => `${r.number} ${r.type}`.toLowerCase().includes(query.toLowerCase()))
      .filter(r => statusFilter === "all" || r.status === statusFilter);
  }, [data, query, statusFilter]);

  if (!data) return null;

  return (
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

        <RackGridTable
          days={data.days}
          filteredRooms={filteredRooms}
          reservations={data.reservations}
          allRooms={data.rooms}
          compact={compact}
          mode={mode}
          vivid={vivid}
          zoom={zoom}
          onDropReservation={onDropReservation}
          onContext={onContext}
          onConflict={handleConflict}
          selectionMode={selectionMode}
          onLeftClick={(room, reservation) => {
            setSelectionMode(prev => ({
              ...prev,
              sourceRoom: room,
              sourceReservation: reservation || null
            }));
            toast({ 
              title: "🎯 Chambre source sélectionnée", 
              description: `Ch. ${room.number} - Clic droit sur destination puis [D]` 
            });
          }}
          onRightClick={(room) => {
            setSelectionMode(prev => ({
              ...prev,
              destinationRoom: room
            }));
            toast({ 
              title: "📍 Chambre destination sélectionnée", 
              description: `Ch. ${room.number} - Appuyez sur [D] pour déloger` 
            });
          }}
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
          onRestart={() => {
            closeManualRelodgeDialog();
            setSelectionMode({
              sourceRoom: null,
              sourceReservation: null,
              destinationRoom: null
            });
          }}
        />

        <div className="fixed inset-x-0 bottom-0 z-30 sm:relative sm:z-auto">
          <div className="mx-auto max-w-screen-2xl px-2 sm:px-4">
            <div className="bg-card/95 backdrop-blur border-t border-border sm:rounded-t-xl shadow-soft [padding-bottom:env(safe-area-inset-bottom)]">
              <div className="px-2 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground overflow-x-auto">
                  <span className="whitespace-nowrap">[F1] Check-in</span>
                  <span className="whitespace-nowrap">[F2] Assigner</span>
                  <span className="whitespace-nowrap">[F5] Note</span>
                </div>
                <div className="text-xs text-muted-foreground/80 font-mono">
                  {filteredRooms.length} chambres
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}