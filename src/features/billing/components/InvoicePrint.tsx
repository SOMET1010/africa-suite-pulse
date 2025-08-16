import React, { forwardRef, useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useOrgId } from "@/core/auth/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger.service";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

interface InvoiceData {
  id: string;
  number: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  reservation_id?: string;
  room_number?: string;
  room_type?: string;
  check_in_date?: string;
  check_out_date?: string;
  nights_count?: number;
  adults_count?: number;
  children_count?: number;
  reference?: string;
  notes?: string;
  items: InvoiceItem[];
}

interface HotelSettings {
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
}

interface InvoicePrintProps {
  invoice: InvoiceData;
}

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ invoice }, ref) => {
    const { orgId } = useOrgId();
    const [hotelSettings, setHotelSettings] = useState<HotelSettings | null>(null);

    useEffect(() => {
      const loadHotelSettings = async () => {
        if (!orgId) return;
        
        try {
          const { data } = await supabase
            .from('hotel_settings')
            .select('*')
            .eq('org_id', orgId)
            .single();
          
          if (data) {
            setHotelSettings(data);
          }
        } catch (error) {
          logger.error('Error loading hotel settings', { error, orgId });
        }
      };

      loadHotelSettings();
    }, [orgId]);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    };

    return (
      <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto" style={{ minHeight: '297mm' }}>
        {/* Header with Hotel Info */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
          <div className="flex-1">
            {hotelSettings?.logo_url && (
              <img 
                src={hotelSettings.logo_url} 
                alt="Logo" 
                className="h-16 mb-4 object-contain"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {hotelSettings?.name || 'Nom de l\'hôtel'}
            </h1>
            <div className="text-gray-600 space-y-1">
              {hotelSettings?.address && (
                <p>{hotelSettings.address}</p>
              )}
              {hotelSettings?.city && (
                <p>{hotelSettings.city}</p>
              )}
              <div className="flex gap-4 text-sm">
                {hotelSettings?.phone && (
                  <span>Tél: {hotelSettings.phone}</span>
                )}
                {hotelSettings?.email && (
                  <span>Email: {hotelSettings.email}</span>
                )}
              </div>
              {hotelSettings?.website && (
                <p className="text-sm">{hotelSettings.website}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">FACTURE</h2>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-lg font-semibold">N° {invoice.number}</p>
              <p className="text-sm text-gray-600">
                Date: {formatDate(invoice.issue_date)}
              </p>
              {invoice.due_date && (
                <p className="text-sm text-gray-600">
                  Échéance: {formatDate(invoice.due_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Client and Stay Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Client Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">CLIENT</h3>
            <div className="bg-gray-50 p-4 rounded">
              {invoice.guest_name && (
                <p className="font-semibold text-gray-800">{invoice.guest_name}</p>
              )}
              {invoice.guest_address && (
                <p className="text-gray-600">{invoice.guest_address}</p>
              )}
              {invoice.guest_email && (
                <p className="text-gray-600">{invoice.guest_email}</p>
              )}
              {invoice.guest_phone && (
                <p className="text-gray-600">{invoice.guest_phone}</p>
              )}
            </div>
          </div>

          {/* Stay Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">SÉJOUR</h3>
            <div className="bg-gray-50 p-4 rounded space-y-2">
              {invoice.room_number && (
                <p><span className="font-medium">Chambre:</span> {invoice.room_number} {invoice.room_type && `(${invoice.room_type})`}</p>
              )}
              {invoice.check_in_date && (
                <p><span className="font-medium">Arrivée:</span> {formatDate(invoice.check_in_date)}</p>
              )}
              {invoice.check_out_date && (
                <p><span className="font-medium">Départ:</span> {formatDate(invoice.check_out_date)}</p>
              )}
              {invoice.nights_count && (
                <p><span className="font-medium">Nuits:</span> {invoice.nights_count}</p>
              )}
              {(invoice.adults_count || invoice.children_count) && (
                <p><span className="font-medium">Occupants:</span> {invoice.adults_count} adulte{invoice.adults_count > 1 ? 's' : ''}{invoice.children_count > 0 && `, ${invoice.children_count} enfant${invoice.children_count > 1 ? 's' : ''}`}</p>
              )}
              {invoice.reservation_id && (
                <p><span className="font-medium">Réservation:</span> {invoice.reservation_id}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left">Description</th>
                <th className="border border-gray-300 p-3 text-center w-20">Qté</th>
                <th className="border border-gray-300 p-3 text-right w-24">Prix unit.</th>
                <th className="border border-gray-300 p-3 text-center w-16">TVA</th>
                <th className="border border-gray-300 p-3 text-right w-28">Total HT</th>
                <th className="border border-gray-300 p-3 text-right w-28">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item) => {
                const totalHT = item.quantity * item.unit_price;
                const totalTTC = totalHT * (1 + item.tax_rate / 100);
                return (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-3">{item.description}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.tax_rate}%</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(totalHT)}</td>
                    <td className="border border-gray-300 p-3 text-right font-semibold">{formatCurrency(totalTTC)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="bg-gray-50 p-4 rounded space-y-2">
              <div className="flex justify-between">
                <span>Sous-total HT:</span>
                <span>{formatCurrency(invoice.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA:</span>
                <span>{formatCurrency(invoice.tax_amount || 0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>TOTAL TTC:</span>
                <span>{formatCurrency(invoice.total_amount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">NOTES</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Merci de votre confiance</p>
          {hotelSettings?.name && (
            <p className="mt-2 font-medium">{hotelSettings.name}</p>
          )}
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";