import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { PageLayout } from "@/core/layout/PageLayout";
import { CalendarClock, Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { AuditDashboard } from "./components/AuditDashboard";
import { CheckpointsList } from "./components/CheckpointsList";
import { StartAuditDialog } from "./components/StartAuditDialog";
import { 
  useNightAuditSessions, 
  useAuditCheckpoints, 
  useCompleteNightAudit, 
  useDailyClosures 
} from "./hooks/useNightAudit";
import type { AuditSummary } from "./types";

export default function NightAuditPage() {
  const { data: sessions = [], isLoading: sessionsLoading } = useNightAuditSessions();
  const { data: closures = [] } = useDailyClosures();
  const completeAudit = useCompleteNightAudit();

  // Get current active session
  const activeSession = sessions.find(s => s.status === "in_progress");
  
  const { data: checkpoints = [] } = useAuditCheckpoints(activeSession?.id);

  // Calculate audit summary
  const summary: AuditSummary = {
    totalCheckpoints: checkpoints.length,
    completedCheckpoints: checkpoints.filter(c => c.status === "completed").length,
    failedCheckpoints: checkpoints.filter(c => c.status === "failed").length,
    criticalPending: checkpoints.filter(c => c.is_critical && c.status === "pending").length,
    progress: checkpoints.length > 0 
      ? Math.round((checkpoints.filter(c => c.status === "completed").length / checkpoints.length) * 100)
      : 0,
  };

  const canCompleteAudit = activeSession && 
    summary.criticalPending === 0 && 
    summary.failedCheckpoints === 0 &&
    summary.completedCheckpoints > 0;

  const handleCompleteAudit = async () => {
    if (activeSession) {
      await completeAudit.mutateAsync(activeSession.id);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (sessionsLoading) {
    return (
      <PageLayout title="Audit de Nuit">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données d'audit...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Audit de Nuit">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {activeSession ? "Audit en cours" : "Nouvel audit"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {!activeSession && (
              <StartAuditDialog
                trigger={
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer l'audit
                  </Button>
                }
                hasActiveSession={!!activeSession}
              />
            )}
            
            {activeSession && canCompleteAudit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Terminer l'audit
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Terminer l'audit de nuit</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action va finaliser l'audit, mettre à jour la date hôtel et créer le résumé de clôture. 
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCompleteAudit}>
                      Terminer l'audit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Dashboard */}
        <AuditDashboard session={activeSession} summary={summary} />

        {/* Current Session */}
        {activeSession && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Checkpoints */}
            <Card>
              <CardHeader>
                <CardTitle>Processus d'audit</CardTitle>
                <CardDescription>
                  Date d'audit: {formatDate(activeSession.audit_date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CheckpointsList 
                  checkpoints={checkpoints} 
                  sessionStatus={activeSession.status}
                />
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails de la session</CardTitle>
                <CardDescription>
                  Informations sur l'audit en cours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Statut:</span>
                    <Badge className="bg-soft-warning text-status-processing">
                      En cours
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">{formatDate(activeSession.audit_date)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Démarré à:</span>
                    <span className="text-sm">
                      {new Date(activeSession.started_at).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Progression:</span>
                    <span className="text-sm">{summary.progress}%</span>
                  </div>
                </div>

                {!canCompleteAudit && (
                  <div className="bg-soft-warning p-4 rounded-md">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-warning">Points à résoudre:</p>
                        <ul className="mt-1 space-y-1 text-warning">
                          {summary.criticalPending > 0 && (
                            <li>• {summary.criticalPending} point(s) critique(s) en attente</li>
                          )}
                          {summary.failedCheckpoints > 0 && (
                            <li>• {summary.failedCheckpoints} échec(s) à corriger</li>
                          )}
                          {summary.completedCheckpoints === 0 && (
                            <li>• Aucune étape terminée</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Active Session */}
        {!activeSession && (
          <Card>
            <CardHeader className="text-center">
              <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>Aucun audit en cours</CardTitle>
              <CardDescription>
                Démarrez un nouvel audit de nuit pour commencer le processus de clôture journalière.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <StartAuditDialog
                trigger={
                  <Button size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Démarrer un audit
                  </Button>
                }
                hasActiveSession={false}
              />
            </CardContent>
          </Card>
        )}

        {/* Recent Closures */}
        {closures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Clôtures récentes</CardTitle>
              <CardDescription>
                Historique des derniers audits terminés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {closures.slice(0, 5).map((closure) => (
                  <div key={closure.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{formatDate(closure.closure_date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {closure.occupied_rooms} chambres occupées • {closure.revenue_total}€ de chiffre d'affaires
                      </p>
                    </div>
                    <Badge className="bg-soft-success text-status-confirmed">
                      Terminé
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}