import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MainCoranteRequest {
  start_date: string;
  end_date: string;
}

const SERVICE_FAMILIES = [
  { code: 'HEBERGEMENT', name: 'Hébergement', vat_rate: 18 },
  { code: 'RESTAURATION', name: 'Restauration', vat_rate: 18 },
  { code: 'BAR', name: 'Bar', vat_rate: 18 },
  { code: 'TELEPHONE', name: 'Téléphone', vat_rate: 18 },
  { code: 'MINIBAR', name: 'Mini-bar', vat_rate: 18 },
  { code: 'BLANCHISSERIE', name: 'Blanchisserie', vat_rate: 18 },
  { code: 'DIVERS', name: 'Divers', vat_rate: 18 },
  { code: 'TAXI', name: 'Transport', vat_rate: 0 },
];

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

    const { start_date, end_date }: MainCoranteRequest = await req.json();

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

    // Get invoice items (services)
    const { data: invoiceItems, error: itemsError } = await supabase
      .from('invoice_items')
      .select(`
        *,
        invoices(
          id,
          guest_name,
          room_number,
          check_in_date,
          check_out_date
        )
      `)
      .eq('org_id', orgId)
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`)
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    // Get reservation services
    const { data: reservationServices, error: servicesError } = await supabase
      .from('reservation_services')
      .select(`
        *,
        reservations(
          id,
          reference,
          guests(first_name, last_name),
          rooms(number)
        ),
        services(code, label)
      `)
      .eq('org_id', orgId)
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`)
      .eq('is_applied', true)
      .order('created_at', { ascending: true });

    if (servicesError) throw servicesError;

    // Map service codes to families
    const getServiceFamily = (serviceCode: string) => {
      const upperCode = serviceCode.toUpperCase();
      
      if (upperCode.includes('HEBERG') || upperCode.includes('CHAMBRE') || upperCode.includes('NUIT')) {
        return 'HEBERGEMENT';
      }
      if (upperCode.includes('RESTAURANT') || upperCode.includes('REPAS') || upperCode.includes('PETIT')) {
        return 'RESTAURATION';
      }
      if (upperCode.includes('BAR') || upperCode.includes('BOISSON')) {
        return 'BAR';
      }
      if (upperCode.includes('TEL') || upperCode.includes('PHONE')) {
        return 'TELEPHONE';
      }
      if (upperCode.includes('MINI') || upperCode.includes('FRIGO')) {
        return 'MINIBAR';
      }
      if (upperCode.includes('BLANC') || upperCode.includes('LESSIVE')) {
        return 'BLANCHISSERIE';
      }
      if (upperCode.includes('TAXI') || upperCode.includes('TRANSPORT')) {
        return 'TAXI';
      }
      
      return 'DIVERS';
    };

    // Process entries
    const allEntries = [];
    
    // Process invoice items
    invoiceItems?.forEach(item => {
      const family = getServiceFamily(item.service_code);
      const familyInfo = SERVICE_FAMILIES.find(f => f.code === family);
      const vatRate = familyInfo?.vat_rate || 18;
      
      const totalHT = item.total_price;
      const vatAmount = (totalHT * vatRate) / 100;
      const totalTTC = totalHT + vatAmount;

      allEntries.push({
        date: item.created_at,
        folio_number: item.folio_number,
        service_family: family,
        service_code: item.service_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_ht: totalHT,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_ttc: totalTTC,
        guest_name: item.invoices?.guest_name,
        room_number: item.invoices?.room_number,
        reservation_reference: null
      });
    });

    // Process reservation services
    reservationServices?.forEach(service => {
      const family = getServiceFamily(service.services?.code || 'DIVERS');
      const familyInfo = SERVICE_FAMILIES.find(f => f.code === family);
      const vatRate = familyInfo?.vat_rate || 18;
      
      const totalHT = service.total_price;
      const vatAmount = (totalHT * vatRate) / 100;
      const totalTTC = totalHT + vatAmount;

      const guestName = service.reservations?.guests ? 
        `${service.reservations.guests.first_name} ${service.reservations.guests.last_name}` : 
        null;

      allEntries.push({
        date: service.created_at,
        folio_number: service.folio_number,
        service_family: family,
        service_code: service.services?.code || 'UNKNOWN',
        description: service.services?.label || 'Service',
        quantity: service.quantity,
        unit_price: service.unit_price,
        total_ht: totalHT,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_ttc: totalTTC,
        guest_name: guestName,
        room_number: service.reservations?.rooms?.number,
        reservation_reference: service.reservations?.reference
      });
    });

    // Group by family
    const entriesByFamily = allEntries.reduce((acc, entry) => {
      const family = entry.service_family;
      
      if (!acc[family]) {
        acc[family] = {
          total_ht: 0,
          total_vat: 0,
          total_ttc: 0,
          entries: []
        };
      }
      
      acc[family].total_ht += entry.total_ht;
      acc[family].total_vat += entry.vat_amount;
      acc[family].total_ttc += entry.total_ttc;
      acc[family].entries.push(entry);
      
      return acc;
    }, {});

    // Calculate VAT summary
    const vatSummary = allEntries.reduce((acc, entry) => {
      const rate = entry.vat_rate.toString();
      
      if (!acc[rate]) {
        acc[rate] = {
          base_amount: 0,
          vat_amount: 0,
          total_amount: 0
        };
      }
      
      acc[rate].base_amount += entry.total_ht;
      acc[rate].vat_amount += entry.vat_amount;
      acc[rate].total_amount += entry.total_ttc;
      
      return acc;
    }, {});

    // Calculate totals
    const totalHT = allEntries.reduce((sum, entry) => sum + entry.total_ht, 0);
    const totalVAT = allEntries.reduce((sum, entry) => sum + entry.vat_amount, 0);
    const totalTTC = allEntries.reduce((sum, entry) => sum + entry.total_ttc, 0);

    const report = {
      date_from: start_date,
      date_to: end_date,
      total_ht: totalHT,
      total_vat: totalVAT,
      total_ttc: totalTTC,
      entries_by_family: entriesByFamily,
      vat_summary: vatSummary
    };

    return new Response(
      JSON.stringify({
        success: true,
        report
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in main-courante-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});