import type { Reservation, Room } from "./types";
import { Badge } from "@/core/ui/Badge";
import { toast } from "@/hooks/use-toast";
import { reassignReservation } from "./rack.service";

interface Props {
  date: string; // ISO
  roomId: string;
  roomStatus: Room["status"];
  mode: "compact" | "detailed";
  reservations: Reservation[];
}

export function RackCell({ date, roomId, roomStatus, mode, reservations }: Props) {
  const res = reservations.find(r => r.start <= date && date < r.end);
  const colorVar = roomStatus === 'clean'
    ? '--status-confirmed'
    : roomStatus === 'dirty'
    ? '--status-option'
    : roomStatus === 'maintenance'
    ? '--status-present'
    : '--status-cancelled';
  const stateDot = (
    <span
      className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: `hsl(var(${colorVar}))` }}
      aria-hidden
    />
  );

  if (!res) {
    return (
      <div
        className="relative bg-background border-b border-l border-border px-3 py-2 cursor-pointer hover:bg-secondary/40 transition-colors"
        onClick={() => toast({ title: "Créer réservation", description: `Chambre ${roomId} - ${date}` })}
        onDragOver={(e)=>{e.preventDefault(); e.currentTarget.classList.add('bg-primary/10');}}
        onDragLeave={(e)=>{e.currentTarget.classList.remove('bg-primary/10');}}
        onDrop={async (e)=>{
          e.preventDefault();
          e.currentTarget.classList.remove('bg-primary/10');
          const id = e.dataTransfer.getData('text/res-id');
          if (!id) return;
          try{
            await reassignReservation(id, roomId);
            toast({ title: "✅ Réservation réassignée", description: `Nouvelle chambre assignée` });
            window.dispatchEvent(new CustomEvent('rack-refresh'));
          }catch(err:any){
            toast({ title: "❌ Erreur réassignation", description: err.message });
          }
        }}
      >
        {stateDot}
      </div>
    );
  }

  const badgeVariant = res.status === 'present' ? 'present' : res.status === 'confirmed' ? 'confirmed' : res.status === 'option' ? 'option' : 'cancelled';
  const cellSoftClass = res.status === 'present' ? 'cell-soft--present' : res.status === 'confirmed' ? 'cell-soft--confirmed' : res.status === 'option' ? 'cell-soft--option' : 'cell-soft--cancelled';

  return (
    <div
      className={`relative border-b border-l border-border px-3 py-2 cursor-move transition-all hover:shadow-md hover:scale-[1.02] ${cellSoftClass}`}
      onClick={() => toast({ title: "Détails réservation", description: `${res.guestName} (${res.id})` })}
      draggable
      onDragStart={(e)=>{
        e.dataTransfer.setData('text/res-id', res.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.5';
      }}
      onDragEnd={(e)=>{
        e.currentTarget.style.opacity = '1';
      }}
    >
      {stateDot}
      <div className="flex items-center gap-2">
        <Badge variant={badgeVariant as any}>{res.status === 'present' ? 'Présent' : res.status === 'confirmed' ? 'Confirmé' : res.status === 'option' ? 'Option' : 'Annulé'}</Badge>
        <span className="truncate">{res.guestName}</span>
      </div>
      {mode === 'detailed' && (
        <div className="text-xs text-muted-foreground mt-1">{res.ae} · {res.nights}n · {res.rate.toFixed(2)} €</div>
      )}
    </div>
  );
}

