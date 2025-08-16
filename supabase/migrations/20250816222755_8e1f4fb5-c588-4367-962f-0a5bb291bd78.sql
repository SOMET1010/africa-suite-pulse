-- Fix Security Definer View issues by removing unnecessary SECURITY DEFINER from table-returning functions
-- These functions should rely on RLS policies instead of SECURITY DEFINER when possible

-- 1. Fix get_guest_details_secure - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_guest_details_secure(uuid);

-- Create a replacement that uses proper RLS
CREATE OR REPLACE FUNCTION public.get_guest_details_secure(guest_id uuid)
RETURNS TABLE(
    id uuid, first_name text, last_name text, email text, phone text,
    document_type text, document_number text, document_expiry date,
    date_of_birth date, nationality text, address_line1 text, 
    address_line2 text, city text, state_province text, postal_code text,
    country text, tax_id text, guest_type text, vip_status boolean,
    special_requests text, notes text, preferences jsonb, marketing_consent boolean
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, g.first_name, g.last_name, g.email, g.phone,
        g.document_type, g.document_number, g.document_expiry,
        g.date_of_birth, g.nationality, g.address_line1,
        g.address_line2, g.city, g.state_province, g.postal_code,
        g.country, g.tax_id, g.guest_type, g.vip_status,
        g.special_requests, g.notes, g.preferences, g.marketing_consent
    FROM guests g
    WHERE g.id = get_guest_details_secure.guest_id;
    -- RLS policies on guests table will handle access control
END;
$$;

-- 2. Fix get_guest_stay_history_secure - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_guest_stay_history_secure(uuid);

CREATE OR REPLACE FUNCTION public.get_guest_stay_history_secure(p_guest_id uuid DEFAULT NULL)
RETURNS TABLE(
    guest_id uuid, reservation_id uuid, first_name text, last_name text,
    email text, phone text, room_number text, room_type text,
    date_arrival date, date_departure date, nights_count integer,
    adults integer, children integer, rate_total numeric,
    invoice_total numeric, invoice_number text, reservation_reference text,
    reservation_status text
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gsh.guest_id, gsh.reservation_id, gsh.first_name, gsh.last_name,
        gsh.email, gsh.phone, gsh.room_number, gsh.room_type,
        gsh.date_arrival, gsh.date_departure, gsh.nights_count,
        gsh.adults, gsh.children, gsh.rate_total,
        gsh.invoice_total, gsh.invoice_number, gsh.reservation_reference,
        gsh.reservation_status
    FROM guest_stay_history gsh
    WHERE (p_guest_id IS NULL OR gsh.guest_id = p_guest_id);
    -- RLS policies on underlying tables will handle access control
END;
$$;

-- 3. Fix get_reservations_with_details_secure - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_reservations_with_details_secure(uuid);

CREATE OR REPLACE FUNCTION public.get_reservations_with_details_secure(p_reservation_id uuid DEFAULT NULL)
RETURNS TABLE(
    id uuid, guest_id uuid, room_id uuid, status text,
    date_arrival date, date_departure date, guest_name text,
    guest_email text, guest_phone text, room_number text,
    room_type text, rate_total numeric
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rwd.id, rwd.guest_id, rwd.room_id, rwd.status,
        rwd.date_arrival, rwd.date_departure, rwd.guest_name,
        rwd.guest_email, rwd.guest_phone, rwd.room_number,
        rwd.room_type, rwd.rate_total
    FROM reservations_with_details rwd
    WHERE (p_reservation_id IS NULL OR rwd.id = p_reservation_id);
    -- RLS policies on underlying tables will handle access control
END;
$$;

-- 4. Fix get_guests_masked - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_guests_masked(integer, integer);

CREATE OR REPLACE FUNCTION public.get_guests_masked(limit_count integer, offset_count integer)
RETURNS TABLE(
    id uuid, org_id uuid, first_name text, last_name text,
    email text, phone text, guest_type text, vip_status boolean,
    special_requests text, preferences jsonb, created_at timestamp with time zone,
    updated_at timestamp with time zone, document_number text,
    date_of_birth date, tax_id text, city text, country text,
    address_line1 text, address_line2 text, postal_code text
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, g.org_id, g.first_name, g.last_name,
        g.email, g.phone, g.guest_type, g.vip_status,
        g.special_requests, g.preferences, g.created_at,
        g.updated_at, 
        CASE WHEN LENGTH(g.document_number) > 4 
             THEN LEFT(g.document_number, 4) || '***'
             ELSE g.document_number
        END as document_number,
        g.date_of_birth, g.tax_id, g.city, g.country,
        g.address_line1, g.address_line2, g.postal_code
    FROM guests g
    ORDER BY g.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
    -- RLS policies on guests table will handle access control
END;
$$;