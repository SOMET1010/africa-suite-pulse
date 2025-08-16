-- Phase 1: Menu compositions, advanced kitchen messages, and stock management

-- Table for menu compositions with customizable items
CREATE TABLE public.pos_menu_compositions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  parent_product_id UUID NOT NULL,
  component_type TEXT NOT NULL, -- 'main', 'side', 'sauce', 'garnish', 'drink'
  component_name TEXT NOT NULL,
  component_product_id UUID,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  extra_price NUMERIC DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for predefined kitchen messages
CREATE TABLE public.pos_kitchen_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID,
  category TEXT NOT NULL, -- 'cooking', 'allergy', 'special', 'timing'
  message_text TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_priority BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for stock alerts and management
CREATE TABLE public.pos_stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID NOT NULL,
  product_id UUID NOT NULL,
  stock_item_id UUID,
  alert_type TEXT NOT NULL, -- 'low_stock', 'out_of_stock', 'expired'
  current_quantity NUMERIC NOT NULL,
  threshold_quantity NUMERIC,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pos_menu_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_kitchen_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu compositions
CREATE POLICY "Users can manage menu compositions for their org"
ON public.pos_menu_compositions
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for kitchen messages
CREATE POLICY "Users can manage kitchen messages for their org"
ON public.pos_kitchen_messages
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for stock alerts
CREATE POLICY "Users can manage stock alerts for their org"
ON public.pos_stock_alerts
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Function to check and create stock alerts
CREATE OR REPLACE FUNCTION public.check_stock_levels()
RETURNS TRIGGER AS $$
DECLARE
  low_stock_threshold NUMERIC := 10;
  out_of_stock_threshold NUMERIC := 0;
BEGIN
  -- Check for low stock
  IF NEW.current_stock <= low_stock_threshold AND NEW.current_stock > out_of_stock_threshold THEN
    INSERT INTO public.pos_stock_alerts (
      org_id, outlet_id, product_id, stock_item_id, alert_type, 
      current_quantity, threshold_quantity, message
    )
    SELECT 
      si.org_id, si.outlet_id, si.product_id, si.id, 'low_stock',
      NEW.current_stock, low_stock_threshold,
      'Stock faible pour ' || p.name || ' (' || NEW.current_stock || ' restant)'
    FROM public.pos_stock_items si
    LEFT JOIN public.pos_products p ON p.id = si.product_id
    WHERE si.id = NEW.id
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check for out of stock
  IF NEW.current_stock <= out_of_stock_threshold THEN
    INSERT INTO public.pos_stock_alerts (
      org_id, outlet_id, product_id, stock_item_id, alert_type,
      current_quantity, threshold_quantity, message
    )
    SELECT 
      si.org_id, si.outlet_id, si.product_id, si.id, 'out_of_stock',
      NEW.current_stock, out_of_stock_threshold,
      'Rupture de stock pour ' || p.name
    FROM public.pos_stock_items si
    LEFT JOIN public.pos_products p ON p.id = si.product_id
    WHERE si.id = NEW.id
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for stock level monitoring
CREATE TRIGGER trigger_check_stock_levels
  AFTER UPDATE OF current_stock ON public.pos_stock_items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_stock_levels();