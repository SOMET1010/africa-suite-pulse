import { useEffect, useMemo, useState } from "react";
import { TButton } from "@/core/ui/TButton";
import { Badge } from "@/core/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface ArrivalItem {
  id: string;
  name: string;
  reference: string;
  room?: string;
  status: "confirmed" | "checked_in" | "option" | "cancelled";
  nights: number;
  ae: string; // A/E
  total: number;
}

const sampleArrivals: ArrivalItem[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `res-${i+1}`,
  name: ["A. Diop","B. N'Diaye","C. Traoré","D. Abebe","E. Okoro","F. Mensah"][i % 6] + ` ${i+1}`,
  reference: `AFS-${1000 + i}`,
  room: i % 3 === 0 ? undefined : `${200 + i}`,
  status: ((): ArrivalItem["status"] => {
    const m = i % 5;
    if (m === 0) return "checked_in";
    if (m === 1) return "confirmed";
    if (m === 2) return "option";
    if (m === 3) return "cancelled";
    return "confirmed";
  })(),
  nights: (i % 5) + 1,
  ae: i % 2 === 0 ? "A" : "E",
  total: 75 + (i % 5) * 20,
}));

const statusToBadge = (s: ArrivalItem["status"]) =>
  s === "checked_in" ? "present" : s === "confirmed" ? "confirmed" : s === "option" ? "option" : "cancelled" as const;

export default function CheckinExpressPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "confirmed">("all");
  const [sort, setSort] = useState<"time" | "name" | "room">("time");
  const [mode, setMode] = useState<"express" | "detailed">("express");

  useEffect(() => {
    document.title = "Arrivées du jour - AfricaSuite";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Arrivées du jour: check-in express, filtres, et actions rapides.");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (inInput) return;
      if (e.key === 'F1') { e.preventDefault(); toast({ title: "[F1] Check-in", description: "Action de démonstration" }); }
      if (e.key === 'F2') { e.preventDefault(); toast({ title: "[F2] Assigner", description: "Action de démonstration" }); }
      if (e.key === 'F5') { e.preventDefault(); toast({ title: "[F5] Note", description: "Action de démonstration" }); }
      if (e.key === 'F9') { e.preventDefault(); toast({ title: "[F9] Détail", description: "Action de démonstration" }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    let list = sampleArrivals.filter(a =>
      [a.name, a.reference, a.room ?? "Non assignée"].join(" ").toLowerCase().includes(query.toLowerCase())
    );
    if (status === 'confirmed') list = list.filter(a => a.status === 'confirmed');
    const sorter: Record<typeof sort, (a: ArrivalItem, b: ArrivalItem) => number> = {
      time: (a,b) => a.id.localeCompare(b.id),
      name: (a,b) => a.name.localeCompare(b.name),
      room: (a,b) => (a.room ?? '').localeCompare(b.room ?? ''),
    };
    return list.sort(sorter[sort]);
  }, [query, status, sort]);

  const stats = useMemo(() => {
    const confirmed = sampleArrivals.filter(a => a.status === 'confirmed').length;
    const present = sampleArrivals.filter(a => a.status === 'checked_in').length;
    const unassigned = sampleArrivals.filter(a => !a.room).length;
    return { confirmed, present, unassigned };
  }, []);

  return (
    <main className="min-h-screen pb-24 px-4 sm:px-6 pt-6">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Arrivées du jour</h1>
          <p className="text-muted-foreground text-sm">{new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Mode</span>
          <div className="inline-flex rounded-xl border border-border overflow-hidden">
            <button onClick={()=>setMode('express')} className={"px-3 h-10 " + (mode==='express'?"bg-secondary":"bg-background")}>Express</button>
            <button onClick={()=>setMode('detailed')} className={"px-3 h-10 " + (mode==='detailed'?"bg-secondary":"bg-background")}>Détaillé</button>
          </div>
        </div>
      </header>

      <section className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Confirmés</div><div className="text-2xl font-bold">{stats.confirmed}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Présents</div><div className="text-2xl font-bold">{stats.present}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Non assignés</div><div className="text-2xl font-bold">{stats.unassigned}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Total</div><div className="text-2xl font-bold">{sampleArrivals.length}</div></CardContent></Card>
      </section>

      <section aria-label="Filtres" className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          placeholder="Rechercher nom / réf / chambre"
          className="w-full rounded-xl border border-border bg-background px-4 h-12 shadow-soft focus:outline-none focus:ring-2 focus:ring-ring"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
        />
        <select className="rounded-xl border border-border bg-background px-3 h-12" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
          <option value="all">Tous statuts</option>
          <option value="confirmed">Confirmés</option>
        </select>
        <select className="rounded-xl border border-border bg-background px-3 h-12" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
          <option value="time">Tri par heure</option>
          <option value="name">Tri par nom</option>
          <option value="room">Tri par chambre</option>
        </select>
      </section>

      <section className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a) => (
          <Card key={a.id} className="shadow-soft">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-semibold">{a.name}</div>
                  <div className="text-sm text-muted-foreground">{a.reference}</div>
                </div>
                <Badge variant={statusToBadge(a.status)}>{a.status === 'checked_in' ? 'Présent' : a.status === 'confirmed' ? 'Confirmé' : a.status === 'option' ? 'Option' : 'Annulé'}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Chambre</div>
                <div>{a.room ?? 'Non assignée'}</div>
                <div className="text-muted-foreground">A/E</div>
                <div>{a.ae}</div>
                <div className="text-muted-foreground">Nuits</div>
                <div>{a.nights}</div>
                <div className="text-muted-foreground">Tarif total</div>
                <div>{a.total.toFixed(2)} €</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <TButton variant="primary" onClick={()=>toast({ title: "Check-in", description: `${a.name}` })}>Check-in</TButton>
                <TButton variant="default" onClick={()=>toast({ title: "Assigner chambre", description: `${a.name}` })}>Assigner</TButton>
                <TButton variant="ghost" onClick={()=>toast({ title: "Note", description: `${a.name}` })}>Note</TButton>
                <TButton variant="ghost" onClick={()=>toast({ title: "Détails", description: `${a.name}` })}>Détails</TButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="h-24" />

      {/* Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-0">
        <div className="mx-auto max-w-screen-2xl px-4">
          <div className="bg-card/90 backdrop-blur border-t border-border rounded-t-xl shadow-soft [padding-bottom:env(safe-area-inset-bottom)]">
            <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>[F1] Check-in</span>
                <span>[F2] Assigner</span>
                <span>[F5] Note</span>
                <span>[F9] Détail</span>
              </div>
              <div className="flex items-center gap-2">
                <TButton onClick={()=>toast({ title: "Check-in (barre)" })}>Check-in</TButton>
                <TButton variant="default" onClick={()=>toast({ title: "Assigner (barre)" })}>Assigner</TButton>
                <TButton variant="ghost" onClick={()=>toast({ title: "Note (barre)" })}>Note</TButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
