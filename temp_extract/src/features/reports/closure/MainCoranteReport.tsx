import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Calendar, RefreshCw, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { MainCoranteReport, MainCoranteEntry, ReportPeriod } from "@/types/reports";
import { SERVICE_FAMILIES } from "@/types/reports";

interface MainCoranteReportProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
}

export function MainCoranteReport({ period, onPeriodChange }: MainCoranteReportProps) {
  const [report, setReport] = useState<MainCoranteReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const { toast } = useToast();

  const loadMainCourante = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('main-courante-report', {
        body: { 
          start_date: period.start_date,
          end_date: period.end_date 
        }
      });

      if (error) throw error;
      setReport(data.report);
    } catch (error: unknown) {
      console.error('Error loading main courante:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la main courante",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'xlsx') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-main-courante', {
        body: { 
          start_date: period.start_date,
          end_date: period.end_date,
          format,
          family_filter: selectedFamily
        }
      });

      if (error) throw error;

      // Download file
      const link = document.createElement('a');
      link.href = data.file_url;
      link.download = `main-courante-${period.start_date}-${period.end_date}.${format}`;
      link.click();

      toast({
        title: "Export réussi",
        description: `Main courante exportée en ${format.toUpperCase()}`
      });
    } catch (error: unknown) {
      console.error('Error exporting main courante:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter la main courante",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (period.start_date && period.end_date) {
      loadMainCourante();
    }
  }, [period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Main Courante Prestations
                {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Ventilation des prestations par famille et TVA - {period.label}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={loadMainCourante} disabled={isLoading} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              {report && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportReport('pdf')}
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportReport('xlsx')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Excel
                  </Button>
                </div>
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
              <Button onClick={loadMainCourante} disabled={isLoading}>
                <Calendar className="h-4 w-4 mr-2" />
                Charger
              </Button>
            </div>
          </div>

          {report && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(report.total_ht)}</div>
                  <div className="text-sm text-muted-foreground">Total HT</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(report.total_vat)}</div>
                  <div className="text-sm text-muted-foreground">TVA</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{formatCurrency(report.total_ttc)}</div>
                  <div className="text-sm text-muted-foreground">Total TTC</div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* VAT Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Récapitulatif TVA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(report.vat_summary).map(([rate, summary]) => (
                      <div key={rate} className="flex justify-between items-center p-3 bg-muted rounded">
                        <span className="font-medium">TVA {rate}%</span>
                        <div className="text-right">
                          <div>Base: {formatCurrency(summary.base_amount)}</div>
                          <div>TVA: {formatCurrency(summary.vat_amount)}</div>
                          <div className="font-semibold">TTC: {formatCurrency(summary.total_amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Families Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prestations par famille</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(report.entries_by_family).map(([family, data]) => {
                      const familyInfo = SERVICE_FAMILIES.find(f => f.code === family);
                      return (
                        <Card 
                          key={family} 
                          className={`cursor-pointer transition-colors ${
                            selectedFamily === family ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedFamily(selectedFamily === family ? null : family)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-base">
                                  {familyInfo?.name || family}
                                </CardTitle>
                                <Badge variant="outline">
                                  TVA {familyInfo?.vat_rate || 18}%
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(data.total_ttc)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatPercent(data.total_ttc, report.total_ttc)}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">HT: </span>
                                <span className="font-medium">{formatCurrency(data.total_ht)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">TVA: </span>
                                <span className="font-medium">{formatCurrency(data.total_vat)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Écritures: </span>
                                <span className="font-medium">{data.entries.length}</span>
                              </div>
                            </div>

                            {selectedFamily === family && (
                              <div className="mt-4 pt-4 border-t">
                                <h5 className="font-medium mb-2">Détail des écritures</h5>
                                <div className="max-h-60 overflow-y-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left p-1">Date</th>
                                        <th className="text-left p-1">Description</th>
                                        <th className="text-left p-1">Client</th>
                                        <th className="text-right p-1">HT</th>
                                        <th className="text-right p-1">TVA</th>
                                        <th className="text-right p-1">TTC</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {data.entries.slice(0, 50).map((entry, index) => (
                                        <tr key={index} className="border-b text-xs">
                                          <td className="p-1">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                                          <td className="p-1">{entry.description}</td>
                                          <td className="p-1">{entry.guest_name || '-'}</td>
                                          <td className="p-1 text-right">{formatCurrency(entry.total_ht)}</td>
                                          <td className="p-1 text-right">{formatCurrency(entry.vat_amount)}</td>
                                          <td className="p-1 text-right font-medium">{formatCurrency(entry.total_ttc)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  {data.entries.length > 50 && (
                                    <p className="text-center text-muted-foreground p-2">
                                      ... et {data.entries.length - 50} autres écritures
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!report && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Sélectionnez une période pour charger la main courante</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}