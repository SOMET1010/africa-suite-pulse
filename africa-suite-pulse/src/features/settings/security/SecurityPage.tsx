import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, AlertTriangle, Key, Eye, Clock, Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { useUserRole } from "@/core/auth/useUserRole";
import { auditApi, type AuditLog } from "@/features/security/audit.api";

export default function SecurityPage() {

  const { orgId } = useOrgId();
  const { hasPermission } = useUserRole();
  const [canViewAudit, setCanViewAudit] = useState<boolean>(false);
  const [canExportAudit, setCanExportAudit] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const checkPerms = async () => {
      const [view, exp] = await Promise.all([
        hasPermission("audit.view"),
        hasPermission("audit.export"),
      ]);
      if (!mounted) return;
      setCanViewAudit(!!view);
      setCanExportAudit(!!exp);
    };
    checkPerms();
    return () => { mounted = false; };
  }, [hasPermission]);

  const { data: logs = [], isLoading: auditLoading, error: auditError } = useQuery<AuditLog[]>({
    queryKey: ["audit-logs", orgId, canViewAudit],
    queryFn: () => auditApi.listAuditLogs({ orgId, limit: 50 }),
    enabled: !!orgId && canViewAudit,
  });

  const exportCsv = () => {
    if (!logs?.length) return;
    const headers = [
      "occurred_at",
      "user_id",
      "action",
      "table_name",
      "record_id",
      "severity",
    ];
    const rows = logs.map((l) => [
      l.occurred_at,
      l.user_id ?? "",
      l.action,
      l.table_name,
      l.record_id ?? "",
      l.severity,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityVariant = (sev: string) => {
    switch (sev) {
      case "error": return "destructive";
      case "warning": return "secondary";
      default: return "default";
    }
  };

  // Static demo data previously used
  // const auditLogs = [ ... ]  -> replaced by live data

  return (
    <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Sécurité & Audit</h1>
        <p className="text-muted-foreground">Configuration de la sécurité et suivi des activités</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentification
            </CardTitle>
            <CardDescription>Paramètres de sécurité des connexions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="2fa" />
              <Label htmlFor="2fa">Authentification à 2 facteurs</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="strong-password" defaultChecked />
              <Label htmlFor="strong-password">Mots de passe forts obligatoires</Label>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="session-timeout">Timeout de session (minutes)</Label>
              <Input id="session-timeout" type="number" placeholder="30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Surveillance
            </CardTitle>
            <CardDescription>Monitoring et alertes de sécurité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="login-monitoring" defaultChecked />
              <Label htmlFor="login-monitoring">Surveillance des connexions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="failed-attempts" defaultChecked />
              <Label htmlFor="failed-attempts">Alerte tentatives échouées</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="audit-logs" defaultChecked />
              <Label htmlFor="audit-logs">Logs d'audit détaillés</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              <CardTitle>Clés API & Accès</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge variant="default">Active</Badge>
              <Button variant="outline" size="sm">Révoquer</Button>
            </div>
          </div>
          <CardDescription>Gestion des accès API et intégrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">API Principale</h4>
                <p className="text-sm text-muted-foreground">sk-***************************</p>
                <p className="text-xs text-muted-foreground">Dernière utilisation: Il y a 10 minutes</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="default">Active</Badge>
                <Button variant="outline" size="sm">Révoquer</Button>
              </div>
            </div>
            <Button variant="outline">
              <Key className="w-4 h-4 mr-2" />
              Générer Nouvelle Clé
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <CardTitle>Journal d'Audit</CardTitle>
          </div>
          {canExportAudit && (
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!logs?.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!canViewAudit && (
            <div className="p-3 rounded-md border text-sm text-muted-foreground">
              Vous n'avez pas la permission de consulter le journal d'audit (audit.view).
            </div>
          )}

          {canViewAudit && (
            <div className="space-y-3">
              {auditLoading && <div className="text-sm text-muted-foreground">Chargement des logs…</div>}
              {auditError && (
                <div className="text-sm text-destructive">
                  Erreur lors du chargement des logs.
                </div>
              )}
              {!auditLoading && !auditError && (!logs || logs.length === 0) && (
                <div className="text-sm text-muted-foreground">Aucun événement récent.</div>
              )}

              {logs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {log.action} • {log.table_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {new Date(log.occurred_at).toLocaleString()} • {log.user_id ? `User: ${log.user_id}` : "User: —"}
                    </p>
                  </div>
                  <Badge variant={severityVariant(log.severity) as any} className="shrink-0">
                    {log.severity}
                  </Badge>
                </div>
              ))}

              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Voir tout l'historique
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            Recommandations de Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800">
          <ul className="space-y-2 text-sm">
            <li>• Activez l'authentification à 2 facteurs pour tous les comptes administrateurs</li>
            <li>• Configurez des sauvegardes automatiques chiffrées</li>
            <li>• Vérifiez régulièrement les logs d'audit pour détecter des activités suspectes</li>
            <li>• Renouvelez les clés API tous les 90 jours</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
