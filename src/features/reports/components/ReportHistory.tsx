import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReportHistory } from "../hooks/useReportTemplates";
import { Download, Eye, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function ReportHistory() {
  const { data: generations, isLoading, refetch } = useReportHistory();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'generating':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'generating':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'failed':
        return 'Échec';
      case 'generating':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const handleDownload = (filePath: string) => {
    // TODO: Implement download functionality
    console.log('Downloading:', filePath);
  };

  const handlePreview = (filePath: string) => {
    // TODO: Implement preview functionality
    console.log('Previewing:', filePath);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Historique des rapports</CardTitle>
            <CardDescription>
              Consultez les rapports générés et leur statut
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {generations?.length ? (
            generations.map((generation) => (
              <div key={generation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(generation.status)}
                    <Badge variant={getStatusVariant(generation.status) as any}>
                      {getStatusLabel(generation.status)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      Rapport #{generation.id.slice(0, 8)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Généré le {format(generation.startedAt, 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                    {generation.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Durée: {Math.round((generation.completedAt.getTime() - generation.startedAt.getTime()) / 1000)}s
                        {generation.emailsSent && ` • ${generation.emailsSent} email(s) envoyé(s)`}
                      </p>
                    )}
                    {generation.error && (
                      <p className="text-xs text-destructive mt-1">
                        Erreur: {generation.error}
                      </p>
                    )}
                  </div>
                </div>
                
                {generation.status === 'completed' && generation.filePath && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreview(generation.filePath!)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Aperçu
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(generation.filePath!)}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun rapport généré pour le moment
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}