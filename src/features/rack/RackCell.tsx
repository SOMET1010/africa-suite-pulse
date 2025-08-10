import { Reservation, RoomStatus } from "./types";
import { Badge } from "@/core/ui/Badge";
import { toast } from "@/hooks/use-toast";

interface Props {
  date: string; // ISO
  roomId: string;
  roomStatus: RoomStatus;
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
        className="relative bg-background border-b border-l border-border px-3 py-2 cursor-pointer hover:bg-secondary/40"
        onClick={() => toast({ title: "Créer réservation", description: `Chambre ${roomId} - ${date}` })}
        onDragOver={(e)=>e.preventDefault()}
        onDrop={(e)=>{
          const id = e.dataTransfer.getData('text/res-id');
          console.log('Drop réservation', id, '→', roomId, date);
          toast({ title: "Déplacement (mock)", description: `${id} → ${roomId} (${date})` });
        }}
      >
        {stateDot}
      </div>
    );
  }

  const badgeVariant = res.status === 'present' ? 'present' : res.status === 'confirmed' ? 'confirmed' : res.status === 'option' ? 'option' : 'cancelled';

  return (
    <div
      className="relative bg-card border-b border-l border-border px-3 py-2 hover:bg-secondary/30 cursor-pointer"
      onClick={() => toast({ title: "Détails réservation", description: `${res.guestName} (${res.id})` })}
      draggable
      onDragStart={(e)=>{
        e.dataTransfer.setData('text/res-id', res.id);
        console.log('Drag réservation', res.id);
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

