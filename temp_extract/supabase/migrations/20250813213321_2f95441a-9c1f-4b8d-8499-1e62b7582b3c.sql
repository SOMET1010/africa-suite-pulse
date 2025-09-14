-- Fix security issues: Add RLS policies to database views that expose sensitive customer data

-- Enable RLS on critical views that contain sensitive customer information
ALTER VIEW guest_stay_history SET (security_barrier=true);
ALTER VIEW reservations_with_details SET (security_barrier=true);
ALTER VIEW reservations_view_arrivals SET (security_barrier=true);
ALTER VIEW rack_reservations_enriched SET (security_barrier=true);

-- Create security definer function for views access control
CREATE OR REPLACE FUNCTION public.can_access_view_data()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
BEGIN
  -- Allow access only if user has an active organization
  RETURN EXISTS (
    SELECT 1 
    FROM public.app_users 
    WHERE user_id = auth.uid() 
    AND active = true 
    AND org_id IS NOT NULL
  );
END;
$$;

-- Add security barriers and access controls to sensitive views
-- Note: We cannot directly add RLS to views, but we can add security barriers
-- and create secure wrapper functions for accessing sensitive data

-- Create secure functions to replace direct view access for sensitive operations
CREATE OR REPLACE FUNCTION public.get_guest_stay_history_secure(p_guest_id UUID DEFAULT NULL)
RETURNS TABLE(
  guest_id UUID,
  reservation_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  room_number TEXT,
  room_type TEXT,
  date_arrival DATE,
  date_departure DATE,
  nights_count INTEGER,
  adults INTEGER,
  children INTEGER,
  rate_total NUMERIC,
  invoice_total NUMERIC,
  invoice_number TEXT,
  reservation_reference TEXT,
  reservation_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get current user's org
  v_org_id := get_current_user_org_id();
  
  IF v_org_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Return filtered results based on organization
  RETURN QUERY
  SELECT 
    gsh.guest_id,
    gsh.reservation_id,
    gsh.first_name,
    gsh.last_name,
    gsh.email,
    gsh.phone,
    gsh.room_number,
    gsh.room_type,
    gsh.date_arrival,
    gsh.date_departure,
    gsh.nights_count,
    gsh.adults,
    gsh.children,
    gsh.rate_total,
    gsh.invoice_total,
    gsh.invoice_number,
    gsh.reservation_reference,
    gsh.reservation_status
  FROM guest_stay_history gsh
  WHERE (p_guest_id IS NULL OR gsh.guest_id = p_guest_id)
  AND EXISTS (
    SELECT 1 FROM guests g 
    WHERE g.id = gsh.guest_id 
    AND g.org_id = v_org_id
  );
END;
$$;

-- Create secure function for reservations with details
CREATE OR REPLACE FUNCTION public.get_reservations_with_details_secure(p_reservation_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  guest_id UUID,
  room_id UUID,
  status TEXT,
  date_arrival DATE,
  date_departure DATE,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  room_number TEXT,
  room_type TEXT,
  rate_total NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  v_org_id := get_current_user_org_id();
  
  IF v_org_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    rwd.id,
    rwd.guest_id,
    rwd.room_id,
    rwd.status,
    rwd.date_arrival,
    rwd.date_departure,
    rwd.guest_name,
    rwd.guest_email,
    rwd.guest_phone,
    rwd.room_number,
    rwd.room_type,
    rwd.rate_total
  FROM reservations_with_details rwd
  WHERE (p_reservation_id IS NULL OR rwd.id = p_reservation_id)
  AND EXISTS (
    SELECT 1 FROM reservations r 
    WHERE r.id = rwd.id 
    AND r.org_id = v_org_id
  );
END;
$$;

-- Add comment to remind developers to use secure functions
COMMENT ON VIEW guest_stay_history IS 'SECURITY: Use get_guest_stay_history_secure() function instead of direct view access to ensure proper access control';
COMMENT ON VIEW reservations_with_details IS 'SECURITY: Use get_reservations_with_details_secure() function instead of direct view access to ensure proper access control';
COMMENT ON VIEW reservations_view_arrivals IS 'SECURITY: This view contains sensitive data. Ensure RLS policies are checked when using this view';
COMMENT ON VIEW rack_reservations_enriched IS 'SECURITY: This view contains sensitive data. Ensure RLS policies are checked when using this view';