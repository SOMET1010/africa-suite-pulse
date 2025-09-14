-- Fix authenticate_pos_user to use user_roles table instead of non-existing role_name column

CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid)
RETURNS TABLE (
  user_id uuid,
  pos_user_id uuid,
  display_name text,
  employee_code text,
  role_name text,
  org_id uuid,
  outlet_id uuid,
  session_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pos_user_id uuid;
  v_display_name text;
  v_employee_code text;
  v_role_name text;
  v_outlet_id uuid;
  v_session_token text;
  v_session_number text;
  v_pin_hash text;
BEGIN
  -- Hash the PIN for comparison
  v_pin_hash := crypt(p_pin, gen_salt('bf'));

  -- Find user by PIN and org, get role from user_roles table
  SELECT 
    pu.user_id, 
    pu.id, 
    pu.display_name, 
    pu.employee_code,
    ur.role::text,
    NULL::uuid -- outlet_id will be set later
  INTO v_user_id, v_pos_user_id, v_display_name, v_employee_code, v_role_name, v_outlet_id
  FROM pos_users pu
  INNER JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.pin_hash = crypt(p_pin, pu.pin_hash)
    AND pu.org_id = p_org_id 
    AND pu.is_active = true
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager');

  -- If user not found or invalid
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Generate session token and number
  v_session_token := encode(gen_random_bytes(32), 'base64');
  v_session_number := generate_pos_session_number();

  -- Create new session
  INSERT INTO pos_sessions (
    session_number,
    user_id,
    session_token,
    expires_at,
    is_active
  ) VALUES (
    v_session_number,
    v_user_id,
    v_session_token,
    now() + interval '8 hours',
    true
  );

  -- Return user data with session token
  RETURN QUERY
  SELECT 
    v_user_id,
    v_pos_user_id,
    v_display_name,
    v_employee_code,
    v_role_name,
    p_org_id,
    v_outlet_id,
    v_session_token;
END;
$$;

-- Also fix get_pos_user_safe function
CREATE OR REPLACE FUNCTION public.get_pos_user_safe(p_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  role_name text,
  org_id uuid,
  outlet_id uuid,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pu.user_id,
    pu.display_name,
    ur.role::text as role_name,
    pu.org_id,
    NULL::uuid as outlet_id, -- outlet_id not in pos_users table
    pu.is_active
  FROM pos_users pu
  INNER JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.user_id = p_user_id
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager');
END;
$$;