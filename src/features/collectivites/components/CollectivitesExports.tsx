import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CollectivitesExportsProps {
  onExport: (format: 'excel' | 'pdf') => void;
}

export function CollectivitesExports({ onExport }: CollectivitesExportsProps) {
  const [exportOptions, setExportOptions] = useState({
    format: 'excel',
    period: 'month',
    includeKPIs: true,
    includeTransactions: true,
    includeBeneficiaries: false,
    includeSubsidies: true,
    includeCharts: false
  });

  const handleExport = () => {
    const format = exportOptions.format as 'excel' | 'pdf';
    
    // Show loading toast
    toast.loading(`Génération du rapport ${format.toUpperCase()}...`);
    
    setTimeout(() => {
      toast.dismiss();
      toast.success(`Rapport ${format.toUpperCase()} généré avec succès!`);
      onExport(format);
    }, 2000);
  };

  const exportTemplates = [
    {
      name: "Rapport financier",
      description: "KPIs, subventions et contributions",
      icon: FileSpreadsheet,
      preset: {
        includeKPIs: true,
        includeTransactions: true,
        includeBeneficiaries: false,
        includeSubsidies: true,
        includeCharts: false
      }
    },
    {
      name: "Rapport complet",
      description: "Toutes les données avec graphiques",
      icon: FileText,
      preset: {
        includeKPIs: true,
        includeTransactions: true,
        includeBeneficiaries: true,
        includeSubsidies: true,
        includeCharts: true
      }
    },
    {
      name: "Liste bénéficiaires",
      description: "Fiche détaillée des usagers",
      icon: FileSpreadsheet,
      preset: {
        includeKPIs: false,
        includeTransactions: false,
        includeBeneficiaries: true,
        includeSubsidies: false,
        includeCharts: false
      }
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter les données
          </DialogTitle>
          <DialogDescription>
            Configurez et téléchargez vos rapports collectivités
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Templates */}
          <div>
            <h4 className="font-medium mb-3">Modèles rapides</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exportTemplates.map((template, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExportOptions(prev => ({ ...prev, ...template.preset }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <template.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h5 className="font-medium text-sm">{template.name}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Export Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="format">Format d'export</Label>
                <Select 
                  value={exportOptions.format} 
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Excel (.xlsx)
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF (.pdf)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period">Période</Label>
                <Select 
                  value={exportOptions.period} 
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="quarter">Ce trimestre</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Données à inclure</Label>
              <div className="space-y-3">
                {[
                  { key: 'includeKPIs', label: 'Indicateurs clés (KPIs)' },
                  { key: 'includeTransactions', label: 'Historique des transactions' },
                  { key: 'includeBeneficiaries', label: 'Liste des bénéficiaires' },
                  { key: 'includeSubsidies', label: 'Détail des subventions' },
                  { key: 'includeCharts', label: 'Graphiques (PDF uniquement)' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.key}
                      checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ 
                          ...prev, 
                          [option.key]: checked 
                        }))
                      }
                    />
                    <Label htmlFor={option.key} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Résumé de l'export</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Format: {exportOptions.format.toUpperCase()}</p>
                <p>Période: {exportOptions.period}</p>
                <p>
                  Sections: {Object.entries(exportOptions)
                    .filter(([key, value]) => key.startsWith('include') && value)
                    .length} sélectionnées
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">
              Annuler
            </Button>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Générer le rapport
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}