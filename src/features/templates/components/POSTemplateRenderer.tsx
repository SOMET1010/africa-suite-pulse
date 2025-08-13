import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { DocumentTemplate } from '@/types/templates';

interface POSTemplateData {
  receiptNumber: string;
  date: string;
  time: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashier: string;
  venue: string;
  address?: string;
  phone?: string;
}

interface POSTemplateRendererProps {
  template: DocumentTemplate;
  data: POSTemplateData;
  format?: '58mm' | '80mm' | 'A4';
}

export function POSTemplateRenderer({ template, data, format = '80mm' }: POSTemplateRendererProps) {
  const formatStyles = {
    '58mm': 'w-[58mm] text-xs',
    '80mm': 'w-[80mm] text-sm',
    'A4': 'w-[210mm] text-base'
  };

  const generateQRData = () => {
    return JSON.stringify({
      receipt: data.receiptNumber,
      total: data.total,
      date: data.date,
      verify: `${window.location.origin}/pos/verify/${data.receiptNumber}`
    });
  };

  return (
    <div className={`${formatStyles[format]} bg-white p-4 font-mono print:shadow-none`}>
      {/* Header */}
      {template.header.show_logo && (
        <div className="text-center mb-4">
          <div className="font-bold text-lg">{data.venue}</div>
          {data.address && <div className="text-xs">{data.address}</div>}
          {data.phone && <div className="text-xs">Tél: {data.phone}</div>}
        </div>
      )}

      {template.header.custom_text && (
        <div className="text-center mb-4 text-xs">
          {template.header.custom_text}
        </div>
      )}

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Receipt Info */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>Ticket N°:</span>
          <span className="font-bold">{data.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{data.date}</span>
        </div>
        <div className="flex justify-between">
          <span>Heure:</span>
          <span>{data.time}</span>
        </div>
        <div className="flex justify-between">
          <span>Caissier:</span>
          <span>{data.cashier}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Items */}
      <div className="mb-4">
        {data.items.map((item, index) => (
          <div key={index} className="text-xs mb-2">
            <div className="flex justify-between">
              <span className="flex-1">{item.name}</span>
              <span className="ml-2">{item.quantity} x {item.price.toFixed(2)}€</span>
              <span className="ml-2 w-12 text-right">{item.total.toFixed(2)}€</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Totals */}
      <div className="text-xs mb-4">
        <div className="flex justify-between">
          <span>Sous-total:</span>
          <span>{data.subtotal.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between">
          <span>TVA:</span>
          <span>{data.tax.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between font-bold border-t border-dashed border-gray-400 pt-1">
          <span>TOTAL:</span>
          <span>{data.total.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Paiement:</span>
          <span>{data.paymentMethod}</span>
        </div>
      </div>

      {/* QR Code */}
      {template.qr_code.enabled && (
        <div className="text-center my-4">
          <QRCodeSVG
            value={generateQRData()}
            size={format === '58mm' ? 60 : format === '80mm' ? 80 : 120}
            className="mx-auto"
          />
          <div className="text-xs mt-2">
            Scannez pour vérifier
          </div>
        </div>
      )}

      {/* Footer */}
      {template.footer.custom_text && (
        <div className="text-center text-xs mt-4 border-t border-dashed border-gray-400 pt-2">
          {template.footer.custom_text}
        </div>
      )}

      <div className="text-center text-xs mt-4">
        Merci de votre visite !
      </div>
    </div>
  );
}