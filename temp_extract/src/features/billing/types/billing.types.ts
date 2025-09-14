// Types stricts pour le module facturation - Phase 1 refactoring
export type BillingStatus = 'draft' | 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export type BillingCondition = 'daily' | 'stay' | 'weekly' | 'monthly';

export type GroupBillingMode = 'individual' | 'master' | 'duplicate';

export type FolioNumber = 1 | 2 | 3 | 4 | 5 | 6;

// ============= CORE ENTITIES =============

export interface InvoiceCore {
  id: string;
  org_id: string;
  number: string;
  status: BillingStatus;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceGuest {
  guest_id: string | null;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  guest_address: string | null;
}

export interface InvoiceReservation {
  reservation_id: string | null;
  room_number: string | null;
  room_type: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  nights_count: number | null;
  adults_count: number | null;
  children_count: number | null;
}

export interface InvoiceMeta {
  reference: string | null;
  description: string | null;
  notes: string | null;
  folio_number: FolioNumber;
  group_billing_mode: GroupBillingMode;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  org_id: string;
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  folio_number: FolioNumber;
  billing_condition: BillingCondition;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

// ============= COMPOSED TYPES =============

export interface Invoice extends InvoiceCore, InvoiceGuest, InvoiceReservation, InvoiceMeta {}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface InvoiceListItem {
  id: string;
  number: string;
  guest_name: string;
  status: BillingStatus;
  total_amount: number;
  issue_date: string;
  due_date: string | null;
  reference: string | null;
}

// ============= INPUT TYPES =============

export interface CreateInvoiceInput {
  // Guest info
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  guest_id?: string;
  
  // Reservation info
  reservation_id?: string;
  room_number?: string;
  room_type?: string;
  check_in_date?: string;
  check_out_date?: string;
  nights_count?: number;
  adults_count?: number;
  children_count?: number;
  
  // Invoice metadata
  reference?: string;
  description?: string;
  notes?: string;
  due_date?: string;
  folio_number?: FolioNumber;
  group_billing_mode?: GroupBillingMode;
  
  // Line items
  items: CreateInvoiceItemInput[];
}

export interface CreateInvoiceItemInput {
  service_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  folio_number?: FolioNumber;
  billing_condition?: BillingCondition;
  valid_from?: string;
  valid_until?: string;
}

export interface UpdateInvoiceInput {
  status?: BillingStatus;
  due_date?: string;
  notes?: string;
  reference?: string;
}

// ============= STATS & ANALYTICS =============

export interface BillingStats {
  today: {
    invoices_count: number;
    total_amount: number;
    paid_amount: number;
    pending_count: number;
  };
  overdue: {
    invoices_count: number;
    total_amount: number;
  };
  this_month: {
    invoices_count: number;
    total_amount: number;
    avg_invoice_amount: number;
  };
}

// ============= FILTERS =============

export interface BillingFilters {
  status?: BillingStatus[];
  date_from?: string;
  date_to?: string;
  guest_name?: string;
  room_number?: string;
  amount_min?: number;
  amount_max?: number;
  folio_number?: FolioNumber[];
}

// ============= API RESPONSES =============

export interface BillingApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface BillingListResponse<T> {
  data: T[] | null;
  error: Error | null;
  count?: number;
  has_more?: boolean;
}