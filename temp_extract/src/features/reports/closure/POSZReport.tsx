import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer, Lock, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { POSZReport, POSPaymentMethod, POSCategory } from "@/types/reports";

interface POSZReportProps {
  selectedDate: string;
  outletId?: string;
}

export function POSZReport({ selectedDate, outletId }: POSZReportProps) {
  const [reports, setReports] = useState<POSZReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const loadZReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pos-z-report', {
        body: { 
          date: selectedDate,
          outlet_id: outletId 
        }
      });

      if (error) throw error;
      setReports(data.reports || []);
    } catch (error: unknown) {
      console.error('Error loading Z reports:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports Z",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateZReport = async (outletId: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-z-report', {
        body: { 
          date: selectedDate,
          outlet_id: outletId 
        }
      });

      if (error) throw error;

      toast({
        title: "Rapport Z généré",
        description: "Le rapport Z a été généré et archivé avec succès"
      });
      
      await loadZReports();
    } catch (error: unknown) {
      console.error('Error generating Z report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport Z",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = async (report: POSZReport, format: 'pdf' | 'xlsx') => {
    try {
      const { data, error } = await supabase.functions.invoke('export-z-report', {
        body: { 
          report_id: report.outlet_id,
          date: selectedDate,
          format 
        }
      });

      if (error) throw error;

      // Download file
      const link = document.createElement('a');
      link.href = data.file_url;
      link.download = `z-report-${report.outlet_name}-${selectedDate}.${format}`;
      link.click();

      toast({
        title: "Export réussi",
        description: `Rapport Z exporté en ${format.toUpperCase()}`
      });
    } catch (error: unknown) {
      console.error('Error exporting Z report:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadZReports();
    }
  }, [selectedDate, outletId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateGrandTotal = () => {
    return reports.reduce((total, report) => total + report.total_sales, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Rapports Z POS
                {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                Consolidation des ventes par point de vente - {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </CardDescription>
            </div>
            <Button onClick={loadZReports} disabled={isLoading} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Global Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(calculateGrandTotal())}</div>
              <div className="text-sm text-muted-foreground">CA Total</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{reports.length}</div>
              <div className="text-sm text-muted-foreground">Points de vente</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {reports.reduce((total, r) => total + r.total_transactions, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {reports.filter(r => r.status === 'closed').length}/{reports.length}
              </div>
              <div className="text-sm text-muted-foreground">Sessions fermées</div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Individual Reports */}
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.outlet_id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.outlet_name}</CardTitle>
                      <CardDescription>
                        {report.cashier_name && `Caissier: ${report.cashier_name}`}
                        {report.session_id && ` • Session: ${report.session_id}`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'closed' ? 'default' : 'secondary'}>
                        {report.status === 'closed' ? 'Fermée' : 'Ouverte'}
                      </Badge>
                      {report.status === 'open' && (
                        <Button
                          size="sm"
                          onClick={() => generateZReport(report.outlet_id)}
                          disabled={isGenerating}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Clôturer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Caisse ouverture</div>
                      <div className="font-semibold">{formatCurrency(report.opening_cash)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Caisse fermeture</div>
                      <div className="font-semibold">{formatCurrency(report.closing_cash)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ventes brutes</div>
                      <div className="font-semibold text-primary">{formatCurrency(report.total_sales)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ventes nettes</div>
                      <div className="font-semibold">{formatCurrency(report.net_sales)}</div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  {report.payment_methods.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Modes de paiement</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {report.payment_methods.map((method) => (
                          <div key={method.method_code} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{method.method_name}</span>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(method.amount)}</div>
                              <div className="text-xs text-muted-foreground">
                                {method.transaction_count} trans. ({method.percentage.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Categories */}
                  {report.product_categories.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Ventes par catégorie</h4>
                      <div className="space-y-1">
                        {report.product_categories.map((category) => (
                          <div key={category.category_name} className="flex justify-between items-center p-2 bg-muted rounded">
                            <span className="text-sm">{category.category_name}</span>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(category.revenue)}</div>
                              <div className="text-xs text-muted-foreground">
                                {category.items_sold} articles ({category.percentage.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport(report, 'pdf')}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportReport(report, 'xlsx')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reports.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun rapport Z disponible pour cette date
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}