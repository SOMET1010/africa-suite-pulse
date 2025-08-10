import { useMemo, useState, useEffect } from "react";
import { useRackData } from "./useRackData";
import { RackToolbar } from "./RackToolbar";
import { RackLegend } from "./RackLegend";
import { RackStatusBar } from "./RackStatusBar";
import { RackRow } from "./RackRow";
import { toast } from "@/hooks/use-toast";
import { reassignReservation } from "./rack.service";

export default function RackGrid() {
  const { data, kpis, reload } = useRackData();
  const [zoom, setZoom] = useState(100);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"compact" | "detailed">("compact");
  const [highlight, setHighlight] = useState<string | null>(null);

  async function onDropReservation(resId: string, roomId: string) {
    await reassignReservation(resId, roomId);
    toast({ title: "✅ Réservation réassignée", description: "Nouvelle chambre assignée" });
    await reload();
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
    return data.rooms.filter(r => `${r.number} ${r.type}`.toLowerCase().includes(query.toLowerCase()));
  }, [data, query]);

  if (!data) return null;

  return (
    <main className="min-h-screen px-4 sm:px-6 pt-6 pb-12">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Rack visuel</h1>
          <p className="text-sm text-muted-foreground">Glissez-déposez les réservations pour les réassigner</p>
        </div>
      </header>

      <RackToolbar
        zoom={zoom}
        setZoom={setZoom}
        query={query}
        setQuery={setQuery}
        mode={mode}
        setMode={setMode}
        onFullscreen={() => {
          const el = document.documentElement;
          el.requestFullscreen?.();
        }}
      />

      <RackLegend />

      <div className="mt-4 overflow-auto rounded-xl border border-border" style={{ fontSize: `${Math.max(12, Math.min(16, (zoom/100)*14))}px` }}>
        <div style={{ width: 'max-content' }}>
          <div className="grid" style={{ gridTemplateColumns: `240px repeat(${data.days.length}, 1fr)` }}>
            {/* Header row */}
            <div className="sticky left-0 z-10 bg-card border-b border-border px-3 py-2 font-medium">Chambre</div>
            {data.days.map(d => (
              <div key={d} className="bg-card border-b border-l border-border px-3 py-2 text-center">{new Date(d).toLocaleDateString(undefined,{weekday:'short', day:'2-digit'})}</div>
            ))}
            {/* Rows */}
            {filteredRooms.map((room) => (
              <RackRow 
                key={room.id} 
                room={room} 
                days={data.days} 
                reservations={data.reservations} 
                mode={mode} 
                highlight={highlight === room.id} 
                onHighlight={() => setHighlight(room.id)}
                onDropReservation={onDropReservation}
              />
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
