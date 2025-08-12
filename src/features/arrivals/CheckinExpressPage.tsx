import { useEffect, useMemo, useState } from "react";
import { TButton } from "@/core/ui/TButton";
import { Badge } from "@/core/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useArrivals, useAssignRoomToReservation, useCheckinReservation } from "@/queries/arrivals.queries";
import { useExpressCheckin } from "./hooks/useExpressCheckin";
import { useOrgId } from "@/core/auth/useOrg";
import { Crown, FileText, MoreVertical } from "lucide-react";
import type { ArrivalRow } from "./arrivals.types";
import RoomAssignSheet from "./RoomAssignSheet";
import { DocumentActionsMenu } from "./components/DocumentActionsMenu";
import ArrivalServicesControl from "./components/ArrivalServicesControl";

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
  const expressCheckinMutation = useExpressCheckin();
  
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

  async function onExpressCheckin(reservationId: string) {
    if (!confirm("Confirmer le check-in express ? (Création automatique de la facture)")) return;
    try {
      await expressCheckinMutation.mutateAsync(reservationId);
    } catch (e: any) {
      // Error handling is done in the hook
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
    <main className="min-h-screen bg-pearl pb-24 px-4 sm:px-6 pt-8 animate-fade-in">
      <div className="container mx-auto">
        <header className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Crown className="h-6 w-6 text-brand-accent" />
              <h1 className="text-3xl font-luxury font-bold text-gradient">Arrivées du Jour</h1>
            </div>
            <p className="text-lg text-charcoal/80 font-premium">{new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm font-premium text-charcoal/70">Mode d'affichage</span>
            <div className="inline-flex rounded-xl border border-accent-gold/30 bg-glass-card shadow-soft overflow-hidden">
              <button 
                onClick={()=>setMode('express')} 
                className={`px-4 h-10 font-premium transition-elegant ${mode==='express'?"bg-brand-accent text-white":"bg-transparent text-charcoal hover:bg-brand-accent/10"}`}
              >
                Express
              </button>
              <button 
                onClick={()=>setMode('detailed')} 
                className={`px-4 h-10 font-premium transition-elegant ${mode==='detailed'?"bg-brand-accent text-white":"bg-transparent text-charcoal hover:bg-brand-accent/10"}`}
              >
                Détaillé
              </button>
            </div>
          </div>
        </header>

        <section className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {label:"Confirmés",value:stats.confirmed,color:"text-info"},
              {label:"Présents",value:stats.present,color:"text-success"},
              {label:"Non assignés",value:stats.unassigned,color:"text-warning"},
              {label:"Total",value:rows.length,color:"text-brand-accent"}
            ].map((stat, index) => (
              <Card key={stat.label} className="glass-card shadow-luxury hover-glow transition-elegant" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                <CardContent className="pt-6">
                  <div className="text-sm font-premium text-charcoal/70 uppercase tracking-wide mb-2">{stat.label}</div>
                  <div className={`text-3xl font-luxury font-bold ${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-label="Filtres" className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Rechercher nom, référence, chambre..."
              className="w-full rounded-xl border border-accent-gold/20 bg-glass-card px-6 h-12 shadow-luxury focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent backdrop-blur text-charcoal placeholder:text-charcoal/60 transition-elegant"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
            <select 
              className="rounded-xl border border-accent-gold/20 bg-glass-card px-4 h-12 shadow-luxury text-charcoal font-premium transition-elegant focus:outline-none focus:ring-2 focus:ring-brand-accent" 
              value={status} 
              onChange={(e)=>setStatus(e.target.value as any)}
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmés uniquement</option>
            </select>
            <select 
              className="rounded-xl border border-accent-gold/20 bg-glass-card px-4 h-12 shadow-luxury text-charcoal font-premium transition-elegant focus:outline-none focus:ring-2 focus:ring-brand-accent" 
              value={sort} 
              onChange={(e)=>setSort(e.target.value as any)}
            >
              <option value="time">Tri par heure d'arrivée</option>
              <option value="name">Tri par nom client</option>
              <option value="room">Tri par numéro chambre</option>
            </select>
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((a, index) => (
              <Card key={a.id} className="glass-card shadow-luxury hover-lift transition-elegant group" style={{ animationDelay: `${0.6 + index * 0.05}s` }}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-lg font-luxury font-semibold text-charcoal">{a.guest_name}</div>
                      <div className="text-sm text-charcoal/60 font-premium">{a.reference ?? "Aucune référence"}</div>
                    </div>
                    <Badge variant={statusToBadge(a.status)} className="shimmer">
                      {a.status === 'present' ? 'Présent' : a.status === 'confirmed' ? 'Confirmé' : a.status === 'option' ? 'Option' : 'Annulé'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-premium text-charcoal/70">Chambre</span>
                      <div className="flex items-center gap-2">
                        <span className="font-luxury font-medium text-charcoal">{a.room_number ?? 'Non assignée'}</span>
                        {!a.room_id && <span className="text-xs px-2 py-1 rounded-full badge-soft--option">À assigner</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-premium text-charcoal/70">Occupants</span>
                      <span className="font-luxury font-medium text-charcoal">{(a.adults ?? 0)} Adulte{(a.adults ?? 0) > 1 ? 's' : ''} • {(a.children ?? 0)} Enfant{(a.children ?? 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-premium text-charcoal/70">Montant</span>
                      <span className="font-luxury font-bold text-brand-accent">
                        {a.rate_total != null ? Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(a.rate_total) : "—"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <TButton 
                      variant="primary" 
                      onClick={() => onExpressCheckin(a.id)} 
                      disabled={a.status === 'present' || expressCheckinMutation.isPending}
                      className="group-hover:scale-[1.02] transition-elegant"
                    >
                      {a.status === 'present' ? 'Présent ✓' : expressCheckinMutation.isPending ? 'Express...' : 'Check-in Express'}
                    </TButton>
                    <TButton 
                      variant="default" 
                      onClick={() => askAssign(a.id)}
                      className="group-hover:scale-[1.02] transition-elegant"
                    >
                      Assigner
                    </TButton>
                    <DocumentActionsMenu
                      arrival={a}
                      trigger={
                        <TButton 
                          variant="ghost" 
                          className="group-hover:scale-[1.02] transition-elegant"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Documents
                        </TButton>
                      }
                    />
                    <TButton 
                      variant="ghost" 
                      onClick={()=>toast({ title: "Détails", description: `Détails de ${a.guest_name}` })}
                      className="group-hover:scale-[1.02] transition-elegant"
                    >
                      Détails
                    </TButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

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
                <TButton onClick={()=>toast({ title: "Check-in Express", description: "Sélectionnez une réservation" })}>Check-in Express</TButton>
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
