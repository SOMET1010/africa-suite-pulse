// Core report types for AfricaSuite
export interface ClosureReport {
  id: string;
  org_id: string;
  report_date: string;
  report_type: 'daily' | 'monthly';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  generated_by: string;
  created_at: string;
  completed_at?: string;
  file_url?: string;
  errors?: string[];
  warnings?: string[];
}

export interface PreClosureCheck {
  id: string;
  check_type: 'invoices' | 'folios' | 'pos_tickets' | 'payments' | 'housekeeping';
  description: string;
  status: 'passed' | 'warning' | 'failed';
  details?: string;
  count?: number;
  action_required?: string;
}

export interface POSZReport {
  outlet_id: string;
  outlet_name: string;
  session_id?: string;
  cashier_name?: string;
  date: string;
  opening_cash: number;
  closing_cash: number;
  total_sales: number;
  total_transactions: number;
  payment_methods: POSPaymentMethod[];
  product_categories: POSCategory[];
  discounts_total: number;
  tax_total: number;
  net_sales: number;
  status: 'open' | 'closed';
}

export interface POSPaymentMethod {
  method_code: string;
  method_name: string;
  amount: number;
  transaction_count: number;
  percentage: number;
}

export interface POSCategory {
  category_name: string;
  items_sold: number;
  revenue: number;
  percentage: number;
}

export interface MainCoranteEntry {
  date: string;
  folio_number: number;
  service_family: string;
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_ht: number;
  vat_rate: number;
  vat_amount: number;
  total_ttc: number;
  guest_name?: string;
  room_number?: string;
  reservation_reference?: string;
}

export interface MainCoranteReport {
  date_from: string;
  date_to: string;
  total_ht: number;
  total_vat: number;
  total_ttc: number;
  entries_by_family: {
    [family: string]: {
      total_ht: number;
      total_vat: number;
      total_ttc: number;
      entries: MainCoranteEntry[];
    };
  };
  vat_summary: {
    [rate: string]: {
      base_amount: number;
      vat_amount: number;
      total_amount: number;
    };
  };
}

export interface SyscohadaExport {
  org_id: string;
  period_start: string;
  period_end: string;
  accounts: SyscohadaAccount[];
  total_debit: number;
  total_credit: number;
  export_format: 'csv' | 'xml' | 'txt';
  generated_at: string;
}

export interface SyscohadaAccount {
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  entries: SyscohadaEntry[];
}

export interface SyscohadaEntry {
  date: string;
  piece_number: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  reference?: string;
  analytical_code?: string;
}

export interface ReportPeriod {
  start_date: string;
  end_date: string;
  period_type: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  label: string;
}

export interface ExportOptions {
  format: 'pdf' | 'xlsx' | 'csv';
  include_details: boolean;
  email_recipients?: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    enabled: boolean;
  };
}

// Service families for main courante
export const SERVICE_FAMILIES = [
  { code: 'HEBERGEMENT', name: 'Hébergement', vat_rate: 18 },
  { code: 'RESTAURATION', name: 'Restauration', vat_rate: 18 },
  { code: 'BAR', name: 'Bar', vat_rate: 18 },
  { code: 'TELEPHONE', name: 'Téléphone', vat_rate: 18 },
  { code: 'MINIBAR', name: 'Mini-bar', vat_rate: 18 },
  { code: 'BLANCHISSERIE', name: 'Blanchisserie', vat_rate: 18 },
  { code: 'DIVERS', name: 'Divers', vat_rate: 18 },
  { code: 'TAXI', name: 'Transport', vat_rate: 0 },
] as const;

// SYSCOHADA account mapping
export const SYSCOHADA_MAPPING = {
  // Produits
  HEBERGEMENT: '7011', // Ventes de marchandises dans la région
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
} as const;