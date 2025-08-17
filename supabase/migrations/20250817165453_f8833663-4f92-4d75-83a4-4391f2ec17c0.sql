-- Fix the recursive has_role function
-- Drop existing function
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role text);

-- Create a simple, non-recursive version
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Direct check without RLS policies interference
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    WHERE ur.user_id = _user_id
    AND ur.role = _role::app_role
  );
END;
$function$;

-- Update RLS policies to be even simpler
DROP POLICY IF EXISTS "Managers can manage user roles for their org" ON public.user_roles;

-- Simple policy that doesn't use has_role function
CREATE POLICY "Org members can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.user_id = auth.uid() 
    AND au.org_id = user_roles.org_id 
    AND au.active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.user_id = auth.uid() 
    AND au.org_id = user_roles.org_id 
    AND au.active = true
  )
);

-- Ensure authenticate_pos_user function works correctly
-- Update the function to use direct queries without RLS interference
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
  -- Get org_id
  v_org_id := COALESCE(p_org_id, (
    SELECT au.org_id FROM app_users au WHERE au.user_id = auth.uid() LIMIT 1
  ));
  
  -- Find POS user by PIN
  SELECT pu.user_id, pu.display_name
  INTO v_user_record
  FROM pos_users pu
  WHERE pu.org_id = v_org_id
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  -- Get user role directly without RLS
  SELECT ur.role::text INTO v_role
  FROM user_roles ur
  WHERE ur.user_id = v_user_record.user_id 
    AND ur.org_id = v_org_id
  LIMIT 1;
  
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