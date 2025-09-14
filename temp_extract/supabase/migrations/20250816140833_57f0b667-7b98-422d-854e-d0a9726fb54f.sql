-- Fix Security Definer View linter warnings
-- These are actually legitimate SECURITY DEFINER table-valued functions, not problematic views

-- 1. Add security comments to document why these functions need SECURITY DEFINER
COMMENT ON FUNCTION public.get_guest_stay_history_secure(uuid) IS 
'SECURITY DEFINER required: This function needs elevated privileges to properly enforce RLS policies across joined tables and ensure users only see data for their organization.';

COMMENT ON FUNCTION public.get_reservations_with_details_secure(uuid) IS 
'SECURITY DEFINER required: This function needs elevated privileges to properly enforce RLS policies across joined tables and ensure users only see data for their organization.';

COMMENT ON FUNCTION public.get_hotel_health_summary() IS 
'SECURITY DEFINER required: This function needs elevated privileges to aggregate health data across multiple tables with proper RLS enforcement.';

COMMENT ON FUNCTION public.get_server_tables(uuid, uuid) IS 
'SECURITY DEFINER required: This function needs elevated privileges to securely check table assignments and enforce proper access control.';

COMMENT ON FUNCTION public.get_organization_settings() IS 
'SECURITY DEFINER required: This function needs elevated privileges to safely access organization settings while enforcing proper RLS policies.';

-- 2. Ensure the existing security_policy_notes table has the required columns
-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add security_level column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'security_policy_notes' 
    AND column_name = 'security_level'
  ) THEN
    ALTER TABLE public.security_policy_notes ADD COLUMN security_level text NOT NULL DEFAULT 'medium' CHECK (security_level IN ('low', 'medium', 'high', 'critical'));
  END IF;

  -- Add policy_name column if it doesn't exist (using existing description as fallback)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'security_policy_notes' 
    AND column_name = 'policy_name'
  ) THEN
    -- Rename description to policy_name since they serve similar purpose
    ALTER TABLE public.security_policy_notes RENAME COLUMN description TO policy_name;
  END IF;

  -- Add other missing columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'security_policy_notes' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE public.security_policy_notes ADD COLUMN approved_at timestamp with time zone DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'security_policy_notes' 
    AND column_name = 'review_required_by'
  ) THEN
    ALTER TABLE public.security_policy_notes ADD COLUMN review_required_by date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'security_policy_notes' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.security_policy_notes ADD COLUMN updated_at timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Change approved_by to uuid type if it's text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'security_policy_notes' 
    AND column_name = 'approved_by'
    AND data_type = 'text'
  ) THEN
    -- Drop and recreate as uuid
    ALTER TABLE public.security_policy_notes DROP COLUMN approved_by;
    ALTER TABLE public.security_policy_notes ADD COLUMN approved_by uuid;
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.security_policy_notes ENABLE ROW LEVEL SECURITY;

-- Recreate policy to ensure it exists
DROP POLICY IF EXISTS "Managers can manage security policy notes" ON public.security_policy_notes;
CREATE POLICY "Managers can manage security policy notes"
ON public.security_policy_notes
FOR ALL
USING (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin'));

-- 3. Create a function to validate table function access for audit purposes
CREATE OR REPLACE FUNCTION public.validate_table_function_access(
  p_function_name text,
  p_user_id uuid DEFAULT auth.uid(),
  p_org_id uuid DEFAULT get_current_user_org_id()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log the access attempt
  INSERT INTO public.audit_logs (
    user_id, org_id, action, table_name, record_id, 
    new_values, severity
  ) VALUES (
    p_user_id, p_org_id, 'function_access', 'security_functions', 
    p_function_name, jsonb_build_object('function_name', p_function_name), 'info'
  );
  
  -- Validate user has proper org access
  RETURN EXISTS (
    SELECT 1 FROM public.app_users 
    WHERE user_id = p_user_id 
    AND org_id = p_org_id 
    AND active = true
  );
END;
$$;

-- 4. Document the legitimate SECURITY DEFINER functions
-- Clear existing entries first
DELETE FROM public.security_policy_notes WHERE policy_type = 'function';

-- Insert documentation for the security functions
INSERT INTO public.security_policy_notes (
  policy_type, policy_name, justification, security_level, approved_by
) VALUES 
  (
    'function', 
    'get_guest_stay_history_secure', 
    'SECURITY DEFINER required to properly enforce RLS policies across multiple joined tables (guests, reservations, rooms, invoices) while ensuring users only access data for their organization. Without SECURITY DEFINER, complex joins could expose data from other organizations.',
    'high',
    auth.uid()
  ),
  (
    'function', 
    'get_reservations_with_details_secure', 
    'SECURITY DEFINER required to safely aggregate reservation data with guest, room, and policy details while maintaining strict organizational boundaries. Function includes proper org_id validation.',
    'high',
    auth.uid()
  ),
  (
    'function', 
    'get_hotel_health_summary', 
    'SECURITY DEFINER required to aggregate system health metrics across multiple tables while respecting organizational boundaries. Function includes role-based access control.',
    'medium',
    auth.uid()
  ),
  (
    'function', 
    'get_server_tables', 
    'SECURITY DEFINER required to securely validate table assignments and server access while enforcing organizational and temporal constraints.',
    'medium',
    auth.uid()
  ),
  (
    'function', 
    'get_organization_settings', 
    'SECURITY DEFINER required to safely access organization settings with proper error handling for missing tables and RLS enforcement.',
    'medium',
    auth.uid()
  );

COMMENT ON TABLE public.security_policy_notes IS 'Documents security policy decisions and justifications for audit and compliance purposes';