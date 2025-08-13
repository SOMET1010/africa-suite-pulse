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

    // Get outlets
    let outletFilter = supabase
      .from('pos_outlets')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true);

    if (outlet_id) {
      outletFilter = outletFilter.eq('id', outlet_id);
    }

    const { data: outlets, error: outletsError } = await outletFilter;

    if (outletsError) throw outletsError;

    const reports = [];

    for (const outlet of outlets) {
      // Get sessions for this outlet and date
      const { data: sessions } = await supabase
        .from('pos_sessions')
        .select('*, app_users(full_name)')
        .eq('org_id', orgId)
        .eq('outlet_id', outlet.id)
        .gte('started_at', `${date}T00:00:00`)
        .lt('started_at', `${date}T23:59:59`)
        .order('started_at', { ascending: false });

      // Get orders for this outlet and date
      const { data: orders } = await supabase
        .from('pos_orders')
        .select(`
          *,
          pos_order_items(*)
        `)
        .eq('org_id', orgId)
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`)
        .neq('status', 'cancelled');

      // Get payment transactions for POS orders
      const orderIds = orders?.map(o => o.id) || [];
      let paymentTransactions = [];
      
      if (orderIds.length > 0) {
        const { data: transactions } = await supabase
          .from('payment_transactions')
          .select(`
            *,
            payment_methods(code, label)
          `)
          .eq('org_id', orgId)
          .in('reference', orderIds.map(id => `POS-${id}`))
          .gte('created_at', `${date}T00:00:00`)
          .lt('created_at', `${date}T23:59:59`);
        
        paymentTransactions = transactions || [];
      }

      // Calculate totals
      const totalSales = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalTransactions = orders?.length || 0;
      const discountsTotal = orders?.reduce((sum, order) => sum + (order.discount_amount || 0), 0) || 0;
      const taxTotal = orders?.reduce((sum, order) => sum + (order.tax_amount || 0), 0) || 0;

      // Group payments by method
      const paymentMethods = paymentTransactions.reduce((acc, transaction) => {
        const methodCode = transaction.payment_methods?.code || 'UNKNOWN';
        const methodName = transaction.payment_methods?.label || 'Inconnu';
        
        if (!acc[methodCode]) {
          acc[methodCode] = {
            method_code: methodCode,
            method_name: methodName,
            amount: 0,
            transaction_count: 0,
            percentage: 0
          };
        }
        
        acc[methodCode].amount += transaction.amount;
        acc[methodCode].transaction_count += 1;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate percentages
      Object.values(paymentMethods).forEach((method: any) => {
        method.percentage = totalSales > 0 ? (method.amount / totalSales) * 100 : 0;
      });

      // Group products by category
      const productCategories = {};
      orders?.forEach(order => {
        order.pos_order_items?.forEach(item => {
          // For now, use a simple category extraction or default
          const categoryName = item.product_name?.split(' ')[0] || 'Divers';
          
          if (!productCategories[categoryName]) {
            productCategories[categoryName] = {
              category_name: categoryName,
              items_sold: 0,
              revenue: 0,
              percentage: 0
            };
          }
          
          productCategories[categoryName].items_sold += item.quantity;
          productCategories[categoryName].revenue += item.total_price;
        });
      });

      // Calculate category percentages
      Object.values(productCategories).forEach((category: any) => {
        category.percentage = totalSales > 0 ? (category.revenue / totalSales) * 100 : 0;
      });

      // Get latest session for cash amounts
      const latestSession = sessions?.[0];

      const report = {
        outlet_id: outlet.id,
        outlet_name: outlet.name,
        session_id: latestSession?.session_number,
        cashier_name: latestSession?.app_users?.full_name,
        date,
        opening_cash: latestSession?.opening_cash || 0,
        closing_cash: latestSession?.closing_cash || 0,
        total_sales: totalSales,
        total_transactions: totalTransactions,
        payment_methods: Object.values(paymentMethods),
        product_categories: Object.values(productCategories),
        discounts_total: discountsTotal,
        tax_total: taxTotal,
        net_sales: totalSales - discountsTotal,
        status: latestSession?.status || 'closed'
      };

      reports.push(report);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reports
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