import { Reservation } from "./types";
import { Badge } from "@/core/ui/Badge";
import { toast } from "@/hooks/use-toast";

interface Props {
  date: string; // ISO
  roomId: string;
  reservations: Reservation[];
}

export function RackCell({ date, roomId, reservations }: Props) {
  const res = reservations.find(r => r.start <= date && date < r.end);
  const stateDot = <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden />;

  if (!res) {
    return (
      <div
        className="relative bg-background border-b border-l border-border px-3 py-2 cursor-pointer hover:bg-secondary/40"
        onClick={() => toast({ title: "Créer réservation", description: `Chambre ${roomId} - ${date}` })}
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
    >
      {stateDot}
      <div className="flex items-center gap-2">
        <Badge variant={badgeVariant as any}>{res.status === 'present' ? 'Présent' : res.status === 'confirmed' ? 'Confirmé' : res.status === 'option' ? 'Option' : 'Annulé'}</Badge>
        <span className="truncate">{res.guestName}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{res.ae} · {res.nights}n · {res.rate.toFixed(2)} €</div>
    </div>
  );
}
