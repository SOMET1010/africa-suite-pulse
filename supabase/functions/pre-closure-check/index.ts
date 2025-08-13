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
    const checks: PreClosureCheck[] = [];

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
    const checkDate = new Date(date);

    // Check 1: Unpaid invoices
    const { data: unpaidInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('id, total_amount, guest_name')
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .lte('due_date', date);

    if (!invoicesError) {
      checks.push({
        id: 'unpaid-invoices',
        check_type: 'invoices',
        description: 'Factures impayées en attente',
        status: unpaidInvoices.length > 0 ? 'warning' : 'passed',
        count: unpaidInvoices.length,
        details: unpaidInvoices.length > 0 ? 
          `${unpaidInvoices.length} facture(s) impayée(s) détectée(s)` :
          'Toutes les factures sont réglées',
        action_required: unpaidInvoices.length > 0 ? 
          'Vérifier les règlements ou émettre des relances' : undefined
      });
    }

    // Check 2: Open POS tickets
    const { data: openTickets, error: ticketsError } = await supabase
      .from('pos_orders')
      .select('id, total_amount, status')
      .eq('org_id', orgId)
      .in('status', ['draft', 'sent', 'preparing'])
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`);

    if (!ticketsError) {
      checks.push({
        id: 'open-pos-tickets',
        check_type: 'pos_tickets',
        description: 'Tickets POS non finalisés',
        status: openTickets.length > 0 ? 'failed' : 'passed',
        count: openTickets.length,
        details: openTickets.length > 0 ?
          `${openTickets.length} ticket(s) POS encore ouvert(s)` :
          'Tous les tickets POS sont finalisés',
        action_required: openTickets.length > 0 ?
          'Finaliser ou annuler les tickets ouverts' : undefined
      });
    }

    // Check 3: Unassigned reservations
    const { data: unassignedReservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, reference, guest_id, room_id')
      .eq('org_id', orgId)
      .eq('date_arrival', date)
      .eq('status', 'confirmed')
      .is('room_id', null);

    if (!reservationsError) {
      checks.push({
        id: 'unassigned-reservations',
        check_type: 'reservations',
        description: 'Réservations non assignées',
        status: unassignedReservations.length > 0 ? 'warning' : 'passed',
        count: unassignedReservations.length,
        details: unassignedReservations.length > 0 ?
          `${unassignedReservations.length} réservation(s) sans chambre assignée` :
          'Toutes les réservations sont assignées',
        action_required: unassignedReservations.length > 0 ?
          'Assigner les chambres aux réservations' : undefined
      });
    }

    // Check 4: Dirty rooms not cleaned
    const { data: dirtyRooms, error: roomsError } = await supabase
      .from('housekeeping_tasks')
      .select('id, room_number, task_type')
      .eq('org_id', orgId)
      .in('status', ['pending', 'in_progress'])
      .eq('task_type', 'cleaning')
      .gte('created_at', `${date}T00:00:00`);

    if (!roomsError) {
      checks.push({
        id: 'dirty-rooms',
        check_type: 'housekeeping',
        description: 'Chambres en attente de nettoyage',
        status: dirtyRooms.length > 0 ? 'warning' : 'passed',
        count: dirtyRooms.length,
        details: dirtyRooms.length > 0 ?
          `${dirtyRooms.length} chambre(s) en attente de nettoyage` :
          'Toutes les chambres sont nettoyées',
        action_required: dirtyRooms.length > 0 ?
          'Finaliser le nettoyage des chambres' : undefined
      });
    }

    // Check 5: Open POS sessions
    const { data: openSessions, error: sessionsError } = await supabase
      .from('pos_sessions')
      .select('id, session_number, cashier_id')
      .eq('org_id', orgId)
      .eq('status', 'open')
      .gte('started_at', `${date}T00:00:00`);

    if (!sessionsError) {
      checks.push({
        id: 'open-pos-sessions',
        check_type: 'pos_sessions',
        description: 'Sessions POS ouvertes',
        status: openSessions.length > 0 ? 'failed' : 'passed',
        count: openSessions.length,
        details: openSessions.length > 0 ?
          `${openSessions.length} session(s) POS encore ouverte(s)` :
          'Toutes les sessions POS sont fermées',
        action_required: openSessions.length > 0 ?
          'Fermer toutes les sessions POS' : undefined
      });
    }

    // Check 6: Payment discrepancies
    const { data: paymentTransactions } = await supabase
      .from('payment_transactions')
      .select('amount, method_id, payment_methods(code)')
      .eq('org_id', orgId)
      .gte('created_at', `${date}T00:00:00`)
      .lt('created_at', `${date}T23:59:59`);

    const cashPayments = paymentTransactions?.filter(p => 
      p.payment_methods?.code === 'CASH'
    ).reduce((sum, p) => sum + p.amount, 0) || 0;

    checks.push({
      id: 'cash-balance',
      check_type: 'payments',
      description: 'Contrôle caisse espèces',
      status: 'passed', // Always passed for now, manual verification needed
      details: `Total espèces théorique: ${cashPayments.toLocaleString('fr-FR')} XOF`,
      action_required: 'Vérifier le solde physique de la caisse'
    });

    return new Response(
      JSON.stringify({
        success: true,
        checks,
        can_close: !checks.some(check => check.status === 'failed')
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