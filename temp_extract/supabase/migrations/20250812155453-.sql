-- Create POS module tables for AfricaSuite
-- Phase 1: Core POS Architecture

-- POS Outlets (Points de vente)
CREATE TABLE public.pos_outlets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  outlet_type TEXT NOT NULL DEFAULT 'restaurant', -- restaurant, bar, spa, boutique, room_service
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

-- POS Categories 
CREATE TABLE public.pos_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6b7280',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, outlet_id, code)
);

-- POS Products (based on existing services)
CREATE TABLE public.pos_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.pos_categories(id) ON DELETE SET NULL,
  service_id UUID, -- Link to existing services table
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  image_url TEXT,
  barcode TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  track_stock BOOLEAN DEFAULT false,
  current_stock INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  variants JSONB DEFAULT '[]', -- sizes, options, etc.
  preparation_time INTEGER DEFAULT 0, -- minutes
  kitchen_notes TEXT,
  allergens JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, outlet_id, code)
);

-- POS Tables and zones
CREATE TABLE public.pos_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  zone TEXT,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'available', -- available, occupied, reserved, cleaning
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  shape TEXT DEFAULT 'round', -- round, square, rectangle
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, outlet_id, table_number)
);

-- POS Orders
CREATE TABLE public.pos_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'dine_in', -- dine_in, takeaway, room_service, delivery
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, preparing, ready, served, paid, cancelled
  table_id UUID REFERENCES public.pos_tables(id) ON DELETE SET NULL,
  room_id UUID, -- For room service (link to rooms table)
  guest_id UUID, -- Link to guests table
  reservation_id UUID, -- Link to reservations table
  server_id UUID, -- Assigned server
  cashier_id UUID, -- Cashier who processed
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  tip_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  customer_count INTEGER DEFAULT 1,
  special_instructions TEXT,
  kitchen_notes TEXT,
  sent_to_kitchen_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  session_id UUID, -- Link to POS session
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS Order Items
CREATE TABLE public.pos_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.pos_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.pos_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  variant_selection JSONB DEFAULT '{}', -- Selected variants
  modifiers JSONB DEFAULT '[]', -- Modifications, extras
  special_instructions TEXT,
  status TEXT DEFAULT 'pending', -- pending, preparing, ready, served, cancelled
  sent_to_kitchen_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS Sessions (caisse sessions)
CREATE TABLE public.pos_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE RESTRICT,
  session_number TEXT NOT NULL,
  cashier_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open, closed
  opening_cash NUMERIC DEFAULT 0,
  closing_cash NUMERIC DEFAULT 0,
  total_sales NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS Promotions
CREATE TABLE public.pos_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_ids UUID[] DEFAULT '{}', -- Apply to specific outlets
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'percentage', -- percentage, fixed, buy_x_get_y
  value NUMERIC NOT NULL,
  min_amount NUMERIC DEFAULT 0,
  max_discount NUMERIC,
  applicable_products UUID[] DEFAULT '{}',
  applicable_categories UUID[] DEFAULT '{}',
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

-- Enable RLS on all tables
ALTER TABLE public.pos_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_promotions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for org-based access
CREATE POLICY "Users can manage pos outlets for their org" ON public.pos_outlets
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage pos categories for their org" ON public.pos_categories
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage pos products for their org" ON public.pos_products
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage pos tables for their org" ON public.pos_tables
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage pos orders for their org" ON public.pos_orders
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage pos order items for their org" ON public.pos_order_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pos_orders o 
    WHERE o.id = pos_order_items.order_id 
    AND o.org_id = get_current_user_org_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pos_orders o 
    WHERE o.id = pos_order_items.order_id 
    AND o.org_id = get_current_user_org_id()
  ));

CREATE POLICY "Users can manage pos sessions for their org" ON public.pos_sessions
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage pos promotions for their org" ON public.pos_promotions
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for performance
CREATE INDEX idx_pos_orders_outlet_status ON public.pos_orders(outlet_id, status);
CREATE INDEX idx_pos_orders_date ON public.pos_orders(created_at);
CREATE INDEX idx_pos_orders_server ON public.pos_orders(server_id);
CREATE INDEX idx_pos_orders_table ON public.pos_orders(table_id);
CREATE INDEX idx_pos_order_items_order ON public.pos_order_items(order_id);
CREATE INDEX idx_pos_products_outlet_category ON public.pos_products(outlet_id, category_id);
CREATE INDEX idx_pos_products_barcode ON public.pos_products(barcode) WHERE barcode IS NOT NULL;

-- Triggers for updated_at
CREATE TRIGGER update_pos_outlets_updated_at
  BEFORE UPDATE ON public.pos_outlets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_categories_updated_at
  BEFORE UPDATE ON public.pos_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_products_updated_at
  BEFORE UPDATE ON public.pos_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_tables_updated_at
  BEFORE UPDATE ON public.pos_tables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_orders_updated_at
  BEFORE UPDATE ON public.pos_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_order_items_updated_at
  BEFORE UPDATE ON public.pos_order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_sessions_updated_at
  BEFORE UPDATE ON public.pos_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_promotions_updated_at
  BEFORE UPDATE ON public.pos_promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_pos_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM pos_orders
  WHERE org_id = NEW.org_id
  AND order_number ~ '^POS-[0-9]+$';
  
  formatted_number := 'POS-' || LPAD(next_number::TEXT, 6, '0');
  NEW.order_number := formatted_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating order numbers
CREATE TRIGGER generate_pos_order_number_trigger
  BEFORE INSERT ON public.pos_orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION public.generate_pos_order_number();

-- Function to generate session numbers
CREATE OR REPLACE FUNCTION public.generate_pos_session_number()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(session_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM pos_sessions
  WHERE org_id = NEW.org_id
  AND session_number ~ '^SES-[0-9]+$';
  
  formatted_number := 'SES-' || LPAD(next_number::TEXT, 6, '0');
  NEW.session_number := formatted_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating session numbers
CREATE TRIGGER generate_pos_session_number_trigger
  BEFORE INSERT ON public.pos_sessions
  FOR EACH ROW
  WHEN (NEW.session_number IS NULL OR NEW.session_number = '')
  EXECUTE FUNCTION public.generate_pos_session_number();