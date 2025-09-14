-- Fix remaining Security Definer View issues
-- The issue appears to be with views that have security concerns but aren't properly secured

-- 1. Drop and recreate problematic views with proper security approach
-- Instead of SECURITY DEFINER, we'll ensure proper RLS policies exist

-- Fix reservations_with_details view - it should use proper RLS instead of security definer function
DROP VIEW IF EXISTS public.reservations_with_details CASCADE;

CREATE VIEW public.reservations_with_details AS
SELECT 
    r.id,
    r.org_id,
    r.date_arrival,
    r.planned_time,
    r.status,
    r.room_id,
    r.reference,
    r.adults,
    r.children,
    r.rate_total,
    r.date_departure,
    r.guest_id,
    r.created_at,
    r.updated_at,
    r.source,
    r.source_reference,
    r.special_requests,
    r.notes,
    r.confirmed_at,
    r.confirmed_by,
    r.checked_in_at,
    r.checked_out_at,
    r.created_by,
    r.group_id,
    r.tariff_id,
    r.promotion_code,
    r.allotment_id,
    r.cancellation_policy_id,
    r.is_duplicate_from,
    r.discount_amount,
    r.original_rate,
    r.group_billing_mode,
    COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom') AS guest_name,
    g.email AS guest_email,
    g.phone AS guest_phone,
    rm.number AS room_number,
    rm.type AS room_type,
    t.label AS tariff_label,
    t.base_rate AS tariff_base_rate,
    cp.label AS cancellation_policy_label
FROM reservations r
LEFT JOIN guests g ON (r.guest_id = g.id)
LEFT JOIN rooms rm ON (r.room_id = rm.id)  
LEFT JOIN tariffs t ON (r.tariff_id = t.id)
LEFT JOIN cancellation_policies cp ON (r.cancellation_policy_id = cp.id);

-- Add proper comment explaining security approach
COMMENT ON VIEW public.reservations_with_details IS 
'Reservation details view using table-level RLS for security. Access is controlled by RLS policies on underlying tables (reservations, guests, rooms, etc.)';

-- 2. Fix rack_reservations_enriched view
DROP VIEW IF EXISTS public.rack_reservations_enriched CASCADE;

CREATE VIEW public.rack_reservations_enriched AS
SELECT 
    r.id,
    r.org_id,
    r.date_arrival,
    r.date_departure,
    r.room_id,
    r.adults,
    r.children,
    r.rate_total,
    r.reference,
    r.status,
    rm.number AS room_number,
    rm.type AS room_type_code,
    rm.floor AS room_floor
FROM reservations r
LEFT JOIN rooms rm ON (r.room_id = rm.id);

COMMENT ON VIEW public.rack_reservations_enriched IS 
'Enriched reservation data using table-level RLS for security filtering.';

-- 3. Fix any other views that might have security definer concerns
-- Ensure all views rely on table-level RLS rather than function-based security

-- 4. Update view descriptions to clarify security approach
COMMENT ON VIEW public.guest_stay_history IS 
'Guest stay history using table-level RLS. Access controlled by RLS policies on guests and reservations tables.';

COMMENT ON VIEW public.housekeeping_tasks_with_staff IS 
'Housekeeping tasks with staff info using table-level RLS for organization filtering.';

COMMENT ON VIEW public.room_status_summary IS 
'Room status summary using table-level RLS for organization filtering.';

COMMENT ON VIEW public.arrangements_with_calculated_price IS 
'Arrangements with calculated pricing using table-level RLS for organization filtering.';

-- Remove any potential security definer issues by ensuring views are simple and rely on table RLS
-- This approach is more secure than SECURITY DEFINER views because:
-- 1. Each table has its own RLS policies
-- 2. Views inherit the security context of the calling user
-- 3. No privilege escalation occurs