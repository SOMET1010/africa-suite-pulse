import { useState } from "react";
import { Grid3X3, Palette, ZoomIn, ZoomOut, Columns3, Eye, RefreshCw, Timer, TrendingUp, Clock, CalendarCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { RealtimeClock } from "@/components/layout/RealtimeClock";

type Props = {
  onFilterStatus: (s: "all"|"clean"|"inspected"|"dirty"|"maintenance"|"out_of_order")=>void;
  onToggleCompact: (v: boolean)=>void;
  onZoom: (pct:number)=>void;
  onVivid: (v:boolean)=>void;
  // Enhanced props for integrated functionality
  kpis?: {
    occ: number;
    arrivals: number;
    presents: number;
    availableRooms: number;
    dailyRevenue: number;
    issues: number;
    departures: number;
    urgentActions: number;
  };
  isRefetching?: boolean;
  onRefresh?: () => void;
};

export default function RackToolbar({ onFilterStatus, onToggleCompact, onZoom, onVivid, kpis, isRefetching, onRefresh }: Props){
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
      {/* Compact integrated header with KPIs + controls */}
      <div className="card-elevated p-3 bg-gradient-secondary backdrop-blur-sm border border-accent-gold/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Left: Title + Clock + Key KPIs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-charcoal">Rack</h2>
              <RealtimeClock timezone="Africa/Dakar" className="hidden md:flex text-xs" />
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefetching}
                  className="h-7 px-2"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefetching ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
            
            {/* Compact KPIs row */}
            {kpis && (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-brand-accent font-bold">{kpis.occ}%</span>
                  <span className="text-muted-foreground">occ</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarCheck className="h-3 w-3 text-green-600" />
                  <span className="font-medium">{kpis.arrivals}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="font-medium">{kpis.departures}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-accent-gold" />
                  <span className="font-medium">{kpis.dailyRevenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€</span>
                </div>
                {kpis.urgentActions > 0 && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    {kpis.urgentActions} urgent
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Right: Filters + Legend + Controls in one compact row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            
            {/* Combined Filters + Legend */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <Eye className="w-3 h-3 text-muted-foreground flex-shrink-0" />
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
                  className="group flex items-center gap-1 px-2 py-1 rounded-lg border border-border/50 text-xs font-medium hover-lift transition-all duration-200 touch-manipulation whitespace-nowrap active:scale-95">
                  <span className={`w-2 h-2 rounded-full ${ch.color} group-hover:scale-110 transition-transform`} />
                  <span className="hidden sm:inline">{ch.label}</span>
                  <span className="sm:hidden">{ch.short}</span>
                </button>
              ))}
            </div>

            {/* Compact Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={compact ? "default" : "outline"}
                size="sm"
                onClick={() => handleCompactToggle(!compact)}
                title="Mode compact"
                className={cn("h-7 px-2", compact && "ring-1 ring-primary/40")}
              >
                <Columns3 className="w-3 h-3" />
              </Button>
              
              <Button
                variant={vivid ? "default" : "outline"}
                size="sm"
                onClick={() => handleVividToggle(!vivid)}
                title="Couleurs vives"
                className={cn("h-7 px-2", vivid && "ring-1 ring-primary/40")}
              >
                <Palette className="w-3 h-3" />
              </Button>
              
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-card border border-border/50">
                <ZoomOut className="w-3 h-3 text-muted-foreground" />
                <input 
                  type="range" 
                  min={80} 
                  max={140} 
                  value={zoom}
                  onChange={(e)=>{ const v=+e.target.value; setZoom(v); onZoom(v); }}
                  title={`Zoom: ${zoom}%`}
                  className="w-12 accent-primary touch-manipulation cursor-pointer"
                />
                <ZoomIn className="w-3 h-3 text-muted-foreground" />
                <span className="w-8 text-right text-xs font-mono text-muted-foreground">{zoom}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}