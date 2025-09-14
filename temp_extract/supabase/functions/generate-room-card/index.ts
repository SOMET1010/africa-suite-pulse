import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoomCardRequest {
  reservationId: string;
  cardType?: 'magnetic' | 'qr' | 'pin';
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

    const { reservationId, cardType = 'qr', template = 'default' }: RoomCardRequest = await req.json();

    console.log('Generating room card for reservation:', reservationId, 'type:', cardType);

    // Fetch reservation details
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

    // Generate access code/data based on card type
    const accessData = generateAccessData(reservation, cardType);

    // Generate room card HTML
    const roomCardHTML = generateRoomCardHTML(reservation, hotelSettings, accessData, cardType);

    // Convert to base64 (simulating PDF generation)
    const pdfData = btoa(roomCardHTML);

    // Log the generation
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: reservationId,
        org_id: reservation.org_id,
        action_type: 'room_card_generated',
        action_description: `Room card generated (type: ${cardType}, template: ${template})`,
        new_values: { 
          card_type: cardType, 
          template, 
          access_data: accessData,
          generated_at: new Date().toISOString() 
        }
      });

    console.log('Room card generated successfully');

    return new Response(JSON.stringify({
      success: true,
      pdf_data: pdfData,
      filename: `carte_chambre_${reservation.room_number || 'non_assignee'}_${reservationId}.pdf`,
      reservation_id: reservationId,
      access_data: accessData,
      card_type: cardType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating room card:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

function generateAccessData(reservation: any, cardType: string): any {
  const roomNumber = reservation.room_number || 'XXX';
  const resId = reservation.id.slice(-6); // Last 6 chars of reservation ID
  
  switch (cardType) {
    case 'pin':
      // Generate 4-digit PIN
      return {
        type: 'pin',
        code: Math.floor(1000 + Math.random() * 9000).toString(),
        room: roomNumber
      };
    case 'qr':
      // Generate QR code data
      return {
        type: 'qr',
        data: `ROOM:${roomNumber}|RES:${resId}|EXP:${reservation.date_departure}`,
        room: roomNumber
      };
    case 'magnetic':
    default:
      // Generate magnetic stripe data
      return {
        type: 'magnetic',
        track1: `%${roomNumber}^GUEST/${reservation.guest_name.replace(' ', '/')}^${reservation.date_departure.replace('-', '')}?`,
        track2: `${roomNumber}=${reservation.date_departure.replace('-', '')}?`,
        room: roomNumber
      };
  }
}

function generateRoomCardHTML(reservation: any, hotelSettings: any, accessData: any, cardType: string): string {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const hotelName = hotelSettings?.name || 'AfricaSuite Hotel';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Carte de Chambre - ${reservation.guest_name}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .card-container {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 30px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 400px;
          margin: 50px auto;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .hotel-logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .card-title {
          font-size: 18px;
          margin-bottom: 30px;
          opacity: 0.9;
        }
        .room-info {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .room-number {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .guest-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stay-dates {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 20px;
        }
        .access-info {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
        }
        .access-code {
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          margin: 10px 0;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        .qr-placeholder {
          width: 100px;
          height: 100px;
          background: white;
          margin: 10px auto;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          font-weight: bold;
        }
        .instructions {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 20px;
          line-height: 1.4;
        }
        .footer {
          margin-top: 30px;
          font-size: 10px;
          opacity: 0.6;
        }
      </style>
    </head>
    <body>
      <div class="card-container">
        <div class="hotel-logo">${hotelName}</div>
        <div class="card-title">Carte de Chambre</div>
        
        <div class="room-info">
          <div class="room-number">Ch. ${accessData.room}</div>
          <div class="guest-name">${reservation.guest_name}</div>
          <div class="stay-dates">
            ${formatDate(reservation.date_arrival)} - ${formatDate(reservation.date_departure)}
          </div>
        </div>

        <div class="access-info">
          ${cardType === 'pin' ? `
            <div>Code d'accès PIN</div>
            <div class="access-code">${accessData.code}</div>
            <div class="instructions">
              Entrez ce code sur le clavier de la porte<br>
              Suivi de la touche #
            </div>
          ` : cardType === 'qr' ? `
            <div>Code QR d'accès</div>
            <div class="qr-placeholder">QR CODE</div>
            <div class="instructions">
              Scannez ce code QR avec le lecteur<br>
              situé près de votre chambre
            </div>
          ` : `
            <div>Carte magnétique</div>
            <div style="margin: 15px 0; font-size: 12px;">
              Track 1: ${accessData.track1}<br>
              Track 2: ${accessData.track2}
            </div>
            <div class="instructions">
              Insérez la carte dans le lecteur<br>
              et retirez-la rapidement
            </div>
          `}
        </div>

        <div class="instructions">
          <strong>Instructions importantes:</strong><br>
          • Gardez cette carte avec vous en permanence<br>
          • En cas de perte, contactez la réception<br>
          • Cette carte expire le ${formatDate(reservation.date_departure)}
        </div>

        <div class="footer">
          Généré le ${new Date().toLocaleString('fr-FR')}<br>
          AfricaSuite PMS
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);