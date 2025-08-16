import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Settings, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { SyscohadaExport, SyscohadaAccount, ReportPeriod } from "@/types/reports";
import { SYSCOHADA_MAPPING } from "@/types/reports";

interface SyscohadaExportProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
}

export function SyscohadaExport({ period, onPeriodChange }: SyscohadaExportProps) {
  const [exportData, setExportData] = useState<SyscohadaExport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xml' | 'txt'>('csv');
  const { toast } = useToast();

  const loadSyscohadaData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('syscohada-export', {
        body: { 
          start_date: period.start_date,
          end_date: period.end_date,
          preview: true
        }
      });

      if (error) throw error;
      setExportData(data.export);
    } catch (error: unknown) {
      console.error('Error loading SYSCOHADA data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données SYSCOHADA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportSyscohadaFile = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('syscohada-export', {
        body: { 
          start_date: period.start_date,
          end_date: period.end_date,
          format: exportFormat,
          export: true
        }
      });

      if (error) throw error;

      // Download file
      const link = document.createElement('a');
      link.href = data.file_url;
      link.download = `syscohada-${period.start_date}-${period.end_date}.${exportFormat}`;
      link.click();

      toast({
        title: "Export réussi",
        description: `Données SYSCOHADA exportées en ${exportFormat.toUpperCase()}`
      });
    } catch (error: unknown) {
      console.error('Error exporting SYSCOHADA:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (period.start_date && period.end_date) {
      loadSyscohadaData();
    }
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAccountTypeColor = (code: string) => {
    if (code.startsWith('7')) return 'bg-success/10 text-success';
    if (code.startsWith('4')) return 'bg-warning/10 text-warning';
    if (code.startsWith('5')) return 'bg-primary/10 text-primary';
    return 'bg-muted';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Export SYSCOHADA
                <Settings className="h-4 w-4" />
              </CardTitle>
              <CardDescription>
                Export comptable au format SYSCOHADA - {period.label}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'xml' | 'txt') => setExportFormat(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                </SelectContent>
              </Select>
              {exportData && (
                <Button
                  onClick={exportSyscohadaFile}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Period Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="start_date">Date début</Label>
              <Input
                id="start_date"
                type="date"
                value={period.start_date}
                onChange={(e) => onPeriodChange({
                  ...period,
                  start_date: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Date fin</Label>
              <Input
                id="end_date"
                type="date"
                value={period.end_date}
                onChange={(e) => onPeriodChange({
                  ...period,
                  end_date: e.target.value
                })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadSyscohadaData} disabled={isLoading}>
                <FileText className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
            </div>
          </div>

          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Les comptes SYSCOHADA sont automatiquement mappés selon le plan comptable OHADA. 
              Vérifiez la correspondance avec votre logiciel comptable avant l'import.
            </AlertDescription>
          </Alert>

          {exportData && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(exportData.total_debit)}</div>
                  <div className="text-sm text-muted-foreground">Total Débit</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(exportData.total_credit)}</div>
                  <div className="text-sm text-muted-foreground">Total Crédit</div>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {formatCurrency(Math.abs(exportData.total_debit - exportData.total_credit))}
                  </div>
                  <div className="text-sm text-muted-foreground">Équilibre</div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Account Mapping Reference */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Mapping des comptes SYSCOHADA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(SYSCOHADA_MAPPING).map(([key, accountCode]) => (
                      <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{key.replace(/_/g, ' ')}</span>
                        <Badge variant="outline" className={getAccountTypeColor(accountCode)}>
                          {accountCode}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Accounts Detail */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détail des comptes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exportData.accounts.map((account) => (
                      <Card key={account.account_code} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Badge variant="outline" className={getAccountTypeColor(account.account_code)}>
                                  {account.account_code}
                                </Badge>
                                {account.account_name}
                              </CardTitle>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                Solde: {formatCurrency(account.balance)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {account.entries.length} écriture(s)
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <span className="text-sm text-muted-foreground">Total Débit: </span>
                              <span className="font-medium">{formatCurrency(account.debit_amount)}</span>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Total Crédit: </span>
                              <span className="font-medium">{formatCurrency(account.credit_amount)}</span>
                            </div>
                          </div>

                          {account.entries.length > 0 && (
                            <div className="max-h-40 overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left p-1">Date</th>
                                    <th className="text-left p-1">Pièce</th>
                                    <th className="text-left p-1">Description</th>
                                    <th className="text-right p-1">Débit</th>
                                    <th className="text-right p-1">Crédit</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {account.entries.slice(0, 20).map((entry, index) => (
                                    <tr key={index} className="border-b text-xs">
                                      <td className="p-1">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                                      <td className="p-1">{entry.piece_number}</td>
                                      <td className="p-1">{entry.description}</td>
                                      <td className="p-1 text-right">
                                        {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                                      </td>
                                      <td className="p-1 text-right">
                                        {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {account.entries.length > 20 && (
                                <p className="text-center text-muted-foreground p-2">
                                  ... et {account.entries.length - 20} autres écritures
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!exportData && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez une période pour prévisualiser l'export SYSCOHADA</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}