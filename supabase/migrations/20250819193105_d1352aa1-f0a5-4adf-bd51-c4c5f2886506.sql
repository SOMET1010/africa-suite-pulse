-- Fix validate_pos_secure_session function to be VOLATILE instead of STABLE
-- since it updates last_activity_at

DROP FUNCTION IF EXISTS validate_pos_secure_session(text);

CREATE OR REPLACE FUNCTION public.validate_pos_secure_session(p_session_token text)
RETURNS TABLE(pos_user_id uuid, display_name text, role_name text, employee_code text, org_id uuid, outlet_id uuid)
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session RECORD;
BEGIN
  SELECT 
    s.pos_user_id, s.outlet_id, s.expires_at, s.is_active,
    u.display_name, u.role_name, u.employee_code, u.org_id, u.is_active as user_active
  INTO v_session
  FROM pos_secure_sessions s
  JOIN pos_auth_system u ON s.pos_user_id = u.id
  WHERE s.session_token = p_session_token;
  
  IF v_session.pos_user_id IS NULL OR NOT v_session.is_active 
     OR NOT v_session.user_active OR v_session.expires_at < now() THEN
    RETURN;
  END IF;
  
  -- Update last activity (this makes the function VOLATILE)
  UPDATE pos_secure_sessions SET last_activity_at = now() WHERE session_token = p_session_token;
  
  RETURN QUERY SELECT
    v_session.pos_user_id, v_session.display_name, v_session.role_name,
    v_session.employee_code, v_session.org_id, v_session.outlet_id;
END;
$function$;