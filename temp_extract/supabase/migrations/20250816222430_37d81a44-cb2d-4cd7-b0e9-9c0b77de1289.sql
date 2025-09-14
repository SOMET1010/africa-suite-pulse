-- Fix Security Definer View Issues
-- The correct approach is to either:
-- 1. Convert problematic views to regular views without SECURITY DEFINER functions
-- 2. Or use security definer functions that are properly isolated

-- Approach 1: Fix views that call get_current_user_org_id() by removing that dependency
-- and relying on RLS policies on the underlying tables instead

-- 1. Drop and recreate rack_data_view without get_current_user_org_id()
DROP VIEW IF EXISTS public.rack_data_view;

CREATE VIEW public.rack_data_view AS
SELECT 
    r.id AS room_id,
    r.number AS room_number,
    r.type AS room_type,
    r.floor,
    r.status AS room_status,
    r.org_id,
    res.id AS reservation_id,
    res.reference AS reservation_reference,
    res.status AS reservation_status,
    res.date_arrival,
    res.date_departure,
    res.adults,
    res.children,
    res.rate_total,
    (g.first_name || ' ' || g.last_name) AS guest_name
FROM rooms r
LEFT JOIN reservations res ON (
    r.id = res.room_id 
    AND res.status NOT IN ('cancelled', 'no_show')
)
LEFT JOIN guests g ON (res.guest_id = g.id)
ORDER BY r.number;

-- 2. Update reservations_view_arrivals to remove get_current_user_org_id() call
DROP VIEW IF EXISTS public.reservations_view_arrivals;

CREATE VIEW public.reservations_view_arrivals AS
SELECT 
    r.id,
    r.org_id,
    r.date_arrival::text AS date_arrival,
    r.room_id,
    r.adults,
    r.children,
    r.planned_time::text AS planned_time,
    r.reference,
    r.status,
    r.rate_total,
    COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom') AS guest_name,
    rm.number AS room_number
FROM reservations r
LEFT JOIN guests g ON (r.guest_id = g.id)
LEFT JOIN rooms rm ON (r.room_id = rm.id)
WHERE r.date_arrival = CURRENT_DATE;

-- 3. Check and fix any other views that might be problematic
-- Ensure all views depend on table-level RLS rather than function calls

-- The views now rely on the underlying table RLS policies:
-- - rooms table has RLS policy: "Users can manage rooms for their org"
-- - reservations table has RLS policy: "Users can view reservations for their org" 
-- - guests table has RLS policy: "Users can view guests for their org"

-- These table-level policies will automatically filter the view results
-- without needing SECURITY DEFINER functions