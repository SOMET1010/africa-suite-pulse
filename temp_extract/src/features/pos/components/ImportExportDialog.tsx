import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/unified-toast";
import type { POSCategory } from "../types";

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: POSCategory[];
  outletId: string;
  onImport: (categories: any[]) => void;
}

export function ImportExportDialog({ 
  open, 
  onOpenChange, 
  categories, 
  outletId,
  onImport 
}: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const exportData = categories.map(cat => ({
      name: cat.name,
      description: cat.description,
      color: cat.color,
      icon: (cat as any).icon || 'utensils',
      sort_order: cat.sort_order
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${categories.length} catégories exportées`,
      variant: "success",
    });

    onOpenChange(false);
  };

  const handleImport = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (!Array.isArray(importedData)) {
          throw new Error("Format de fichier invalide");
        }

        // Validate structure
        const validCategories = importedData.filter(item => 
          item.name && typeof item.name === 'string'
        );

        if (validCategories.length === 0) {
          throw new Error("Aucune catégorie valide trouvée");
        }

        onImport(validCategories);
        onOpenChange(false);

        toast({
          title: "Import réussi",
          description: `${validCategories.length} catégories importées`,
          variant: "success",
        });
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Fichier invalide ou corrompu",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import / Export des Catégories</DialogTitle>
          <DialogDescription>
            Gérez vos catégories en important ou exportant les données
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'export' ? 'default' : 'outline'}
              onClick={() => setActiveTab('export')}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
            <Button
              variant={activeTab === 'import' ? 'default' : 'outline'}
              onClick={() => setActiveTab('import')}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
          </div>

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Données à exporter</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {categories.length} catégories seront exportées au format JSON
                </p>
                <div className="text-xs text-muted-foreground">
                  Inclut: nom, description, couleur, icône, ordre d'affichage
                </div>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium">Format requis</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Fichier JSON avec un tableau de catégories
                </p>
                <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
{`[
  {
    "name": "Boissons",
    "description": "Toutes les boissons",
    "color": "#6366f1",
    "icon": "coffee",
    "sort_order": 1
  }
]`}
                </pre>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          {activeTab === 'export' ? (
            <Button onClick={handleExport} disabled={categories.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exporter ({categories.length})
            </Button>
          ) : (
            <Button onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Choisir fichier
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}