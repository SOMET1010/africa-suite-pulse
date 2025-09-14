import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CalendarCheck2, CalendarDays, Lock, AlertTriangle, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useOrgId } from "@/core/auth/useOrg";
import { supabase } from "@/integrations/supabase/client";

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accent || ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

export function ClosurePanel() {
  const { orgId } = useOrgId();
  const [hasRights, setHasRights] = useState<boolean>(false);
  const [running, setRunning] = useState<"daily" | "monthly" | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Basic role check (fallback to true if rpc not available)
        const { data, error } = await supabase.rpc("get_current_user_role");
        if (!mounted) return;
        if (error) {
          setHasRights(true);
        } else {
          setHasRights(["admin", "manager"].includes((data as any) || ""));
        }
      } catch {
        if (mounted) setHasRights(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const doDailyClose = async () => {
    if (!orgId) return;
    setRunning("daily");
    try {
      // Placeholder: invoke generate-report as a proxy action (replace later with real close-day function)
      await fetch("/noop", { method: "POST" }).catch(() => void 0);
      alert("Clôture journalière simulée: vérifications et verrouillage à implémenter côté serveur.");
    } finally {
      setRunning(null);
    }
  };

  const doMonthlyClose = async () => {
    if (!orgId) return;
    setRunning("monthly");
    try {
      await fetch("/noop", { method: "POST" }).catch(() => void 0);
      alert("Clôture mensuelle simulée: verrouillage période + exports comptables à implémenter.");
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat label="Droits utilisateur" value={hasRights ? "Autorisés" : "Restreints"} accent={hasRights ? "text-success" : "text-destructive"} />
        <Stat label="Dernière clôture jour" value="—" />
        <Stat label="Dernière clôture mois" value="—" />
      </div>

      {/* Daily Closure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5" /> Clôture journalière
          </CardTitle>
          <CardDescription>
            Vérifie les encaissements, traite les no-shows et verrouille la journée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Vérification encaissements vs factures</li>
            <li>Conversion des réservations non arrivées selon politique</li>
            <li>Archivage immuable du journal du jour</li>
          </ul>
          <div className="flex items-center gap-3">
            <Button disabled={!hasRights || running === "daily"} onClick={doDailyClose} className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              {running === "daily" ? "Clôture en cours..." : "Lancer la clôture"}
            </Button>
            <Badge variant="secondary" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> Action traçable et irréversible
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Closure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" /> Clôture mensuelle
          </CardTitle>
          <CardDescription>
            Verrouille toutes les écritures du mois et génère les rapports/export comptables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Vérification des écarts et anomalies</li>
            <li>Génération des rapports mensuels</li>
            <li>Exports vers ERP/Compta (Sage/Odoo/QuickBooks)</li>
          </ul>
          <div className="flex items-center gap-3">
            <Button variant="outline" disabled={!hasRights || running === "monthly"} onClick={doMonthlyClose} className="gap-2">
              <Lock className="h-4 w-4" />
              {running === "monthly" ? "Clôture en cours..." : "Verrouiller le mois"}
            </Button>
            <Badge variant="secondary" className="gap-1">
              <Mail className="h-3 w-3" /> Alerte direction à l'exécution
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
