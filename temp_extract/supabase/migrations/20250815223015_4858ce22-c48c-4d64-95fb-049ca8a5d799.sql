-- Phase 2: Pricing Experience Enhancement

-- 1. Create promotional periods table for advanced happy hours
CREATE TABLE public.promotional_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  applicable_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  min_purchase_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  applicable_categories UUID[],
  applicable_products UUID[],
  customer_types TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS for promotional periods
ALTER TABLE public.promotional_periods ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotional periods
CREATE POLICY "Users can manage promotional periods for their org" 
ON public.promotional_periods 
FOR ALL 
USING (org_id = get_current_user_org_id()) 
WITH CHECK (org_id = get_current_user_org_id());

-- 2. Extend pos_products table for multi-level pricing
ALTER TABLE public.pos_products 
ADD COLUMN IF NOT EXISTS price_level_1 NUMERIC,
ADD COLUMN IF NOT EXISTS price_level_2 NUMERIC, 
ADD COLUMN IF NOT EXISTS price_level_3 NUMERIC,
ADD COLUMN IF NOT EXISTS min_price NUMERIC,
ADD COLUMN IF NOT EXISTS max_price NUMERIC,
ADD COLUMN IF NOT EXISTS happy_hour_price NUMERIC,
ADD COLUMN IF NOT EXISTS promotion_eligible BOOLEAN DEFAULT true;

-- 3. Create pricing shifts table
CREATE TABLE public.pricing_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  price_level INTEGER NOT NULL CHECK (price_level IN (1, 2, 3)),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  applicable_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for pricing shifts
ALTER TABLE public.pricing_shifts ENABLE ROW LEVEL SECURITY;

-- RLS policies for pricing shifts
CREATE POLICY "Users can manage pricing shifts for their org" 
ON public.pricing_shifts 
FOR ALL 
USING (org_id = get_current_user_org_id()) 
WITH CHECK (org_id = get_current_user_org_id());

-- 4. Create promotional rules table for advanced promotions
CREATE TABLE public.promotional_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  promotional_period_id UUID NOT NULL REFERENCES public.promotional_periods(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('minimum_quantity', 'product_combo', 'customer_loyalty', 'time_based')),
  rule_conditions JSONB NOT NULL DEFAULT '{}',
  rule_action JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for promotional rules
ALTER TABLE public.promotional_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotional rules
CREATE POLICY "Users can manage promotional rules for their org" 
ON public.promotional_rules 
FOR ALL 
USING (org_id = get_current_user_org_id()) 
WITH CHECK (org_id = get_current_user_org_id());

-- 5. Create function to get current pricing level
CREATE OR REPLACE FUNCTION public.get_current_pricing_level(p_outlet_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_time TIME := CURRENT_TIME;
  current_day INTEGER := EXTRACT(DOW FROM CURRENT_DATE) + 1; -- Convert to 1-7 format
  active_shift RECORD;
BEGIN
  SELECT price_level INTO active_shift
  FROM public.pricing_shifts
  WHERE outlet_id = p_outlet_id
    AND is_active = true
    AND current_day = ANY(applicable_days)
    AND (
      (start_time <= end_time AND current_time BETWEEN start_time AND end_time) OR
      (start_time > end_time AND (current_time >= start_time OR current_time <= end_time))
    )
  ORDER BY priority DESC
  LIMIT 1;
  
  RETURN COALESCE(active_shift.price_level, 1);
END;
$$;

-- 6. Create function to calculate promotional price
CREATE OR REPLACE FUNCTION public.calculate_promotional_price(
  p_product_id UUID,
  p_base_price NUMERIC,
  p_quantity INTEGER DEFAULT 1,
  p_customer_type TEXT DEFAULT 'regular'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_time TIME := CURRENT_TIME;
  current_day INTEGER := EXTRACT(DOW FROM CURRENT_DATE) + 1;
  promotion RECORD;
  final_price NUMERIC := p_base_price;
  discount_amount NUMERIC := 0;
  promotion_applied JSONB := '{}';
BEGIN
  -- Find active promotional periods
  FOR promotion IN
    SELECT pp.*, pr.rule_conditions, pr.rule_action
    FROM public.promotional_periods pp
    LEFT JOIN public.promotional_rules pr ON pp.id = pr.promotional_period_id
    WHERE pp.is_active = true
      AND CURRENT_DATE BETWEEN pp.start_date AND pp.end_date
      AND (pp.start_time IS NULL OR pp.end_time IS NULL OR 
           (pp.start_time <= pp.end_time AND current_time BETWEEN pp.start_time AND pp.end_time) OR
           (pp.start_time > pp.end_time AND (current_time >= pp.start_time OR current_time <= pp.end_time)))
      AND current_day = ANY(pp.applicable_days)
      AND (pp.applicable_products IS NULL OR p_product_id = ANY(pp.applicable_products))
      AND (pp.customer_types = '{}' OR p_customer_type = ANY(pp.customer_types))
      AND (pp.usage_limit IS NULL OR pp.usage_count < pp.usage_limit)
    ORDER BY pp.priority DESC
    LIMIT 1
  LOOP
    IF promotion.discount_type = 'percentage' THEN
      discount_amount := (p_base_price * p_quantity * promotion.discount_value / 100);
      IF promotion.max_discount_amount IS NOT NULL THEN
        discount_amount := LEAST(discount_amount, promotion.max_discount_amount);
      END IF;
    ELSIF promotion.discount_type = 'fixed_amount' THEN
      discount_amount := promotion.discount_value * p_quantity;
    END IF;
    
    final_price := GREATEST(0, p_base_price - (discount_amount / p_quantity));
    
    promotion_applied := jsonb_build_object(
      'promotion_id', promotion.id,
      'promotion_name', promotion.name,
      'discount_type', promotion.discount_type,
      'discount_value', promotion.discount_value,
      'discount_amount', discount_amount
    );
    
    EXIT; -- Apply only the first (highest priority) promotion
  END LOOP;
  
  RETURN jsonb_build_object(
    'original_price', p_base_price,
    'final_price', final_price,
    'discount_amount', discount_amount,
    'promotion', promotion_applied
  );
END;
$$;

-- 7. Create indexes for performance
CREATE INDEX idx_promotional_periods_org_dates ON public.promotional_periods(org_id, start_date, end_date);
CREATE INDEX idx_promotional_periods_active ON public.promotional_periods(is_active, priority);
CREATE INDEX idx_pricing_shifts_outlet_time ON public.pricing_shifts(outlet_id, start_time, end_time);
CREATE INDEX idx_pos_products_pricing ON public.pos_products(outlet_id, price_level_1, price_level_2, price_level_3);

-- 8. Update updated_at trigger for new tables
CREATE TRIGGER update_promotional_periods_updated_at
  BEFORE UPDATE ON public.promotional_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_shifts_updated_at
  BEFORE UPDATE ON public.pricing_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();