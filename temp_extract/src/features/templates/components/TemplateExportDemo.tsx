import { useState } from 'react';
import { TButton } from '@/core/ui/TButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Receipt, FileImage } from 'lucide-react';
import { useTemplateExport } from '../hooks/useTemplateExport';
import { POSTemplateRenderer } from './POSTemplateRenderer';

export function TemplateExportDemo() {
  const [isExporting, setIsExporting] = useState(false);
  const { exportToPDF, exportToImage } = useTemplateExport();

  const handleExportPOSTemplate = async (format: 'pdf' | 'image') => {
    setIsExporting(true);
    
    // Créer un élément temporaire avec le ticket POS
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-pos-template';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.backgroundColor = 'white';
    document.body.appendChild(tempDiv);

    // Template de ticket POS avec données d'exemple
    const mockTemplate = {
      id: 'pos-standard',
      type: 'pos_receipt',
      style: { font_family: 'monospace', font_size: 12 },
      header: { show_logo: true, custom_text: '' },
      footer: { custom_text: 'Merci de votre visite !' },
      qr_code: { enabled: true }
    };

    const mockData = {
      receiptNumber: 'TIC-2024-001',
      date: new Date().toLocaleDateString('fr-FR'),
      time: new Date().toLocaleTimeString('fr-FR'),
      items: [
        { name: 'Café Expresso', quantity: 2, price: 2.50, total: 5.00 },
        { name: 'Croissant aux amandes', quantity: 1, price: 2.80, total: 2.80 },
        { name: 'Jus d\'orange frais', quantity: 1, price: 3.50, total: 3.50 }
      ],
      subtotal: 11.30,
      tax: 2.03,
      total: 13.33,
      paymentMethod: 'Carte bancaire',
      cashier: 'Marie Dupont',
      venue: 'Café Excellence',
      address: '123 Rue du Commerce, 75001 Paris',
      phone: '+33 1 42 00 00 00'
    };

    // Générer le HTML du ticket
    tempDiv.innerHTML = `
      <div style="font-family: monospace; background: white; width: 320px; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
            ${mockData.venue}
          </div>
          <div style="font-size: 12px; margin-bottom: 2px;">
            ${mockData.address}
          </div>
          <div style="font-size: 12px;">
            Tél: ${mockData.phone}
          </div>
        </div>

        <div style="margin-bottom: 10px; font-size: 11px;">
          <div><strong>Ticket:</strong> ${mockData.receiptNumber}</div>
          <div><strong>Date:</strong> ${mockData.date}</div>
          <div><strong>Heure:</strong> ${mockData.time}</div>
          <div><strong>Caissier:</strong> ${mockData.cashier}</div>
        </div>

        <div style="border-top: 1px solid #000; padding-top: 5px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px; font-size: 10px;">
            <span>Article</span>
            <span>Qté</span>
            <span>Prix</span>
          </div>
          ${mockData.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px;">
              <span style="flex: 1; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
                ${item.name}
              </span>
              <span style="width: 30px; text-align: center;">
                ${item.quantity}
              </span>
              <span style="width: 60px; text-align: right;">
                ${item.total.toFixed(2)} €
              </span>
            </div>
          `).join('')}
        </div>

        <div style="border-top: 1px solid #000; padding-top: 5px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>Sous-total:</span>
            <span>${mockData.subtotal.toFixed(2)} €</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>TVA (18%):</span>
            <span>${mockData.tax.toFixed(2)} €</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 3px; margin-top: 5px;">
            <span>TOTAL:</span>
            <span>${mockData.total.toFixed(2)} €</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 15px; font-size: 9px; border-top: 1px dashed #ccc; padding-top: 10px;">
          <div>Merci de votre visite !</div>
          <div>Conservez ce ticket</div>
          <div style="margin-top: 10px;">
            <div style="width: 80px; height: 80px; border: 1px solid #000; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 8px;">
              QR CODE<br/>DGI
            </div>
            <div style="margin-top: 5px; font-size: 8px;">Facture certifiée DGI ✓</div>
          </div>
        </div>
      </div>
    `;

    // Attendre le rendu
    await new Promise(resolve => setTimeout(resolve, 200));

    // Exporter
    if (format === 'pdf') {
      await exportToPDF(tempDiv.id, 'ticket-pos-exemple');
    } else {
      await exportToImage(tempDiv.id, 'ticket-pos-exemple');
    }

    // Nettoyer
    document.body.removeChild(tempDiv);
    setIsExporting(false);
  };

  const handleExportInvoiceTemplate = async (format: 'pdf' | 'image') => {
    setIsExporting(true);
    
    // Créer un élément temporaire avec la facture
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-invoice-template';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.backgroundColor = 'white';
    document.body.appendChild(tempDiv);

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
        { name: 'Chambre Standard (3 nuits)', quantity: 1, price: 360.00, total: 360.00 },
        { name: 'Petit-déjeuner (3 personnes)', quantity: 3, price: 15.00, total: 45.00 },
        { name: 'Service de ménage', quantity: 1, price: 25.00, total: 25.00 }
      ],
      subtotal: 430.00,
      tax: 77.40,
      total: 507.40,
      paymentTerms: 'Paiement à 30 jours',
      legalInfo: 'TVA FR12345678901 - RCS Paris 123 456 789'
    };

    // Générer le HTML de la facture
    tempDiv.innerHTML = `
      <div style="font-family: Arial; padding: 40px; background: white; max-width: 800px;">
        <div style="text-center; margin-bottom: 40px;">
          <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">
            ${mockData.venue.name}
          </h1>
          <p style="color: #6b7280; margin: 4px 0;">${mockData.venue.address.replace('\n', '<br>')}</p>
          <p style="color: #6b7280; margin: 4px 0;">Tél: ${mockData.venue.phone}</p>
          <p style="color: #6b7280; margin: 4px 0;">Email: ${mockData.venue.email}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">
              FACTURE
            </h2>
            <p><strong>N° :</strong> ${mockData.invoiceNumber}</p>
            <p><strong>Date :</strong> ${mockData.date}</p>
          </div>
          <div style="text-align: center;">
            <div style="width: 80px; height: 80px; border: 1px solid #000; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 10px;">
              QR CODE<br/>VÉRIFICATION
            </div>
            <p style="font-size: 10px; margin-top: 8px;">Scannez pour vérifier</p>
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

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; margin-bottom: 40px;">
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

        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 300px;">
            <div style="background-color: #f9fafb; padding: 16px; border: 1px solid #d1d5db;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Sous-total HT :</span>
                <span style="font-weight: 500;">${mockData.subtotal.toFixed(2)} €</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>TVA (18%) :</span>
                <span style="font-weight: 500;">${mockData.tax.toFixed(2)} €</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 1px solid #9ca3af; padding-top: 8px;">
                <span>TOTAL TTC :</span>
                <span style="color: #1f2937;">${mockData.total.toFixed(2)} €</span>
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
          <p style="margin-top: 8px; font-size: 14px; color: #374151;">Merci de votre confiance</p>
        </div>
      </div>
    `;

    // Attendre le rendu
    await new Promise(resolve => setTimeout(resolve, 200));

    // Exporter
    if (format === 'pdf') {
      await exportToPDF(tempDiv.id, 'facture-exemple');
    } else {
      await exportToImage(tempDiv.id, 'facture-exemple');
    }

    // Nettoyer
    document.body.removeChild(tempDiv);
    setIsExporting(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Modèle de Facture
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Exemple de facture d'hôtellerie avec en-tête personnalisé, détail des services et QR code de vérification.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Format:</span>
                <span>A4 (210 × 297 mm)</span>
              </div>
              <div className="flex justify-between">
                <span>Contenu:</span>
                <span>En-tête, articles, totaux, QR code</span>
              </div>
              <div className="flex justify-between">
                <span>Usage:</span>
                <span>Présentation clients prospects</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <TButton
              onClick={() => handleExportInvoiceTemplate('pdf')}
              disabled={isExporting}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </TButton>
            <TButton
              onClick={() => handleExportInvoiceTemplate('image')}
              disabled={isExporting}
              variant="ghost"
              className="flex-1 gap-2"
            >
              <FileImage className="h-4 w-4" />
              Export PNG
            </TButton>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Ticket de Caisse POS
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Exemple de ticket POS avec QR code DGI pour la certification fiscale (Côte d'Ivoire).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Format:</span>
                <span>80mm thermique</span>
              </div>
              <div className="flex justify-between">
                <span>Contenu:</span>
                <span>Articles, totaux, QR DGI</span>
              </div>
              <div className="flex justify-between">
                <span>Conformité:</span>
                <span>DGI Côte d'Ivoire</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <TButton
              onClick={() => handleExportPOSTemplate('pdf')}
              disabled={isExporting}
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </TButton>
            <TButton
              onClick={() => handleExportPOSTemplate('image')}
              disabled={isExporting}
              variant="ghost"
              className="flex-1 gap-2"
            >
              <FileImage className="h-4 w-4" />
              Export PNG
            </TButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}