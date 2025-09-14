import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FNEInvoicePayload {
  orderId: string;
  orgId: string;
  orderNumber: string;
  totalAmount: number;
  taxAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate: number;
  }>;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  timestamp: string;
}

interface FNEApiResponse {
  success: boolean;
  fne_invoice_id?: string;
  fne_reference_number?: string;
  qr_code?: string;
  error_code?: string;
  error_message?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Simulation de l'API DGI pour développement
async function simulateDGIAPI(payload: FNEInvoicePayload): Promise<FNEApiResponse> {
  console.log('Simulating DGI API call with payload:', JSON.stringify(payload, null, 2));
  
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simuler parfois des erreurs (10% de chance)
  if (Math.random() < 0.1) {
    return {
      success: false,
      error_code: 'DGI_TIMEOUT',
      error_message: 'Timeout lors de la communication avec les services DGI'
    };
  }
  
  // Générer des données fictives pour le test
  const fne_invoice_id = `FNE${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const fne_reference_number = `REF-${payload.orderNumber}-${Date.now()}`;
  const qr_code = `https://dgi.gouv.ci/verify?id=${fne_invoice_id}&ref=${fne_reference_number}`;
  
  return {
    success: true,
    fne_invoice_id,
    fne_reference_number,
    qr_code
  };
}

async function submitInvoiceToDGI(payload: FNEInvoicePayload): Promise<FNEApiResponse> {
  const startTime = Date.now();
  
  try {
    // Pour le développement, utiliser la simulation
    // En production, remplacer par l'appel réel à l'API DGI
    const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';
    
    let result: FNEApiResponse;
    
    if (isDevelopment) {
      result = await simulateDGIAPI(payload);
    } else {
      // Code pour l'API DGI réelle (à implémenter selon la spec officielle)
      const dgiApiUrl = Deno.env.get('DGI_API_URL') ?? 'https://api.dgi.gouv.ci/fne/v1';
      const dgiApiKey = Deno.env.get('DGI_API_KEY');
      
      if (!dgiApiKey) {
        throw new Error('DGI_API_KEY not configured');
      }
      
      const response = await fetch(`${dgiApiUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dgiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: payload.orderNumber,
          total_amount: payload.totalAmount,
          tax_amount: payload.taxAmount,
          items: payload.items,
          customer: payload.customer,
          timestamp: payload.timestamp
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        result = {
          success: false,
          error_code: `HTTP_${response.status}`,
          error_message: `Erreur API DGI: ${errorText}`
        };
      } else {
        const dgiResponse = await response.json();
        result = {
          success: true,
          fne_invoice_id: dgiResponse.invoice_id,
          fne_reference_number: dgiResponse.reference_number,
          qr_code: dgiResponse.qr_code
        };
      }
    }
    
    // Logger l'appel API
    const responseTime = Date.now() - startTime;
    await logApiCall(
      payload.orgId,
      payload.orderId,
      'submit_invoice',
      payload,
      result,
      responseTime
    );
    
    return result;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorResult: FNEApiResponse = {
      success: false,
      error_code: 'NETWORK_ERROR',
      error_message: error instanceof Error ? error.message : 'Erreur réseau inconnue'
    };
    
    await logApiCall(
      payload.orgId,
      payload.orderId,
      'submit_invoice',
      payload,
      errorResult,
      responseTime
    );
    
    return errorResult;
  }
}

async function logApiCall(
  orgId: string,
  orderId: string,
  operationType: string,
  request: any,
  response: FNEApiResponse,
  responseTime: number
) {
  try {
    await supabase.from('fne_api_logs').insert({
      org_id: orgId,
      order_id: orderId,
      api_endpoint: '/fne/invoices',
      http_method: 'POST',
      request_payload: request,
      response_status: response.success ? 200 : 400,
      response_body: response,
      response_time_ms: responseTime,
      fne_invoice_id: response.fne_invoice_id,
      fne_reference_number: response.fne_reference_number,
      operation_type: operationType,
      success: response.success,
      error_code: response.error_code,
      error_message: response.error_message,
      ntp_synchronized: true, // À implémenter avec un service NTP réel
      ntp_offset_ms: 0
    });
  } catch (error) {
    console.error('Failed to log API call:', error);
  }
}

async function updateOrderFNEStatus(
  orderId: string,
  orgId: string,
  result: FNEApiResponse
) {
  const updateData: any = {
    fne_status: result.success ? 'submitted' : 'error',
    fne_submitted_at: new Date().toISOString()
  };
  
  if (result.success) {
    updateData.fne_invoice_id = result.fne_invoice_id;
    updateData.fne_reference_number = result.fne_reference_number;
    updateData.fne_qr_code = result.qr_code;
    updateData.fne_validated_at = new Date().toISOString();
  } else {
    updateData.fne_error_message = result.error_message;
  }
  
  const { error } = await supabase
    .from('pos_orders')
    .update(updateData)
    .eq('id', orderId)
    .eq('org_id', orgId);
  
  if (error) {
    console.error('Failed to update order FNE status:', error);
    throw error;
  }
}

async function addToPendingQueue(
  orderId: string,
  orgId: string,
  payload: FNEInvoicePayload,
  priority: number = 1
) {
  const { error } = await supabase
    .from('fne_pending_invoices')
    .insert({
      org_id: orgId,
      order_id: orderId,
      invoice_payload: payload,
      priority,
      status: 'pending'
    });
  
  if (error) {
    console.error('Failed to add to pending queue:', error);
    throw error;
  }
}

async function processPendingInvoices() {
  console.log('Processing pending FNE invoices...');
  
  const { data: pendingInvoices, error } = await supabase
    .from('fne_pending_invoices')
    .select('*')
    .eq('status', 'pending')
    .or(`next_retry_at.is.null,next_retry_at.lte.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10);
  
  if (error) {
    console.error('Failed to fetch pending invoices:', error);
    return;
  }
  
  for (const invoice of pendingInvoices || []) {
    try {
      // Marquer comme en cours de traitement
      await supabase
        .from('fne_pending_invoices')
        .update({ 
          status: 'processing',
          processing_timeout: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min timeout
        })
        .eq('id', invoice.id);
      
      const result = await submitInvoiceToDGI(invoice.invoice_payload);
      
      if (result.success) {
        // Succès - mettre à jour la commande et supprimer de la queue
        await updateOrderFNEStatus(invoice.order_id, invoice.org_id, result);
        await supabase
          .from('fne_pending_invoices')
          .update({ 
            status: 'success',
            processed_at: new Date().toISOString()
          })
          .eq('id', invoice.id);
        
        console.log(`Successfully processed invoice ${invoice.order_id}`);
      } else {
        // Échec - programmer un retry
        await supabase.rpc('schedule_fne_retry', {
          p_pending_invoice_id: invoice.id,
          p_error_message: result.error_message,
          p_error_code: result.error_code
        });
        
        console.log(`Failed to process invoice ${invoice.order_id}, scheduled retry`);
      }
      
    } catch (error) {
      console.error(`Error processing invoice ${invoice.id}:`, error);
      
      // En cas d'erreur inattendue, programmer un retry
      await supabase.rpc('schedule_fne_retry', {
        p_pending_invoice_id: invoice.id,
        p_error_message: error instanceof Error ? error.message : 'Erreur inconnue',
        p_error_code: 'UNEXPECTED_ERROR'
      });
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { action, ...payload } = await req.json();
    
    switch (action) {
      case 'submit_invoice': {
        const fnePayload = payload as FNEInvoicePayload;
        
        try {
          const result = await submitInvoiceToDGI(fnePayload);
          
          if (result.success) {
            // Succès immédiat
            await updateOrderFNEStatus(fnePayload.orderId, fnePayload.orgId, result);
          } else {
            // Échec - ajouter à la queue pour retry
            await addToPendingQueue(fnePayload.orderId, fnePayload.orgId, fnePayload, 2);
          }
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
          
        } catch (error) {
          // Erreur réseau - ajouter à la queue offline
          await addToPendingQueue(fnePayload.orderId, fnePayload.orgId, fnePayload, 3);
          
          return new Response(JSON.stringify({
            success: false,
            error_code: 'QUEUED_FOR_RETRY',
            error_message: 'Facture ajoutée à la queue pour traitement ultérieur'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      case 'process_pending': {
        // Traitement des factures en attente (appelé par cron ou manuellement)
        await processPendingInvoices();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        return new Response(JSON.stringify({
          success: false,
          error_message: 'Action non supportée'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
  } catch (error) {
    console.error('Error in fne-connector:', error);
    return new Response(JSON.stringify({
      success: false,
      error_message: error instanceof Error ? error.message : 'Erreur interne'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});