/**
 * Types pour les produits POS
 */

export interface POSProduct {
  id: string;
  name: string;
  price: number;
  category_id?: string;
  outlet_id?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  stock_quantity?: number;
  barcode?: string;
  tax_rate?: number;
  is_favorite?: boolean;
  happy_hour_price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: POSProduct;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface CartSummary {
  subtotal: number;
  taxAmount: number;
  total: number;
  discount: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  credit_limit?: number;
  current_balance?: number;
  is_vip?: boolean;
  created_at?: string;
}

export interface Invoice {
  id: string;
  number: string;
  total: number;
  status: string;
  created_at: string;
  customer_id?: string;
  payment_status?: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  created_at: string;
}