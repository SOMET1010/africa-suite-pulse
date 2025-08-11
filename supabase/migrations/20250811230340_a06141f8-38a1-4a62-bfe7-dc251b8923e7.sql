-- Fix security vulnerabilities identified by Supabase linter (corrected version)

-- 1. Fix function search_path for security functions
ALTER FUNCTION public.get_current_user_org_id() SET search_path = 'public';
ALTER FUNCTION public.has_permission(text) SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = 'public';

-- 2. Fix views with SECURITY DEFINER - recreate without security definer
DROP VIEW IF EXISTS public.rack_reservations_enriched CASCADE;
DROP VIEW IF EXISTS public.reservations_view_arrivals CASCADE;
DROP VIEW IF EXISTS public.guest_stay_history CASCADE;
DROP VIEW IF EXISTS public.arrangements_with_calculated_price CASCADE;
DROP VIEW IF EXISTS public.services_with_family CASCADE;

-- Recreate views without SECURITY DEFINER
CREATE VIEW public.services_with_family AS
SELECT 
    s.*,
    sf.label as family_label,
    sf.code as family_code,
    sf.color as family_color,
    sf.icon as family_icon
FROM public.services s
LEFT JOIN public.service_families sf ON s.family_id = sf.id;

CREATE VIEW public.arrangements_with_calculated_price AS
SELECT 
    a.*,
    COALESCE(SUM(ass.unit_price * ass.quantity), 0) + COALESCE(a.base_price, 0) as calculated_price,
    COUNT(ass.id) as services_count
FROM public.arrangements a
LEFT JOIN public.arrangement_services ass ON a.id = ass.arrangement_id
GROUP BY a.id;

CREATE VIEW public.guest_stay_history AS
SELECT 
    r.id as reservation_id,
    r.reference as reservation_reference,
    r.date_arrival,
    r.date_departure,
    r.adults,
    r.children,
    r.rate_total,
    r.status as reservation_status,
    (r.date_departure - r.date_arrival) as nights_count,
    g.id as guest_id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    rm.number as room_number,
    rm.type as room_type,
    i.number as invoice_number,
    i.total_amount as invoice_total
FROM public.reservations r
LEFT JOIN public.guests g ON r.guest_id = g.id
LEFT JOIN public.rooms rm ON r.room_id = rm.id
LEFT JOIN public.invoices i ON r.id = i.reservation_id;

CREATE VIEW public.reservations_view_arrivals AS
SELECT 
    r.id,
    r.org_id,
    r.date_arrival::text,
    r.planned_time::text,
    r.room_id,
    r.adults,
    r.children,
    r.rate_total,
    r.reference,
    r.status,
    CONCAT(g.first_name, ' ', g.last_name) as guest_name,
    rm.number as room_number
FROM public.reservations r
LEFT JOIN public.guests g ON r.guest_id = g.id
LEFT JOIN public.rooms rm ON r.room_id = rm.id
WHERE r.date_arrival = CURRENT_DATE;

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
    rm.number as room_number,
    rm.type as room_type_code,
    rm.floor as room_floor
FROM public.reservations r
LEFT JOIN public.rooms rm ON r.room_id = rm.id;