export default function RackLegend(){
  const Item = ({c,label}:{c:string;label:string})=>(
    <div className="flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded-full ${c}`} />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
  
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs px-2 py-2 bg-card/50 rounded-lg border border-border">
      <Item c="bg-green-500" label="Présent"/>
      <Item c="bg-blue-500" label="Confirmé"/>
      <Item c="bg-purple-500" label="Option"/>
      <Item c="bg-red-500" label="Annulé/No-show"/>
      <span className="mx-2 text-muted-foreground">|</span>
      <Item c="bg-green-200" label="Ch. propre"/>
      <Item c="bg-blue-200" label="Contrôlée"/>
      <Item c="bg-yellow-200" label="Sale"/>
      <Item c="bg-orange-200" label="Maintenance"/>
      <Item c="bg-red-200" label="HS"/>
    </div>
  );
}