-- Fix security issues introduced in the previous migration
-- This addresses the security linter warnings

-- 1. Fix the security definer view issue by removing the security barrier
-- and implementing proper access control through RLS policies instead
DROP VIEW IF EXISTS public.guests_limited;

-- 2. Fix function search path issues - add explicit SET search_path to all functions
-- Update log_guest_data_access function
CREATE OR REPLACE FUNCTION public.log_guest_data_access(
  guest_id UUID,
  access_type TEXT,
  sensitive_fields TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
  org_id UUID;
BEGIN
  -- Get user role and org
  user_role := get_current_user_role();
  org_id := get_current_user_org_id();
  
  -- Only log if accessing sensitive data
  IF sensitive_fields IS NOT NULL AND array_length(sensitive_fields, 1) > 0 THEN
    INSERT INTO public.audit_logs (
      org_id,
      user_id,
      action,
      table_name,
      record_id,
      new_values,
      severity
    ) VALUES (
      org_id,
      auth.uid(),
      access_type,
      'guests_sensitive_access',
      guest_id::TEXT,
      jsonb_build_object(
        'accessed_fields', sensitive_fields,
        'user_role', user_role,
        'timestamp', now()
      ),
      'warning'
    );
  END IF;
END;
$$;

-- Update trigger function
CREATE OR REPLACE FUNCTION public.trigger_log_guest_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive fields for managers and above
  IF has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin') THEN
    PERFORM public.log_guest_data_access(
      NEW.id,
      'select_sensitive',
      ARRAY['document_number', 'tax_id', 'date_of_birth', 'address_line1', 'address_line2']
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update search function
CREATE OR REPLACE FUNCTION public.search_guests_secure(
  search_term TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  guest_type TEXT,
  masked_document TEXT,
  city TEXT,
  country TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org_id UUID;
  user_role TEXT;
BEGIN
  org_id := get_current_user_org_id();
  user_role := get_current_user_role();
  
  -- Only allow authorized users to search
  IF NOT (has_role(auth.uid(), 'receptionist') OR 
          has_role(auth.uid(), 'manager') OR 
          has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Unauthorized access to guest search';
  END IF;
  
  RETURN QUERY
  SELECT 
    g.id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    g.guest_type,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.document_number
      WHEN g.document_number IS NOT NULL THEN '****' || RIGHT(g.document_number, 4)
      ELSE NULL
    END as masked_document,
    g.city,
    g.country
  FROM public.guests g
  WHERE g.org_id = search_guests_secure.org_id
    AND (
      g.first_name ILIKE '%' || search_term || '%' OR
      g.last_name ILIKE '%' || search_term || '%' OR
      g.email ILIKE '%' || search_term || '%' OR
      (user_role IN ('super_admin', 'manager') AND g.phone ILIKE '%' || search_term || '%')
    )
  ORDER BY g.created_at DESC
  LIMIT limit_count;
  
  -- Log the search
  PERFORM public.log_guest_data_access(
    NULL, -- No specific guest ID for search
    'search',
    ARRAY['search_term: ' || search_term]
  );
END;
$$;

-- Update get guest details function
CREATE OR REPLACE FUNCTION public.get_guest_details_secure(guest_id UUID)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  document_type TEXT,
  document_number TEXT,
  document_expiry DATE,
  date_of_birth DATE,
  nationality TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  tax_id TEXT,
  guest_type TEXT,
  vip_status BOOLEAN,
  special_requests TEXT,
  notes TEXT,
  preferences JSONB,
  marketing_consent BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  org_id UUID;
  user_role TEXT;
  sensitive_fields TEXT[] := ARRAY[]::TEXT[];
BEGIN
  org_id := get_current_user_org_id();
  user_role := get_current_user_role();
  
  -- Check authorization
  IF NOT (has_role(auth.uid(), 'receptionist') OR 
          has_role(auth.uid(), 'manager') OR 
          has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Unauthorized access to guest details';
  END IF;
  
  -- Track which sensitive fields are being accessed
  IF user_role IN ('super_admin', 'manager') THEN
    sensitive_fields := ARRAY['document_number', 'tax_id', 'date_of_birth', 'full_address'];
  END IF;
  
  -- Log access to sensitive data
  PERFORM public.log_guest_data_access(guest_id, 'view_details', sensitive_fields);
  
  RETURN QUERY
  SELECT 
    g.id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    g.document_type,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.document_number
      WHEN g.document_number IS NOT NULL THEN '****' || RIGHT(g.document_number, 4)
      ELSE NULL
    END as document_number,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.document_expiry
      ELSE NULL
    END as document_expiry,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.date_of_birth
      ELSE NULL
    END as date_of_birth,
    g.nationality,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.address_line1
      ELSE NULL
    END as address_line1,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.address_line2
      ELSE NULL
    END as address_line2,
    g.city,
    g.state_province,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.postal_code
      ELSE NULL
    END as postal_code,
    g.country,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.tax_id
      WHEN g.tax_id IS NOT NULL THEN '****'
      ELSE NULL
    END as tax_id,
    g.guest_type,
    g.vip_status,
    g.special_requests,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.notes
      ELSE NULL
    END as notes,
    g.preferences,
    g.marketing_consent
  FROM public.guests g
  WHERE g.id = guest_id 
    AND g.org_id = get_guest_details_secure.org_id;
END;
$$;

-- Update bulk export prevention function
CREATE OR REPLACE FUNCTION public.prevent_bulk_guest_export()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  query_count INTEGER;
BEGIN
  -- Count recent queries from this user
  SELECT COUNT(*) INTO query_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND table_name = 'guests'
    AND action = 'select'
    AND occurred_at > now() - INTERVAL '1 minute';
  
  -- Prevent bulk data extraction
  IF query_count > 100 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many guest data requests. Contact administrator.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Instead of a security definer view, create a secure data access function
-- that returns masked data based on user role
CREATE OR REPLACE FUNCTION public.get_guests_masked(
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  org_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  guest_type TEXT,
  vip_status BOOLEAN,
  special_requests TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  document_number TEXT,
  date_of_birth DATE,
  tax_id TEXT,
  city TEXT,
  country TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role TEXT;
  org_id UUID;
BEGIN
  user_role := get_current_user_role();
  org_id := get_current_user_org_id();
  
  -- Check authorization
  IF NOT (has_role(auth.uid(), 'receptionist') OR 
          has_role(auth.uid(), 'manager') OR 
          has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Unauthorized access to guest data';
  END IF;
  
  RETURN QUERY
  SELECT 
    g.id,
    g.org_id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    g.guest_type,
    g.vip_status,
    g.special_requests,
    g.preferences,
    g.created_at,
    g.updated_at,
    -- Mask sensitive data for lower-privilege users
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.document_number
      WHEN g.document_number IS NOT NULL THEN '****' || RIGHT(g.document_number, 4)
      ELSE NULL
    END as document_number,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.date_of_birth
      ELSE NULL 
    END as date_of_birth,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.tax_id
      WHEN g.tax_id IS NOT NULL THEN '****'
      ELSE NULL
    END as tax_id,
    -- Address info available to all authorized staff
    g.city,
    g.country,
    -- Full address only for managers and above
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.address_line1
      ELSE NULL 
    END as address_line1,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.address_line2
      ELSE NULL 
    END as address_line2,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.postal_code
      ELSE NULL 
    END as postal_code
  FROM public.guests g
  WHERE g.org_id = get_guests_masked.org_id
  ORDER BY g.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
  
  -- Log the access
  PERFORM public.log_guest_data_access(
    NULL,
    'list_guests',
    CASE 
      WHEN user_role IN ('super_admin', 'manager') 
      THEN ARRAY['sensitive_data_accessed']
      ELSE ARRAY['basic_data_only']
    END
  );
END;
$$;

-- 4. Create additional security policies to prevent unauthorized data access patterns
-- Policy to prevent direct SELECT on sensitive columns by receptionists
CREATE POLICY "Restrict direct sensitive data access for receptionists"
ON public.guests
FOR SELECT
TO authenticated
USING (
  -- Allow if user is manager/super_admin OR if they're using approved functions
  (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin'))
  OR 
  -- For receptionists, only allow through secure functions
  (has_role(auth.uid(), 'receptionist') AND current_setting('application_name', true) = 'secure_guest_access')
);

-- 5. Add a rate limiting table for guest data access
CREATE TABLE IF NOT EXISTS public.guest_access_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  access_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.guest_access_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for rate limits table
CREATE POLICY "Users can manage their own rate limits"
ON public.guest_access_rate_limits
FOR ALL
TO authenticated
USING (user_id = auth.uid() AND org_id = get_current_user_org_id())
WITH CHECK (user_id = auth.uid() AND org_id = get_current_user_org_id());

-- 6. Create a more sophisticated rate limiting function
CREATE OR REPLACE FUNCTION public.check_guest_access_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count INTEGER;
  max_requests INTEGER := 1000; -- Max requests per hour
  window_minutes INTEGER := 60;
BEGIN
  -- Clean up old entries
  DELETE FROM public.guest_access_rate_limits 
  WHERE window_start < now() - (window_minutes || ' minutes')::interval;
  
  -- Get current count for this user
  SELECT COALESCE(SUM(access_count), 0) INTO current_count
  FROM public.guest_access_rate_limits
  WHERE user_id = auth.uid()
    AND org_id = get_current_user_org_id()
    AND window_start > now() - (window_minutes || ' minutes')::interval;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    -- Log the rate limit violation
    PERFORM public.log_guest_data_access(
      NULL,
      'rate_limit_exceeded',
      ARRAY['current_count: ' || current_count::TEXT]
    );
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.guest_access_rate_limits (user_id, org_id, access_count)
  VALUES (auth.uid(), get_current_user_org_id(), 1)
  ON CONFLICT (user_id, org_id)
  DO UPDATE SET 
    access_count = guest_access_rate_limits.access_count + 1,
    window_start = CASE 
      WHEN guest_access_rate_limits.window_start < now() - (window_minutes || ' minutes')::interval 
      THEN now() 
      ELSE guest_access_rate_limits.window_start 
    END;
  
  RETURN TRUE;
END;
$$;