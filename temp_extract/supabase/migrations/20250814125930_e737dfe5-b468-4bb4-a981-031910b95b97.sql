-- Create POS authentication sessions table
CREATE TABLE public.pos_auth_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  outlet_id UUID NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add indexes for performance
CREATE INDEX idx_pos_auth_sessions_token ON public.pos_auth_sessions(session_token);
CREATE INDEX idx_pos_auth_sessions_user_org ON public.pos_auth_sessions(user_id, org_id);

-- Enable RLS
ALTER TABLE public.pos_auth_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage auth sessions for their org" 
ON public.pos_auth_sessions 
FOR ALL 
USING (org_id = get_current_user_org_id());

-- Update authenticate_pos_user function to use new table
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
  
  -- Find user by PIN and org using MD5 hash comparison
  SELECT pu.user_id, pu.display_name, ur.role::text as role_name
  INTO v_user_record
  FROM public.pos_users pu
  LEFT JOIN public.user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.org_id = v_org_id
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  -- Generate session token using gen_random_uuid
  v_session_token := gen_random_uuid()::text;
  v_expires_at := now() + INTERVAL '8 hours';
  
  -- Create authentication session
  INSERT INTO public.pos_auth_sessions (
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

-- Create validate_pos_session function
CREATE OR REPLACE FUNCTION public.validate_pos_session(p_session_token text)
 RETURNS TABLE(user_id uuid, display_name text, role_name text, org_id uuid, outlet_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session_record RECORD;
BEGIN
  -- Find active session
  SELECT 
    pas.user_id, 
    pas.org_id, 
    pas.outlet_id,
    pu.display_name,
    ur.role::text as role_name
  INTO v_session_record
  FROM public.pos_auth_sessions pas
  JOIN public.pos_users pu ON pas.user_id = pu.user_id AND pas.org_id = pu.org_id
  LEFT JOIN public.user_roles ur ON pas.user_id = ur.user_id AND pas.org_id = ur.org_id
  WHERE pas.session_token = p_session_token
    AND pas.is_active = true
    AND pas.expires_at > now()
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Return session data
  RETURN QUERY SELECT 
    v_session_record.user_id,
    v_session_record.display_name,
    COALESCE(v_session_record.role_name, 'pos_server'),
    v_session_record.org_id,
    v_session_record.outlet_id;
END;
$function$;

-- Create logout_pos_session function
CREATE OR REPLACE FUNCTION public.logout_pos_session(p_session_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Deactivate session
  UPDATE public.pos_auth_sessions 
  SET is_active = false
  WHERE session_token = p_session_token;
END;
$function$;