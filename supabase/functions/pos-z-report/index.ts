import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface POSZRequest {
  date: string;
  outlet_id?: string;
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

    const { date, outlet_id }: POSZRequest = await req.json();

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

    // Get POS sessions for the date
    const sessionsQuery = supabase
      .from('pos_sessions')
      .select(`
        id,
        session_number,
        outlet_name,
        status,
        opening_cash,
        closing_cash,
        opened_at,
        closed_at,
        pos_users(display_name)
      `)
      .eq('org_id', orgId)
      .gte('opened_at', `${date}T00:00:00`)
      .lte('opened_at', `${date}T23:59:59`);

    if (outlet_id) {
      sessionsQuery.eq('outlet_id', outlet_id);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;
    if (sessionsError) throw sessionsError;

    const reports = [];

    for (const session of sessions || []) {
      // Get orders for this session
      const { data: orders, error: ordersError } = await supabase
        .from('pos_orders')
        .select(`
          id,
          order_number,
          total_amount,
          payment_method,
          pos_order_items(
            id,
            quantity,
            unit_price,
            total_price,
            pos_products(name, category)
          )
        `)
        .eq('org_id', orgId)
        .eq('session_id', session.id)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Get payment methods summary
      const paymentMethods = {};
      orders?.forEach(order => {
        const method = order.payment_method || 'cash';
        if (!paymentMethods[method]) {
          paymentMethods[method] = {
            amount: 0,
            transaction_count: 0
          };
        }
        paymentMethods[method].amount += order.total_amount;
        paymentMethods[method].transaction_count += 1;
      });

      // Get product categories summary
      const categories = {};
      orders?.forEach(order => {
        order.pos_order_items?.forEach(item => {
          const categoryName = item.pos_products?.category || 'Autres';
          if (!categories[categoryName]) {
            categories[categoryName] = {
              items_sold: 0,
              revenue: 0
            };
          }
          categories[categoryName].items_sold += item.quantity;
          categories[categoryName].revenue += item.total_price;
        });
      });

      const totalSales = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalTransactions = orders?.length || 0;

      // Convert to arrays with percentages
      const paymentMethodsArray = Object.entries(paymentMethods).map(([method, data]: [string, any]) => ({
        method_code: method,
        method_name: method === 'cash' ? 'Espèces' : 
                     method === 'card' ? 'Carte bancaire' : 
                     method === 'mobile_money' ? 'Mobile Money' : method,
        amount: data.amount,
        transaction_count: data.transaction_count,
        percentage: totalSales > 0 ? (data.amount / totalSales) * 100 : 0
      }));

      const categoriesArray = Object.entries(categories).map(([category, data]: [string, any]) => ({
        category_name: category,
        items_sold: data.items_sold,
        revenue: data.revenue,
        percentage: totalSales > 0 ? (data.revenue / totalSales) * 100 : 0
      }));

      reports.push({
        outlet_id: session.outlet_id || session.id,
        outlet_name: session.outlet_name,
        session_id: session.session_number,
        cashier_name: session.pos_users?.display_name,
        date: date,
        opening_cash: session.opening_cash || 0,
        closing_cash: session.closing_cash || 0,
        total_sales: totalSales,
        total_transactions: totalTransactions,
        payment_methods: paymentMethodsArray,
        product_categories: categoriesArray,
        discounts_total: 0, // TODO: implement discounts
        tax_total: totalSales * 0.18, // 18% VAT
        net_sales: totalSales * 0.82,
        status: session.status
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        reports,
        summary: {
          total_outlets: reports.length,
          total_sales: reports.reduce((sum, r) => sum + r.total_sales, 0),
          total_transactions: reports.reduce((sum, r) => sum + r.total_transactions, 0),
          open_sessions: reports.filter(r => r.status === 'open').length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in pos-z-report function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});