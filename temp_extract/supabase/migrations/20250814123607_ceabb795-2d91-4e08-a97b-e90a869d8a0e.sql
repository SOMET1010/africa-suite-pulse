-- Clean up function overload conflict for authenticate_pos_user

-- Drop ALL versions of the authenticate_pos_user function
DROP FUNCTION IF EXISTS public.authenticate_pos_user(uuid, text);
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, uuid);
DROP FUNCTION IF EXISTS public.authenticate_pos_user(p_org_id uuid, p_pin text);
DROP FUNCTION IF EXISTS public.authenticate_pos_user(p_pin text, p_org_id uuid);

-- Create a single, clean version of the function
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