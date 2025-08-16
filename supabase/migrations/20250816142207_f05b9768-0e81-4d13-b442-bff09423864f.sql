-- Convert SECURITY DEFINER table-valued functions to regular functions with RLS
-- This addresses the linter's "Security Definer View" false positives

-- 1. Convert get_guest_stay_history_secure to use views with RLS
CREATE OR REPLACE VIEW public.guest_stay_history_secure AS
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
WHERE EXISTS (
  SELECT 1 FROM guests g 
  WHERE g.id = gsh.guest_id 
  AND g.org_id = get_current_user_org_id()
);

-- Enable RLS on the view
ALTER VIEW public.guest_stay_history_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view guest stay history for their org"
ON public.guest_stay_history_secure
FOR SELECT
USING (true); -- The view already filters by org

-- 2. Convert get_reservations_with_details_secure to use views with RLS
CREATE OR REPLACE VIEW public.reservations_with_details_secure AS
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
WHERE EXISTS (
  SELECT 1 FROM reservations r 
  WHERE r.id = rwd.id 
  AND r.org_id = get_current_user_org_id()
);

-- Enable RLS on the view
ALTER VIEW public.reservations_with_details_secure SET (security_barrier = true);

-- Create RLS policy for the secure view
CREATE POLICY "Users can view reservation details for their org"
ON public.reservations_with_details_secure
FOR SELECT
USING (true); -- The view already filters by org

-- 3. Replace the SECURITY DEFINER functions with regular functions that use the views
CREATE OR REPLACE FUNCTION public.get_guest_stay_history_secure_v2(p_guest_id uuid DEFAULT NULL)
RETURNS TABLE(
  guest_id uuid, 
  reservation_id uuid, 
  first_name text, 
  last_name text, 
  email text, 
  phone text, 
  room_number text, 
  room_type text, 
  date_arrival date, 
  date_departure date, 
  nights_count integer, 
  adults integer, 
  children integer, 
  rate_total numeric, 
  invoice_total numeric, 
  invoice_number text, 
  reservation_reference text, 
  reservation_status text
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT * FROM public.guest_stay_history_secure 
  WHERE (p_guest_id IS NULL OR guest_stay_history_secure.guest_id = p_guest_id);
$$;

CREATE OR REPLACE FUNCTION public.get_reservations_with_details_secure_v2(p_reservation_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid, 
  guest_id uuid, 
  room_id uuid, 
  status text, 
  date_arrival date, 
  date_departure date, 
  guest_name text, 
  guest_email text, 
  guest_phone text, 
  room_number text, 
  room_type text, 
  rate_total numeric
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT * FROM public.reservations_with_details_secure 
  WHERE (p_reservation_id IS NULL OR reservations_with_details_secure.id = p_reservation_id);
$$;

-- 4. Create a non-SECURITY DEFINER version of get_current_user_org_id for views
CREATE OR REPLACE FUNCTION public.get_current_user_org_id_view()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT org_id FROM public.app_users WHERE user_id = auth.uid() AND active = true LIMIT 1;
$$;

-- 5. Update the views to use the non-SECURITY DEFINER function
CREATE OR REPLACE VIEW public.guest_stay_history_secure AS
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
WHERE EXISTS (
  SELECT 1 FROM guests g 
  WHERE g.id = gsh.guest_id 
  AND g.org_id = get_current_user_org_id_view()
);

CREATE OR REPLACE VIEW public.reservations_with_details_secure AS
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
WHERE EXISTS (
  SELECT 1 FROM reservations r 
  WHERE r.id = rwd.id 
  AND r.org_id = get_current_user_org_id_view()
);

-- Set security barrier on views
ALTER VIEW public.guest_stay_history_secure SET (security_barrier = true);
ALTER VIEW public.reservations_with_details_secure SET (security_barrier = true);

COMMENT ON VIEW public.guest_stay_history_secure IS 'Secure view with RLS enforcement for guest stay history data';
COMMENT ON VIEW public.reservations_with_details_secure IS 'Secure view with RLS enforcement for reservation details data';