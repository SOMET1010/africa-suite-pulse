-- Fix validate_pos_session function to return role_name instead of role
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