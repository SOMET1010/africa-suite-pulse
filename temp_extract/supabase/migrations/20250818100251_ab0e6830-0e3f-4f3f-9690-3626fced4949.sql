-- Corriger la fonction authenticate_pos_user pour retourner le bon rôle
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
  
  -- Find POS user by PIN using direct query (bypass RLS)
  SELECT pu.user_id, pu.display_name
  INTO v_user_record
  FROM pos_users pu
  WHERE pu.org_id = v_org_id
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true
  LIMIT 1;
  
  IF v_user_record.user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  -- Get user role - Check for POS specific roles first
  IF public.check_user_role_safe(v_user_record.user_id, 'pos_manager') THEN
    v_role := 'pos_manager';
  ELSIF public.check_user_role_safe(v_user_record.user_id, 'pos_server') THEN
    v_role := 'pos_server';
  ELSIF public.check_user_role_safe(v_user_record.user_id, 'pos_cashier') THEN
    v_role := 'pos_cashier';
  ELSIF public.check_user_role_safe(v_user_record.user_id, 'manager') THEN
    v_role := 'manager';
  ELSIF public.check_user_role_safe(v_user_record.user_id, 'receptionist') THEN
    v_role := 'receptionist';
  ELSE
    v_role := 'pos_server'; -- Default role
  END IF;
  
  -- Generate session
  v_session_token := gen_random_uuid()::text;
  v_expires_at := now() + INTERVAL '8 hours';
  
  -- Insert session directly (bypass RLS)
  INSERT INTO pos_auth_sessions (
    user_id, org_id, session_token, expires_at
  ) VALUES (
    v_user_record.user_id, v_org_id, v_session_token, v_expires_at
  );
  
  RETURN QUERY SELECT 
    v_session_token,
    v_user_record.user_id,
    v_user_record.display_name,
    v_role,
    v_org_id,
    NULL::uuid;
END;
$function$;