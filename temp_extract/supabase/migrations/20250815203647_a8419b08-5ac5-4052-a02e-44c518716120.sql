-- Create modules table
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  category text NOT NULL,
  base_price_monthly numeric NOT NULL DEFAULT 0,
  is_core boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  dependencies text[] DEFAULT '{}',
  features jsonb DEFAULT '[]',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create deployment types table
CREATE TABLE public.deployment_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_modifier numeric NOT NULL DEFAULT 1.0, -- 1.0 = no change, 0.8 = -20%, 1.2 = +20%
  setup_fee numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create organization modules table
CREATE TABLE public.organization_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.modules(id),
  deployment_type_id uuid NOT NULL REFERENCES public.deployment_types(id),
  is_active boolean NOT NULL DEFAULT true,
  activated_at timestamp with time zone NOT NULL DEFAULT now(),
  deactivated_at timestamp with time zone,
  trial_until date,
  custom_price numeric, -- Override base price if needed
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(org_id, module_id)
);

-- Create module packages table for predefined bundles
CREATE TABLE public.module_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  target_audience text,
  module_ids uuid[] NOT NULL,
  base_price_monthly numeric NOT NULL,
  discount_percentage numeric DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active modules" ON public.modules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view deployment types" ON public.deployment_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Organizations can manage their modules" ON public.organization_modules
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Anyone can view active packages" ON public.module_packages
  FOR SELECT USING (is_active = true);

-- Insert deployment types
INSERT INTO public.deployment_types (code, name, description, price_modifier, setup_fee) VALUES
('cloud', 'Cloud', 'Hébergé sur nos serveurs sécurisés', 1.0, 0),
('on_premise', 'On-Premise', 'Installation sur vos serveurs', 0.8, 500);

-- Insert core modules
INSERT INTO public.modules (code, name, description, icon, category, base_price_monthly, is_core, features) VALUES
('core', 'Core', 'Fonctionnalités de base : authentification, paramètres, tableau de bord', 'Settings', 'core', 29, true, 
 '["Authentification", "Gestion utilisateurs", "Dashboard basique", "Paramètres organisation"]'),
 
('hotel', 'Hôtelier', 'Gestion hôtelière complète : réservations, rack, check-in/out', 'Building', 'hospitality', 49, false,
 '["Gestion réservations", "Rack management", "Check-in/Check-out", "Facturation hôtelière", "Gestion chambres"]'),
 
('restaurant', 'Restaurant POS', 'Point de vente restaurant : commandes, tables, facturation', 'UtensilsCrossed', 'pos', 39, false,
 '["Point de vente", "Gestion tables", "Commandes", "Facturation restaurant", "Inventaire de base"]'),
 
('operations', 'Opérations', 'Gestion opérationnelle : ménage, maintenance, inventaire', 'Wrench', 'operations', 29, false,
 '["Gestion ménage", "Maintenance", "Inventaire avancé", "Planning staff", "Contrôle qualité"]'),
 
('analytics', 'Analytics Pro', 'Rapports avancés et business intelligence', 'BarChart3', 'analytics', 19, false,
 '["Rapports personnalisés", "Tableaux de bord avancés", "Prédictions", "Export données", "KPI métier"]'),
 
('multisite', 'Multi-Propriétés', 'Gestion de chaînes et multi-établissements', 'Network', 'enterprise', 99, false,
 '["Gestion multi-sites", "Consolidation données", "Rapports globaux", "Gestion centralisée", "Droits granulaires"]');

-- Function to calculate organization total cost
CREATE OR REPLACE FUNCTION public.calculate_organization_module_cost(p_org_id uuid)
RETURNS TABLE(
  total_monthly_cost numeric,
  total_setup_fees numeric,
  module_count integer,
  active_modules jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_monthly_cost numeric := 0;
  v_setup_fees numeric := 0;
  v_count integer := 0;
  v_modules jsonb := '[]'::jsonb;
BEGIN
  SELECT 
    COALESCE(SUM(
      COALESCE(om.custom_price, m.base_price_monthly) * dt.price_modifier
    ), 0),
    COALESCE(SUM(dt.setup_fee), 0),
    COUNT(*),
    jsonb_agg(jsonb_build_object(
      'module_code', m.code,
      'module_name', m.name,
      'deployment_type', dt.name,
      'monthly_cost', COALESCE(om.custom_price, m.base_price_monthly) * dt.price_modifier,
      'is_trial', om.trial_until IS NOT NULL AND om.trial_until >= CURRENT_DATE
    ))
  INTO v_monthly_cost, v_setup_fees, v_count, v_modules
  FROM public.organization_modules om
  JOIN public.modules m ON om.module_id = m.id
  JOIN public.deployment_types dt ON om.deployment_type_id = dt.id
  WHERE om.org_id = p_org_id AND om.is_active = true;
  
  RETURN QUERY SELECT v_monthly_cost, v_setup_fees, v_count, v_modules;
END;
$$;

-- Function to activate module for organization
CREATE OR REPLACE FUNCTION public.activate_organization_module(
  p_org_id uuid,
  p_module_code text,
  p_deployment_type_code text,
  p_trial_days integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_module_id uuid;
  v_deployment_id uuid;
  v_org_module_id uuid;
  v_trial_until date;
BEGIN
  -- Get module ID
  SELECT id INTO v_module_id FROM public.modules WHERE code = p_module_code AND is_active = true;
  IF v_module_id IS NULL THEN
    RAISE EXCEPTION 'Module not found: %', p_module_code;
  END IF;
  
  -- Get deployment type ID
  SELECT id INTO v_deployment_id FROM public.deployment_types WHERE code = p_deployment_type_code AND is_active = true;
  IF v_deployment_id IS NULL THEN
    RAISE EXCEPTION 'Deployment type not found: %', p_deployment_type_code;
  END IF;
  
  -- Calculate trial period
  IF p_trial_days IS NOT NULL THEN
    v_trial_until := CURRENT_DATE + (p_trial_days || ' days')::interval;
  END IF;
  
  -- Insert or update module
  INSERT INTO public.organization_modules (org_id, module_id, deployment_type_id, trial_until)
  VALUES (p_org_id, v_module_id, v_deployment_id, v_trial_until)
  ON CONFLICT (org_id, module_id) 
  DO UPDATE SET 
    deployment_type_id = EXCLUDED.deployment_type_id,
    is_active = true,
    activated_at = now(),
    deactivated_at = NULL,
    trial_until = EXCLUDED.trial_until,
    updated_at = now()
  RETURNING id INTO v_org_module_id;
  
  RETURN v_org_module_id;
END;
$$;