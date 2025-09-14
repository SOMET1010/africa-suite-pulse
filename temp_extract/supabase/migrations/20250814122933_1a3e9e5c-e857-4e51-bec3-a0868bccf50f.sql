-- Fix gen_random_bytes error by using gen_random_uuid instead

-- Drop existing functions
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, uuid);
DROP FUNCTION IF EXISTS public.validate_pos_session(text);
DROP FUNCTION IF EXISTS public.logout_pos_session(text);

-- Recreate authenticate_pos_user function with gen_random_uuid
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(session_token text, user_id uuid, display_name text, role_name text, org_id uuid, outlet_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
  v_user_record RECORD;
  v_session_token text;
  v_expires_at timestamptz;
BEGIN
  -- Use provided org_id or fall back to current user's org
  v_org_id := COALESCE(p_org_id, get_current_user_org_id());
  
  -- Check rate limiting
  IF NOT public.check_rate_limit(
    COALESCE(inet_client_addr()::text, 'unknown') || '_pos_login',
    'pos_login',
    5, -- max 5 attempts
    15  -- per 15 minutes
  ) THEN
    RAISE EXCEPTION 'Too many login attempts. Please try again later.';
  END IF;
  
  -- Find user by PIN and org
  SELECT pu.user_id, pu.display_name, ur.role::text as role_name
  INTO v_user_record
  FROM public.pos_users pu
  LEFT JOIN public.user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.org_id = v_org_id
    AND pu.pin_hash = crypt(p_pin, pu.pin_hash)
    AND pu.is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  -- Generate session token using gen_random_uuid
  v_session_token := gen_random_uuid()::text;
  v_expires_at := now() + INTERVAL '8 hours';
  
  -- Create session
  INSERT INTO public.pos_sessions (
    user_id, org_id, session_token, expires_at
  ) VALUES (
    v_user_record.user_id, v_org_id, v_session_token, v_expires_at
  );
  
  -- Return session data
  RETURN QUERY SELECT 
    v_session_token,
    v_user_record.user_id,
    v_user_record.display_name,
    COALESCE(v_user_record.role_name, 'pos_server'),
    v_org_id,
    NULL::uuid; -- outlet_id can be set later
END;
$function$;

-- Recreate validate_pos_session function
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

-- Recreate logout_pos_session function
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