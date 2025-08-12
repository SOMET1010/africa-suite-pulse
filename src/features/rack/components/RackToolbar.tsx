import { useState } from "react";
import { Grid3X3, Palette, ZoomIn, ZoomOut, Columns3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  onFilterStatus: (s: "all"|"clean"|"inspected"|"dirty"|"maintenance"|"out_of_order")=>void;
  onToggleCompact: (v: boolean)=>void;
  onZoom: (pct:number)=>void;
  onVivid: (v:boolean)=>void;
};

export default function RackToolbar({ onFilterStatus, onToggleCompact, onZoom, onVivid }: Props){
  const [zoom, setZoom] = useState(100);
  const [compact, setCompact] = useState(false);
  const [vivid, setVivid] = useState(false);
  
  const handleCompactToggle = (checked: boolean) => {
    setCompact(checked);
    onToggleCompact(checked);
  };
  
  const handleVividToggle = (checked: boolean) => {
    setVivid(checked);
    onVivid(checked);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="card-elevated p-2 sm:p-4 bg-gradient-secondary backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6">
          
          {/* Filtres de statut */}
          <div className="flex gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto scrollbar-thin">
            <div className="flex items-center gap-2 mr-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Filtres:</span>
            </div>
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
                title={`Filtrer par chambres ${ch.label.toLowerCase()}`}
                className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-border/50 text-xs sm:text-sm font-medium hover-lift focus-ring transition-all duration-300 touch-manipulation tap-target whitespace-nowrap active:scale-95">
                <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${ch.color} group-hover:scale-110 transition-transform`} />
                <span className="hidden sm:inline">{ch.label}</span>
                <span className="sm:hidden">{ch.short}</span>
              </button>
            ))}
          </div>

          {/* Contrôles d'affichage */}
          <div className="w-full sm:w-auto sm:ml-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              
              {/* Section Mode d'affichage */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Affichage:</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={compact ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCompactToggle(!compact)}
                    title="Réduire la largeur des colonnes (C)"
                    className={cn(
                      "group relative transition-all duration-300",
                      compact && "ring-2 ring-primary/20"
                    )}
                  >
                    <Columns3 className="w-3.5 h-3.5 mr-1.5" />
                    <span className="hidden sm:inline">Compact</span>
                    <span className="sm:hidden">C</span>
                    {compact && (
                      <Badge variant="secondary" className="absolute -top-1 -right-1 h-2 w-2 p-0">
                        <span className="sr-only">Actif</span>
                      </Badge>
                    )}
                  </Button>
                  
                  <Button
                    variant={vivid ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleVividToggle(!vivid)}
                    title="Augmenter la saturation des couleurs (V)"
                    className={cn(
                      "group relative transition-all duration-300",
                      vivid && "ring-2 ring-primary/20"
                    )}
                  >
                    <Palette className="w-3.5 h-3.5 mr-1.5" />
                    <span className="text-gradient hidden sm:inline">Vives</span>
                    <span className="text-gradient sm:hidden">V</span>
                    {vivid && (
                      <Badge variant="secondary" className="absolute -top-1 -right-1 h-2 w-2 p-0">
                        <span className="sr-only">Actif</span>
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Section Zoom */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-card border border-border/50">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min={80} 
                    max={140} 
                    value={zoom}
                    onChange={(e)=>{ const v=+e.target.value; setZoom(v); onZoom(v); }}
                    title={`Zoom: ${zoom}% (+ ou - pour ajuster)`}
                    className="w-16 sm:w-20 accent-primary touch-manipulation cursor-pointer"
                  />
                  <span className="w-10 text-right text-xs font-mono text-muted-foreground">{zoom}%</span>
                </div>
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}