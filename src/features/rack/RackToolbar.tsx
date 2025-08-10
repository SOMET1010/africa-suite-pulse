import { useRef } from "react";
import { TButton } from "@/core/ui/TButton";
import { Link } from "react-router-dom";

interface Props {
  onFullscreen?: () => void;
  zoom: number;
  setZoom: (z: number) => void;
  query: string;
  setQuery: (q: string) => void;
}

export function RackToolbar({ onFullscreen, zoom, setZoom, query, setQuery }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-3 justify-between mb-4">
      <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          placeholder="Recherche (nom, réf, chambre)"
          className="rounded-xl border border-border bg-background px-4 h-12 shadow-soft focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select className="rounded-xl border border-border bg-background px-3 h-12">
          <option>Statut (tous)</option>
          <option>Confirmé</option>
          <option>Présent</option>
          <option>Option</option>
        </select>
        <select className="rounded-xl border border-border bg-background px-3 h-12">
          <option>Étage (tous)</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
        <select className="rounded-xl border border-border bg-background px-3 h-12">
          <option>Type (tous)</option>
          <option>STD</option>
          <option>DLX</option>
          <option>SUI</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Zoom</span>
          <input type="range" min={80} max={140} value={zoom} onChange={(e)=>setZoom(Number(e.target.value))} />
          <span className="text-sm">{zoom}%</span>
        </div>
        <TButton asChild variant="default"><Link to="/arrivals">Arrivées</Link></TButton>
        <TButton variant="ghost" onClick={onFullscreen}>Plein écran</TButton>
      </div>
    </div>
  );
}
