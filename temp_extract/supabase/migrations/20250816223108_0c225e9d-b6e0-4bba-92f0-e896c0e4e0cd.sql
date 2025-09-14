-- Continue fixing remaining Security Definer View issues
-- Convert remaining table-returning SECURITY DEFINER functions to SECURITY INVOKER

-- 5. Fix get_rack_data_optimized - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_rack_data_optimized(uuid, date, date);

CREATE OR REPLACE FUNCTION public.get_rack_data_optimized(p_org_id uuid, p_start_date date, p_end_date date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
    rack_data jsonb;
BEGIN
    SELECT jsonb_build_object(
        'rooms', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', r.id,
                'number', r.number,
                'type', r.type,
                'floor', r.floor,
                'status', r.status
            ))
            FROM rooms r
            WHERE r.org_id = p_org_id
            ORDER BY r.number
        ),
        'reservations', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', res.id,
                'room_id', res.room_id,
                'reference', res.reference,
                'status', res.status,
                'date_arrival', res.date_arrival,
                'date_departure', res.date_departure,
                'adults', res.adults,
                'children', res.children,
                'rate_total', res.rate_total
            ))
            FROM reservations res
            WHERE res.org_id = p_org_id
            AND res.date_arrival <= p_end_date
            AND res.date_departure >= p_start_date
        ),
        'kpis', jsonb_build_object(
            'total_rooms', (SELECT COUNT(*) FROM rooms WHERE org_id = p_org_id),
            'occupied_rooms', (SELECT COUNT(*) FROM reservations WHERE org_id = p_org_id AND status = 'present'),
            'arrivals', (SELECT COUNT(*) FROM reservations WHERE org_id = p_org_id AND date_arrival = p_start_date),
            'departures', (SELECT COUNT(*) FROM reservations WHERE org_id = p_org_id AND date_departure = p_start_date)
        ),
        'generated_at', now()
    ) INTO rack_data;
    
    RETURN rack_data;
    -- RLS policies on rooms and reservations tables will handle access control
END;
$$;

-- 6. Fix get_operational_metrics - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_operational_metrics(uuid, date, date);

CREATE OR REPLACE FUNCTION public.get_operational_metrics(p_org_id uuid, p_from_date date, p_to_date date)
RETURNS TABLE(
    metric_name text, current_value numeric, previous_value numeric,
    percentage_change numeric, trend text, last_updated timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'occupancy_rate'::text as metric_name,
        COALESCE(
            (SELECT COUNT(*)::numeric / NULLIF(COUNT(*) OVER (), 0) * 100
             FROM reservations r
             WHERE r.org_id = p_org_id AND r.status = 'present'), 0
        ) as current_value,
        COALESCE(
            (SELECT COUNT(*)::numeric / NULLIF(COUNT(*) OVER (), 0) * 100
             FROM reservations r  
             WHERE r.org_id = p_org_id AND r.status = 'present'
             AND r.date_arrival BETWEEN p_from_date - INTERVAL '30 days' AND p_to_date - INTERVAL '30 days'), 0
        ) as previous_value,
        0::numeric as percentage_change,
        'stable'::text as trend,
        now() as last_updated
        
    UNION ALL
    
    SELECT 
        'revenue'::text,
        COALESCE(
            (SELECT SUM(rate_total) 
             FROM reservations r
             WHERE r.org_id = p_org_id 
             AND r.date_departure BETWEEN p_from_date AND p_to_date), 0
        ),
        COALESCE(
            (SELECT SUM(rate_total)
             FROM reservations r
             WHERE r.org_id = p_org_id
             AND r.date_departure BETWEEN p_from_date - INTERVAL '30 days' AND p_to_date - INTERVAL '30 days'), 0
        ),
        0::numeric,
        'stable'::text,
        now()
        
    UNION ALL
    
    SELECT 
        'average_rate'::text,
        COALESCE(
            (SELECT AVG(rate_total)
             FROM reservations r
             WHERE r.org_id = p_org_id
             AND r.date_departure BETWEEN p_from_date AND p_to_date), 0
        ),
        COALESCE(
            (SELECT AVG(rate_total)
             FROM reservations r
             WHERE r.org_id = p_org_id
             AND r.date_departure BETWEEN p_from_date - INTERVAL '30 days' AND p_to_date - INTERVAL '30 days'), 0
        ),
        0::numeric,
        'stable'::text,
        now();
    -- RLS policies on underlying tables will handle access control
END;
$$;

-- 7. Fix get_server_tables - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_server_tables(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_server_tables(p_server_id uuid, p_org_id uuid DEFAULT NULL)
RETURNS TABLE(
    assignment_id uuid, table_id uuid, table_number text, zone text,
    capacity integer, status text, assigned_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
    v_org_id uuid;
BEGIN
    -- Use current user's org if not specified
    v_org_id := COALESCE(p_org_id, (
        SELECT au.org_id FROM app_users au WHERE au.user_id = auth.uid() LIMIT 1
    ));
    
    RETURN QUERY
    SELECT 
        ta.id as assignment_id,
        pt.id as table_id,
        pt.table_number,
        pt.zone,
        pt.capacity,
        ta.status,
        ta.assigned_at
    FROM table_assignments ta
    JOIN pos_tables pt ON ta.table_id = pt.id
    WHERE ta.server_id = p_server_id 
        AND ta.shift_date = CURRENT_DATE
        AND ta.status = 'active'
        AND ta.org_id = v_org_id
    ORDER BY pt.table_number;
    -- RLS policies on table_assignments and pos_tables will handle access control
END;
$$;