import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Archive, 
  Download, 
  Shield, 
  Clock, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Lock,
  Calendar,
  HardDrive,
  Cloud
} from 'lucide-react';
import { 
  useFiscalArchives, 
  useComplianceLogs, 
  useCreateFiscalArchive, 
  useExportFiscalArchive,
  useSealArchive 
} from '../hooks/useFiscalArchives';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function FiscalArchiveManager() {
  const [selectedPeriodStart, setSelectedPeriodStart] = useState<Date>();
  const [selectedPeriodEnd, setSelectedPeriodEnd] = useState<Date>();
  const [archiveType, setArchiveType] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  const { data: archives = [], isLoading: archivesLoading } = useFiscalArchives();
  const { data: logs = [], isLoading: logsLoading } = useComplianceLogs();
  const createArchive = useCreateFiscalArchive();
  const exportArchive = useExportFiscalArchive();
  const sealArchive = useSealArchive();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock },
      processed: { variant: 'default' as const, icon: CheckCircle },
      archived: { variant: 'success' as const, icon: Lock },
      exported: { variant: 'outline' as const, icon: Download },
      error: { variant: 'destructive' as const, icon: AlertTriangle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getComplianceBadge = (status: string) => {
    const variants = {
      compliant: { variant: 'success' as const, icon: CheckCircle },
      warning: { variant: 'warning' as const, icon: AlertTriangle },
      non_compliant: { variant: 'destructive' as const, icon: AlertTriangle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.warning;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const handleCreateArchive = () => {
    if (!selectedPeriodStart || !selectedPeriodEnd) {
      return;
    }

    createArchive.mutate({
      archiveType,
      periodStart: format(selectedPeriodStart, 'yyyy-MM-dd'),
      periodEnd: format(selectedPeriodEnd, 'yyyy-MM-dd')
    });
  };

  const handleExport = (archiveId: string, exportType: 'usb' | 'cloud', format: 'json' | 'xml' | 'csv') => {
    exportArchive.mutate({ archiveId, exportType, format });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archivage Fiscal NF525
          </CardTitle>
          <CardDescription>
            Gestion des archives fiscales conformes à la norme française NF525 pour les logiciels de caisse
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="archives" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="archives">Archives</TabsTrigger>
          <TabsTrigger value="create">Créer Archive</TabsTrigger>
          <TabsTrigger value="compliance">Conformité</TabsTrigger>
        </TabsList>

        <TabsContent value="archives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Archives Existantes</CardTitle>
              <CardDescription>
                Liste des archives fiscales générées
              </CardDescription>
            </CardHeader>
            <CardContent>
              {archivesLoading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : archives.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune archive fiscal trouvée
                </div>
              ) : (
                <div className="space-y-4">
                  {archives.map((archive) => (
                    <div key={archive.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{archive.certificate_number}</span>
                          {getStatusBadge(archive.status)}
                          {archive.is_sealed && (
                            <Badge variant="outline" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Scellée
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {archive.archive_type} | 
                          Période: {format(new Date(archive.period_start), 'dd/MM/yyyy', { locale: fr })} - {format(new Date(archive.period_end), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Créée le: {format(new Date(archive.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })} |
                          Signature: {archive.digital_signature.substring(0, 16)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!archive.is_sealed && archive.status === 'processed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => sealArchive.mutate(archive.id)}
                            disabled={sealArchive.isPending}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Sceller
                          </Button>
                        )}
                        <Select onValueChange={(format) => handleExport(archive.id, 'usb', format as any)}>
                          <SelectTrigger className="w-32">
                            <HardDrive className="h-4 w-4 mr-1" />
                            <SelectValue placeholder="USB" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(format) => handleExport(archive.id, 'cloud', format as any)}>
                          <SelectTrigger className="w-32">
                            <Cloud className="h-4 w-4 mr-1" />
                            <SelectValue placeholder="Cloud" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Créer une Nouvelle Archive</CardTitle>
              <CardDescription>
                Générer une archive fiscal conforme NF525 pour une période donnée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Type d'archive</label>
                  <Select value={archiveType} onValueChange={(value: any) => setArchiveType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Journalière</SelectItem>
                      <SelectItem value="monthly">Mensuelle</SelectItem>
                      <SelectItem value="yearly">Annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Date de début</label>
                  <Input
                    type="date"
                    value={selectedPeriodStart ? format(selectedPeriodStart, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setSelectedPeriodStart(e.target.value ? new Date(e.target.value) : undefined)}
                    placeholder="Date de début"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date de fin</label>
                  <Input
                    type="date"
                    value={selectedPeriodEnd ? format(selectedPeriodEnd, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setSelectedPeriodEnd(e.target.value ? new Date(e.target.value) : undefined)}
                    placeholder="Date de fin"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCreateArchive}
                disabled={!selectedPeriodStart || !selectedPeriodEnd || createArchive.isPending}
                className="w-full"
              >
                <Archive className="h-4 w-4 mr-2" />
                {createArchive.isPending ? 'Création en cours...' : 'Créer Archive'}
              </Button>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Conformité NF525</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Archive inaltérable avec signature numérique</li>
                  <li>• Horodatage sécurisé des transactions</li>
                  <li>• Génération automatique du certificat</li>
                  <li>• Conservation légale des données</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal de Conformité</CardTitle>
              <CardDescription>
                Historique des événements de conformité fiscal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-8">Chargement...</div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun événement de conformité trouvé
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.event_description}</span>
                          {getComplianceBadge(log.compliance_status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Type: {log.event_type} | 
                          {format(new Date(log.performed_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </div>
                      </div>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}