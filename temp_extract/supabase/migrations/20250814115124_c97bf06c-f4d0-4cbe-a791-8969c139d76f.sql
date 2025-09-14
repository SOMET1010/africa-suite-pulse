-- Create authenticate_pos_user function with hybrid MD5/bcrypt support
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_org_id uuid, p_pin text)
RETURNS TABLE(user_id uuid, display_name text, role_name text, session_token text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_record RECORD;
  v_session_token TEXT;
  v_session_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check rate limiting first
  IF NOT public.check_rate_limit('pos_login_' || p_org_id::text, 'pos_login', 10, 15) THEN
    RAISE EXCEPTION 'Trop de tentatives de connexion. Veuillez patienter.';
  END IF;

  -- Try to find user with MD5 hash first (legacy support)
  SELECT pu.user_id, pu.display_name, ur.role::text as role_name
  INTO v_user_record
  FROM public.pos_users pu
  LEFT JOIN public.user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.org_id = p_org_id 
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true
  LIMIT 1;

  -- If not found with MD5, try bcrypt (new format)
  IF NOT FOUND THEN
    SELECT pu.user_id, pu.display_name, ur.role::text as role_name
    INTO v_user_record
    FROM public.pos_users pu
    LEFT JOIN public.user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
    WHERE pu.org_id = p_org_id 
      AND crypt(p_pin, pu.pin_hash) = pu.pin_hash
      AND pu.is_active = true
    LIMIT 1;
  END IF;

  -- If still not found, authentication failed
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PIN invalide ou utilisateur inactif';
  END IF;

  -- Generate session token and expiry
  v_session_token := encode(gen_random_bytes(32), 'base64');
  v_session_expiry := now() + INTERVAL '8 hours';

  -- Create session record
  INSERT INTO public.pos_sessions (
    org_id, user_id, session_token, expires_at, is_active
  ) VALUES (
    p_org_id, v_user_record.user_id, v_session_token, v_session_expiry, true
  );

  -- Return session data
  RETURN QUERY SELECT 
    v_user_record.user_id, 
    v_user_record.display_name, 
    COALESCE(v_user_record.role_name, 'pos_server'),
    v_session_token;
END;
$function$;

-- Ensure validate_pos_session function exists
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

-- Ensure logout_pos_session function exists
CREATE OR REPLACE FUNCTION public.logout_pos_session(p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.pos_sessions 
  SET is_active = false 
  WHERE session_token = p_session_token;
  
  RETURN FOUND;
END;
$function$;