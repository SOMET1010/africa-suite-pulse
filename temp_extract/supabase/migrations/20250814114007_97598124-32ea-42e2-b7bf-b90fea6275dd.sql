-- Fix authenticate_pos_user function to return role_name instead of role
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_org_id uuid, p_pin text)
 RETURNS TABLE(user_id uuid, display_name text, role_name text, session_token text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_found_user_id UUID;
  v_found_display_name TEXT;
  v_found_role_name TEXT;
  v_session_token TEXT;
BEGIN
  -- Find user with matching PIN hash using crypt (more secure than MD5)
  SELECT pu.user_id, pu.display_name INTO v_found_user_id, v_found_display_name
  FROM public.pos_users pu
  WHERE pu.org_id = p_org_id 
    AND pu.pin_hash = crypt(p_pin, pu.pin_hash)
    AND pu.is_active = true;
  
  IF v_found_user_id IS NULL THEN
    RETURN; -- Invalid PIN
  END IF;
  
  -- Get the user's POS role
  SELECT ur.role::TEXT INTO v_found_role_name
  FROM public.user_roles ur
  WHERE ur.user_id = v_found_user_id 
    AND ur.org_id = p_org_id
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager')
  LIMIT 1;
  
  -- Generate secure session token
  v_session_token := encode(gen_random_bytes(32), 'base64');
  
  -- Invalidate any existing sessions for this user
  UPDATE public.pos_sessions 
  SET is_active = false 
  WHERE user_id = v_found_user_id AND org_id = p_org_id;
  
  -- Create new session
  INSERT INTO public.pos_sessions (org_id, user_id, session_token, expires_at)
  VALUES (p_org_id, v_found_user_id, v_session_token, now() + INTERVAL '8 hours');
  
  -- Update last login time
  UPDATE public.pos_users 
  SET last_login_at = now(), updated_at = now()
  WHERE pos_users.user_id = v_found_user_id AND pos_users.org_id = p_org_id;
  
  -- Return user info with session token
  RETURN QUERY SELECT v_found_user_id, v_found_display_name, COALESCE(v_found_role_name, 'pos_server'), v_session_token;
END;
$function$;