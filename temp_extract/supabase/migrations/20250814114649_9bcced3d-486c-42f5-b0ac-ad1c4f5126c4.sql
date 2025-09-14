-- Fix authenticate_pos_user function to support both MD5 and bcrypt formats
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
  v_stored_hash TEXT;
BEGIN
  -- Find user and get their stored PIN hash
  SELECT pu.user_id, pu.display_name, pu.pin_hash 
  INTO v_found_user_id, v_found_display_name, v_stored_hash
  FROM public.pos_users pu
  WHERE pu.org_id = p_org_id 
    AND pu.is_active = true;
  
  IF v_found_user_id IS NULL THEN
    RETURN; -- No users found
  END IF;
  
  -- Check PIN based on hash format
  IF v_stored_hash IS NOT NULL THEN
    -- Check if it's MD5 format (32 characters, hexadecimal)
    IF LENGTH(v_stored_hash) = 32 AND v_stored_hash ~ '^[a-f0-9]{32}$' THEN
      -- MD5 verification
      IF v_stored_hash != MD5(p_pin) THEN
        RETURN; -- Invalid PIN
      END IF;
    ELSIF v_stored_hash LIKE '$2%' THEN
      -- bcrypt verification
      IF v_stored_hash != crypt(p_pin, v_stored_hash) THEN
        RETURN; -- Invalid PIN
      END IF;
    ELSE
      RETURN; -- Unknown hash format
    END IF;
  ELSE
    RETURN; -- No PIN hash stored
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

-- Update validate_pos_session function to be consistent
CREATE OR REPLACE FUNCTION public.validate_pos_session(p_session_token text)
 RETURNS TABLE(user_id uuid, display_name text, role_name text, org_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session_record RECORD;
BEGIN
  -- Check if session exists and is valid
  SELECT ps.user_id, ps.org_id, pu.display_name, ur.role::text as role_name
  INTO v_session_record
  FROM public.pos_sessions ps
  JOIN public.pos_users pu ON ps.user_id = pu.user_id AND ps.org_id = pu.org_id
  LEFT JOIN public.user_roles ur ON ps.user_id = ur.user_id AND ps.org_id = ur.org_id
  WHERE ps.session_token = p_session_token
    AND ps.is_active = true
    AND ps.expires_at > now()
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN; -- Invalid or expired session
  END IF;
  
  -- Update last activity
  UPDATE public.pos_sessions 
  SET last_activity = now() 
  WHERE session_token = p_session_token;
  
  -- Return session data
  RETURN QUERY SELECT 
    v_session_record.user_id, 
    v_session_record.display_name, 
    COALESCE(v_session_record.role_name, 'pos_server'),
    v_session_record.org_id;
END;
$function$;