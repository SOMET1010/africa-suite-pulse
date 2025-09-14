import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PoliceFormRequest {
  reservationId: string;
  template?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { reservationId, template = 'default' }: PoliceFormRequest = await req.json();

    console.log('Generating police form for reservation:', reservationId);

    // Fetch reservation details with guest information
    const { data: reservation, error: resError } = await supabase
      .from('reservations_with_details')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (resError || !reservation) {
      throw new Error(`Reservation not found: ${resError?.message}`);
    }

    // Fetch hotel settings
    const { data: hotelSettings, error: hotelError } = await supabase
      .from('hotel_settings')
      .select('*')
      .eq('org_id', reservation.org_id)
      .single();

    if (hotelError) {
      console.warn('Hotel settings not found, using defaults');
    }

    // Generate police form HTML
    const policeFormHTML = generatePoliceFormHTML(reservation, hotelSettings);

    // Convert to base64 (simulating PDF generation)
    const pdfData = btoa(policeFormHTML);

    // Log the generation
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: reservationId,
        org_id: reservation.org_id,
        action_type: 'police_form_generated',
        action_description: `Police form generated (template: ${template})`,
        new_values: { template, generated_at: new Date().toISOString() }
      });

    console.log('Police form generated successfully');

    return new Response(JSON.stringify({
      success: true,
      pdf_data: pdfData,
      filename: `fiche_police_${reservation.reference || reservationId}.pdf`,
      reservation_id: reservationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating police form:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

function generatePoliceFormHTML(reservation: any, hotelSettings: any): string {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const hotelName = hotelSettings?.name || 'AfricaSuite Hotel';
  const hotelAddress = hotelSettings?.address || '';
  const hotelCity = hotelSettings?.city || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fiche de Police - ${reservation.guest_name}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.4;
          font-size: 12px;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px;
        }
        .hotel-info { 
          margin-bottom: 20px; 
          background: #f5f5f5; 
          padding: 15px; 
          border-radius: 5px;
        }
        .guest-info { 
          margin-bottom: 20px; 
        }
        .row { 
          display: flex; 
          margin-bottom: 10px; 
        }
        .label { 
          font-weight: bold; 
          width: 150px; 
          display: inline-block;
        }
        .value { 
          flex: 1; 
          border-bottom: 1px solid #ccc; 
          padding-bottom: 2px;
        }
        .section-title { 
          font-size: 14px; 
          font-weight: bold; 
          margin: 20px 0 10px 0; 
          color: #333;
          border-left: 4px solid #007bff;
          padding-left: 10px;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          font-size: 10px; 
          color: #666;
        }
        .signature-box {
          margin-top: 30px;
          border: 1px solid #ccc;
          height: 60px;
          text-align: center;
          padding-top: 20px;
          background: #fafafa;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FICHE DE POLICE</h1>
        <p>Conformément à la réglementation en vigueur</p>
      </div>

      <div class="hotel-info">
        <div class="section-title">INFORMATIONS ÉTABLISSEMENT</div>
        <div class="row">
          <span class="label">Nom de l'hôtel:</span>
          <span class="value">${hotelName}</span>
        </div>
        <div class="row">
          <span class="label">Adresse:</span>
          <span class="value">${hotelAddress} ${hotelCity}</span>
        </div>
        <div class="row">
          <span class="label">Date d'édition:</span>
          <span class="value">${formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      <div class="guest-info">
        <div class="section-title">INFORMATIONS CLIENT</div>
        <div class="row">
          <span class="label">Nom complet:</span>
          <span class="value">${reservation.guest_name || 'Non renseigné'}</span>
        </div>
        <div class="row">
          <span class="label">Email:</span>
          <span class="value">${reservation.guest_email || 'Non renseigné'}</span>
        </div>
        <div class="row">
          <span class="label">Téléphone:</span>
          <span class="value">${reservation.guest_phone || 'Non renseigné'}</span>
        </div>
        <div class="row">
          <span class="label">Référence résa:</span>
          <span class="value">${reservation.reference || 'Aucune'}</span>
        </div>
      </div>

      <div class="guest-info">
        <div class="section-title">SÉJOUR</div>
        <div class="row">
          <span class="label">Date d'arrivée:</span>
          <span class="value">${formatDate(reservation.date_arrival)}</span>
        </div>
        <div class="row">
          <span class="label">Date de départ:</span>
          <span class="value">${formatDate(reservation.date_departure)}</span>
        </div>
        <div class="row">
          <span class="label">Chambre:</span>
          <span class="value">${reservation.room_number || 'Non assignée'}</span>
        </div>
        <div class="row">
          <span class="label">Type de chambre:</span>
          <span class="value">${reservation.room_type || 'Non spécifié'}</span>
        </div>
        <div class="row">
          <span class="label">Nombre d'adultes:</span>
          <span class="value">${reservation.adults || 0}</span>
        </div>
        <div class="row">
          <span class="label">Nombre d'enfants:</span>
          <span class="value">${reservation.children || 0}</span>
        </div>
      </div>

      <div class="signature-box">
        <strong>Signature du client</strong>
      </div>

      <div class="footer">
        <p>Document généré automatiquement par AfricaSuite PMS - ${new Date().toLocaleString('fr-FR')}</p>
        <p>Ce document doit être conservé conformément à la réglementation locale</p>
      </div>
    </body>
    </html>
  `;
}

serve(handler);