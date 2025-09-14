-- Create Collectivités module tables for POS system

-- Table for collective organizations (schools, companies, administrations)
CREATE TABLE public.collective_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  organization_type TEXT NOT NULL, -- 'school', 'company', 'administration', 'association'
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  budget_limit NUMERIC,
  budget_consumed NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for beneficiaries (students, employees)
CREATE TABLE public.collective_beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  collective_organization_id UUID NOT NULL REFERENCES collective_organizations(id),
  guest_id UUID REFERENCES guests(id), -- Link to existing guest system
  beneficiary_code TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  category TEXT NOT NULL, -- 'student', 'employee', 'teacher', 'visitor'
  grade_level TEXT, -- For students
  department TEXT, -- For employees
  dietary_restrictions JSONB DEFAULT '[]',
  allergies JSONB DEFAULT '[]',
  credit_balance NUMERIC DEFAULT 0,
  monthly_allowance NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, beneficiary_code)
);

-- Table for subsidy programs
CREATE TABLE public.subsidy_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  collective_organization_id UUID NOT NULL REFERENCES collective_organizations(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  program_type TEXT NOT NULL, -- 'fixed_amount', 'percentage', 'free_meal', 'tiered'
  rules JSONB NOT NULL DEFAULT '{}', -- Subsidy calculation rules
  valid_from DATE,
  valid_until DATE,
  applicable_categories JSONB DEFAULT '[]', -- Which beneficiary categories
  applicable_business_types JSONB DEFAULT '["restaurant"]', -- restaurant, bar, boutique, fast_food
  daily_limit NUMERIC,
  weekly_limit NUMERIC,
  monthly_limit NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for beneficiary cards (NFC/QR badges)
CREATE TABLE public.beneficiary_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  beneficiary_id UUID NOT NULL REFERENCES collective_beneficiaries(id),
  card_number TEXT NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'nfc', -- 'nfc', 'qr', 'rfid'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'blocked', 'lost', 'expired'
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_date DATE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, card_number)
);

-- Table for meal allowances and prepaid credits
CREATE TABLE public.meal_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  beneficiary_id UUID NOT NULL REFERENCES collective_beneficiaries(id),
  allowance_type TEXT NOT NULL, -- 'monthly_forfait', 'prepaid_tickets', 'credit_replenishment'
  amount NUMERIC NOT NULL,
  remaining_amount NUMERIC NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  purchase_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'consumed', 'expired'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for collective meals tracking
CREATE TABLE public.collective_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  beneficiary_id UUID NOT NULL REFERENCES collective_beneficiaries(id),
  collective_organization_id UUID NOT NULL REFERENCES collective_organizations(id),
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  total_amount NUMERIC NOT NULL,
  subsidy_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC NOT NULL,
  payment_method TEXT,
  business_type TEXT NOT NULL DEFAULT 'restaurant',
  pos_order_id UUID, -- Link to pos_orders if applicable
  attended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for menu planning
CREATE TABLE public.collective_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  collective_organization_id UUID NOT NULL REFERENCES collective_organizations(id),
  menu_date DATE NOT NULL,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner'
  menu_items JSONB NOT NULL DEFAULT '[]', -- Array of menu items with allergens
  price NUMERIC NOT NULL,
  allergens JSONB DEFAULT '[]',
  dietary_options JSONB DEFAULT '[]', -- vegetarian, vegan, halal, etc.
  is_published BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, collective_organization_id, menu_date, meal_type)
);

-- Enable RLS on all tables
ALTER TABLE public.collective_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidy_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiary_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_menus ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage collective organizations for their org" 
ON public.collective_organizations 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage collective beneficiaries for their org" 
ON public.collective_beneficiaries 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage subsidy programs for their org" 
ON public.subsidy_programs 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage beneficiary cards for their org" 
ON public.beneficiary_cards 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage meal allowances for their org" 
ON public.meal_allowances 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage collective meals for their org" 
ON public.collective_meals 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage collective menus for their org" 
ON public.collective_menus 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create function to calculate subsidy amount
CREATE OR REPLACE FUNCTION public.calculate_subsidy_amount(
  p_beneficiary_id UUID,
  p_base_amount NUMERIC,
  p_business_type TEXT DEFAULT 'restaurant'
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_subsidy_amount NUMERIC := 0;
  v_program_record RECORD;
  v_beneficiary_record RECORD;
BEGIN
  -- Get beneficiary info
  SELECT cb.category, cb.credit_balance, co.organization_type
  INTO v_beneficiary_record
  FROM collective_beneficiaries cb
  JOIN collective_organizations co ON cb.collective_organization_id = co.id
  WHERE cb.id = p_beneficiary_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Find applicable subsidy program
  SELECT sp.*
  INTO v_program_record
  FROM subsidy_programs sp
  JOIN collective_beneficiaries cb ON sp.collective_organization_id = cb.collective_organization_id
  WHERE cb.id = p_beneficiary_id
    AND sp.is_active = true
    AND (sp.valid_from IS NULL OR sp.valid_from <= CURRENT_DATE)
    AND (sp.valid_until IS NULL OR sp.valid_until >= CURRENT_DATE)
    AND p_business_type = ANY(sp.applicable_business_types::TEXT[])
    AND (sp.applicable_categories = '[]'::JSONB OR v_beneficiary_record.category = ANY(SELECT jsonb_array_elements_text(sp.applicable_categories)))
  ORDER BY sp.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate subsidy based on program type
  CASE v_program_record.program_type
    WHEN 'fixed_amount' THEN
      v_subsidy_amount := LEAST(p_base_amount, (v_program_record.rules->>'amount')::NUMERIC);
    WHEN 'percentage' THEN
      v_subsidy_amount := p_base_amount * (v_program_record.rules->>'percentage')::NUMERIC / 100;
    WHEN 'free_meal' THEN
      v_subsidy_amount := p_base_amount;
    ELSE
      v_subsidy_amount := 0;
  END CASE;
  
  -- Apply daily/weekly/monthly limits if set
  -- (Implementation would check usage for current period)
  
  RETURN GREATEST(0, v_subsidy_amount);
END;
$$;