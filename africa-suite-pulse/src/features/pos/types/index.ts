// ============= POS CORE TYPES =============

export interface POSOutlet {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description?: string;
  outlet_type: 'restaurant' | 'bar' | 'spa' | 'reception' | 'boutique' | 'room_service';
  is_active: boolean;
  settings?: {
    layout?: string;
    theme?: string;
    printer_config?: any;
  };
  created_at: string;
  updated_at: string;
}

export interface POSCategory {
  id: string;
  outlet_id: string;
  name: string;
  description?: string;
  code: string;
  sort_order: number;
  is_active: boolean;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface POSProduct {
  id: string;
  org_id: string;
  outlet_id: string;
  category_id?: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  unit_sale: string;
  price_ht: number;
  tax_rate: number;
  price_ttc: number;
  is_active: boolean;
  stock_tracking: boolean;
  image_url?: string;
  modifiers?: ProductModifier[];
  created_at: string;
  updated_at: string;
}

export interface ProductModifier {
  id: string;
  name: string;
  options: ModifierOption[];
  required: boolean;
  multiple: boolean;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

export interface POSTable {
  id: string;
  org_id: string;
  outlet_id: string;
  table_number: string;
  capacity: number;
  section?: string;
  position_x?: number;
  position_y?: number;
  status: 'available' | 'occupied' | 'reserved' | 'out_of_order';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface POSSession {
  id: string;
  org_id: string;
  outlet_id: string;
  user_id: string;
  session_token: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  initial_cash?: number;
  final_cash?: number;
  discrepancies?: any;
}

export interface POSOrder {
  id: string;
  org_id: string;
  outlet_id: string;
  order_number: string;
  table_id?: string;
  server_id: string;
  session_id: string;
  status: 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'room_service';
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  discount_amount?: number;
  service_charge?: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  // Hotel-specific fields
  room_id?: string;
  guest_id?: string;
  charge_to_room?: boolean;
  folio_id?: string;
}

export interface POSOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers?: OrderItemModifier[];
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface OrderItemModifier {
  modifier_id: string;
  option_id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers?: OrderItemModifier[];
  notes?: string;
}

export interface POSTableAssignment {
  id: string;
  org_id: string;
  table_id: string;
  server_id: string;
  shift_date: string;
  assigned_by: string;
  status: 'active' | 'transferred' | 'ended';
  created_at: string;
  updated_at: string;
}

// ============= HOTEL-SPECIFIC POS TYPES =============

export interface RoomCharge {
  id: string;
  org_id: string;
  room_id: string;
  guest_id: string;
  folio_id: string;
  order_id: string;
  amount: number;
  description: string;
  charge_date: string;
  status: 'pending' | 'posted' | 'disputed' | 'reversed';
  created_by: string;
  guest_signature?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestFolio {
  id: string;
  org_id: string;
  reservation_id: string;
  guest_id: string;
  room_id: string;
  folio_number: string;
  status: 'open' | 'closed' | 'transferred';
  balance: number;
  charges_total: number;
  payments_total: number;
  created_at: string;
  updated_at: string;
}

export interface FolioCharge {
  id: string;
  folio_id: string;
  charge_type: 'room' | 'tax' | 'service' | 'restaurant' | 'bar' | 'spa' | 'other';
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
  tax_amount?: number;
  date_charged: string;
  reference_id?: string; // Order ID, service ID, etc.
  created_by: string;
  created_at: string;
}

export interface FolioPayment {
  id: string;
  folio_id: string;
  payment_type: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'agency' | 'advance';
  amount: number;
  payment_method: string;
  reference_number?: string;
  transaction_id?: string;
  payment_date: string;
  processed_by: string;
  notes?: string;
  created_at: string;
}

// ============= CUSTOMER ACCOUNTS (HOTEL DEBTORS) =============

export interface CustomerAccount {
  id: string;
  org_id: string;
  customer_code: string;
  customer_type: 'individual' | 'corporate' | 'agency' | 'ota';
  name: string;
  contact_person?: string;
  address_line1?: string;
  address_line2?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  account_status: 'active' | 'blocked' | 'suspended';
  credit_limit_type: 'unlimited' | 'limited' | 'blocked';
  credit_limit: number;
  current_balance: number;
  payment_terms: number; // Days
  loyalty_card_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInvoice {
  id: string;
  org_id: string;
  customer_account_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'open' | 'partial' | 'paid' | 'cancelled';
  order_data: any;
  folio_id?: string;
  table_number?: string;
  server_id?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
}

// ============= SERVICE TYPES =============

export interface POSService {
  id: string;
  org_id: string;
  outlet_id: string;
  service_type: 'room_service' | 'laundry' | 'spa' | 'transport' | 'other';
  name: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  is_active: boolean;
  booking_required: boolean;
  advance_booking_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceBooking {
  id: string;
  org_id: string;
  service_id: string;
  guest_id: string;
  room_id?: string;
  booking_date: string;
  booking_time: string;
  status: 'booked' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  special_requests?: string;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'charged_to_room';
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ============= PAYMENT TYPES =============

export interface POSPayment {
  id: string;
  org_id: string;
  order_id?: string;
  folio_id?: string;
  payment_type: 'order' | 'folio' | 'account';
  payment_method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'room_charge' | 'account_charge';
  amount: number;
  currency: string;
  exchange_rate?: number;
  reference_number?: string;
  transaction_id?: string;
  payment_processor?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processed_by: string;
  processed_at: string;
  notes?: string;
  created_at: string;
}

// ============= REPORTS & ANALYTICS TYPES =============

export interface POSDailySummary {
  date: string;
  outlet_id: string;
  total_orders: number;
  total_revenue: number;
  total_tax: number;
  payment_methods: Record<string, number>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  room_charges: number;
  cash_payments: number;
  card_payments: number;
  mobile_money: number;
}