import React, { useMemo, useState, useEffect } from "react";
import { useRackData } from "./useRackData";
import RackToolbar from "./components/RackToolbar";
import RackLegend from "./components/RackLegend";
import RoomHeader from "./components/RoomHeader";
import { RackCell } from "./RackCell";
import { RackStatusBar } from "./RackStatusBar";
import RoomDetailSheet from "./components/RoomDetailSheet";
import { ConflictDialog } from "./components/ConflictDialog";
import { MoveConfirmationDialog } from "./components/MoveConfirmationDialog";
import { toast } from "@/hooks/use-toast";
import { reassignReservation } from "./rack.service";
import { detectConflicts } from "./conflictValidation";
import type { Room, Reservation } from "./types";
import type { ConflictInfo } from "./conflictValidation";

export default function RackGrid() {
  const { data, kpis, reload } = useRackData();
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"compact" | "detailed">("compact");
  const [statusFilter, setStatusFilter] = useState<"all"|"clean"|"inspected"|"dirty"|"maintenance"|"out_of_order">("all");
  const [compact, setCompact] = useState(false);
  const [vivid, setVivid] = useState(false);
  const [detailSheet, setDetailSheet] = useState<{
    open: boolean;
    room: Room | null;
    dayISO: string;
    reservation?: Reservation;
  }>({
    open: false,
    room: null,
    dayISO: "",
    reservation: undefined
  });
  
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    conflictInfo: ConflictInfo | null;
    pendingDrop: { resId: string; roomId: string } | null;
  }>({
    open: false,
    conflictInfo: null,
    pendingDrop: null
  });

  const [moveConfirmDialog, setMoveConfirmDialog] = useState<{
    open: boolean;
    reservation: Reservation | null;
    sourceRoom: Room | null;
    targetRoom: Room | null;
    pendingDrop: { resId: string; roomId: string } | null;
  }>({
    open: false,
    reservation: null,
    sourceRoom: null,
    targetRoom: null,
    pendingDrop: null
  });

  async function onDropReservation(resId: string, roomId: string, hasConflict: boolean = false) {
    console.log(`🎯 Dropping reservation ${resId} onto room ${roomId}, hasConflict: ${hasConflict}`);
    
    if (!data) return;
    
    const reservation = data.reservations.find(r => r.id === resId);
    const targetRoom = data.rooms.find(r => r.id === roomId);
    const sourceRoom = reservation ? data.rooms.find(r => r.id === reservation.roomId) : null;
    
    if (!reservation || !targetRoom) {
      console.error("❌ Reservation or room not found");
      return;
    }
    
    if (hasConflict) {
      // Afficher le dialog de conflit
      const conflictInfo = detectConflicts(resId, roomId, data.reservations, data.rooms);
      setConflictDialog({
        open: true,
        conflictInfo,
        pendingDrop: { resId, roomId }
      });
      return;
    }
    
    // Pas de conflit, afficher le dialog de confirmation
    setMoveConfirmDialog({
      open: true,
      reservation,
      sourceRoom,
      targetRoom,
      pendingDrop: { resId, roomId }
    });
  }
  
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
      console.log(`📊 Current data before reload:`, data?.reservations.length, "reservations");
      
      await reload();
      
      console.log(`✅ Reload completed`);
      console.log(`📊 Data after reload should be different now`);
      
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

  function onContext(room: Room, dayISO: string, res?: Reservation) {
    setDetailSheet({
      open: true,
      room,
      dayISO,
      reservation: res
    });
  }
  
  function handleConflictConfirm() {
    const { pendingDrop } = conflictDialog;
    if (pendingDrop) {
      performDrop(pendingDrop.resId, pendingDrop.roomId);
    }
    setConflictDialog({ open: false, conflictInfo: null, pendingDrop: null });
  }
  
  function handleConflictCancel() {
    setConflictDialog({ open: false, conflictInfo: null, pendingDrop: null });
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
      // TODO: Implémenter le check-in avec la fonction Supabase
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
    // TODO: Ouvrir un formulaire de nouvelle réservation
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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

        <div className="card-elevated overflow-auto bg-gradient-secondary/30 backdrop-blur-sm animate-fade-in scrollbar-thin touch-pan-x" 
             style={{ fontSize: `${Math.max(10, Math.min(16, (zoom/100)*14))}px` }}>
          <div style={{ width: 'max-content' }}>
            <div className="grid touch-manipulation" style={{ gridTemplateColumns: `${compact ? '200px' : '260px'} repeat(${data.days.length}, ${compact ? '60px' : '80px'})` }}>
              {/* Header row avec amélioration aujourd'hui/weekend */}
              <div className="sticky left-0 z-20 bg-gradient-primary text-primary-foreground px-2 sm:px-4 py-2 sm:py-3 font-display font-bold shadow-soft text-sm sm:text-base">
                Chambres
              </div>
              {data.days.map(d=>{
                const dt = new Date(d);
                const isToday = d === new Date().toISOString().slice(0,10);
                const isWE = [0,6].includes(dt.getDay());
                return (
                  <div key={d}
                    className={`px-1 sm:px-3 py-2 sm:py-3 text-xs font-semibold text-center border-l border-border transition-all duration-300 touch-manipulation
                      ${isToday 
                        ? "bg-gradient-primary text-primary-foreground shadow-glow animate-glow-pulse" 
                        : isWE 
                        ? "bg-warning/20 text-warning-foreground" 
                        : "bg-card/80 backdrop-blur-sm hover:bg-card active:bg-card/90"}`}>
                    <div className="font-display leading-tight">
                      <div className="hidden sm:block">
                        {dt.toLocaleDateString("fr-FR",{weekday:"short", day:"2-digit", month:"2-digit"})}
                      </div>
                      <div className="sm:hidden">
                        {dt.toLocaleDateString("fr-FR",{day:"2-digit", month:"2-digit"})}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Rows avec animations */}
              {filteredRooms.map((room, index) => (
                <React.Fragment key={room.id}>
                  <div className={`animate-fade-in`} style={{ animationDelay: `${index * 50}ms` }}>
                    <RoomHeader room={room} />
                  </div>
                  {data.days.map((day, dayIndex) => (
                    <div key={`${room.id}-${day}`} 
                         className={`animate-fade-in`} 
                         style={{ animationDelay: `${(index * 50) + (dayIndex * 10)}ms` }}>
                       <RackCell
                         room={room}
                         dayISO={day}
                         reservations={data.reservations}
                         allRooms={data.rooms}
                         mode={compact ? "compact" : mode}
                         onDropReservation={onDropReservation}
                         onContext={onContext}
                         vivid={vivid}
                       />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

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

        <ConflictDialog
          open={conflictDialog.open}
          onOpenChange={(open) => !open && handleConflictCancel()}
          conflictInfo={conflictDialog.conflictInfo}
          onConfirm={handleConflictConfirm}
          onCancel={handleConflictCancel}
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
