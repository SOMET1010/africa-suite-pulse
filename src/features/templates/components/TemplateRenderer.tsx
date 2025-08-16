import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useCurrency } from '@/hooks/useCurrency';
import type { DocumentTemplate } from '@/types/templates';

interface TemplateRendererProps {
  template: DocumentTemplate;
  data?: any; // Document data (invoice, receipt, etc.)
}

export function TemplateRenderer({ template, data }: TemplateRendererProps) {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const { formatCurrency } = useCurrency();

  // Données d'exemple pour l'aperçu
  const sampleData = data || {
    id: 'INV-2024-001',
    number: 'INV-2024-001',
    date: new Date().toLocaleDateString('fr-FR'),
    amount: 125000,
    customer: {
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      address: '123 Avenue de la Paix\n75001 Paris\nFrance',
    },
    items: [
      { description: 'Hébergement - Chambre Deluxe', quantity: 2, unitPrice: 50000, total: 100000 },
      { description: 'Petit-déjeuner', quantity: 2, unitPrice: 12500, total: 25000 },
    ],
    subtotal: 125000,
    tax: 22500,
    total: 147500,
  };

  useEffect(() => {
    if (template.qr_code.enabled && qrCodeRef.current) {
      const generateQRCode = async () => {
        let qrContent = '';
        
        switch (template.qr_code.content) {
          case 'document_url':
            qrContent = `https://hotel.com/documents/${sampleData.id}`;
            break;
          case 'verification_url':
            qrContent = `https://hotel.com/verify/${sampleData.id}`;
            break;
          case 'payment_url':
            qrContent = `https://hotel.com/pay/${sampleData.id}`;
            break;
          case 'custom':
            qrContent = template.qr_code.custom_content || sampleData.id;
            break;
        }

        try {
          await QRCode.toCanvas(qrCodeRef.current, qrContent, {
            width: template.qr_code.size === 'small' ? 64 : template.qr_code.size === 'medium' ? 96 : 128,
            margin: 1,
          });
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };

      generateQRCode();
    }
  }, [template, sampleData]);

  const getQRCodeSize = () => {
    return template.qr_code.size === 'small' ? 'w-16 h-16' : template.qr_code.size === 'medium' ? 'w-24 h-24' : 'w-32 h-32';
  };

  const qrCodeElement = template.qr_code.enabled ? (
    <div className={`${getQRCodeSize()} flex-shrink-0`}>
      <canvas ref={qrCodeRef} className="w-full h-full" />
    </div>
  ) : null;

  return (
    <div 
      className="print-content" 
      style={{ 
        fontFamily: template.style.font_family === 'inter' ? 'Inter, sans-serif' :
                   template.style.font_family === 'roboto' ? 'Roboto, sans-serif' :
                   template.style.font_family === 'arial' ? 'Arial, sans-serif' : 'Times, serif',
        fontSize: template.style.font_size === 'small' ? '14px' : template.style.font_size === 'large' ? '18px' : '16px',
        color: template.style.text_color,
        backgroundColor: template.style.background_color,
      }}
    >
      {/* En-tête */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div className={`flex items-center gap-4 ${template.header.logo_position === 'center' ? 'justify-center' : template.header.logo_position === 'right' ? 'justify-end' : ''}`}>
            {template.header.show_logo && (
              <div className={`${template.header.logo_size === 'small' ? 'w-16 h-16' : template.header.logo_size === 'large' ? 'w-32 h-32' : 'w-24 h-24'} bg-gray-200 rounded flex items-center justify-center`}>
                {template.header.logo_url ? (
                  <img src={template.header.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-500">LOGO</span>
                )}
              </div>
            )}
            
            {template.header.show_company_info && (
              <div className="space-y-1">
                <h1 className="text-xl font-bold" style={{ color: template.style.primary_color }}>
                  {template.header.company_name || 'Nom de l\'entreprise'}
                </h1>
                {template.header.company_address && (
                  <div className="text-sm whitespace-pre-line">{template.header.company_address}</div>
                )}
                <div className="text-sm space-y-0.5">
                  {template.header.company_phone && <div>Tél: {template.header.company_phone}</div>}
                  {template.header.company_email && <div>Email: {template.header.company_email}</div>}
                  {template.header.company_website && <div>Web: {template.header.company_website}</div>}
                </div>
              </div>
            )}
          </div>

          {template.qr_code.enabled && template.qr_code.position === 'top_right' && qrCodeElement}
        </div>

        {template.header.custom_text && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            {template.header.custom_text}
          </div>
        )}

        {template.qr_code.enabled && template.qr_code.position === 'header' && (
          <div className="mt-4 flex justify-center">
            {qrCodeElement}
          </div>
        )}
      </header>

      {/* Contenu principal */}
      <main className="space-y-6">
        {/* Titre du document */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: template.style.primary_color }}>
            {template.content.title || template.type.toUpperCase()}
          </h2>
          {template.content.subtitle && (
            <p className="text-lg" style={{ color: template.style.secondary_color }}>
              {template.content.subtitle}
            </p>
          )}
        </div>

        {/* Informations du document */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: template.style.primary_color }}>Informations client</h3>
            <div className="space-y-1">
              <div className="font-medium">{sampleData.customer.name}</div>
              <div className="text-sm whitespace-pre-line">{sampleData.customer.address}</div>
              <div className="text-sm">{sampleData.customer.email}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="space-y-1">
              {template.content.show_reference && (
                <div><span className="font-semibold">Référence:</span> {sampleData.number}</div>
              )}
              {template.content.show_date && (
                <div><span className="font-semibold">Date:</span> {sampleData.date}</div>
              )}
            </div>
          </div>
        </div>

        {/* Tableau des éléments */}
        <div className="overflow-hidden rounded-lg border" style={{ borderColor: template.style.border_color }}>
          <table className={`w-full ${getTableClasses()}`}>
            <thead className="bg-gray-50" style={{ backgroundColor: template.style.primary_color, color: 'white' }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                <th className="px-4 py-3 text-center font-semibold">Quantité</th>
                <th className="px-4 py-3 text-right font-semibold">Prix unitaire</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.items.map((item: any, index: number) => (
                <tr key={index} className={getRowClasses(index)}>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between">
              <span>Sous-total HT:</span>
              <span className="font-medium">{formatCurrency(sampleData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (18%):</span>
              <span className="font-medium">{formatCurrency(sampleData.tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-2" style={{ borderColor: template.style.border_color }}>
              <span className="font-bold text-lg">Total TTC:</span>
              <span className="font-bold text-lg" style={{ color: template.style.primary_color }}>
                {formatCurrency(sampleData.total)}
              </span>
            </div>
          </div>
        </div>

        {template.content.show_qr_code && template.qr_code.enabled && (
          <div className="flex justify-center mt-6">
            {qrCodeElement}
          </div>
        )}
      </main>

      {/* Pied de page */}
      <footer className="mt-12 pt-6 border-t space-y-4" style={{ borderColor: template.style.border_color }}>
        {template.qr_code.enabled && template.qr_code.position === 'footer' && (
          <div className="flex justify-center mb-4">
            {qrCodeElement}
          </div>
        )}

        {template.footer.show_legal_info && template.footer.legal_text && (
          <div className="text-sm" style={{ color: template.style.secondary_color }}>
            {template.footer.legal_text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {template.footer.show_bank_info && template.footer.bank_details && (
            <div>
              <h4 className="font-semibold mb-1">Coordonnées bancaires</h4>
              <div className="whitespace-pre-line" style={{ color: template.style.secondary_color }}>
                {template.footer.bank_details}
              </div>
            </div>
          )}

          {template.footer.show_tax_info && (
            <div>
              <h4 className="font-semibold mb-1">Informations fiscales</h4>
              <div className="space-y-0.5" style={{ color: template.style.secondary_color }}>
                {template.footer.tax_number && <div>N° TVA: {template.footer.tax_number}</div>}
                {template.footer.commercial_registry && <div>RCS: {template.footer.commercial_registry}</div>}
              </div>
            </div>
          )}

          {template.qr_code.enabled && template.qr_code.position === 'bottom_right' && (
            <div className="flex justify-end">
              {qrCodeElement}
            </div>
          )}
        </div>

        {template.footer.custom_text && (
          <div className="text-sm" style={{ color: template.style.secondary_color }}>
            {template.footer.custom_text}
          </div>
        )}

        {template.footer.show_page_numbers && (
          <div className="text-center text-sm" style={{ color: template.style.secondary_color }}>
            Page 1 sur 1
          </div>
        )}
      </footer>
    </div>
  );

  function getTableClasses() {
    switch (template.style.table_style) {
      case 'minimal':
        return '';
      case 'bordered':
        return 'border-collapse';
      case 'striped':
        return '';
      case 'elegant':
        return 'border-collapse';
      default:
        return '';
    }
  }

  function getRowClasses(index: number) {
    switch (template.style.table_style) {
      case 'minimal':
        return '';
      case 'bordered':
        return 'border-b';
      case 'striped':
        return index % 2 === 0 ? 'bg-gray-50' : '';
      case 'elegant':
        return 'border-b hover:bg-gray-50';
      default:
        return '';
    }
  }
}