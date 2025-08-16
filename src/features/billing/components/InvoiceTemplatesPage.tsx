// Page des modèles de factures - Templates et prévisualisations
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TButton } from "@/core/ui/TButton";
import { FileText, Eye, Download, Settings } from "lucide-react";
import { InvoiceTemplatePreview } from "./InvoiceTemplatePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTemplateExport } from "@/features/templates/hooks/useTemplateExport";
import { InvoiceTemplateRenderer } from "@/features/templates/components/InvoiceTemplateRenderer";

export function InvoiceTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { exportToPDF } = useTemplateExport();

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

  const handleExportTemplate = async (template: any) => {
    // Créer un élément temporaire avec le template
    const tempDiv = document.createElement('div');
    tempDiv.id = `temp-template-${template.id}`;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    document.body.appendChild(tempDiv);

    // Créer le template rendu
    const mockTemplate = {
      id: template.id,
      type: 'invoice',
      style: {
        font_family: 'Arial',
        font_size: 12,
        primary_color: '#1f2937',
        text_color: '#000000'
      },
      header: {
        show_logo: true,
        custom_text: ''
      },
      footer: {
        show_legal_info: true,
        custom_text: 'Merci de votre confiance'
      },
      qr_code: {
        enabled: true
      }
    };

    const mockData = {
      invoiceNumber: 'FAC-2024-001',
      date: new Date().toLocaleDateString('fr-FR'),
      customer: {
        name: 'Société EXEMPLE',
        address: '123 Rue de la Paix\n75001 Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@exemple.fr'
      },
      venue: {
        name: 'Hôtel Excellence',
        address: '456 Avenue des Champs\n75008 Paris',
        phone: '+33 1 42 00 00 00',
        email: 'hotel@excellence.fr',
        siret: '12345678901234'
      },
      items: [
        { name: 'Chambre Standard', quantity: 3, price: 120.00, total: 360.00 },
        { name: 'Petit-déjeuner', quantity: 3, price: 15.00, total: 45.00 },
        { name: 'Service de nettoyage', quantity: 1, price: 25.00, total: 25.00 }
      ],
      subtotal: 430.00,
      tax: 77.40,
      total: 507.40,
      paymentTerms: 'Paiement à 30 jours',
      legalInfo: 'TVA FR12345678901 - RCS Paris 123 456 789'
    };

    // Injecter le HTML du template
    tempDiv.innerHTML = `
      <div style="font-family: Arial; padding: 40px; background: white; width: 100%;">
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="text-center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">
              ${mockData.venue.name}
            </h1>
            <p style="color: #6b7280; margin: 4px 0;">${mockData.venue.address.replace('\n', '<br>')}</p>
            <p style="color: #6b7280; margin: 4px 0;">Tél: ${mockData.venue.phone}</p>
            <p style="color: #6b7280; margin: 4px 0;">Email: ${mockData.venue.email}</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
            <div>
              <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">
                FACTURE
              </h2>
              <p><strong>N° :</strong> ${mockData.invoiceNumber}</p>
              <p><strong>Date :</strong> ${mockData.date}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
            <div>
              <h3 style="font-weight: 600; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #1f2937;">
                Facturé à :
              </h3>
              <p style="font-weight: 500;">${mockData.customer.name}</p>
              <p>${mockData.customer.address.replace('\n', '<br>')}</p>
              <p>Tél: ${mockData.customer.phone}</p>
              <p>Email: ${mockData.customer.email}</p>
            </div>
            <div>
              <h3 style="font-weight: 600; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #1f2937;">
                Facturé par :
              </h3>
              <p style="font-weight: 500;">${mockData.venue.name}</p>
              <p>${mockData.venue.address.replace('\n', '<br>')}</p>
              <p>Tél: ${mockData.venue.phone}</p>
              <p>Email: ${mockData.venue.email}</p>
              <p>SIRET: ${mockData.venue.siret}</p>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left;">Description</th>
                  <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">Quantité</th>
                  <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">Prix unitaire</th>
                  <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">Total HT</th>
                </tr>
              </thead>
              <tbody>
                ${mockData.items.map((item, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
                    <td style="border: 1px solid #d1d5db; padding: 12px;">${item.name}</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">${item.price.toFixed(2)} €</td>
                    <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right;">${item.total.toFixed(2)} €</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
            <div style="width: 50%;">
              <div style="background-color: #f9fafb; padding: 16px; border: 1px solid #d1d5db;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Sous-total HT :</span>
                  <span style="font-weight: 500;">${mockData.subtotal.toFixed(2)} €</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>TVA (20%) :</span>
                  <span style="font-weight: 500;">${mockData.tax.toFixed(2)} €</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 1px solid #9ca3af; padding-top: 8px;">
                  <span>TOTAL TTC :</span>
                  <span style="color: #1f2937;">
                    ${mockData.total.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="font-weight: 600; margin-bottom: 8px;">Conditions de paiement :</h3>
            <p style="color: #374151;">${mockData.paymentTerms}</p>
          </div>

          <div style="font-size: 12px; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 32px;">
            <p>${mockData.legalInfo}</p>
            <p style="margin-top: 8px;">Cette facture est générée automatiquement et ne nécessite pas de signature.</p>
          </div>

          <div style="text-align: center; margin-top: 16px;">
            <p style="font-size: 14px; color: #374151;">Merci de votre confiance</p>
          </div>
        </div>
      </div>
    `;

    // Attendre un peu pour que le rendu soit terminé
    await new Promise(resolve => setTimeout(resolve, 100));

    // Exporter en PDF
    await exportToPDF(tempDiv.id, `${template.name.toLowerCase().replace(/\s+/g, '-')}-exemple`);

    // Nettoyer
    document.body.removeChild(tempDiv);
  };

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
                    <TButton 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => handleExportTemplate(template)}
                    >
                      <Download className="h-3 w-3" />
                      Exporter
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