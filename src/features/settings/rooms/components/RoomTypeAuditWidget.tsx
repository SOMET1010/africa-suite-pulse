import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/use-toast';
import { RoomTypeValidationService } from '../roomTypeValidation.service';
import { useOrgId } from '@/core/auth/useOrg';

export function RoomTypeAuditWidget() {
  const { orgId } = useOrgId();
  const { toast } = useToast();
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const runAudit = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      const result = await RoomTypeValidationService.auditRoomTypes(orgId);
      setAuditResult(result);
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de vérifier la cohérence des données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const migrateMissingTypes = async () => {
    if (!orgId || !auditResult?.missingTypes?.length) return;
    
    try {
      setMigrating(true);
      await RoomTypeValidationService.migrateOrphanedTypes(orgId, auditResult.missingTypes);
      
      toast({
        title: 'Migration réussie',
        description: `${auditResult.missingTypes.length} types de chambres ont été créés`
      });
      
      // Re-run audit
      await runAudit();
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Erreur de migration',
        description: 'Impossible de créer les types manquants',
        variant: 'destructive'
      });
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, [orgId]);

  if (!auditResult) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Vérification de la cohérence des données...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-6 ${auditResult.isValid ? 'border-success' : 'border-warning'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {auditResult.isValid ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning" />
            )}
            Configuration des types de chambres
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={runAudit}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{auditResult.totalRooms}</div>
            <div className="text-xs text-muted-foreground">Chambres totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{auditResult.configuredTypes.length}</div>
            <div className="text-xs text-muted-foreground">Types configurés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{auditResult.missingTypes.length}</div>
            <div className="text-xs text-muted-foreground">Types manquants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{auditResult.orphanedRooms.length}</div>
            <div className="text-xs text-muted-foreground">Chambres orphelines</div>
          </div>
        </div>

        {auditResult.isValid ? (
          <div className="flex items-center gap-2 text-success text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Toutes les chambres sont liées à des types configurés</span>
          </div>
        ) : (
          <div className="space-y-3">
            {auditResult.missingTypes.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div>
                  <div className="font-medium text-warning">Types manquants détectés</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {auditResult.missingTypes.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={migrateMissingTypes}
                  disabled={migrating}
                  className="ml-3"
                >
                  {migrating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Créer automatiquement
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {auditResult.orphanedRooms.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <strong>{auditResult.orphanedRooms.length} chambre(s)</strong> utilisent des types non configurés.
                Créez les types manquants pour résoudre ce problème.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}