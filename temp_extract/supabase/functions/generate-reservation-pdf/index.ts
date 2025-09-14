import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratePDFRequest {
  reservationId: string;
  action: 'confirmation' | 'modification' | 'cancellation' | 'invoice';
  template?: 'standard' | 'luxury' | 'minimal';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reservationId, action, template = 'standard' }: GeneratePDFRequest = await req.json();

    // Fetch reservation details with enriched data
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations_with_details')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      console.error("Error fetching reservation:", reservationError);
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Fetch hotel settings for PDF branding
    const { data: hotelSettings } = await supabase
      .from('hotel_settings')
      .select('*')
      .eq('org_id', reservation.org_id)
      .single();

    // Generate PDF content based on template and action
    const pdfContent = generatePDFContent(reservation, hotelSettings, action, template);

    // For this implementation, we'll return HTML that can be converted to PDF
    // In a real implementation, you might use a library like Puppeteer or jsPDF
    const htmlContent = generateHTMLForPDF(reservation, hotelSettings, action, template);

    // Simulate PDF generation (in real implementation, convert HTML to PDF)
    const pdfBuffer = Buffer.from(htmlContent, 'utf8').toString('base64');

    // Log the PDF generation
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: reservationId,
        org_id: reservation.org_id,
        action_type: 'pdf_generated',
        action_description: `PDF ${action} généré (template: ${template})`,
        new_values: {
          action,
          template,
          generated_at: new Date().toISOString()
        }
      });

    console.log("PDF generated successfully:", {
      reservationId,
      action,
      template
    });

    return new Response(
      JSON.stringify({
        success: true,
        pdf: pdfBuffer,
        filename: `reservation-${reservation.reference || reservation.id}-${action}.pdf`,
        reservationId,
        action,
        template
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in generate-reservation-pdf function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generatePDFContent(reservation: any, hotelSettings: any, action: string, template: string) {
  // Generate structured content for PDF
  return {
    header: {
      hotelName: hotelSettings?.name || 'AfricaSuite Hotel',
      logo: hotelSettings?.logo_url,
      address: hotelSettings?.address,
      contact: {
        phone: hotelSettings?.phone,
        email: hotelSettings?.email,
        website: hotelSettings?.website
      }
    },
    reservation: {
      reference: reservation.reference || reservation.id,
      guest: {
        name: reservation.guest_name,
        email: reservation.guest_email,
        phone: reservation.guest_phone
      },
      stay: {
        arrival: reservation.date_arrival,
        departure: reservation.date_departure,
        plannedTime: reservation.planned_time,
        nights: Math.ceil(
          (new Date(reservation.date_departure).getTime() - new Date(reservation.date_arrival).getTime()) 
          / (1000 * 60 * 60 * 24)
        )
      },
      room: {
        number: reservation.room_number,
        type: reservation.room_type
      },
      occupancy: {
        adults: reservation.adults,
        children: reservation.children
      },
      pricing: {
        total: reservation.rate_total,
        currency: 'F CFA'
      },
      status: reservation.status,
      specialRequests: reservation.special_requests,
      notes: reservation.notes
    },
    action,
    template,
    generatedAt: new Date().toISOString()
  };
}

function generateHTMLForPDF(reservation: any, hotelSettings: any, action: string, template: string): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActionTitle = () => {
    switch (action) {
      case 'confirmation':
        return 'Confirmation de Réservation';
      case 'modification':
        return 'Modification de Réservation';
      case 'cancellation':
        return 'Annulation de Réservation';
      case 'invoice':
        return 'Facture de Réservation';
      default:
        return 'Document de Réservation';
    }
  };

  const nights = Math.ceil(
    (new Date(reservation.date_departure).getTime() - new Date(reservation.date_arrival).getTime()) 
    / (1000 * 60 * 60 * 24)
  );

  const getStatusText = () => {
    switch (reservation.status) {
      case 'confirmed': return 'Confirmée';
      case 'option': return 'En option';
      case 'present': return 'Client présent';
      case 'cancelled': return 'Annulée';
      default: return reservation.status;
    }
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${getActionTitle()} - ${reservation.reference || reservation.id}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .hotel-name {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 10px 0;
        }
        .hotel-address {
            color: #6b7280;
            font-size: 14px;
        }
        .action-title {
            background: ${action === 'confirmation' ? '#22c55e' : action === 'modification' ? '#f59e0b' : '#ef4444'};
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 30px 0;
            border-radius: 8px;
        }
        .content {
            max-width: 800px;
            margin: 0 auto;
        }
        .section {
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #374151;
            margin: 0 0 15px 0;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
        }
        .detail-row {
            display: flex;
            margin-bottom: 8px;
            align-items: center;
        }
        .detail-label {
            width: 150px;
            font-weight: 600;
            color: #6b7280;
            flex-shrink: 0;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 500;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            background: ${reservation.status === 'confirmed' ? '#dcfce7' : reservation.status === 'option' ? '#fef3c7' : '#fecaca'};
            color: ${reservation.status === 'confirmed' ? '#166534' : reservation.status === 'option' ? '#92400e' : '#991b1b'};
        }
        .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .contact-info {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        .contact-item {
            margin: 5px;
            font-size: 12px;
        }
        .special-requests {
            background: #fefce8;
            border: 1px solid #eab308;
            border-left: 4px solid #eab308;
            padding: 12px;
            border-radius: 4px;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .content { max-width: 100%; }
        }
    </style>
</head>
<body>
    <div class="content">
        <!-- Header -->
        <div class="header">
            <div class="hotel-name">${hotelSettings?.name || 'AfricaSuite Hotel'}</div>
            ${hotelSettings?.address ? `<div class="hotel-address">${hotelSettings.address}</div>` : ''}
        </div>

        <!-- Action Title -->
        <div class="action-title">${getActionTitle()}</div>

        <!-- Guest Information -->
        <div class="section">
            <div class="section-title">Informations Client</div>
            <div class="detail-row">
                <div class="detail-label">Nom :</div>
                <div class="detail-value">${reservation.guest_name}</div>
            </div>
            ${reservation.guest_email ? `
            <div class="detail-row">
                <div class="detail-label">Email :</div>
                <div class="detail-value">${reservation.guest_email}</div>
            </div>
            ` : ''}
            ${reservation.guest_phone ? `
            <div class="detail-row">
                <div class="detail-label">Téléphone :</div>
                <div class="detail-value">${reservation.guest_phone}</div>
            </div>
            ` : ''}
        </div>

        <!-- Reservation Details -->
        <div class="section">
            <div class="section-title">Détails de la Réservation</div>
            <div class="detail-row">
                <div class="detail-label">Référence :</div>
                <div class="detail-value">${reservation.reference || reservation.id}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Statut :</div>
                <div class="detail-value"><span class="status">${getStatusText()}</span></div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date d'arrivée :</div>
                <div class="detail-value">${formatDate(reservation.date_arrival)}${reservation.planned_time ? ` à ${reservation.planned_time}` : ''}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date de départ :</div>
                <div class="detail-value">${formatDate(reservation.date_departure)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Durée du séjour :</div>
                <div class="detail-value">${nights} nuit${nights > 1 ? 's' : ''}</div>
            </div>
        </div>

        <!-- Room Information -->
        <div class="section">
            <div class="section-title">Informations Chambre</div>
            ${reservation.room_number ? `
            <div class="detail-row">
                <div class="detail-label">Numéro :</div>
                <div class="detail-value">Chambre ${reservation.room_number}</div>
            </div>
            ` : ''}
            ${reservation.room_type ? `
            <div class="detail-row">
                <div class="detail-label">Type :</div>
                <div class="detail-value">${reservation.room_type}</div>
            </div>
            ` : ''}
            <div class="detail-row">
                <div class="detail-label">Occupants :</div>
                <div class="detail-value">${reservation.adults} adulte${reservation.adults > 1 ? 's' : ''}${reservation.children > 0 ? `, ${reservation.children} enfant${reservation.children > 1 ? 's' : ''}` : ''}</div>
            </div>
        </div>

        <!-- Pricing -->
        ${reservation.rate_total ? `
        <div class="section">
            <div class="section-title">Tarification</div>
            <div class="detail-row">
                <div class="detail-label">Tarif total :</div>
                <div class="detail-value total-amount">${reservation.rate_total.toLocaleString()} F CFA</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Tarif par nuit :</div>
                <div class="detail-value">${Math.round(reservation.rate_total / nights).toLocaleString()} F CFA</div>
            </div>
        </div>
        ` : ''}

        <!-- Special Requests -->
        ${reservation.special_requests ? `
        <div class="section">
            <div class="section-title">Demandes Spéciales</div>
            <div class="special-requests">
                ${reservation.special_requests}
            </div>
        </div>
        ` : ''}

        <!-- Contact Information -->
        <div class="section">
            <div class="section-title">Contact Hôtel</div>
            <div class="contact-info">
                ${hotelSettings?.phone ? `<div class="contact-item">📞 ${hotelSettings.phone}</div>` : ''}
                ${hotelSettings?.email ? `<div class="contact-item">✉️ ${hotelSettings.email}</div>` : ''}
                ${hotelSettings?.website ? `<div class="contact-item">🌐 ${hotelSettings.website}</div>` : ''}
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</div>
            <div>Merci de votre confiance - ${hotelSettings?.name || 'AfricaSuite Hotel'}</div>
        </div>
    </div>
</body>
</html>
  `;
}

serve(handler);