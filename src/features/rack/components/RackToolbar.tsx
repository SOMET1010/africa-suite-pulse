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
    <div className="animate-fade-in">
      <div className="card-elevated p-4 bg-gradient-secondary backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {[
              {k:"all",label:"Tous", color:"bg-muted"},
              {k:"clean",label:"Propre", color:"room-dot-clean"},
              {k:"inspected",label:"Contrôlée", color:"room-dot-inspected"},
              {k:"dirty",label:"Sale", color:"room-dot-dirty"},
              {k:"maintenance",label:"Maint.", color:"room-dot-maintenance"},
              {k:"out_of_order",label:"HS", color:"room-dot-out_of_order"},
            ].map(ch=>(
              <button key={ch.k}
                onClick={()=>onFilterStatus(ch.k as any)}
                className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 text-sm font-medium hover-lift focus-ring transition-all duration-300">
                <span className={`w-2.5 h-2.5 rounded-full ${ch.color} group-hover:scale-110 transition-transform`} />
                {ch.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input 
                type="checkbox" 
                onChange={e=>onToggleCompact(e.target.checked)}
                className="focus-ring rounded"
              />
              Mode compact
            </label>
            
            <label className="flex items-center gap-2 text-sm font-medium">
              <input 
                type="checkbox" 
                onChange={e=>onVivid(e.target.checked)}
                className="focus-ring rounded"
              />
              <span className="text-gradient">Couleurs vives</span>
            </label>
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border/50">
              <span className="text-sm font-medium text-muted-foreground">Zoom</span>
              <input 
                type="range" 
                min={80} 
                max={140} 
                value={zoom}
                onChange={(e)=>{ const v=+e.target.value; setZoom(v); onZoom(v); }}
                className="w-20 accent-primary"
              />
              <span className="w-12 text-right text-sm font-mono">{zoom}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}