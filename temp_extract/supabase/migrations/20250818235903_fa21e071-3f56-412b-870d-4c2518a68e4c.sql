-- Fix all ambiguous column references in secure_pos_authenticate function
DROP FUNCTION IF EXISTS public.secure_pos_authenticate(text, text, uuid);

CREATE OR REPLACE FUNCTION public.secure_pos_authenticate(p_employee_code text, p_pin text, p_org_id uuid)
RETURNS TABLE(pos_user_id uuid, display_name text, role_name text, employee_code text, session_token text, expires_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pos_user RECORD;
  v_session_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Use explicit table alias to avoid all ambiguity
  SELECT pas.* INTO v_pos_user
  FROM pos_auth_system pas
  WHERE pas.org_id = p_org_id 
    AND pas.employee_code = p_employee_code
    AND pas.is_active = true;
  
  IF v_pos_user.id IS NULL THEN
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', 'user_not_found');
    RETURN;
  END IF;
  
  IF v_pos_user.locked_until IS NOT NULL AND v_pos_user.locked_until > now() THEN
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', 'account_locked');
    RETURN;
  END IF;
  
  IF NOT verify_pos_pin(p_pin, v_pos_user.pin_hash) THEN
    UPDATE pos_auth_system pas
    SET failed_attempts = pas.failed_attempts + 1,
        locked_until = CASE 
          WHEN pas.failed_attempts + 1 >= 5 THEN now() + interval '15 minutes'
          ELSE NULL 
        END,
        updated_at = now()
    WHERE pas.id = v_pos_user.id;
    
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', 'invalid_pin');
    RETURN;
  END IF;
  
  -- Reset failed attempts on successful login
  UPDATE pos_auth_system pas
  SET failed_attempts = 0,
      locked_until = NULL,
      last_login_at = now(),
      updated_at = now()
  WHERE pas.id = v_pos_user.id;
  
  -- Generate session token
  v_session_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text)::bytea), 'hex');
  v_expires_at := now() + interval '8 hours';
  
  -- Deactivate old sessions with explicit table alias
  UPDATE pos_secure_sessions pss 
  SET is_active = false 
  WHERE pss.pos_user_id = v_pos_user.id;
  
  -- Create new session
  INSERT INTO pos_secure_sessions (
    pos_user_id, session_token, refresh_token, expires_at, refresh_expires_at
  ) VALUES (
    v_pos_user.id, v_session_token, 
    encode(sha256((gen_random_uuid()::text || 'refresh')::bytea), 'hex'),
    v_expires_at, now() + interval '7 days'
  );
  
  -- Log successful authentication
  INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type)
  VALUES (p_org_id, p_employee_code, 'login_success');
  
  -- Return authentication result
  RETURN QUERY SELECT
    v_pos_user.id AS pos_user_id, 
    v_pos_user.display_name, 
    v_pos_user.role_name,
    v_pos_user.employee_code, 
    v_session_token AS session_token, 
    v_expires_at AS expires_at;
END;
$function$;