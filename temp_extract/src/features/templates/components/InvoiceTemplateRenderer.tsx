import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { DocumentTemplate } from '@/types/templates';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  venue: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    siret?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms?: string;
  legalInfo?: string;
}

interface InvoiceTemplateRendererProps {
  template: DocumentTemplate;
  data: InvoiceData;
}

export function InvoiceTemplateRenderer({ template, data }: InvoiceTemplateRendererProps) {
  const generateQRData = () => {
    return JSON.stringify({
      invoice: data.invoiceNumber,
      total: data.total,
      date: data.date,
      verify: `${window.location.origin}/invoice/verify/${data.invoiceNumber}`
    });
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ 
      fontFamily: template.style.font_family || 'Arial', 
      fontSize: `${template.style.font_size || 12}px`,
      color: template.style.text_color || '#000000'
    }}>
      {/* En-tête */}
      {template.header.show_logo && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: template.style.primary_color || '#1f2937' }}>
            {data.venue.name}
          </h1>
          <div className="text-gray-600">
            <p>{data.venue.address.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p>
            {data.venue.phone && <p>Tél: {data.venue.phone}</p>}
            {data.venue.email && <p>Email: {data.venue.email}</p>}
          </div>
        </div>
      )}

      {template.header.custom_text && (
        <div className="text-center mb-6">
          <p className="text-lg">{template.header.custom_text}</p>
        </div>
      )}

      {/* Titre et informations */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: template.style.primary_color || '#1f2937' }}>
            FACTURE
          </h2>
          <div>
            <p><strong>N° :</strong> {data.invoiceNumber}</p>
            <p><strong>Date :</strong> {data.date}</p>
          </div>
        </div>
        {template.qr_code.enabled && (
          <div className="text-center">
            <QRCodeSVG
              value={generateQRData()}
              size={80}
              className="mb-2"
            />
            <p className="text-xs text-gray-600">Scannez pour vérifier</p>
          </div>
        )}
      </div>

      {/* Adresses */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: template.style.primary_color || '#1f2937' }}>
            Facturé à :
          </h3>
          <div>
            <p className="font-medium">{data.customer.name}</p>
            <p>{data.customer.address.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p>
            {data.customer.phone && <p>Tél: {data.customer.phone}</p>}
            {data.customer.email && <p>Email: {data.customer.email}</p>}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: template.style.primary_color || '#1f2937' }}>
            Facturé par :
          </h3>
          <div>
            <p className="font-medium">{data.venue.name}</p>
            <p>{data.venue.address.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}</p>
            {data.venue.phone && <p>Tél: {data.venue.phone}</p>}
            {data.venue.email && <p>Email: {data.venue.email}</p>}
            {data.venue.siret && <p>SIRET: {data.venue.siret}</p>}
          </div>
        </div>
      </div>

      {/* Tableau des articles */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr style={{ backgroundColor: template.style.primary_color || '#f3f4f6' }}>
              <th className="border border-gray-300 p-3 text-left">Description</th>
              <th className="border border-gray-300 p-3 text-center">Quantité</th>
              <th className="border border-gray-300 p-3 text-right">Prix unitaire</th>
              <th className="border border-gray-300 p-3 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-300 p-3">{item.name}</td>
                <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-3 text-right">{item.price.toFixed(2)} €</td>
                <td className="border border-gray-300 p-3 text-right">{item.total.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2">
          <div className="bg-gray-50 p-4 border border-gray-300">
            <div className="flex justify-between mb-2">
              <span>Sous-total HT :</span>
              <span className="font-medium">{data.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>TVA (20%) :</span>
              <span className="font-medium">{data.tax.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-400 pt-2">
              <span>TOTAL TTC :</span>
              <span style={{ color: template.style.primary_color || '#1f2937' }}>
                {data.total.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions de paiement */}
      {data.paymentTerms && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Conditions de paiement :</h3>
          <p className="text-gray-700">{data.paymentTerms}</p>
        </div>
      )}

      {/* Pied de page */}
      {template.footer.show_legal_info && (
        <div className="text-xs text-gray-600 text-center border-t pt-4 mt-8">
          {data.legalInfo && <p>{data.legalInfo}</p>}
          <p className="mt-2">Cette facture est générée automatiquement et ne nécessite pas de signature.</p>
        </div>
      )}

      {template.footer.custom_text && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-700">{template.footer.custom_text}</p>
        </div>
      )}
    </div>
  );
}