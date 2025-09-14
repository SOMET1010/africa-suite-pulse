-- Fix security issues: Update functions with proper search_path setting

-- Fix authenticate_pos_user function
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_org_id UUID, p_pin TEXT)
RETURNS TABLE(user_id UUID, display_name TEXT, role_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_display_name TEXT;
  v_role_name TEXT;
BEGIN
  -- Find user with matching PIN hash using crypt verification
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

-- Fix create_pos_user function
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