import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyscohadaRequest {
  start_date: string;
  end_date: string;
  format?: 'csv' | 'xml' | 'txt';
  preview?: boolean;
  export?: boolean;
}

// SYSCOHADA account mapping
const SYSCOHADA_MAPPING = {
  // Produits
  HEBERGEMENT: '7011', // Ventes dans la région
  RESTAURATION: '7012',
  BAR: '7013',
  DIVERS: '7018',
  
  // TVA
  TVA_COLLECTEE: '4432', // TVA collectée
  TVA_DEDUCTIBLE: '4451', // TVA déductible
  
  // Clients
  CLIENTS: '411', // Clients
  CLIENTS_DOUTEUX: '416', // Clients douteux
  
  // Encaissements
  CAISSE: '571', // Caisse
  BANQUE: '521', // Banques
  MOBILE_MONEY: '5711', // Caisse mobile money
};

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

    const { start_date, end_date, format = 'csv', preview = false, export: doExport = false }: SyscohadaRequest = await req.json();

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

    // Map service family to SYSCOHADA account
    const getServiceFamily = (serviceCode: string) => {
      const upperCode = serviceCode.toUpperCase();
      
      if (upperCode.includes('HEBERG') || upperCode.includes('CHAMBRE')) {
        return 'HEBERGEMENT';
      }
      if (upperCode.includes('RESTAURANT') || upperCode.includes('REPAS')) {
        return 'RESTAURATION';
      }
      if (upperCode.includes('BAR') || upperCode.includes('BOISSON')) {
        return 'BAR';
      }
      
      return 'DIVERS';
    };

    // Get invoice items for the period
    const { data: invoiceItems, error: itemsError } = await supabase
      .from('invoice_items')
      .select(`
        *,
        invoices(
          id,
          invoice_number,
          guest_name,
          created_at
        )
      `)
      .eq('org_id', orgId)
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`)
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    // Get payment transactions
    const { data: payments, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`)
      .order('created_at', { ascending: true });

    if (paymentsError) throw paymentsError;

    // Build accounting entries
    const accounts = {};

    // Process sales (credit revenue accounts)
    invoiceItems?.forEach((item, index) => {
      const family = getServiceFamily(item.service_code);
      const accountCode = SYSCOHADA_MAPPING[family];
      const accountName = `Ventes ${family.toLowerCase()}`;
      
      if (!accounts[accountCode]) {
        accounts[accountCode] = {
          account_code: accountCode,
          account_name: accountName,
          debit_amount: 0,
          credit_amount: 0,
          balance: 0,
          entries: []
        };
      }

      const totalHT = item.total_price;
      const vatAmount = totalHT * 0.18;
      const totalTTC = totalHT + vatAmount;

      // Credit revenue account (sales)
      accounts[accountCode].credit_amount += totalHT;
      accounts[accountCode].entries.push({
        date: item.created_at,
        piece_number: item.invoices?.invoice_number || `INV-${index + 1}`,
        description: `${item.description} - ${item.invoices?.guest_name || 'Client'}`,
        debit_amount: 0,
        credit_amount: totalHT,
        reference: `${item.service_code}-${item.id}`
      });

      // Credit VAT account
      const vatAccountCode = SYSCOHADA_MAPPING.TVA_COLLECTEE;
      if (!accounts[vatAccountCode]) {
        accounts[vatAccountCode] = {
          account_code: vatAccountCode,
          account_name: 'TVA collectée',
          debit_amount: 0,
          credit_amount: 0,
          balance: 0,
          entries: []
        };
      }

      accounts[vatAccountCode].credit_amount += vatAmount;
      accounts[vatAccountCode].entries.push({
        date: item.created_at,
        piece_number: item.invoices?.invoice_number || `INV-${index + 1}`,
        description: `TVA 18% - ${item.description}`,
        debit_amount: 0,
        credit_amount: vatAmount,
        reference: `TVA-${item.id}`
      });

      // Debit customer account
      const clientAccountCode = SYSCOHADA_MAPPING.CLIENTS;
      if (!accounts[clientAccountCode]) {
        accounts[clientAccountCode] = {
          account_code: clientAccountCode,
          account_name: 'Clients',
          debit_amount: 0,
          credit_amount: 0,
          balance: 0,
          entries: []
        };
      }

      accounts[clientAccountCode].debit_amount += totalTTC;
      accounts[clientAccountCode].entries.push({
        date: item.created_at,
        piece_number: item.invoices?.invoice_number || `INV-${index + 1}`,
        description: `Facture - ${item.invoices?.guest_name || 'Client'}`,
        debit_amount: totalTTC,
        credit_amount: 0,
        reference: `CLI-${item.id}`
      });
    });

    // Process payments (credit cash/bank accounts, debit clients)
    payments?.forEach((payment, index) => {
      let accountCode;
      let accountName;

      switch (payment.payment_method) {
        case 'cash':
          accountCode = SYSCOHADA_MAPPING.CAISSE;
          accountName = 'Caisse';
          break;
        case 'card':
        case 'bank_transfer':
          accountCode = SYSCOHADA_MAPPING.BANQUE;
          accountName = 'Banques';
          break;
        case 'mobile_money':
          accountCode = SYSCOHADA_MAPPING.MOBILE_MONEY;
          accountName = 'Caisse Mobile Money';
          break;
        default:
          accountCode = SYSCOHADA_MAPPING.CAISSE;
          accountName = 'Caisse';
      }

      if (!accounts[accountCode]) {
        accounts[accountCode] = {
          account_code: accountCode,
          account_name: accountName,
          debit_amount: 0,
          credit_amount: 0,
          balance: 0,
          entries: []
        };
      }

      // Debit cash/bank account
      accounts[accountCode].debit_amount += payment.amount;
      accounts[accountCode].entries.push({
        date: payment.created_at,
        piece_number: payment.reference || `PAY-${index + 1}`,
        description: `Encaissement ${payment.payment_method}`,
        debit_amount: payment.amount,
        credit_amount: 0,
        reference: `ENC-${payment.id}`
      });

      // Credit customer account (payment received)
      const clientAccountCode = SYSCOHADA_MAPPING.CLIENTS;
      if (accounts[clientAccountCode]) {
        accounts[clientAccountCode].credit_amount += payment.amount;
        accounts[clientAccountCode].entries.push({
          date: payment.created_at,
          piece_number: payment.reference || `PAY-${index + 1}`,
          description: `Règlement client`,
          debit_amount: 0,
          credit_amount: payment.amount,
          reference: `REG-${payment.id}`
        });
      }
    });

    // Calculate balances
    Object.values(accounts).forEach((account: any) => {
      account.balance = account.debit_amount - account.credit_amount;
    });

    const accountsArray = Object.values(accounts);
    const totalDebit = accountsArray.reduce((sum, acc: any) => sum + acc.debit_amount, 0);
    const totalCredit = accountsArray.reduce((sum, acc: any) => sum + acc.credit_amount, 0);

    const exportData = {
      org_id: orgId,
      period_start: start_date,
      period_end: end_date,
      accounts: accountsArray,
      total_debit: totalDebit,
      total_credit: totalCredit,
      export_format: format,
      generated_at: new Date().toISOString()
    };

    if (preview) {
      return new Response(
        JSON.stringify({
          success: true,
          export: exportData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (doExport) {
      // Generate file content based on format
      let fileContent = '';
      let contentType = 'text/plain';

      if (format === 'csv') {
        contentType = 'text/csv';
        fileContent = 'Date,Piece,Account,Description,Debit,Credit\n';
        
        accountsArray.forEach((account: any) => {
          account.entries.forEach((entry: any) => {
            fileContent += `${entry.date},${entry.piece_number},${account.account_code},${entry.description},${entry.debit_amount},${entry.credit_amount}\n`;
          });
        });
      } else if (format === 'xml') {
        contentType = 'application/xml';
        fileContent = '<?xml version="1.0" encoding="UTF-8"?>\n<syscohada_export>\n';
        
        accountsArray.forEach((account: any) => {
          fileContent += `  <account code="${account.account_code}" name="${account.account_name}">\n`;
          account.entries.forEach((entry: any) => {
            fileContent += `    <entry>\n`;
            fileContent += `      <date>${entry.date}</date>\n`;
            fileContent += `      <piece>${entry.piece_number}</piece>\n`;
            fileContent += `      <description>${entry.description}</description>\n`;
            fileContent += `      <debit>${entry.debit_amount}</debit>\n`;
            fileContent += `      <credit>${entry.credit_amount}</credit>\n`;
            fileContent += `    </entry>\n`;
          });
          fileContent += `  </account>\n`;
        });
        
        fileContent += '</syscohada_export>';
      } else {
        // TXT format
        fileContent = `EXPORT SYSCOHADA - ${start_date} au ${end_date}\n`;
        fileContent += `================================================\n\n`;
        
        accountsArray.forEach((account: any) => {
          fileContent += `COMPTE ${account.account_code} - ${account.account_name}\n`;
          fileContent += `Total Débit: ${account.debit_amount}\n`;
          fileContent += `Total Crédit: ${account.credit_amount}\n`;
          fileContent += `Solde: ${account.balance}\n\n`;
          
          account.entries.forEach((entry: any) => {
            fileContent += `  ${entry.date} ${entry.piece_number} ${entry.description} ${entry.debit_amount} ${entry.credit_amount}\n`;
          });
          
          fileContent += '\n';
        });
      }

      // In a real implementation, you would upload the file to storage and return the URL
      // For now, we'll return the content directly
      return new Response(
        JSON.stringify({
          success: true,
          file_url: `data:${contentType};base64,${btoa(fileContent)}`,
          filename: `syscohada-${start_date}-${end_date}.${format}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Specify preview=true or export=true'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in syscohada-export function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});