import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { PreClosureCheck } from "@/types/reports";

interface PreClosureReportProps {
  selectedDate: string;
  onCanClose: (canClose: boolean) => void;
}

export function PreClosureReport({ selectedDate, onCanClose }: PreClosureReportProps) {
  const [checks, setChecks] = useState<PreClosureCheck[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  const runPreClosureChecks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pre-closure-check', {
        body: { date: selectedDate }
      });

      if (error) throw error;

      setChecks(data.checks || []);
      setLastCheck(new Date());
      
      const hasErrors = data.checks?.some((check: PreClosureCheck) => check.status === 'failed');
      onCanClose(!hasErrors);

      if (hasErrors) {
        toast({
          title: "Contrôles échoués",
          description: "Des problèmes bloquants ont été détectés",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Contrôles terminés",
          description: "Tous les contrôles sont passés avec succès"
        });
      }
    } catch (error: unknown) {
      console.error('Error running pre-closure checks:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exécuter les contrôles de pré-clôture",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      runPreClosureChecks();
    }
  }, [selectedDate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge variant="default" className="bg-success text-success-foreground">Validé</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Attention</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      default:
        return null;
    }
  };

  const errorCount = checks.filter(c => c.status === 'failed').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const passedCount = checks.filter(c => c.status === 'passed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Contrôles de pré-clôture
              {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Vérification des pré-requis pour la clôture du {new Date(selectedDate).toLocaleDateString('fr-FR')}
            </CardDescription>
          </div>
          <Button onClick={runPreClosureChecks} disabled={isLoading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <div className="text-2xl font-bold text-success">{passedCount}</div>
            <div className="text-sm text-muted-foreground">Validés</div>
          </div>
          <div className="text-center p-4 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning">{warningCount}</div>
            <div className="text-sm text-muted-foreground">Avertissements</div>
          </div>
          <div className="text-center p-4 bg-destructive/10 rounded-lg">
            <div className="text-2xl font-bold text-destructive">{errorCount}</div>
            <div className="text-sm text-muted-foreground">Erreurs</div>
          </div>
        </div>

        {errorCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {errorCount} contrôle(s) en échec. La clôture ne peut pas être effectuée tant que ces problèmes ne sont pas résolus.
            </AlertDescription>
          </Alert>
        )}

        {warningCount > 0 && errorCount === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {warningCount} avertissement(s) détecté(s). Vous pouvez procéder à la clôture mais vérifiez ces éléments.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Checks List */}
        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50"
            >
              {getStatusIcon(check.status)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{check.description}</h4>
                  {getStatusBadge(check.status)}
                </div>
                {check.details && (
                  <p className="text-sm text-muted-foreground">{check.details}</p>
                )}
                {check.count !== undefined && (
                  <p className="text-sm font-medium">
                    {check.count} élément(s) concerné(s)
                  </p>
                )}
                {check.action_required && (
                  <p className="text-sm text-primary font-medium">
                    Action requise: {check.action_required}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {lastCheck && (
          <p className="text-xs text-muted-foreground text-center">
            Dernière vérification: {lastCheck.toLocaleTimeString('fr-FR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}