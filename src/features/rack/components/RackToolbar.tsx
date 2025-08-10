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
      <div className="card-elevated p-2 sm:p-4 bg-gradient-secondary backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-3">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto scrollbar-thin">
            {[
              {k:"all",label:"Tous", short:"T", color:"bg-muted"},
              {k:"clean",label:"Propre", short:"P", color:"room-dot-clean"},
              {k:"inspected",label:"Contrôlée", short:"C", color:"room-dot-inspected"},
              {k:"dirty",label:"Sale", short:"S", color:"room-dot-dirty"},
              {k:"maintenance",label:"Maint.", short:"M", color:"room-dot-maintenance"},
              {k:"out_of_order",label:"HS", short:"HS", color:"room-dot-out_of_order"},
            ].map(ch=>(
              <button key={ch.k}
                onClick={()=>onFilterStatus(ch.k as any)}
                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-border/50 text-xs sm:text-sm font-medium hover-lift focus-ring transition-all duration-300 touch-manipulation tap-target whitespace-nowrap active:scale-95">
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${ch.color} group-hover:scale-110 transition-transform`} />
                <span className="hidden sm:inline">{ch.label}</span>
                <span className="sm:hidden">{ch.short}</span>
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto sm:ml-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium touch-manipulation">
                <input 
                  type="checkbox" 
                  onChange={e=>onToggleCompact(e.target.checked)}
                  className="focus-ring rounded tap-target"
                />
                <span className="hidden sm:inline">Mode compact</span>
                <span className="sm:hidden">Compact</span>
              </label>
              
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium touch-manipulation">
                <input 
                  type="checkbox" 
                  onChange={e=>onVivid(e.target.checked)}
                  className="focus-ring rounded tap-target"
                />
                <span className="text-gradient hidden sm:inline">Couleurs vives</span>
                <span className="text-gradient sm:hidden">Vives</span>
              </label>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-card border border-border/50 touch-manipulation">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Zoom</span>
              <input 
                type="range" 
                min={80} 
                max={140} 
                value={zoom}
                onChange={(e)=>{ const v=+e.target.value; setZoom(v); onZoom(v); }}
                className="w-16 sm:w-20 accent-primary touch-manipulation"
              />
              <span className="w-10 sm:w-12 text-right text-xs sm:text-sm font-mono">{zoom}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}