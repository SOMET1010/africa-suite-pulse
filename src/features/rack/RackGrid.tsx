import React, { useMemo, useState, useEffect } from "react";
import { useRackData } from "./useRackData";
import RackToolbar from "./components/RackToolbar";
import RackLegend from "./components/RackLegend";
import RoomHeader from "./components/RoomHeader";
import { RackCell } from "./RackCell";
import { RackStatusBar } from "./RackStatusBar";
import { toast } from "@/hooks/use-toast";
import { reassignReservation } from "./rack.service";

export default function RackGrid() {
  const { data, kpis, reload } = useRackData();
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"compact" | "detailed">("compact");
  const [statusFilter, setStatusFilter] = useState<"all"|"clean"|"inspected"|"dirty"|"maintenance"|"out_of_order">("all");
  const [compact, setCompact] = useState(false);
  const [vivid, setVivid] = useState(false);

  async function onDropReservation(resId: string, roomId: string) {
    console.log(`🎯 Dropping reservation ${resId} onto room ${roomId}`);
    try {
      const updatedReservation = await reassignReservation(resId, roomId);
      toast({ 
        title: "✅ Réservation réassignée", 
        description: `Déplacée vers la chambre ${updatedReservation?.room_id || roomId}` 
      });
      await reload();
    } catch (error) {
      console.error("❌ Error in onDropReservation:", error);
      toast({ 
        title: "❌ Erreur", 
        description: "Impossible de réassigner la réservation",
        variant: "destructive" 
      });
    }
  }

  function onContext(room: any, dayISO: string, res?: any) {
    toast({ 
      title: "Menu contextuel", 
      description: `Chambre ${room.number} - ${dayISO}${res ? ` - ${res.guestName}` : ''}` 
    });
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
