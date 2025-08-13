-- Fix the authenticate_pos_user function to resolve column ambiguity
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_org_id uuid, p_pin text)
RETURNS TABLE(user_id uuid, display_name text, role_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_found_user_id UUID;
  v_found_display_name TEXT;
  v_found_role_name TEXT;
BEGIN
  -- Find user with matching PIN hash using md5
  SELECT pu.user_id, pu.display_name INTO v_found_user_id, v_found_display_name
  FROM public.pos_users pu
  WHERE pu.org_id = p_org_id 
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true;
  
  IF v_found_user_id IS NULL THEN
    RETURN; -- Invalid PIN
  END IF;
  
  -- Get the user's POS role
  SELECT ur.role::TEXT INTO v_found_role_name
  FROM public.user_roles ur
  WHERE ur.user_id = v_found_user_id 
    AND ur.org_id = p_org_id
    AND ur.role IN ('pos_server', 'pos_cashier', 'pos_manager')
  LIMIT 1;
  
  -- Update last login time using explicit column references
  UPDATE public.pos_users 
  SET last_login_at = now(), updated_at = now()
  WHERE pos_users.user_id = v_found_user_id AND pos_users.org_id = p_org_id;
  
  -- Return user info
  RETURN QUERY SELECT v_found_user_id, v_found_display_name, COALESCE(v_found_role_name, 'pos_server');
END;
$$;