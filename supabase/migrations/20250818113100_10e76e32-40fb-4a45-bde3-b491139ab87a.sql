-- Fix RLS recursion issues in POS functions

-- First, create a security definer function to safely access user data without RLS recursion
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
    pu.role_name,
    pu.org_id,
    pu.outlet_id,
    pu.is_active
  FROM pos_users pu
  WHERE pu.user_id = p_user_id;
END;
$$;

-- Update validate_pos_session to use the security definer function
CREATE OR REPLACE FUNCTION public.validate_pos_session(p_session_token text)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  role_name text,
  org_id uuid,
  outlet_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  session_user_id uuid;
  session_expires_at timestamptz;
BEGIN
  -- Get session info
  SELECT ps.user_id, ps.expires_at
  INTO session_user_id, session_expires_at
  FROM pos_sessions ps
  WHERE ps.session_token = p_session_token
    AND ps.expires_at > now()
    AND ps.is_active = true;

  -- If no valid session found, return empty
  IF session_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Get user info using the security definer function
  RETURN QUERY
  SELECT 
    gpu.user_id,
    gpu.display_name,
    gpu.role_name,
    gpu.org_id,
    gpu.outlet_id
  FROM get_pos_user_safe(session_user_id) gpu
  WHERE gpu.is_active = true;
END;
$$;

-- Also fix authenticate_pos_user function
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
BEGIN
  -- Find user by PIN and org
  SELECT pu.user_id, pu.id, pu.display_name, pu.employee_code, pu.role_name, pu.outlet_id
  INTO v_user_id, v_pos_user_id, v_display_name, v_employee_code, v_role_name, v_outlet_id
  FROM pos_users pu
  WHERE pu.pin = p_pin 
    AND pu.org_id = p_org_id 
    AND pu.is_active = true;

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