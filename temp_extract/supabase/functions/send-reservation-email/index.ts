import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ReservationConfirmationEmail } from "./_templates/reservation-confirmation.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReservationEmailRequest {
  reservationId: string;
  action: 'confirmation' | 'modification' | 'cancellation';
  sendPdf?: boolean;
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { reservationId, action, sendPdf, customMessage }: ReservationEmailRequest = await req.json();

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

    // Fetch hotel settings for email branding
    const { data: hotelSettings } = await supabase
      .from('hotel_settings')
      .select('*')
      .eq('org_id', reservation.org_id)
      .single();

    // Generate email content based on action
    let emailSubject = "";
    let emailTemplate = null;

    switch (action) {
      case 'confirmation':
        emailSubject = `Confirmation de réservation - ${reservation.reference || reservation.id}`;
        break;
      case 'modification':
        emailSubject = `Modification de réservation - ${reservation.reference || reservation.id}`;
        break;
      case 'cancellation':
        emailSubject = `Annulation de réservation - ${reservation.reference || reservation.id}`;
        break;
    }

    // Render email template
    const emailHtml = await renderAsync(
      React.createElement(ReservationConfirmationEmail, {
        reservation,
        hotelSettings,
        action,
        customMessage,
      })
    );

    // Generate PDF if requested
    let pdfAttachment = null;
    if (sendPdf) {
      try {
        // Call PDF generation function
        const pdfResponse = await supabase.functions.invoke('generate-reservation-pdf', {
          body: { reservationId, action }
        });

        if (pdfResponse.data) {
          pdfAttachment = {
            filename: `reservation-${reservation.reference || reservation.id}.pdf`,
            content: pdfResponse.data.pdf,
            type: 'application/pdf'
          };
        }
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        // Continue without PDF if generation fails
      }
    }

    // Send email
    const emailData: any = {
      from: hotelSettings?.email ? 
        `${hotelSettings.name} <reservations@${hotelSettings.email.split('@')[1]}>` : 
        'Réservations <noreply@africasuite.com>',
      to: [reservation.guest_email],
      subject: emailSubject,
      html: emailHtml,
    };

    // Add PDF attachment if available
    if (pdfAttachment) {
      emailData.attachments = [pdfAttachment];
    }

    const { data: emailResult, error: emailError } = await resend.emails.send(emailData);

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log the email action
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: reservationId,
        org_id: reservation.org_id,
        action_type: 'email_sent',
        action_description: `Email ${action} envoyé à ${reservation.guest_email}`,
        new_values: {
          email_id: emailResult.id,
          action,
          recipient: reservation.guest_email,
          subject: emailSubject,
          sent_at: new Date().toISOString()
        }
      });

    console.log("Email sent successfully:", {
      reservationId,
      action,
      recipient: reservation.guest_email,
      emailId: emailResult.id
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult.id,
        recipient: reservation.guest_email,
        action
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-reservation-email function:", error);
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