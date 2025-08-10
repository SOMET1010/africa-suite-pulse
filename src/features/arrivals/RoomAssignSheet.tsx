import { useEffect, useState } from "react";
import { fetchPickableRooms, type PickableRoom } from "./rooms.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (roomId: string) => void;
};

export default function RoomAssignSheet({ open, onClose, onPick }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PickableRoom[]>([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchPickableRooms("").then(setRows).finally(()=>setLoading(false));
  }, [open]);

  const filtered = q ? rows.filter(r =>
    `${r.number} ${r.type} ${r.room_type?.label ?? ""} ${r.floor ?? ""}`.toLowerCase().includes(q.toLowerCase())
  ) : rows;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex">
      <div className="ml-auto h-full w-full max-w-md bg-card shadow-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Assigner une chambre</div>
          <button onClick={onClose} className="px-3 py-2 rounded-xl border border-border hover:bg-muted">Fermer</button>
        </div>
        <input
          placeholder="Rechercher (numéro / type / étage)"
          value={q} onChange={e=>setQ(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border bg-card"
        />
        {loading ? <div>Chargement…</div> : (
          <div className="flex-1 overflow-auto space-y-2">
            {filtered.map(r=>(
              <button key={r.id}
                onClick={()=> onPick(r.id)}
                className="w-full text-left rounded-2xl border border-border hover:bg-muted p-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">Ch. {r.number}</div>
                  <span className={`text-xs px-2 py-1 rounded-full border border-border ${
                    r.status === 'clean' ? 'bg-green-100 text-green-800' :
                    r.status === 'dirty' ? 'bg-red-100 text-red-800' :
                    r.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {r.room_type ? `${r.room_type.label} (${r.type})` : r.type} • Étage {r.floor ?? "—"}
                  {r.room_type && <span className="text-xs ml-2">• {r.room_type.capacity} pers.</span>}
                </div>
              </button>
            ))}
            {!filtered.length && <div className="text-sm text-muted-foreground">Aucune chambre trouvée.</div>}
          </div>
        )}
      </div>
    </div>
  );
}