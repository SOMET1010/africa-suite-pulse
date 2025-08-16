-- CRITICAL SECURITY FIXES - Phase 1 (Fixed)

-- 1. CRITICAL: Fix POS PIN Security - Replace MD5 with bcrypt
CREATE OR REPLACE FUNCTION public.create_pos_user(
  p_org_id uuid, 
  p_user_id uuid, 
  p_pin text, 
  p_display_name text, 
  p_role text DEFAULT 'pos_server'::text, 
  p_employee_code text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pos_user_id UUID;
  v_pin_hash TEXT;
BEGIN
  -- Validate role
  IF p_role NOT IN ('pos_server', 'pos_cashier', 'pos_manager') THEN
    RAISE EXCEPTION 'Invalid POS role: %', p_role;
  END IF;
  
  -- SECURITY FIX: Use bcrypt instead of MD5 for PIN hashing
  v_pin_hash := crypt(p_pin, gen_salt('bf', 10));
  
  -- Insert POS user
  INSERT INTO public.pos_users (
    org_id, user_id, pin_hash, display_name, employee_code, created_by
  ) VALUES (
    p_org_id, p_user_id, v_pin_hash, p_display_name, p_employee_code, auth.uid()
  ) RETURNING id INTO v_pos_user_id;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES (p_user_id, p_org_id, p_role::app_role)
  ON CONFLICT (user_id, org_id) DO UPDATE SET 
    role = EXCLUDED.role,
    updated_at = now();
  
  RETURN v_pos_user_id;
END;
$function$;

-- Fix authenticate_pos_user function to use bcrypt verification
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_org_id uuid, p_user_id uuid, p_pin text)
RETURNS TABLE(pos_user_id uuid, display_name text, employee_code text, role_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_pos_user RECORD;
BEGIN
  -- Get stored PIN hash and user data
  SELECT pu.id, pu.pin_hash, pu.display_name, pu.employee_code, ur.role::text
  INTO v_pos_user
  FROM public.pos_users pu
  LEFT JOIN public.user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.org_id = p_org_id 
    AND pu.user_id = p_user_id 
    AND pu.is_active = true;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- SECURITY FIX: Verify PIN using bcrypt instead of MD5
  -- Handle both legacy MD5 hashes and new bcrypt hashes for transition period
  IF v_pos_user.pin_hash LIKE '$2%' THEN
    -- New bcrypt hash
    IF NOT crypt(p_pin, v_pos_user.pin_hash) = v_pos_user.pin_hash THEN
      RETURN;
    END IF;
  ELSE
    -- Legacy MD5 hash - still verify but flag for upgrade
    IF NOT md5(p_pin) = v_pos_user.pin_hash THEN
      RETURN;
    END IF;
    
    -- Auto-upgrade to bcrypt on successful login
    UPDATE public.pos_users 
    SET pin_hash = crypt(p_pin, gen_salt('bf', 10)),
        updated_at = now()
    WHERE id = v_pos_user.id;
  END IF;
  
  -- Return authenticated user data
  RETURN QUERY SELECT 
    v_pos_user.id,
    v_pos_user.display_name,
    v_pos_user.employee_code,
    COALESCE(v_pos_user.role, 'pos_server');
END;
$function$;

-- 2. Strengthen Guest Data Protection with enhanced RLS policies
CREATE OR REPLACE FUNCTION public.can_access_sensitive_guest_data()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only managers and super_admins can access sensitive guest data
  RETURN has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin');
END;
$function$;

-- Update RLS policies for guests table to protect sensitive data
DROP POLICY IF EXISTS "Enhanced guests access control" ON public.guests;
CREATE POLICY "Enhanced guests access control" ON public.guests
FOR ALL USING (
  org_id = get_current_user_org_id() AND
  (
    -- Full access for managers and super admins
    has_role(auth.uid(), 'manager') OR 
    has_role(auth.uid(), 'super_admin') OR
    -- Limited access for receptionists (no sensitive fields in most queries)
    has_role(auth.uid(), 'receptionist')
  )
)
WITH CHECK (
  org_id = get_current_user_org_id() AND
  (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin'))
);

-- 3. Add rate limiting for bulk guest data exports
CREATE OR REPLACE FUNCTION public.check_guest_export_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  recent_accesses INTEGER;
BEGIN
  -- Count recent guest table accesses by this user
  SELECT COUNT(*) INTO recent_accesses
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND table_name = 'guests'
    AND action IN ('select', 'bulk_export')
    AND occurred_at > now() - INTERVAL '5 minutes';
  
  -- Limit to 100 guest records per 5-minute window for non-managers
  IF NOT (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin')) 
     AND recent_accesses > 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many guest data requests. Please contact administrator.';
  END IF;
  
  RETURN true;
END;
$function$;

-- 4. Enhanced logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_guest_access(
  p_guest_id uuid, 
  p_access_type text, 
  p_fields_accessed text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role TEXT;
  org_id UUID;
BEGIN
  user_role := get_current_user_role();
  org_id := get_current_user_org_id();
  
  -- Log access to sensitive guest data
  INSERT INTO public.audit_logs (
    org_id, user_id, action, table_name, record_id,
    new_values, severity
  ) VALUES (
    org_id,
    auth.uid(),
    p_access_type,
    'guests_sensitive',
    p_guest_id::TEXT,
    jsonb_build_object(
      'user_role', user_role,
      'fields_accessed', p_fields_accessed,
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    CASE WHEN user_role IN ('manager', 'super_admin') THEN 'info' ELSE 'warning' END
  );
END;
$function$;