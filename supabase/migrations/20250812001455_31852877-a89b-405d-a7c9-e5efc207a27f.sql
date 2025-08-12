-- Create loyalty programs table
CREATE TABLE public.loyalty_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  points_per_night INTEGER NOT NULL DEFAULT 10,
  points_per_currency_unit NUMERIC NOT NULL DEFAULT 1.0,
  currency_code TEXT NOT NULL DEFAULT 'XOF',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loyalty tiers table
CREATE TABLE public.loyalty_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6b7280',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer loyalty points table
CREATE TABLE public.customer_loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL,
  program_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  tier_id UUID,
  tier_achieved_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guest_id, program_id)
);

-- Create loyalty transactions table for point history
CREATE TABLE public.loyalty_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL,
  program_id UUID NOT NULL,
  reservation_id UUID,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus', 'adjustment')),
  points INTEGER NOT NULL,
  description TEXT,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on all tables
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for loyalty_programs
CREATE POLICY "Users can manage loyalty programs for their org" 
ON public.loyalty_programs 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create RLS policies for loyalty_tiers
CREATE POLICY "Users can manage loyalty tiers for their org" 
ON public.loyalty_tiers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.loyalty_programs lp 
  WHERE lp.id = loyalty_tiers.program_id 
  AND lp.org_id = get_current_user_org_id()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.loyalty_programs lp 
  WHERE lp.id = loyalty_tiers.program_id 
  AND lp.org_id = get_current_user_org_id()
));

-- Create RLS policies for customer_loyalty_points
CREATE POLICY "Users can manage customer loyalty points for their org" 
ON public.customer_loyalty_points 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.guests g 
  WHERE g.id = customer_loyalty_points.guest_id 
  AND g.org_id = get_current_user_org_id()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.guests g 
  WHERE g.id = customer_loyalty_points.guest_id 
  AND g.org_id = get_current_user_org_id()
));

-- Create RLS policies for loyalty_transactions
CREATE POLICY "Users can manage loyalty transactions for their org" 
ON public.loyalty_transactions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.guests g 
  WHERE g.id = loyalty_transactions.guest_id 
  AND g.org_id = get_current_user_org_id()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.guests g 
  WHERE g.id = loyalty_transactions.guest_id 
  AND g.org_id = get_current_user_org_id()
));

-- Create default loyalty program and tiers for existing orgs
INSERT INTO public.loyalty_programs (org_id, name, description, points_per_night, points_per_currency_unit)
SELECT 
  org_id,
  'Programme Fidélité ' || name,
  'Programme de fidélité automatique avec accumulation de points',
  10,
  0.1
FROM public.hotel_settings;

-- Create default tiers for each loyalty program
WITH program_tiers AS (
  SELECT 
    lp.id as program_id,
    tier_data.name,
    tier_data.code,
    tier_data.min_points,
    tier_data.color,
    tier_data.benefits,
    tier_data.sort_order
  FROM public.loyalty_programs lp
  CROSS JOIN (
    VALUES 
    ('Bronze', 'bronze', 0, '#cd7f32', '["Bienvenue dans notre programme"]'::jsonb, 1),
    ('Silver', 'silver', 500, '#c0c0c0', '["Late checkout gratuit", "Surclassement sujet à disponibilité"]'::jsonb, 2),
    ('Gold', 'gold', 1500, '#ffd700', '["Late checkout gratuit", "Surclassement prioritaire", "Petit-déjeuner offert"]'::jsonb, 3),
    ('Platinum', 'platinum', 3000, '#e5e4e2', '["Late checkout gratuit", "Surclassement prioritaire", "Petit-déjeuner offert", "Accès lounge VIP"]'::jsonb, 4)
  ) AS tier_data(name, code, min_points, color, benefits, sort_order)
)
INSERT INTO public.loyalty_tiers (program_id, name, code, min_points, color, benefits, sort_order)
SELECT program_id, name, code, min_points, color, benefits, sort_order FROM program_tiers;

