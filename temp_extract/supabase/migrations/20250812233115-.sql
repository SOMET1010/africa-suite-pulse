-- Add POS-specific roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pos_server';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pos_cashier';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pos_manager';

-- Create table for POS-specific user configuration
CREATE TABLE IF NOT EXISTS public.pos_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  pin_hash TEXT NOT NULL, -- Hashed PIN for secure storage
  display_name TEXT NOT NULL,
  employee_code TEXT, -- Optional employee code
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(org_id, user_id),
  UNIQUE(org_id, pin_hash), -- Ensure unique PINs per organization
  UNIQUE(org_id, employee_code) -- Ensure unique employee codes per organization
);

-- Enable RLS
ALTER TABLE public.pos_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage POS users for their org" 
ON public.pos_users 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create function to authenticate POS user with PIN
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_org_id UUID, p_pin TEXT)
RETURNS TABLE(user_id UUID, display_name TEXT, role_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pin_hash TEXT;
  v_user_id UUID;
  v_display_name TEXT;
  v_role_name TEXT;
BEGIN
  -- Hash the provided PIN (using crypt for PostgreSQL)
  v_pin_hash := crypt(p_pin, gen_salt('bf'));
  
  -- Find user with matching PIN hash
  SELECT pu.user_id, pu.display_name INTO v_user_id, v_display_name
  FROM public.pos_users pu
  WHERE pu.org_id = p_org_id 
    AND pu.pin_hash = crypt(p_pin, pu.pin_hash)
    AND pu.is_active = true;
  
  IF v_user_id IS NULL THEN
    RETURN; -- Invalid PIN
  END IF;
  
  -- Get the user's POS role
  SELECT ur.role::TEXT INTO v_role_name
  FROM public.user_roles ur
  WHERE ur.user_id = v_user_id 
    AND ur.org_id = p_org_id
    AND ur.role IN ('pos_server', 'pos_cashier', 'pos_manager')
  LIMIT 1;
  
  -- Update last login time
  UPDATE public.pos_users 
  SET last_login_at = now(), updated_at = now()
  WHERE user_id = v_user_id AND org_id = p_org_id;
  
  -- Return user info
  RETURN QUERY SELECT v_user_id, v_display_name, COALESCE(v_role_name, 'pos_server');
END;
$$;

-- Create function to create POS user with PIN
CREATE OR REPLACE FUNCTION public.create_pos_user(
  p_org_id UUID,
  p_user_id UUID,
  p_pin TEXT,
  p_display_name TEXT,
  p_role TEXT DEFAULT 'pos_server',
  p_employee_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pos_user_id UUID;
  v_pin_hash TEXT;
BEGIN
  -- Validate role
  IF p_role NOT IN ('pos_server', 'pos_cashier', 'pos_manager') THEN
    RAISE EXCEPTION 'Invalid POS role: %', p_role;
  END IF;
  
  -- Hash the PIN
  v_pin_hash := crypt(p_pin, gen_salt('bf'));
  
  -- Insert POS user
  INSERT INTO public.pos_users (
    org_id, user_id, pin_hash, display_name, employee_code, created_by
  ) VALUES (
    p_org_id, p_user_id, v_pin_hash, p_display_name, p_employee_code, auth.uid()
  ) RETURNING id INTO v_pos_user_id;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (p_user_id, p_org_id, p_role::app_role)
  ON CONFLICT (user_id, org_id) DO UPDATE SET 
    role = EXCLUDED.role,
    updated_at = now();
  
  RETURN v_pos_user_id;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_pos_users_updated_at
  BEFORE UPDATE ON public.pos_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();