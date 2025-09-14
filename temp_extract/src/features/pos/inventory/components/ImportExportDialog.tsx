import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, FileText, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react";
import { useInventoryData } from "../../hooks/useInventoryData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/errorHandling";

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImportResult {
  success: number;
  errors: string[];
  warnings: string[];
}

export function ImportExportDialog({ open, onOpenChange }: ImportExportDialogProps) {
  const { stockItems, warehouses } = useInventoryData();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const exportToCSV = () => {
    const headers = [
      'Code Article',
      'Nom',
      'Description', 
      'Catégorie',
      'Unité',
      'Stock Actuel',
      'Stock Min',
      'Stock Max',
      'Coût Unitaire',
      'Fournisseur',
      'Code Fournisseur',
      'Date Expiration',
      'Numéro Lot',
      'Entrepôt',
      'Actif'
    ];

    const csvData = stockItems.map(item => [
      item.item_code,
      item.name,
      item.description || '',
      item.category,
      item.unit,
      item.current_stock,
      item.min_stock_level,
      item.max_stock_level,
      item.unit_cost || 0,
      item.supplier_name || '',
      item.supplier_code || '',
      item.expiry_date || '',
      item.batch_number || '',
      warehouses.find(w => w.id === item.warehouse_id)?.name || '',
      item.is_active ? 'Oui' : 'Non'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: `${stockItems.length} articles exportés vers CSV.`,
    });
  };

  const exportTemplate = () => {
    const headers = [
      'code_article',
      'nom',
      'description',
      'categorie',
      'unite',
      'stock_actuel',
      'stock_min',
      'stock_max',
      'cout_unitaire',
      'fournisseur',
      'code_fournisseur',
      'date_expiration',
      'numero_lot',
      'entrepot',
      'actif'
    ];

    const sampleData = [
      'PROD001',
      'Produit Exemple',
      'Description du produit',
      'Alimentaire',
      'pcs',
      '100',
      '10',
      '500',
      '1500',
      'Fournisseur ABC',
      'FOURN001',
      '2024-12-31',
      'LOT2024001',
      warehouses[0]?.name || 'Entrepôt Principal',
      'Oui'
    ];

    const csvContent = [headers, sampleData]
      .map(row => Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : row)
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-inventaire.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Template téléchargé",
      description: "Utilisez ce template pour importer vos articles.",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Format incorrect",
          description: "Veuillez sélectionner un fichier CSV.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const parseCSV = (content: string): any[] => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const item: any = { lineNumber: index + 2 };
      
      headers.forEach((header, i) => {
        item[header] = values[i] || '';
      });
      
      return item;
    });
  };

  const validateImportData = (data: any[]): { valid: any[], errors: string[] } => {
    const errors: string[] = [];
    const valid: any[] = [];

    data.forEach((item, index) => {
      const rowErrors: string[] = [];

      // Required fields validation
      if (!item.code_article) rowErrors.push('Code article manquant');
      if (!item.nom) rowErrors.push('Nom manquant');
      if (!item.categorie) rowErrors.push('Catégorie manquante');
      if (!item.unite) rowErrors.push('Unité manquante');

      // Numeric validation
      if (item.stock_actuel && isNaN(Number(item.stock_actuel))) {
        rowErrors.push('Stock actuel doit être un nombre');
      }
      if (item.stock_min && isNaN(Number(item.stock_min))) {
        rowErrors.push('Stock min doit être un nombre');
      }
      if (item.stock_max && isNaN(Number(item.stock_max))) {
        rowErrors.push('Stock max doit être un nombre');
      }
      if (item.cout_unitaire && isNaN(Number(item.cout_unitaire))) {
        rowErrors.push('Coût unitaire doit être un nombre');
      }

      // Date validation
      if (item.date_expiration && item.date_expiration !== '') {
        const date = new Date(item.date_expiration);
        if (isNaN(date.getTime())) {
          rowErrors.push('Format de date d\'expiration incorrect (YYYY-MM-DD)');
        }
      }

      if (rowErrors.length > 0) {
        errors.push(`Ligne ${item.lineNumber}: ${rowErrors.join(', ')}`);
      } else {
        valid.push(item);
      }
    });

    return { valid, errors };
  };

  const processImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const content = await selectedFile.text();
      const data = parseCSV(content);
      const { valid, errors } = validateImportData(data);

      if (errors.length > 0 && valid.length === 0) {
        setImportResults({ success: 0, errors, warnings: [] });
        return;
      }

      const warnings: string[] = [];
      let successCount = 0;

      for (const item of valid) {
        try {
          // Find or use default warehouse
          let warehouseId = warehouses[0]?.id;
          if (item.entrepot) {
            const warehouse = warehouses.find(w => 
              w.name.toLowerCase() === item.entrepot.toLowerCase()
            );
            if (warehouse) {
              warehouseId = warehouse.id;
            } else {
              warnings.push(`Ligne ${item.lineNumber}: Entrepôt "${item.entrepot}" non trouvé, utilisation de l'entrepôt par défaut`);
            }
          }

          // Check if item already exists
          const { data: existing } = await supabase
            .from('pos_stock_items')
            .select('id')
            .eq('item_code', item.code_article)
            .single();

          const itemData = {
            org_id: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id,
            warehouse_id: warehouseId,
            item_code: item.code_article,
            name: item.nom,
            description: item.description || null,
            category: item.categorie,
            unit: item.unite,
            current_stock: Number(item.stock_actuel) || 0,
            min_stock_level: Number(item.stock_min) || 0,
            max_stock_level: Number(item.stock_max) || 100,
            unit_cost: Number(item.cout_unitaire) || null,
            supplier_name: item.fournisseur || null,
            supplier_code: item.code_fournisseur || null,
            expiry_date: item.date_expiration || null,
            batch_number: item.numero_lot || null,
            is_active: item.actif?.toLowerCase() === 'oui' || item.actif?.toLowerCase() === 'true'
          };

          if (existing) {
            // Update existing item
            const { error } = await supabase
              .from('pos_stock_items')
              .update(itemData)
              .eq('id', existing.id);

            if (error) throw error;
            warnings.push(`Ligne ${item.lineNumber}: Article "${item.nom}" mis à jour`);
          } else {
            // Create new item
            const { error } = await supabase
              .from('pos_stock_items')
              .insert([itemData]);

            if (error) throw error;
          }

          successCount++;
        } catch (error: unknown) {
          errors.push(`Ligne ${item.lineNumber}: ${getErrorMessage(error)}`);
        }
      }

      setImportResults({ success: successCount, errors, warnings });

      if (successCount > 0) {
        toast({
          title: "Import terminé",
          description: `${successCount} article(s) importé(s) avec succès.`,
        });
        
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (error: unknown) {
      toast({
        title: "Erreur d'import",
        description: `Impossible de traiter le fichier: ${getErrorMessage(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import / Export Inventaire
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Exporter l'Inventaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium">Export Complet CSV</h3>
                        <p className="text-sm text-muted-foreground">
                          Tous les articles ({stockItems.length})
                        </p>
                      </div>
                    </div>
                    <Button onClick={exportToCSV} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger CSV
                    </Button>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-medium">Template d'Import</h3>
                        <p className="text-sm text-muted-foreground">
                          Modèle avec exemple
                        </p>
                      </div>
                    </div>
                    <Button onClick={exportTemplate} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger Template
                    </Button>
                  </Card>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Colonnes exportées :</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span>• Code Article</span>
                    <span>• Nom</span>
                    <span>• Description</span>
                    <span>• Catégorie</span>
                    <span>• Stock Actuel/Min/Max</span>
                    <span>• Coût Unitaire</span>
                    <span>• Fournisseur</span>
                    <span>• Date Expiration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Importer des Articles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Fichier CSV</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                  />
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez un fichier CSV avec les colonnes correspondant au template.
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <Badge variant="outline">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={processImport}
                    disabled={!selectedFile || isProcessing}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isProcessing ? 'Import en cours...' : 'Importer'}
                  </Button>
                  
                  <Button onClick={exportTemplate} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Template
                  </Button>
                </div>

                {/* Import Results */}
                {importResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {importResults.success > 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        Résultats de l'Import
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                          <p className="text-sm text-muted-foreground">Succès</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">{importResults.warnings.length}</p>
                          <p className="text-sm text-muted-foreground">Avertissements</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{importResults.errors.length}</p>
                          <p className="text-sm text-muted-foreground">Erreurs</p>
                        </div>
                      </div>

                      {importResults.warnings.length > 0 && (
                        <div>
                          <h4 className="font-medium text-yellow-600 mb-2">Avertissements :</h4>
                          <div className="max-h-32 overflow-y-auto text-sm">
                            {importResults.warnings.map((warning, index) => (
                              <p key={index} className="text-yellow-600">• {warning}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {importResults.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Erreurs :</h4>
                          <div className="max-h-32 overflow-y-auto text-sm">
                            {importResults.errors.map((error, index) => (
                              <p key={index} className="text-red-600">• {error}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Format requis :</p>
                  <div className="grid grid-cols-1 gap-1">
                    <span>• <strong>code_article</strong> : Code unique (obligatoire)</span>
                    <span>• <strong>nom</strong> : Nom de l'article (obligatoire)</span>
                    <span>• <strong>categorie</strong> : Catégorie (obligatoire)</span>
                    <span>• <strong>unite</strong> : Unité de mesure (obligatoire)</span>
                    <span>• <strong>stock_actuel, stock_min, stock_max</strong> : Nombres</span>
                    <span>• <strong>date_expiration</strong> : Format YYYY-MM-DD</span>
                    <span>• <strong>actif</strong> : "Oui" ou "Non"</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}