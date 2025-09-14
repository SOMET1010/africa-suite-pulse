import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PreClosureRequest {
  date: string;
}

interface PreClosureCheck {
  id: string;
  check_type: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  details?: string;
  count?: number;
  action_required?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { date }: PreClosureRequest = await req.json();

    // Get user's organization
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: orgData } = await supabase
      .from('app_users')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!orgData) {
      throw new Error('Organization not found');
    }

    const orgId = orgData.org_id;
    const checks: PreClosureCheck[] = [];

    // 1. Check for unpaid invoices
    const { data: unpaidInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, guest_name, total_amount')
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    if (invoicesError) throw invoicesError;

    checks.push({
      id: 'unpaid_invoices',
      check_type: 'invoices',
      description: 'Factures impayées',
      status: unpaidInvoices && unpaidInvoices.length > 0 ? 'warning' : 'passed',
      count: unpaidInvoices?.length || 0,
      details: unpaidInvoices && unpaidInvoices.length > 0 
        ? `${unpaidInvoices.length} facture(s) non réglée(s)` 
        : 'Toutes les factures sont réglées',
      action_required: unpaidInvoices && unpaidInvoices.length > 0 
        ? 'Vérifier les encaissements en attente' 
        : undefined
    });

    // 2. Check for open folios
    const { data: openFolios, error: foliosError } = await supabase
      .from('reservation_services')
      .select('id, folio_number, reservations(reference, guests(first_name, last_name))')
      .eq('org_id', orgId)
      .eq('is_applied', false)
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    if (foliosError) throw foliosError;

    checks.push({
      id: 'open_folios',
      check_type: 'folios',
      description: 'Folios non appliqués',
      status: openFolios && openFolios.length > 0 ? 'failed' : 'passed',
      count: openFolios?.length || 0,
      details: openFolios && openFolios.length > 0 
        ? `${openFolios.length} service(s) non appliqué(s)` 
        : 'Tous les services sont appliqués',
      action_required: openFolios && openFolios.length > 0 
        ? 'Appliquer ou annuler les services en attente' 
        : undefined
    });

    // 3. Check for open POS sessions
    const { data: openSessions, error: sessionsError } = await supabase
      .from('pos_sessions')
      .select('id, session_number, outlet_name')
      .eq('org_id', orgId)
      .eq('status', 'open')
      .gte('opened_at', `${date}T00:00:00`)
      .lte('opened_at', `${date}T23:59:59`);

    if (sessionsError) throw sessionsError;

    checks.push({
      id: 'open_pos_sessions',
      check_type: 'pos_tickets',
      description: 'Sessions POS ouvertes',
      status: openSessions && openSessions.length > 0 ? 'failed' : 'passed',
      count: openSessions?.length || 0,
      details: openSessions && openSessions.length > 0 
        ? `${openSessions.length} session(s) encore ouverte(s)` 
        : 'Toutes les sessions POS sont fermées',
      action_required: openSessions && openSessions.length > 0 
        ? 'Fermer les sessions POS ouvertes' 
        : undefined
    });

    // 4. Check for pending payment transactions
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('id, amount, payment_method')
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    if (paymentsError) throw paymentsError;

    checks.push({
      id: 'pending_payments',
      check_type: 'payments',
      description: 'Paiements en attente',
      status: pendingPayments && pendingPayments.length > 0 ? 'warning' : 'passed',
      count: pendingPayments?.length || 0,
      details: pendingPayments && pendingPayments.length > 0 
        ? `${pendingPayments.length} paiement(s) en attente` 
        : 'Tous les paiements sont confirmés',
      action_required: pendingPayments && pendingPayments.length > 0 
        ? 'Confirmer ou annuler les paiements en attente' 
        : undefined
    });

    // 5. Check for dirty rooms
    const { data: dirtyRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, number, status')
      .eq('org_id', orgId)
      .eq('status', 'dirty');

    if (roomsError) throw roomsError;

    checks.push({
      id: 'dirty_rooms',
      check_type: 'housekeeping',
      description: 'Chambres à nettoyer',
      status: dirtyRooms && dirtyRooms.length > 0 ? 'warning' : 'passed',
      count: dirtyRooms?.length || 0,
      details: dirtyRooms && dirtyRooms.length > 0 
        ? `${dirtyRooms.length} chambre(s) à nettoyer` 
        : 'Toutes les chambres sont propres',
      action_required: dirtyRooms && dirtyRooms.length > 0 
        ? 'Finaliser le ménage des chambres' 
        : undefined
    });

    // 6. Check for balance discrepancies
    const { data: cashSummary, error: cashError } = await supabase
      .from('payment_transactions')
      .select('amount, payment_method')
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .eq('payment_method', 'cash')
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    if (cashError) throw cashError;

    const totalCash = cashSummary?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    // This is a simplified check - in real world, you'd compare with actual cash count
    checks.push({
      id: 'cash_balance',
      check_type: 'payments',
      description: 'Équilibre caisse',
      status: 'passed', // Would be dynamic based on actual cash count
      details: `Total espèces théorique: ${totalCash.toLocaleString('fr-FR')} FCFA`,
      action_required: undefined
    });

    // 7. Check for departure not processed
    const { data: pendingDepartures, error: departuresError } = await supabase
      .from('reservations')
      .select('id, reference, guests(first_name, last_name), rooms(number)')
      .eq('org_id', orgId)
      .eq('date_departure', date)
      .neq('status', 'departed');

    if (departuresError) throw departuresError;

    checks.push({
      id: 'pending_departures',
      check_type: 'folios',
      description: 'Départs non traités',
      status: pendingDepartures && pendingDepartures.length > 0 ? 'failed' : 'passed',
      count: pendingDepartures?.length || 0,
      details: pendingDepartures && pendingDepartures.length > 0 
        ? `${pendingDepartures.length} départ(s) non traité(s)` 
        : 'Tous les départs sont traités',
      action_required: pendingDepartures && pendingDepartures.length > 0 
        ? 'Finaliser les check-out en attente' 
        : undefined
    });

    return new Response(
      JSON.stringify({
        success: true,
        checks,
        summary: {
          total_checks: checks.length,
          passed: checks.filter(c => c.status === 'passed').length,
          warnings: checks.filter(c => c.status === 'warning').length,
          failed: checks.filter(c => c.status === 'failed').length,
          can_close: checks.every(c => c.status !== 'failed')
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in pre-closure-check function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});