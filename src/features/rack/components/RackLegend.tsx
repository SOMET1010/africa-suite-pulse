export default function RackLegend(){
  const Item = ({c,label, glow}:{c:string;label:string; glow?:boolean})=>(
    <div className="flex items-center gap-2 group">
      <span className={`inline-block w-3 h-3 rounded-full ${c} ${glow ? 'animate-glow-pulse' : ''} group-hover:scale-110 transition-transform`} />
      <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
    </div>
  );
  
  return (
    <div className="animate-fade-in">
      <div className="card-elevated p-4 bg-gradient-secondary/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm text-foreground">Réservations :</span>
            <Item c="bg-success" label="Présent" glow />
            <Item c="bg-info" label="Confirmé" />
            <Item c="bg-warning" label="Option" />
            <Item c="bg-danger" label="Annulé/No-show" />
          </div>
          
          <div className="w-px h-6 bg-border" />
          
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm text-foreground">Chambres :</span>
            <Item c="room-dot-clean" label="Propre" />
            <Item c="room-dot-inspected" label="Contrôlée" />
            <Item c="room-dot-dirty" label="Sale" />
            <Item c="room-dot-maintenance" label="Maintenance" />
            <Item c="room-dot-out_of_order" label="Hors service" />
          </div>
        </div>
      </div>
    </div>
  );
}