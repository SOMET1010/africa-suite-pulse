-- Phase 1: Critical POS Functionalities

-- Fiscal jurisdictions for multi-rate tax support
CREATE TABLE public.fiscal_jurisdictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  region TEXT,
  tax_rates JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {type, rate, name}
  currency_code TEXT NOT NULL DEFAULT 'XOF',
  fiscal_rules JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

-- Product garnishes/add-ons
CREATE TABLE public.pos_product_garnishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID NOT NULL,
  parent_product_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_addon NUMERIC NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  max_selections INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu configurations
CREATE TABLE public.pos_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  valid_from DATE,
  valid_until DATE,
  time_slots JSONB DEFAULT '[]', -- Array of {start_time, end_time, days}
  layout_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, outlet_id, code)
);

-- Menu sections
CREATE TABLE public.pos_menu_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  section_config JSONB DEFAULT '{}', -- colors, layout, etc.
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu items (products in menus)
CREATE TABLE public.pos_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_section_id UUID NOT NULL,
  product_id UUID NOT NULL,
  display_order INTEGER DEFAULT 0,
  custom_name TEXT, -- Override product name for this menu
  custom_description TEXT,
  custom_price NUMERIC, -- Override price for this menu
  is_featured BOOLEAN DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Split bill records
CREATE TABLE public.pos_split_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  original_order_id UUID NOT NULL,
  split_number INTEGER NOT NULL,
  total_splits INTEGER NOT NULL,
  split_amount NUMERIC NOT NULL,
  split_type TEXT NOT NULL CHECK (split_type IN ('by_amount', 'by_items', 'even')),
  split_items JSONB DEFAULT '[]', -- For item-based splits
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table transfer history
CREATE TABLE public.pos_table_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  order_id UUID NOT NULL,
  from_table_id UUID,
  to_table_id UUID,
  transfer_reason TEXT,
  transferred_by UUID,
  transferred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mobile money transactions
CREATE TABLE public.pos_mobile_money_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  order_id UUID NOT NULL,
  payment_method_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('orange_money', 'mtn_money', 'moov_money', 'wave')),
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'XOF',
  transaction_id TEXT, -- Provider transaction ID
  external_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  provider_response JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced audit logs for POS actions
CREATE TABLE public.pos_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID,
  action_type TEXT NOT NULL, -- 'order_create', 'item_add', 'discount_apply', 'split_bill', etc.
  entity_type TEXT NOT NULL, -- 'order', 'item', 'payment', etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT, -- For cancellations, discounts, etc.
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fiscal_jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_product_garnishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_table_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_mobile_money_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_action_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage fiscal jurisdictions for their org" ON public.fiscal_jurisdictions
  FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage product garnishes for their org" ON public.pos_product_garnishes
  FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage menus for their org" ON public.pos_menus
  FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage menu sections for their org" ON public.pos_menu_sections
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pos_menus pm 
    WHERE pm.id = pos_menu_sections.menu_id 
    AND pm.org_id = get_current_user_org_id()
  ));

CREATE POLICY "Users can manage menu items for their org" ON public.pos_menu_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pos_menu_sections pms 
    JOIN public.pos_menus pm ON pms.menu_id = pm.id
    WHERE pms.id = pos_menu_items.menu_section_id 
    AND pm.org_id = get_current_user_org_id()
  ));

CREATE POLICY "Users can manage split bills for their org" ON public.pos_split_bills
  FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage table transfers for their org" ON public.pos_table_transfers
  FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage mobile money transactions for their org" ON public.pos_mobile_money_transactions
  FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage action logs for their org" ON public.pos_action_logs
  FOR ALL USING (org_id = get_current_user_org_id());

-- Indexes for performance
CREATE INDEX idx_fiscal_jurisdictions_org_active ON public.fiscal_jurisdictions(org_id, is_active);
CREATE INDEX idx_pos_product_garnishes_parent ON public.pos_product_garnishes(parent_product_id, is_active);
CREATE INDEX idx_pos_menus_outlet_active ON public.pos_menus(outlet_id, is_active);
CREATE INDEX idx_pos_split_bills_order ON public.pos_split_bills(original_order_id);
CREATE INDEX idx_pos_table_transfers_order ON public.pos_table_transfers(order_id);
CREATE INDEX idx_pos_mobile_money_status ON public.pos_mobile_money_transactions(status, created_at);
CREATE INDEX idx_pos_action_logs_user_time ON public.pos_action_logs(user_id, created_at);

-- Add fiscal jurisdiction to outlets
ALTER TABLE public.pos_outlets ADD COLUMN fiscal_jurisdiction_id UUID;

-- Add garnish support to order items
ALTER TABLE public.pos_order_items ADD COLUMN selected_garnishes JSONB DEFAULT '[]';

-- Add split bill reference to payments
ALTER TABLE public.payment_transactions ADD COLUMN split_bill_id UUID;

-- Update updated_at triggers
CREATE TRIGGER update_fiscal_jurisdictions_updated_at
  BEFORE UPDATE ON public.fiscal_jurisdictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_product_garnishes_updated_at
  BEFORE UPDATE ON public.pos_product_garnishes  
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_menus_updated_at
  BEFORE UPDATE ON public.pos_menus
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_split_bills_updated_at
  BEFORE UPDATE ON public.pos_split_bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pos_mobile_money_updated_at
  BEFORE UPDATE ON public.pos_mobile_money_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();