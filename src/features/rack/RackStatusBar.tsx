interface Props { occ:number; arrivals:number; presents:number; hs:number; }
export function RackStatusBar({ occ, arrivals, presents, hs }: Props) {
  return (
    <div className="mt-4 bg-card border border-border rounded-xl px-4 py-2 shadow-soft">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span>Occupation: <strong>{occ}%</strong></span>
        <span>Arrivées: <strong>{arrivals}</strong></span>
        <span>Présents: <strong>{presents}</strong></span>
        <span>HS: <strong className="text-status-cancelled">{hs}</strong></span>
      </div>
    </div>
  );
}
