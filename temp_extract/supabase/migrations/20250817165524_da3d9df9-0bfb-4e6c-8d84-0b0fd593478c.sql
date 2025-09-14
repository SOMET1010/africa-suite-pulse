-- Fix the has_role function to avoid recursion by bypassing RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  role_exists boolean;
BEGIN
  -- Use a simpler approach that bypasses RLS completely
  -- by using a direct query with security definer privileges
  EXECUTE 'SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN app_users au ON ur.user_id = au.user_id AND ur.org_id = au.org_id
    WHERE ur.user_id = $1
    AND ur.role = $2::app_role
    AND au.active = true
  )' INTO role_exists USING _user_id, _role;
  
  RETURN role_exists;
END;
$function$;

-- Also create a simplified version of authenticate_pos_user that doesn't rely on has_role
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
  v_role text;
BEGIN
  -- Get default org if none provided
  IF p_org_id IS NULL THEN
    SELECT hs.org_id INTO v_org_id 
    FROM hotel_settings hs 
    LIMIT 1;
  ELSE
    v_org_id := p_org_id;
  END IF;
  
  -- Find POS user by PIN using SECURITY DEFINER to bypass RLS
  EXECUTE 'SELECT pu.user_id, pu.display_name
           FROM pos_users pu
           WHERE pu.org_id = $1
             AND pu.pin_hash = md5($2)
             AND pu.is_active = true
           LIMIT 1'
  INTO v_user_record
  USING v_org_id, p_pin;
  
  IF v_user_record.user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  -- Get user role directly
  EXECUTE 'SELECT ur.role::text 
           FROM user_roles ur
           WHERE ur.user_id = $1 
             AND ur.org_id = $2
           LIMIT 1'
  INTO v_role
  USING v_user_record.user_id, v_org_id;
  
  -- Generate session
  v_session_token := gen_random_uuid()::text;
  v_expires_at := now() + INTERVAL '8 hours';
  
  INSERT INTO pos_auth_sessions (
    user_id, org_id, session_token, expires_at
  ) VALUES (
    v_user_record.user_id, v_org_id, v_session_token, v_expires_at
  );
  
  RETURN QUERY SELECT 
    v_session_token,
    v_user_record.user_id,
    v_user_record.display_name,
    COALESCE(v_role, 'pos_server'),
    v_org_id,
    NULL::uuid;
END;
$function$;