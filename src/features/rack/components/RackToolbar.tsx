import { useState } from "react";

type Props = {
  onFilterStatus: (s: "all"|"clean"|"inspected"|"dirty"|"maintenance"|"out_of_order")=>void;
  onToggleCompact: (v: boolean)=>void;
  onZoom: (pct:number)=>void;
  onVivid: (v:boolean)=>void;
};

export default function RackToolbar({ onFilterStatus, onToggleCompact, onZoom, onVivid }: Props){
  const [zoom, setZoom] = useState(100);
  
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex gap-1">
        {[
          {k:"all",label:"Tous"},
          {k:"clean",label:"Propre"},
          {k:"inspected",label:"Contrôlée"},
          {k:"dirty",label:"Sale"},
          {k:"maintenance",label:"Maint."},
          {k:"out_of_order",label:"HS"},
        ].map(ch=>(
          <button key={ch.k}
            onClick={()=>onFilterStatus(ch.k as any)}
            className="px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-secondary/50 transition-colors">
            {ch.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" onChange={e=>onToggleCompact(e.target.checked)}/>
          Compact
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" onChange={e=>onVivid(e.target.checked)}/>
          Couleurs vives
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Zoom</span>
          <input type="range" min={80} max={140} value={zoom}
            onChange={(e)=>{ const v=+e.target.value; setZoom(v); onZoom(v); }} />
          <span className="w-10 text-right text-sm">{zoom}%</span>
        </div>
      </div>
    </div>
  );
}