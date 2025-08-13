// Page des modèles de factures - Templates et prévisualisations
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TButton } from "@/core/ui/TButton";
import { FileText, Eye, Download, Settings } from "lucide-react";
import { InvoiceTemplatePreview } from "./InvoiceTemplatePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InvoiceTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: "standard",
      name: "Facture Standard",
      description: "Modèle classique adapté à la plupart des établissements",
      preview: "/api/placeholder/400/500",
      category: "Professionnel",
      features: ["En-tête personnalisé", "Détail des services", "Conditions de paiement"],
      isDefault: true
    },
    {
      id: "luxury",
      name: "Facture Premium",
      description: "Design élégant pour les établissements de luxe",
      preview: "/api/placeholder/400/500",
      category: "Luxe",
      features: ["Design haut de gamme", "Logo en relief", "Finitions premium"],
      isDefault: false
    },
    {
      id: "minimal",
      name: "Facture Minimaliste",
      description: "Design épuré et moderne",
      preview: "/api/placeholder/400/500",
      category: "Moderne",
      features: ["Design épuré", "Mise en page optimisée", "Lisibilité maximale"],
      isDefault: false
    },
    {
      id: "detailed",
      name: "Facture Détaillée",
      description: "Modèle avec breakdown complet des charges",
      preview: "/api/placeholder/400/500",
      category: "Détaillé",
      features: ["Détail par poste", "Taxes détaillées", "Notes explicatives"],
      isDefault: false
    }
  ];

  const categories = ["Tous", "Professionnel", "Luxe", "Moderne", "Détaillé"];
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filteredTemplates = activeCategory === "Tous" 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modèles de Factures</h1>
          <p className="text-muted-foreground">
            Choisissez et personnalisez vos modèles de factures
          </p>
        </div>
        <TButton variant="ghost" className="gap-2">
          <Settings className="h-4 w-4" />
          Paramètres globaux
        </TButton>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">{template.category}</Badge>
                        {template.isDefault && (
                          <Badge variant="default">Par défaut</Badge>
                        )}
                      </div>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {template.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Preview Image */}
                  <div className="relative aspect-[4/5] bg-muted rounded-md overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-background to-muted flex items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TButton size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </TButton>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Caractéristiques :</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <div className="h-1 w-1 bg-current rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <TButton 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1 gap-1"
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <Eye className="h-3 w-3" />
                      Aperçu
                    </TButton>
                    <TButton size="sm" className="flex-1 gap-1">
                      <Download className="h-3 w-3" />
                      Utiliser
                    </TButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <InvoiceTemplatePreview
          templateId={selectedTemplate}
          template={templates.find(t => t.id === selectedTemplate)!}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}