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

const SYSCOHADA_MAPPING = {
  // Products
  HEBERGEMENT: '7011',
  RESTAURATION: '7012',
  BAR: '7013',
  DIVERS: '7018',
  
  // VAT
  TVA_COLLECTEE: '4432',
  TVA_DEDUCTIBLE: '4451',
  
  // Clients
  CLIENTS: '411',
  CLIENTS_DOUTEUX: '416',
  
  // Cash
  CAISSE: '571',
  BANQUE: '521',
  MOBILE_MONEY: '5711',
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

    const { start_date, end_date, format = 'csv', preview = false, export: shouldExport = false }: SyscohadaRequest = await req.json();

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

    // Collect accounting entries
    const accounts = {};

    // Helper function to add entry
    const addEntry = (accountCode: string, accountName: string, entry: any) => {
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
      
      accounts[accountCode].debit_amount += entry.debit_amount || 0;
      accounts[accountCode].credit_amount += entry.credit_amount || 0;
      accounts[accountCode].balance = accounts[accountCode].debit_amount - accounts[accountCode].credit_amount;
      accounts[accountCode].entries.push(entry);
    };

    // 1. Sales (Invoice items) - Credit sales accounts
    const { data: invoiceItems } = await supabase
      .from('invoice_items')
      .select(`
        *,
        invoices(id, number, guest_name)
      `)
      .eq('org_id', orgId)
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`);

    invoiceItems?.forEach(item => {
      const serviceFamily = getServiceFamily(item.service_code);
      const accountCode = SYSCOHADA_MAPPING[serviceFamily] || SYSCOHADA_MAPPING.DIVERS;
      const vatRate = 18; // Standard VAT rate
      
      const totalHT = item.total_price;
      const vatAmount = (totalHT * vatRate) / 100;
      
      // Credit sales account (HT)
      addEntry(accountCode, `Ventes ${serviceFamily}`, {
        date: item.created_at,
        piece_number: item.invoices?.number || `INV-${item.invoice_id}`,
        description: item.description,
        debit_amount: 0,
        credit_amount: totalHT,
        reference: item.invoices?.guest_name
      });
      
      // Credit VAT account
      if (vatAmount > 0) {
        addEntry(SYSCOHADA_MAPPING.TVA_COLLECTEE, 'TVA collectée', {
          date: item.created_at,
          piece_number: item.invoices?.number || `INV-${item.invoice_id}`,
          description: `TVA ${vatRate}% - ${item.description}`,
          debit_amount: 0,
          credit_amount: vatAmount,
          reference: item.invoices?.guest_name
        });
      }
      
      // Debit clients account (TTC)
      addEntry(SYSCOHADA_MAPPING.CLIENTS, 'Clients', {
        date: item.created_at,
        piece_number: item.invoices?.number || `INV-${item.invoice_id}`,
        description: `Facturation ${item.invoices?.guest_name}`,
        debit_amount: totalHT + vatAmount,
        credit_amount: 0,
        reference: item.invoices?.guest_name
      });
    });

    // 2. Payments - Debit cash/bank accounts, Credit clients
    const { data: payments } = await supabase
      .from('payment_transactions')
      .select(`
        *,
        payment_methods(code, label, kind),
        invoices(number, guest_name)
      `)
      .eq('org_id', orgId)
      .gte('created_at', `${start_date}T00:00:00`)
      .lte('created_at', `${end_date}T23:59:59`);

    payments?.forEach(payment => {
      const methodKind = payment.payment_methods?.kind;
      let accountCode = SYSCOHADA_MAPPING.CAISSE;
      let accountName = 'Caisse';
      
      if (methodKind === 'bank_transfer' || methodKind === 'card') {
        accountCode = SYSCOHADA_MAPPING.BANQUE;
        accountName = 'Banques';
      } else if (methodKind === 'mobile_money') {
        accountCode = SYSCOHADA_MAPPING.MOBILE_MONEY;
        accountName = 'Mobile Money';
      }
      
      // Debit cash/bank account
      addEntry(accountCode, accountName, {
        date: payment.created_at,
        piece_number: payment.reference || `PAY-${payment.id}`,
        description: `Règlement ${payment.payment_methods?.label}`,
        debit_amount: payment.amount,
        credit_amount: 0,
        reference: payment.invoices?.guest_name
      });
      
      // Credit clients account
      addEntry(SYSCOHADA_MAPPING.CLIENTS, 'Clients', {
        date: payment.created_at,
        piece_number: payment.reference || `PAY-${payment.id}`,
        description: `Règlement ${payment.invoices?.guest_name}`,
        debit_amount: 0,
        credit_amount: payment.amount,
        reference: payment.invoices?.guest_name
      });
    });

    // Calculate totals
    const totalDebit = Object.values(accounts).reduce((sum: number, account: any) => sum + account.debit_amount, 0);
    const totalCredit = Object.values(accounts).reduce((sum: number, account: any) => sum + account.credit_amount, 0);

    const exportData = {
      org_id: orgId,
      period_start: start_date,
      period_end: end_date,
      accounts: Object.values(accounts),
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

    if (shouldExport) {
      // Generate file content based on format
      let fileContent = '';
      let fileName = `syscohada-${start_date}-${end_date}.${format}`;
      
      if (format === 'csv') {
        fileContent = generateCSV(exportData);
      } else if (format === 'xml') {
        fileContent = generateXML(exportData);
      } else if (format === 'txt') {
        fileContent = generateTXT(exportData);
      }
      
      // In a real implementation, you would upload this to storage
      // For now, return the content directly
      return new Response(
        JSON.stringify({
          success: true,
          file_url: `data:text/${format};base64,${btoa(fileContent)}`,
          file_name: fileName
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
        export: exportData
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

function getServiceFamily(serviceCode: string): string {
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
}

function generateCSV(exportData: any): string {
  let csv = 'Compte,Nom Compte,Date,Piece,Description,Debit,Credit,Reference\n';
  
  exportData.accounts.forEach((account: any) => {
    account.entries.forEach((entry: any) => {
      csv += `"${account.account_code}","${account.account_name}","${entry.date}","${entry.piece_number}","${entry.description}","${entry.debit_amount}","${entry.credit_amount}","${entry.reference || ''}"\n`;
    });
  });
  
  return csv;
}

function generateXML(exportData: any): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<syscohada>\n';
  xml += `<period start="${exportData.period_start}" end="${exportData.period_end}"/>\n`;
  xml += '<accounts>\n';
  
  exportData.accounts.forEach((account: any) => {
    xml += `<account code="${account.account_code}" name="${account.account_name}">\n`;
    account.entries.forEach((entry: any) => {
      xml += `<entry date="${entry.date}" piece="${entry.piece_number}" debit="${entry.debit_amount}" credit="${entry.credit_amount}" description="${entry.description}" reference="${entry.reference || ''}"/>\n`;
    });
    xml += '</account>\n';
  });
  
  xml += '</accounts>\n</syscohada>';
  return xml;
}

function generateTXT(exportData: any): string {
  let txt = `EXPORT SYSCOHADA - ${exportData.period_start} au ${exportData.period_end}\n`;
  txt += '='.repeat(60) + '\n\n';
  
  exportData.accounts.forEach((account: any) => {
    txt += `${account.account_code} - ${account.account_name}\n`;
    txt += '-'.repeat(40) + '\n';
    
    account.entries.forEach((entry: any) => {
      txt += `${entry.date} | ${entry.piece_number} | ${entry.description} | D:${entry.debit_amount} | C:${entry.credit_amount}\n`;
    });
    
    txt += `\nSolde: ${account.balance}\n\n`;
  });
  
  txt += `TOTAUX: Débit=${exportData.total_debit} | Crédit=${exportData.total_credit}\n`;
  return txt;
}