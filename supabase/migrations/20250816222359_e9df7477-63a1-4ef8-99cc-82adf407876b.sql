-- Fix Security Definer View Issues
-- Remove problematic views that rely on SECURITY DEFINER functions and replace with RLS

-- First, let's see what views exist that might be problematic
DO $$
BEGIN
    -- Drop and recreate views without relying on SECURITY DEFINER functions
    
    -- 1. Fix rack_data_view - add proper RLS instead of function call
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

    -- Enable RLS on the view
    ALTER VIEW public.rack_data_view SET (security_barrier = true);
    
    -- Add RLS policy for the view
    CREATE POLICY "Users can view rack data for their org"
    ON public.rack_data_view
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.app_users au
            WHERE au.org_id = rack_data_view.org_id
            AND au.user_id = auth.uid()
            AND au.active = true
        )
    );

    -- 2. Check if other views need similar treatment
    -- Update reservations_view_arrivals to not use SECURITY DEFINER function
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

    -- Enable RLS on the view
    ALTER VIEW public.reservations_view_arrivals SET (security_barrier = true);
    
    -- Add RLS policy
    CREATE POLICY "Users can view arrival reservations for their org"
    ON public.reservations_view_arrivals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.app_users au
            WHERE au.org_id = reservations_view_arrivals.org_id
            AND au.user_id = auth.uid()
            AND au.active = true
        )
    );

END $$;