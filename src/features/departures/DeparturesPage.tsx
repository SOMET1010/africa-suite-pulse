import { useEffect, useMemo, useState } from "react";
import { TButton } from "@/core/ui/TButton";
import { Badge } from "@/core/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useDepartures, useCheckoutReservation } from "@/queries/departures.queries";
import { useOrgId } from "@/core/auth/useOrg";
import { Clock, FileText, MoreVertical, CreditCard } from "lucide-react";
import type { DepartureRow } from "./departures.types";

const statusToBadge = (s: DepartureRow["status"]) =>
  s === "checked_out" ? "present" : s === "checked_in" ? "confirmed" : "cancelled" as const;

export default function DeparturesPage() {
  const { orgId } = useOrgId();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "pending">("all");
  const [sort, setSort] = useState<"time" | "name" | "room">("time");
  const [mode, setMode] = useState<"express" | "detailed">("express");

  const [dateISO] = useState(() => new Date().toISOString().slice(0, 10));
  
  const departuresQuery = useDepartures(orgId!, dateISO);
  const checkoutMutation = useCheckoutReservation();
  
  const rows = departuresQuery.data || [];

  useEffect(() => {
    document.title = "Départs du jour - AfricaSuite";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Départs du jour: check-out express, facturation finale, et libération des chambres.");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (inInput) return;

      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('departures-search')?.focus();
      }
    };
    
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const onCheckout = async (id: string) => {
    try {
      await checkoutMutation.mutateAsync({ reservationId: id });
      toast({ title: "✅ Check-out effectué", description: "Client parti avec succès" });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({ 
        title: "❌ Erreur lors du check-out", 
        description: "Vérifiez la facturation et réessayez",
        variant: "destructive" 
      });
    }
  };

  const filtered = useMemo(() => {
    let result = rows;

    if (status === "pending") {
      result = result.filter(r => r.status === "checked_in");
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(r =>
        r.guest_name.toLowerCase().includes(q) ||
        (r.room_number && r.room_number.includes(q)) ||
        (r.reference && r.reference.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sort === "name") return a.guest_name.localeCompare(b.guest_name);
      if (sort === "room") return (a.room_number || "").localeCompare(b.room_number || "");
      if (sort === "time") {
        if (!a.planned_time && !b.planned_time) return 0;
        if (!a.planned_time) return 1;
        if (!b.planned_time) return -1;
        return a.planned_time.localeCompare(b.planned_time);
      }
      return 0;
    });

    return result;
  }, [rows, query, status, sort]);

  const stats = useMemo(() => {
    const total = rows.length;
    const checkedOut = rows.filter(r => r.status === "checked_out").length;
    const pending = rows.filter(r => r.status === "checked_in").length;
    const overdue = rows.filter(r => {
      if (r.status !== "checked_in" || !r.planned_time) return false;
      const now = new Date();
      const planned = new Date(`${dateISO}T${r.planned_time}`);
      return now > planned;
    }).length;

    return { total, checkedOut, pending, overdue };
  }, [rows, dateISO]);

  if (departuresQuery.isLoading) {
    return <div className="p-6">Chargement des départs...</div>;
  }

  return (
    <div className="min-h-screen bg-pearl pb-20">
      {/* Header */}
      <div className="bg-white border-b border-accent-gold/20 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Départs du jour</h1>
            <p className="text-muted-foreground">{new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          <div className="flex gap-2">
            <TButton 
              variant={mode === "express" ? "primary" : "ghost"} 
              onClick={() => setMode("express")}
              size="sm"
            >
              Express
            </TButton>
            <TButton 
              variant={mode === "detailed" ? "primary" : "ghost"} 
              onClick={() => setMode("detailed")}
              size="sm"
            >
              Détaillé
            </TButton>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm">Total: <strong>{stats.total}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm">Partis: <strong>{stats.checkedOut}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm">En attente: <strong>{stats.pending}</strong></span>
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm">En retard: <strong>{stats.overdue}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-accent-gold/20 px-6 py-3">
        <div className="flex gap-4 items-center">
          <input
            id="departures-search"
            type="text"
            placeholder="Rechercher (Ctrl+F)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 max-w-md px-3 py-2 border border-accent-gold/20 rounded-md text-sm"
          />
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "all" | "pending")}
            className="px-3 py-2 border border-accent-gold/20 rounded-md text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente de départ</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "time" | "name" | "room")}
            className="px-3 py-2 border border-accent-gold/20 rounded-md text-sm"
          >
            <option value="time">Par heure</option>
            <option value="name">Par nom</option>
            <option value="room">Par chambre</option>
          </select>
        </div>
      </div>

      {/* Departures List */}
      <div className="p-6">
        <div className="grid gap-4">
          {filtered.map((departure) => (
            <Card key={departure.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{departure.guest_name}</h3>
                      <Badge variant={statusToBadge(departure.status)}>
                        {departure.status === "checked_out" ? "Parti" : 
                         departure.status === "checked_in" ? "En attente" : "Annulé"}
                      </Badge>
                      {departure.planned_time && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {departure.planned_time}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Chambre:</span>
                        <div className="font-medium">{departure.room_number || "Non assignée"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Occupants:</span>
                        <div className="font-medium">
                          {departure.adults || 0}A {departure.children ? `+ ${departure.children}E` : ""}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total séjour:</span>
                        <div className="font-medium">
                          {departure.rate_total ? `${departure.rate_total.toLocaleString()} €` : "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Référence:</span>
                        <div className="font-medium text-xs">{departure.reference || "—"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {departure.status === "checked_in" && (
                      <>
                        <Button
                          onClick={() => onCheckout(departure.id)}
                          disabled={checkoutMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          size="sm"
                        >
                          Check-out Express
                        </Button>
                        <Button variant="outline" size="sm">
                          <CreditCard className="w-4 h-4 mr-1" />
                          Facturation
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Documents
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {query ? "Aucun départ trouvé pour cette recherche" : "Aucun départ prévu pour aujourd'hui"}
          </div>
        )}
      </div>
    </div>
  );
}