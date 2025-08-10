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
    await reassignReservation(resId, roomId);
    toast({ title: "✅ Réservation réassignée", description: "Nouvelle chambre assignée" });
    await reload();
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
      <main className="min-h-screen px-4 sm:px-6 pt-6 pb-12 space-y-6">
        <header className="animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-gradient">Rack Visuel</h1>
            <p className="text-muted-foreground font-medium">Interface tactile moderne avec animations fluides</p>
          </div>
        </header>

        <RackToolbar
          onFilterStatus={setStatusFilter}
          onToggleCompact={setCompact}
          onZoom={setZoom}
          onVivid={setVivid}
        />

        <RackLegend />

        <div className="card-elevated overflow-auto bg-gradient-secondary/30 backdrop-blur-sm animate-fade-in" 
             style={{ fontSize: `${Math.max(12, Math.min(16, (zoom/100)*14))}px` }}>
          <div style={{ width: 'max-content' }}>
            <div className="grid" style={{ gridTemplateColumns: `260px repeat(${data.days.length}, 1fr)` }}>
              {/* Header row avec amélioration aujourd'hui/weekend */}
              <div className="sticky left-0 z-20 bg-gradient-primary text-primary-foreground px-4 py-3 font-display font-bold shadow-soft">
                Chambres
              </div>
              {data.days.map(d=>{
                const dt = new Date(d);
                const isToday = d === new Date().toISOString().slice(0,10);
                const isWE = [0,6].includes(dt.getDay());
                return (
                  <div key={d}
                    className={`px-3 py-3 text-xs font-semibold text-center border-l border-border transition-all duration-300
                      ${isToday 
                        ? "bg-gradient-primary text-primary-foreground shadow-glow animate-glow-pulse" 
                        : isWE 
                        ? "bg-warning/20 text-warning-foreground" 
                        : "bg-card/80 backdrop-blur-sm hover:bg-card"}`}>
                    <div className="font-display">
                      {dt.toLocaleDateString("fr-FR",{weekday:"short", day:"2-digit", month:"2-digit"})}
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

        <div className="fixed inset-x-0 bottom-0">
          <div className="mx-auto max-w-screen-2xl px-4">
            <div className="bg-card/90 backdrop-blur border-t border-border rounded-t-xl shadow-soft [padding-bottom:env(safe-area-inset-bottom)]">
              <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>[F1] Check-in</span>
                  <span>[F2] Assigner</span>
                  <span>[F5] Note</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
