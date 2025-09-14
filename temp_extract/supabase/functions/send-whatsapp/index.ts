import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  reservationId: string;
  action: 'confirmation' | 'modification' | 'cancellation' | 'checkin';
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!whatsappToken || !whatsappPhoneId) {
      return new Response(
        JSON.stringify({ error: "WhatsApp credentials not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { reservationId, action, customMessage }: WhatsAppRequest = await req.json();

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

    // Fetch hotel settings for WhatsApp branding
    const { data: hotelSettings } = await supabase
      .from('hotel_settings')
      .select('*')
      .eq('org_id', reservation.org_id)
      .single();

    // Clean phone number (remove spaces, dashes, parentheses and ensure it starts with country code)
    let phoneNumber = reservation.guest_phone?.replace(/[\s\-\(\)]/g, '');
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: "Guest phone number not available" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Add country code if missing (assuming Côte d'Ivoire +225 by default)
    if (!phoneNumber.startsWith('+')) {
      if (!phoneNumber.startsWith('225')) {
        phoneNumber = '225' + phoneNumber;
      }
      phoneNumber = '+' + phoneNumber;
    }

    // Generate WhatsApp message based on action
    let message = "";
    const hotelName = hotelSettings?.name || "Notre Hôtel";
    const reference = reservation.reference || reservation.id;
    
    switch (action) {
      case 'confirmation':
        message = `🏨 *Confirmation de réservation*\n\n` +
                 `Bonjour ${reservation.guest_name} !\n\n` +
                 `Votre réservation *${reference}* est confirmée au ${hotelName}.\n\n` +
                 `📅 *Dates:* ${reservation.date_arrival} au ${reservation.date_departure}\n` +
                 `🏠 *Chambre:* ${reservation.room_number}\n` +
                 `👥 *Occupants:* ${reservation.adults} adulte(s)${reservation.children ? `, ${reservation.children} enfant(s)` : ''}\n\n` +
                 `Merci de votre confiance ! 🙏`;
        break;
      case 'modification':
        message = `🔄 *Modification de réservation*\n\n` +
                 `Bonjour ${reservation.guest_name} !\n\n` +
                 `Votre réservation *${reference}* a été modifiée.\n\n` +
                 `📅 *Nouvelles dates:* ${reservation.date_arrival} au ${reservation.date_departure}\n` +
                 `🏠 *Chambre:* ${reservation.room_number}\n\n` +
                 `${hotelName}`;
        break;
      case 'cancellation':
        message = `❌ *Annulation de réservation*\n\n` +
                 `Bonjour ${reservation.guest_name},\n\n` +
                 `Votre réservation *${reference}* a été annulée.\n\n` +
                 `Nous espérons vous accueillir bientôt !\n\n` +
                 `${hotelName}`;
        break;
      case 'checkin':
        message = `🎉 *Bienvenue au ${hotelName} !*\n\n` +
                 `Bonjour ${reservation.guest_name} !\n\n` +
                 `Votre chambre *${reservation.room_number}* est prête ! 🗝️\n\n` +
                 `Nous vous souhaitons un excellent séjour ! 🌟`;
        break;
    }

    if (customMessage) {
      message += `\n\n📝 *Message:* ${customMessage}`;
    }

    // Send WhatsApp message using Meta WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      }),
    });

    const whatsappResult = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error("WhatsApp API Error:", whatsappResult);
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp message", details: whatsappResult }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log the WhatsApp action
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: reservationId,
        org_id: reservation.org_id,
        action_type: 'whatsapp_sent',
        action_description: `WhatsApp ${action} envoyé à ${phoneNumber}`,
        new_values: {
          whatsapp_id: whatsappResult.messages?.[0]?.id,
          action,
          recipient: phoneNumber,
          message: message,
          sent_at: new Date().toISOString()
        }
      });

    console.log("WhatsApp sent successfully:", {
      reservationId,
      action,
      recipient: phoneNumber,
      messageId: whatsappResult.messages?.[0]?.id
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: whatsappResult.messages?.[0]?.id,
        recipient: phoneNumber,
        action
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-whatsapp function:", error);
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

serve(handler);