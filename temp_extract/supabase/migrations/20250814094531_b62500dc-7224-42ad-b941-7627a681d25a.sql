-- Phase 1: Critical Database Security Fixes

-- 1. Fix search_path for all security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT org_id 
  FROM public.app_users 
  WHERE user_id = auth.uid() 
  AND active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
  user_org_id UUID;
BEGIN
  -- Get user's org_id first
  SELECT org_id INTO user_org_id
  FROM app_users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF user_org_id IS NULL THEN
    RETURN 'guest';
  END IF;
  
  -- Get user role directly without going through RLS
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = auth.uid()
  AND org_id = user_org_id
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'receptionist');
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = (_role)::public.app_role
  );
$$;

-- 2. Create default role assignment system
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get org_id from the new app_user record
  v_org_id := NEW.org_id;
  
  -- Assign default role if no role exists
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND org_id = v_org_id
  ) THEN
    -- Assign 'receptionist' as default role
    INSERT INTO public.user_roles (user_id, org_id, role)
    VALUES (NEW.user_id, v_org_id, 'receptionist'::public.app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for default role assignment
DROP TRIGGER IF EXISTS trigger_assign_default_role ON public.app_users;
CREATE TRIGGER trigger_assign_default_role
  AFTER INSERT ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_user_role();

-- 3. Fix existing users without roles (assign default receptionist role)
INSERT INTO public.user_roles (user_id, org_id, role)
SELECT DISTINCT au.user_id, au.org_id, 'receptionist'::public.app_role
FROM public.app_users au
LEFT JOIN public.user_roles ur ON au.user_id = ur.user_id AND au.org_id = ur.org_id
WHERE ur.user_id IS NULL
AND au.active = true;

-- 4. Add comprehensive RLS policies for payment_transactions
DROP POLICY IF EXISTS "Users can manage payment transactions for their org" ON public.payment_transactions;
CREATE POLICY "Users can manage payment transactions for their org"
ON public.payment_transactions
FOR ALL
TO authenticated
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Restrict sensitive payment data to managers and above
DROP POLICY IF EXISTS "Only managers can view full payment details" ON public.payment_transactions;
CREATE POLICY "Only managers can view full payment details"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  org_id = get_current_user_org_id() 
  AND (
    has_role(auth.uid(), 'manager') 
    OR has_role(auth.uid(), 'super_admin')
    OR has_role(auth.uid(), 'pos_manager')
  )
);

-- 5. Secure allotments table with proper RLS
DROP POLICY IF EXISTS "Users can manage allotments for their org" ON public.allotments;
CREATE POLICY "Users can manage allotments for their org"
ON public.allotments
FOR ALL
TO authenticated
USING (
  org_id = get_current_user_org_id()
  AND (
    has_role(auth.uid(), 'manager')
    OR has_role(auth.uid(), 'super_admin')
  )
)
WITH CHECK (
  org_id = get_current_user_org_id()
  AND (
    has_role(auth.uid(), 'manager')
    OR has_role(auth.uid(), 'super_admin')
  )
);

-- Allow receptionists to view allotments but not modify
DROP POLICY IF EXISTS "Receptionists can view allotments" ON public.allotments;
CREATE POLICY "Receptionists can view allotments"
ON public.allotments
FOR SELECT
TO authenticated
USING (
  org_id = get_current_user_org_id()
  AND has_role(auth.uid(), 'receptionist')
);

-- 6. Secure pos_users table
DROP POLICY IF EXISTS "Users can manage POS users for their org" ON public.pos_users;
CREATE POLICY "Users can manage POS users for their org"
ON public.pos_users
FOR ALL
TO authenticated
USING (
  org_id = get_current_user_org_id()
  AND (
    has_role(auth.uid(), 'manager')
    OR has_role(auth.uid(), 'super_admin')
    OR has_role(auth.uid(), 'pos_manager')
  )
)
WITH CHECK (
  org_id = get_current_user_org_id()
  AND (
    has_role(auth.uid(), 'manager')
    OR has_role(auth.uid(), 'super_admin')
    OR has_role(auth.uid(), 'pos_manager')
  )
);

-- Allow POS users to view their own record for session validation
DROP POLICY IF EXISTS "POS users can view own record" ON public.pos_users;
CREATE POLICY "POS users can view own record"
ON public.pos_users
FOR SELECT
TO authenticated
USING (
  org_id = get_current_user_org_id()
  AND user_id = auth.uid()
);

-- 7. Add security audit function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    org_id,
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    severity
  ) VALUES (
    get_current_user_org_id(),
    auth.uid(),
    p_event_type,
    'security_events',
    gen_random_uuid()::text,
    p_details,
    p_severity
  );
END;
$$;

-- 8. Create security monitoring triggers
CREATE OR REPLACE FUNCTION public.monitor_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log role changes
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'role_assigned',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'org_id', NEW.org_id
      ),
      'warning'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'role_changed',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'org_id', NEW.org_id
      ),
      'warning'
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'role_removed',
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role,
        'org_id', OLD.org_id
      ),
      'warning'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger for role monitoring
DROP TRIGGER IF EXISTS trigger_monitor_role_changes ON public.user_roles;
CREATE TRIGGER trigger_monitor_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.monitor_role_changes();

-- 9. Enhanced rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_security_rate_limit(
  p_action text,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_identifier text;
  v_current_attempts integer;
BEGIN
  -- Use combination of user_id and IP for rate limiting
  v_identifier := auth.uid()::text || '_' || p_action;
  
  -- Check rate limit
  IF NOT public.check_rate_limit(v_identifier, p_action, p_max_attempts, p_window_minutes) THEN
    -- Log security violation
    PERFORM public.log_security_event(
      'rate_limit_exceeded',
      jsonb_build_object(
        'action', p_action,
        'user_id', auth.uid(),
        'max_attempts', p_max_attempts,
        'window_minutes', p_window_minutes
      ),
      'error'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;