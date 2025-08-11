import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DuplicateReservationRequest {
  originalReservationId: string;
  modifications?: {
    date_arrival?: string;
    date_departure?: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    room_id?: string;
    adults?: number;
    children?: number;
    special_requests?: string;
    notes?: string;
  };
  createAsOption?: boolean;
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

    const { 
      originalReservationId, 
      modifications = {}, 
      createAsOption = true 
    }: DuplicateReservationRequest = await req.json();

    // Fetch original reservation
    const { data: originalReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', originalReservationId)
      .single();

    if (fetchError || !originalReservation) {
      console.error("Error fetching original reservation:", fetchError);
      return new Response(
        JSON.stringify({ error: "Original reservation not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate new reference
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase();
    const newReference = `DUP-${timestamp}-${randomSuffix}`;

    // Prepare new reservation data
    const newReservationData = {
      org_id: originalReservation.org_id,
      reference: newReference,
      guest_id: originalReservation.guest_id,
      
      // Apply modifications or keep original values
      guest_name: modifications.guest_name || originalReservation.guest_name,
      guest_email: modifications.guest_email || originalReservation.guest_email,
      guest_phone: modifications.guest_phone || originalReservation.guest_phone,
      
      date_arrival: modifications.date_arrival || originalReservation.date_arrival,
      date_departure: modifications.date_departure || originalReservation.date_departure,
      planned_time: originalReservation.planned_time,
      
      room_id: modifications.room_id || originalReservation.room_id,
      adults: modifications.adults || originalReservation.adults,
      children: modifications.children || originalReservation.children,
      
      rate_total: originalReservation.rate_total,
      
      // Status - create as option by default, or keep original
      status: createAsOption ? 'option' : originalReservation.status,
      
      source: originalReservation.source,
      source_reference: `DUP:${originalReservation.reference || originalReservation.id}`,
      
      special_requests: modifications.special_requests || originalReservation.special_requests,
      notes: modifications.notes || `Dupliqué depuis: ${originalReservation.reference || originalReservation.id}${modifications.notes ? ` - ${modifications.notes}` : ''}`,
      
      // Pricing and contract info
      tariff_id: originalReservation.tariff_id,
      allotment_id: originalReservation.allotment_id,
      group_id: originalReservation.group_id,
      promotion_code: originalReservation.promotion_code,
      original_rate: originalReservation.original_rate,
      discount_amount: originalReservation.discount_amount,
      cancellation_policy_id: originalReservation.cancellation_policy_id,
      
      // Mark as duplicate
      is_duplicate_from: originalReservationId,
      
      created_by: originalReservation.created_by,
    };

    // Check for conflicts if room and dates are specified
    if (newReservationData.room_id && newReservationData.date_arrival && newReservationData.date_departure) {
      const { data: conflicts } = await supabase
        .rpc('pms_validate_move', {
          p_res: '00000000-0000-0000-0000-000000000000', // Dummy ID for new reservation
          p_room: newReservationData.room_id
        });

      if (conflicts && !conflicts.ok) {
        console.warn("Room conflict detected, proceeding without room assignment");
        newReservationData.room_id = null;
      }
    }

    // Create the duplicated reservation
    const { data: newReservation, error: createError } = await supabase
      .from('reservations')
      .insert(newReservationData)
      .select()
      .single();

    if (createError) {
      console.error("Error creating duplicated reservation:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create duplicated reservation", details: createError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Log the duplication action on original reservation
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: originalReservationId,
        org_id: originalReservation.org_id,
        action_type: 'duplicated',
        action_description: `Réservation dupliquée vers ${newReference}`,
        new_values: {
          duplicate_id: newReservation.id,
          duplicate_reference: newReference,
          modifications: Object.keys(modifications).length > 0 ? modifications : null,
          created_at: new Date().toISOString()
        }
      });

    // Log the creation action on new reservation
    await supabase
      .from('reservation_logs')
      .insert({
        reservation_id: newReservation.id,
        org_id: newReservation.org_id,
        action_type: 'created_by_duplication',
        action_description: `Créée par duplication de ${originalReservation.reference || originalReservationId}`,
        new_values: {
          original_id: originalReservationId,
          original_reference: originalReservation.reference,
          modifications: Object.keys(modifications).length > 0 ? modifications : null,
          created_at: new Date().toISOString()
        }
      });

    // Fetch the created reservation with full details
    const { data: fullReservation, error: fetchFullError } = await supabase
      .from('reservations_with_details')
      .select('*')
      .eq('id', newReservation.id)
      .single();

    console.log("Reservation duplicated successfully:", {
      originalId: originalReservationId,
      newId: newReservation.id,
      newReference,
      modifications: Object.keys(modifications),
      createAsOption
    });

    return new Response(
      JSON.stringify({
        success: true,
        original: {
          id: originalReservationId,
          reference: originalReservation.reference
        },
        duplicate: fullReservation || newReservation,
        modifications: modifications,
        conflicts_resolved: newReservationData.room_id !== (modifications.room_id || originalReservation.room_id)
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in duplicate-reservation function:", error);
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