-- Create function to calculate and update loyalty tier
CREATE OR REPLACE FUNCTION public.update_customer_loyalty_tier(p_guest_id UUID, p_program_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_points INTEGER;
  v_new_tier_id UUID;
  v_current_tier_id UUID;
BEGIN
  -- Get current total points
  SELECT total_points, tier_id 
  INTO v_total_points, v_current_tier_id
  FROM public.customer_loyalty_points 
  WHERE guest_id = p_guest_id AND program_id = p_program_id;
  
  -- Find appropriate tier based on points
  SELECT id INTO v_new_tier_id
  FROM public.loyalty_tiers 
  WHERE program_id = p_program_id 
    AND min_points <= v_total_points
    AND is_active = true
  ORDER BY min_points DESC 
  LIMIT 1;
  
  -- Update tier if changed
  IF v_new_tier_id IS DISTINCT FROM v_current_tier_id THEN
    UPDATE public.customer_loyalty_points 
    SET 
      tier_id = v_new_tier_id,
      tier_achieved_at = CASE WHEN v_new_tier_id IS NOT NULL THEN now() ELSE NULL END,
      updated_at = now()
    WHERE guest_id = p_guest_id AND program_id = p_program_id;
  END IF;
END;
$$;

-- Create function to add loyalty points
CREATE OR REPLACE FUNCTION public.add_loyalty_points(
  p_guest_id UUID,
  p_program_id UUID,
  p_points INTEGER,
  p_transaction_type TEXT DEFAULT 'earned',
  p_description TEXT DEFAULT NULL,
  p_reservation_id UUID DEFAULT NULL,
  p_reference TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert or update customer loyalty points
  INSERT INTO public.customer_loyalty_points (guest_id, program_id, total_points, last_activity_at)
  VALUES (p_guest_id, p_program_id, p_points, now())
  ON CONFLICT (guest_id, program_id)
  DO UPDATE SET 
    total_points = customer_loyalty_points.total_points + p_points,
    last_activity_at = now(),
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.loyalty_transactions (
    guest_id, program_id, reservation_id, transaction_type, 
    points, description, reference, created_by
  )
  VALUES (
    p_guest_id, p_program_id, p_reservation_id, p_transaction_type,
    p_points, p_description, p_reference, auth.uid()
  );
  
  -- Update tier
  PERFORM public.update_customer_loyalty_tier(p_guest_id, p_program_id);
END;
$$;

-- Create trigger to automatically award points when reservation is checked out
CREATE OR REPLACE FUNCTION public.handle_reservation_checkout_loyalty()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_program_id UUID;
  v_nights INTEGER;
  v_points_per_night INTEGER;
  v_points_per_currency NUMERIC;
  v_night_points INTEGER;
  v_spend_points INTEGER;
  v_total_points INTEGER;
BEGIN
  -- Only process when status changes to checked out
  IF OLD.status != 'departed' AND NEW.status = 'departed' AND NEW.guest_id IS NOT NULL THEN
    
    -- Get the active loyalty program for this org
    SELECT id, points_per_night, points_per_currency_unit
    INTO v_program_id, v_points_per_night, v_points_per_currency
    FROM public.loyalty_programs 
    WHERE org_id = NEW.org_id AND is_active = true
    LIMIT 1;
    
    IF v_program_id IS NOT NULL THEN
      -- Calculate nights
      v_nights := GREATEST(1, NEW.date_departure - NEW.date_arrival);
      
      -- Calculate points from nights
      v_night_points := v_nights * v_points_per_night;
      
      -- Calculate points from spending
      v_spend_points := FLOOR((COALESCE(NEW.rate_total, 0) * v_points_per_currency));
      
      -- Total points
      v_total_points := v_night_points + v_spend_points;
      
      -- Award points
      PERFORM public.add_loyalty_points(
        NEW.guest_id,
        v_program_id,
        v_total_points,
        'earned',
        format('Séjour du %s au %s (%s nuits, %s points nuits + %s points dépenses)', 
               NEW.date_arrival, NEW.date_departure, v_nights, v_night_points, v_spend_points),
        NEW.id,
        NEW.reference
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER reservation_checkout_loyalty_trigger
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_reservation_checkout_loyalty();

-- Create updated_at triggers
CREATE TRIGGER update_loyalty_programs_updated_at
  BEFORE UPDATE ON public.loyalty_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_loyalty_points_updated_at
  BEFORE UPDATE ON public.customer_loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();