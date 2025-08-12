-- Create inventory and settings tables for POS back office

-- Warehouses/Storage locations
CREATE TABLE public.pos_warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  is_main BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(org_id, code)
);

-- Stock items (inventory products)
CREATE TABLE public.pos_stock_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES public.pos_warehouses(id),
  product_id UUID REFERENCES public.pos_products(id),
  item_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pcs',
  current_stock NUMERIC NOT NULL DEFAULT 0,
  min_stock_level NUMERIC NOT NULL DEFAULT 0,
  max_stock_level NUMERIC NOT NULL DEFAULT 100,
  unit_cost NUMERIC,
  last_cost NUMERIC,
  average_cost NUMERIC,
  supplier_name TEXT,
  supplier_code TEXT,
  expiry_date DATE,
  batch_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(org_id, warehouse_id, item_code)
);

-- Stock movements
CREATE TABLE public.pos_stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  stock_item_id UUID NOT NULL REFERENCES public.pos_stock_items(id),
  warehouse_id UUID NOT NULL REFERENCES public.pos_warehouses(id),
  movement_type TEXT NOT NULL, -- 'in', 'out', 'transfer', 'adjustment', 'consumption'
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC,
  total_cost NUMERIC,
  reference_type TEXT, -- 'purchase', 'sale', 'waste', 'inventory', 'production'
  reference_id UUID,
  reference_number TEXT,
  reason TEXT,
  notes TEXT,
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System settings for POS
CREATE TABLE public.pos_system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL, -- 'general', 'inventory', 'kitchen', 'reporting', 'integration'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID,
  UNIQUE(org_id, setting_key)
);

-- Enable RLS
ALTER TABLE public.pos_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage warehouses for their org" 
ON public.pos_warehouses 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage stock items for their org" 
ON public.pos_stock_items 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage stock movements for their org" 
ON public.pos_stock_movements 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage system settings for their org" 
ON public.pos_system_settings 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for performance
CREATE INDEX idx_pos_stock_items_warehouse ON public.pos_stock_items(warehouse_id);
CREATE INDEX idx_pos_stock_items_product ON public.pos_stock_items(product_id);
CREATE INDEX idx_pos_stock_items_category ON public.pos_stock_items(category);
CREATE INDEX idx_pos_stock_movements_item ON public.pos_stock_movements(stock_item_id);
CREATE INDEX idx_pos_stock_movements_type ON public.pos_stock_movements(movement_type);
CREATE INDEX idx_pos_stock_movements_date ON public.pos_stock_movements(performed_at);

-- Trigger to update stock quantities
CREATE OR REPLACE FUNCTION public.update_pos_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'in' THEN
    UPDATE public.pos_stock_items 
    SET current_stock = current_stock + NEW.quantity,
        last_cost = COALESCE(NEW.unit_cost, last_cost),
        updated_at = now()
    WHERE id = NEW.stock_item_id;
  ELSIF NEW.movement_type = 'out' OR NEW.movement_type = 'consumption' THEN
    UPDATE public.pos_stock_items 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.stock_item_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE public.pos_stock_items 
    SET current_stock = NEW.quantity,
        updated_at = now()
    WHERE id = NEW.stock_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pos_stock_quantity_trigger
AFTER INSERT ON public.pos_stock_movements
FOR EACH ROW
EXECUTE FUNCTION public.update_pos_stock_quantity();

-- Insert default warehouse for existing organizations
INSERT INTO public.pos_warehouses (org_id, code, name, description, is_main)
SELECT DISTINCT org_id, 'MAIN', 'Entrepôt Principal', 'Entrepôt principal du restaurant', true
FROM public.hotel_settings
WHERE NOT EXISTS (
  SELECT 1 FROM public.pos_warehouses 
  WHERE pos_warehouses.org_id = hotel_settings.org_id
);

-- Insert default system settings with proper JSONB casting
INSERT INTO public.pos_system_settings (org_id, setting_key, setting_value, category, description)
SELECT DISTINCT org_id, 'auto_deduct_stock', '{"enabled": true}'::jsonb, 'inventory', 'Déduction automatique du stock lors des ventes'
FROM public.hotel_settings
WHERE NOT EXISTS (
  SELECT 1 FROM public.pos_system_settings 
  WHERE pos_system_settings.org_id = hotel_settings.org_id 
  AND setting_key = 'auto_deduct_stock'
);

INSERT INTO public.pos_system_settings (org_id, setting_key, setting_value, category, description)
SELECT DISTINCT org_id, 'low_stock_alert', '{"enabled": true, "threshold_days": 7}'::jsonb, 'inventory', 'Alertes de stock faible'
FROM public.hotel_settings
WHERE NOT EXISTS (
  SELECT 1 FROM public.pos_system_settings 
  WHERE pos_system_settings.org_id = hotel_settings.org_id 
  AND setting_key = 'low_stock_alert'
);

INSERT INTO public.pos_system_settings (org_id, setting_key, setting_value, category, description)
SELECT DISTINCT org_id, 'kitchen_display_timeout', '{"minutes": 15}'::jsonb, 'kitchen', 'Délai d affichage cuisine'
FROM public.hotel_settings
WHERE NOT EXISTS (
  SELECT 1 FROM public.pos_system_settings 
  WHERE pos_system_settings.org_id = hotel_settings.org_id 
  AND setting_key = 'kitchen_display_timeout'
);