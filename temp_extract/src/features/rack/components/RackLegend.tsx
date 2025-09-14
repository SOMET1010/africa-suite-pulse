export default function RackLegend(){
  const Item = ({c,label, glow}:{c:string;label:string; glow?:boolean})=>(
    <div className="flex items-center gap-2 group">
      <span className={`inline-block w-3 h-3 rounded-full ${c} ${glow ? 'animate-glow-pulse' : ''} group-hover:scale-110 transition-transform`} />
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </div>
  );
  
  return (
    <div className="animate-fade-in">
      <div className="card-elevated p-3 sm:p-4 bg-gradient-secondary/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="font-semibold text-xs sm:text-sm text-foreground">Réservations :</span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Item c="bg-success" label="Présent" glow />
              <Item c="bg-info" label="Confirmé" />
              <Item c="bg-warning" label="Option" />
              <Item c="bg-danger" label="Annulé" />
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-border" />
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="font-semibold text-xs sm:text-sm text-foreground">Chambres :</span>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Item c="room-dot-clean" label="Propre" />
              <Item c="room-dot-inspected" label="Contrôlée" />
              <Item c="room-dot-dirty" label="Sale" />
              <Item c="room-dot-maintenance" label="Maint." />
              <Item c="room-dot-out_of_order" label="HS" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}