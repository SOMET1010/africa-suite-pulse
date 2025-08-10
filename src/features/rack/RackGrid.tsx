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
    <main className="min-h-screen px-4 sm:px-6 pt-6 pb-12">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rack visuel</h1>
          <p className="text-sm text-muted-foreground">Interface tactile améliorée avec long-press et couleurs vives</p>
        </div>
      </header>

      <RackToolbar
        onFilterStatus={setStatusFilter}
        onToggleCompact={setCompact}
        onZoom={setZoom}
        onVivid={setVivid}
      />

      <RackLegend />

      <div className="mt-4 overflow-auto rounded-xl border border-border" style={{ fontSize: `${Math.max(12, Math.min(16, (zoom/100)*14))}px` }}>
        <div style={{ width: 'max-content' }}>
          <div className="grid" style={{ gridTemplateColumns: `240px repeat(${data.days.length}, 1fr)` }}>
            {/* Header row */}
            <div className="sticky left-0 z-10 bg-card border-b border-border px-3 py-2 font-medium">Chambre</div>
            {data.days.map(d=>{
              const dt = new Date(d);
              const isToday = d === new Date().toISOString().slice(0,10);
              const isWE = [0,6].includes(dt.getDay());
              return (
                <div key={d}
                  className={`px-2 py-2 text-xs text-center border-b border-l border-border
                    ${isToday ? "bg-blue-100" : isWE ? "bg-secondary/30" : "bg-card"}`}>
                  {dt.toLocaleDateString("fr-FR",{weekday:"short", day:"2-digit", month:"2-digit"})}
                </div>
              );
            })}
            {/* Rows */}
            {filteredRooms.map((room) => (
              <React.Fragment key={room.id}>
                <RoomHeader room={room} />
                {data.days.map((day) => (
                  <RackCell
                    key={`${room.id}-${day}`}
                    room={room}
                    dayISO={day}
                    reservations={data.reservations}
                    mode={compact ? "compact" : mode}
                    onDropReservation={onDropReservation}
                    onContext={onContext}
                    vivid={vivid}
                  />
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
  );
}
