export interface POSOutlet {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description?: string;
  outlet_type: string;
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface POSCategory {
  id: string;
  outlet_id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface POSProduct {
  id: string;
  outlet_id: string;
  category_id: string;
  code: string;
  name: string;
  description?: string;
  base_price: number;
  cost_price?: number;
  is_active: boolean;
  current_stock?: number;
  min_stock?: number;
  barcode?: string;
  image_url?: string;
  preparation_time?: number;
  allergens?: any;
  variants?: any;
  created_at: string;
  updated_at: string;
}

export interface POSOrder {
  id: string;
  org_id: string;
  order_number: string;
  table_id?: string;
  cashier_id?: string;
  guest_id?: string;
  customer_count?: number;
  status: 'draft' | 'sent' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'room_service';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  kitchen_notes?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface POSOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  total_price: number;
  variant_selection?: Record<string, any>;
  special_instructions?: string;
  status: 'pending' | 'sent' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at: string;
}

export interface POSTable {
  id: string;
  org_id: string;
  outlet_id: string;
  table_number: string;
  number?: string;
  capacity?: number;
  zone?: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';
  is_active: boolean;
  position_x?: number;
  position_y?: number;
  shape?: string;
  created_at: string;
  updated_at: string;
}

export interface POSSession {
  id: string;
  org_id: string;
  outlet_id: string;
  session_number: string;
  cashier_id: string;
  opening_cash: number;
  closing_cash?: number;
  total_sales: number;
  total_transactions: number;
  status: 'open' | 'closed';
  started_at: string;
  closed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem extends POSOrderItem {
  product: POSProduct;
  fireRound?: number; // Wave/round for kitchen timing
}

export interface POSTableAssignment {
  id: string;
  org_id: string;
  table_id: string;
  server_id: string;
  assigned_at: string;
  assigned_by?: string;
  shift_date: string;
  status: 'active' | 'inactive' | 'transferred';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface POSServerAssignment {
  id: string;
  org_id: string;
  server_id: string;
  zone?: string;
  shift_start?: string;
  shift_end?: string;
  shift_date: string;
  status: 'active' | 'break' | 'finished';
  assigned_by?: string;
  max_tables: number;
  created_at: string;
  updated_at: string;
}

export interface POSOrderStatusHistory {
  id: string;
  org_id: string;
  order_id: string;
  status: string;
  changed_by?: string;
  changed_at: string;
  notes?: string;
  estimated_completion_time?: string;
}

export interface POSState {
  currentOrder: POSOrder | null;
  cartItems: CartItem[];
  selectedTable?: POSTable;
  currentSession?: POSSession;
}