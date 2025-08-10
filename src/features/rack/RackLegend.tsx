export function RackLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--status-confirmed))' }} /> Confirmé</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--status-present))' }} /> Présent</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--status-option))' }} /> Option</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(var(--status-cancelled))' }} /> Annulé</span>
      <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: 'hsl(0 0% 60%)' }} /> Vide</span>
    </div>
  );
}
