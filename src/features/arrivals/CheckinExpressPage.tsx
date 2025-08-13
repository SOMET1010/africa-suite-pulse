import { useEffect, useMemo, useState } from "react";
import { TButton } from "@/core/ui/TButton";
import { UnifiedLayout } from "@/core/layout/UnifiedLayout";
import { FilterBar } from "@/core/ui/FilterBar";
import { ActionCard } from "@/core/ui/ActionCard";
import { DataCard } from "@/core/ui/DataCard";
import { Badge } from "@/core/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useArrivals, useAssignRoomToReservation, useCheckinReservation } from "@/queries/arrivals.queries";
import { useExpressCheckin } from "./hooks/useExpressCheckin";
import { useOrgId } from "@/core/auth/useOrg";
import { Crown, FileText, MoreVertical, UserCheck, Filter, Clock, Users } from "lucide-react";
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
    <UnifiedLayout
      title="Arrivées du jour"
      headerAction={
        <div className="flex items-center gap-2">
          <TButton variant="ghost" size="sm" onClick={() => setMode(mode === 'express' ? 'detailed' : 'express')}>
            Mode {mode === 'express' ? 'détaillé' : 'express'}
          </TButton>
        </div>
      }
      bottomActions={
        <>
          <TButton size="lg" onClick={() => toast({ title: "Check-in Express", description: "Sélectionnez une réservation" })} className="flex-1">
            <UserCheck className="h-5 w-5 mr-2" />
            Check-in Express
          </TButton>
          <TButton variant="default" size="lg" onClick={() => toast({ title: "Assigner chambres" })} className="flex-1">
            Assigner
          </TButton>
        </>
      }
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid-adaptive-1 gap-4">
          <DataCard
            title="Confirmés"
            value={stats.confirmed}
            icon={Clock}
            variant="default"
          />
          <DataCard
            title="Présents"
            value={stats.present}
            icon={UserCheck}
            variant="success"
          />
          <DataCard
            title="Non assignés"
            value={stats.unassigned}
            icon={Filter}
            variant="warning"
          />
          <DataCard
            title="Total"
            value={rows.length}
            icon={Users}
            variant="primary"
          />
        </div>

        {/* Filtres */}
        <FilterBar
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder="Rechercher nom, référence, chambre..."
        >
          <select 
            className="rounded-xl border border-border bg-background px-4 h-10 text-foreground focus-input" 
            value={status} 
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmés uniquement</option>
          </select>
          <select 
            className="rounded-xl border border-border bg-background px-4 h-10 text-foreground focus-input" 
            value={sort} 
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="time">Tri par heure d'arrivée</option>
            <option value="name">Tri par nom client</option>
            <option value="room">Tri par numéro chambre</option>
          </select>
        </FilterBar>

        {/* Liste des arrivées */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((a) => (
            <ActionCard
              key={a.id}
              title={a.guest_name}
              description={a.reference ?? "Aucune référence"}
              className="group"
            >
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <Badge variant={statusToBadge(a.status)}>
                    {a.status === 'present' ? 'Présent' : a.status === 'confirmed' ? 'Confirmé' : a.status === 'option' ? 'Option' : 'Annulé'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Chambre</span>
                  <span className="font-medium">{a.room_number ?? 'Non assignée'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Occupants</span>
                  <span className="font-medium">{(a.adults ?? 0)} + {(a.children ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="font-semibold text-primary">
                    {a.rate_total != null ? Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(a.rate_total) : "—"}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <TButton 
                  variant="primary" 
                  size="sm"
                  onClick={() => onExpressCheckin(a.id)} 
                  disabled={a.status === 'present' || expressCheckinMutation.isPending}
                >
                  {a.status === 'present' ? 'Présent ✓' : 'Check-in'}
                </TButton>
                <TButton 
                  variant="default" 
                  size="sm"
                  onClick={() => askAssign(a.id)}
                >
                  Assigner
                </TButton>
                <DocumentActionsMenu
                  arrival={a}
                  trigger={
                    <TButton variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Docs
                    </TButton>
                  }
                />
                <TButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toast({ title: "Détails", description: `Détails de ${a.guest_name}` })}
                >
                  Détails
                </TButton>
              </div>
            </ActionCard>
          ))}
        </div>
      </div>

      <RoomAssignSheet
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onPick={handlePick}
      />
    </UnifiedLayout>
  );
}
