import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { NightAuditSession, AuditSummary } from "../types";

interface AuditDashboardProps {
  session?: NightAuditSession;
  summary: AuditSummary;
}

export function AuditDashboard({ session, summary }: AuditDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-soft-success text-status-confirmed";
      case "in_progress":
        return "bg-soft-warning text-status-processing";
      case "failed":
        return "bg-soft-danger text-status-error";
      default:
        return "bg-soft-neutral text-status-neutral";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Session Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Statut de l'audit</CardTitle>
          {session?.status === "in_progress" && <Clock className="h-4 w-4 text-primary" />}
          {session?.status === "completed" && <CheckCircle className="h-4 w-4 text-success" />}
          {session?.status === "failed" && <XCircle className="h-4 w-4 text-danger" />}
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <Badge className={getStatusColor(session.status)}>
                {session.status === "in_progress" && "En cours"}
                {session.status === "completed" && "Terminé"}
                {session.status === "failed" && "Échec"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Date: {formatDate(session.audit_date)}
              </p>
              <p className="text-xs text-muted-foreground">
                Début: {formatTime(session.started_at)}
              </p>
              {session.completed_at && (
                <p className="text-xs text-muted-foreground">
                  Fin: {formatTime(session.completed_at)}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Aucun audit en cours</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progression</CardTitle>
          <div className="text-2xl font-bold">{summary.progress}%</div>
        </CardHeader>
        <CardContent>
          <Progress value={summary.progress} className="w-full" />
          <p className="text-xs text-muted-foreground mt-2">
            {summary.completedCheckpoints} / {summary.totalCheckpoints} étapes
          </p>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Points critiques</CardTitle>
          <AlertTriangle 
            className={`h-4 w-4 ${summary.criticalPending > 0 ? 'text-danger' : 'text-muted-foreground'}`} 
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.criticalPending}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.criticalPending > 0 ? "À traiter" : "Tous validés"}
          </p>
        </CardContent>
      </Card>

      {/* Failed Checkpoints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Échecs</CardTitle>
          <XCircle 
            className={`h-4 w-4 ${summary.failedCheckpoints > 0 ? 'text-danger' : 'text-muted-foreground'}`} 
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.failedCheckpoints}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.failedCheckpoints > 0 ? "À corriger" : "Aucun échec"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}