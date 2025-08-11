import { useEffect, useMemo, useState } from "react";
import { TButton } from "@/core/ui/TButton";
import { Badge } from "@/core/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useArrivals, useAssignRoomToReservation, useCheckinReservation } from "@/queries/arrivals.queries";
import { useOrgId } from "@/core/auth/useOrg";
import type { ArrivalRow } from "./arrivals.types";
import RoomAssignSheet from "./RoomAssignSheet";

const statusToBadge = (s: ArrivalRow["status"]) =>
  s === "present" ? "present" : s === "confirmed" ? "confirmed" : s === "option" ? "option" : "cancelled" as const;


export default function CheckinExpressPage() {
  const { orgId } = useOrgId();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "confirmed">("all");
  const [sort, setSort] = useState<"time" | "name" | "room">("time");
  const [mode, setMode] = useState<"express" | "detailed">("express");

  const [dateISO] = useState(() => new Date().toISOString().slice(0, 10));
  
  // 🆕 REACT QUERY HOOKS
  const arrivalsQuery = useArrivals(orgId!, dateISO);
  const assignRoomMutation = useAssignRoomToReservation();
  const checkinMutation = useCheckinReservation();
  
  const [assignOpen, setAssignOpen] = useState(false);
  const [targetResa, setTargetResa] = useState<string | undefined>();

  const rows = arrivalsQuery.data || [];

  useEffect(() => {
    document.title = "Arrivées du jour - AfricaSuite";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Arrivées du jour: check-in express, filtres, et actions rapides.");
  }, []);

  // 🆕 SUPPRESSION DES EVENT LISTENERS MANUELS
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

  function askAssign(reservationId: string) {
    setTargetResa(reservationId);
    setAssignOpen(true);
  }

  // 🆕 HANDLERS AVEC REACT QUERY MUTATIONS
  async function handlePick(roomId: string) {
    if (!targetResa) return;
    try {
      await assignRoomMutation.mutateAsync({ reservationId: targetResa, roomId });
      toast({ title: "Chambre assignée", description: "✅ Assignation réussie" });
      setAssignOpen(false);
      setTargetResa(undefined);
    } catch (e: any) {
      toast({ title: "Erreur assignation", description: e.message });
    }
  }

  async function onCheckin(reservationId: string) {
    if (!confirm("Confirmer le check-in ?")) return;
    try {
      await checkinMutation.mutateAsync({ reservationId });
      toast({ title: "Check-in effectué", description: "✅ Client présent" });
    } catch (e: any) {
      toast({ title: "Erreur check-in", description: e.message });
    }
  }

  const filtered = useMemo(() => {
    let list = rows.filter(r => {
      const hay = `${r.guest_name} ${r.room_number ?? ""} ${r.reference ?? ""}`.toLowerCase();
      return hay.includes(query.toLowerCase());
    });
    if (status === 'confirmed') list = list.filter(r => r.status === 'confirmed');
    const sorter: Record<typeof sort, (a: ArrivalRow, b: ArrivalRow) => number> = {
      time: (a, b) => (a.planned_time ?? '').localeCompare(b.planned_time ?? ''),
      name: (a, b) => a.guest_name.localeCompare(b.guest_name),
      room: (a, b) => (a.room_number ?? '').localeCompare(b.room_number ?? ''),
    };
    return list.sort(sorter[sort]);
  }, [rows, query, status, sort]);

  const stats = useMemo(() => {
    const confirmed = rows.filter(r => r.status === 'confirmed').length;
    const present = rows.filter(r => r.status === 'present').length;
    const unassigned = rows.filter(r => !r.room_id).length;
    return { confirmed, present, unassigned };
  }, [rows]);

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
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Total</div><div className="text-2xl font-bold">{rows.length}</div></CardContent></Card>
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
                  <div className="text-base font-semibold">{a.guest_name}</div>
                  <div className="text-sm text-muted-foreground">{a.reference ?? ""}</div>
                </div>
                <Badge variant={statusToBadge(a.status)}>{a.status === 'present' ? 'Présent' : a.status === 'confirmed' ? 'Confirmé' : a.status === 'option' ? 'Option' : 'Annulé'}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Chambre</div>
                <div className="flex items-center gap-2">
                  {a.room_number ?? 'Non assignée'}
                  {!a.room_id && <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">Non assignée</span>}
                </div>
                <div className="text-muted-foreground">A/E</div>
                <div>{(a.adults ?? 0)}A {(a.children ?? 0)}E</div>
                <div className="text-muted-foreground">Total</div>
                <div>{a.rate_total != null ? Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(a.rate_total) : "—"}</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <TButton variant="primary" onClick={() => onCheckin(a.id)} disabled={a.status === 'present'}>
                  {a.status === 'present' ? 'Présent' : 'Check-in'}
                </TButton>
                <TButton variant="default" onClick={() => askAssign(a.id)}>Assigner</TButton>
                <TButton variant="ghost" onClick={()=>toast({ title: "Note", description: a.guest_name })}>Note</TButton>
                <TButton variant="ghost" onClick={()=>toast({ title: "Détails", description: a.guest_name })}>Détails</TButton>
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

      <RoomAssignSheet
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onPick={handlePick}
      />
    </main>
  );
}
