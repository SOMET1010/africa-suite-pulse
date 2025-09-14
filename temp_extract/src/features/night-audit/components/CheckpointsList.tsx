import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  AlertTriangle, 
  SkipForward 
} from "lucide-react";
import { useUpdateCheckpoint } from "../hooks/useNightAudit";
import type { AuditCheckpoint } from "../types";

interface CheckpointsListProps {
  checkpoints: AuditCheckpoint[];
  sessionStatus: string;
}

export function CheckpointsList({ checkpoints, sessionStatus }: CheckpointsListProps) {
  const [runningCheckpoint, setRunningCheckpoint] = useState<string | null>(null);
  const updateCheckpoint = useUpdateCheckpoint();

  const getStatusIcon = (status: string, isCritical: boolean) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-danger" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning animate-pulse" />;
      case "skipped":
        return <SkipForward className="h-4 w-4 text-muted-foreground" />;
      default:
        return isCritical ? 
          <AlertTriangle className="h-4 w-4 text-warning" /> : 
          <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-soft-success text-status-confirmed";
      case "failed":
        return "bg-soft-danger text-status-error";
      case "in_progress":
        return "bg-soft-warning text-status-processing";
      case "skipped":
        return "bg-soft-neutral text-status-neutral";
      default:
        return "bg-soft-neutral text-status-neutral";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé";
      case "failed":
        return "Échec";
      case "in_progress":
        return "En cours";
      case "skipped":
        return "Ignoré";
      default:
        return "En attente";
    }
  };

  const handleStartCheckpoint = async (checkpointId: string) => {
    setRunningCheckpoint(checkpointId);
    await updateCheckpoint.mutateAsync({
      checkpointId,
      status: "in_progress",
    });
  };

  const handleCompleteCheckpoint = async (checkpointId: string) => {
    await updateCheckpoint.mutateAsync({
      checkpointId,
      status: "completed",
      data: { completed_at: new Date().toISOString() },
    });
    setRunningCheckpoint(null);
  };

  const handleSkipCheckpoint = async (checkpointId: string) => {
    await updateCheckpoint.mutateAsync({
      checkpointId,
      status: "skipped",
    });
  };

  const canInteract = sessionStatus === "in_progress";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Points de contrôle</h3>
        <Badge variant="outline">
          {checkpoints.filter(c => c.status === "completed").length} / {checkpoints.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {checkpoints.map((checkpoint) => (
          <Card key={checkpoint.id} className="transition-colors hover:bg-muted/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(checkpoint.status, checkpoint.is_critical)}
                  <div>
                    <CardTitle className="text-sm">{checkpoint.checkpoint_name}</CardTitle>
                    <CardDescription className="text-xs">
                      {checkpoint.is_critical && (
                        <span className="text-warning">• Critique</span>
                      )}
                      {checkpoint.checkpoint_type}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(checkpoint.status)}>
                    {getStatusLabel(checkpoint.status)}
                  </Badge>
                  {checkpoint.status === "pending" && canInteract && (
                    <Button
                      size="sm"
                      onClick={() => handleStartCheckpoint(checkpoint.id)}
                      disabled={updateCheckpoint.isPending}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Démarrer
                    </Button>
                  )}
                  {checkpoint.status === "in_progress" && canInteract && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteCheckpoint(checkpoint.id)}
                        disabled={updateCheckpoint.isPending}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terminer
                      </Button>
                      {!checkpoint.is_critical && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <SkipForward className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ignorer cette étape ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette étape sera marquée comme ignorée. Vous pourrez la reprendre plus tard si nécessaire.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleSkipCheckpoint(checkpoint.id)}
                              >
                                Ignorer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {checkpoint.error_message && (
              <CardContent className="pt-0">
                <div className="bg-soft-danger p-3 rounded-md">
                  <p className="text-sm text-danger">{checkpoint.error_message}</p>
                </div>
              </CardContent>
            )}

            {checkpoint.completed_at && (
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Terminé le {new Date(checkpoint.completed_at).toLocaleString("fr-FR")}
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}