-- Fix the pms_search_free_rooms function to remove reference to non-existent base_rate column
CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(
    p_org text,
    p_start date,
    p_end date,
    p_exclude_room_ids uuid[] DEFAULT '{}'
)
RETURNS TABLE(
    id uuid,
    number text,
    type text,
    floor text,
    features jsonb,
    base_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.number,
        r.type,
        r.floor,
        COALESCE(r.features, '{}'::jsonb) as features,
        50000::numeric as base_rate -- Default base rate for now, will be calculated dynamically later
    FROM rooms r
    WHERE r.org_id = p_org::uuid
        AND r.id != ALL(p_exclude_room_ids)
        AND r.status = 'available'
        AND NOT EXISTS (
            SELECT 1 
            FROM reservations res
            WHERE res.room_id = r.id
                AND res.org_id = r.org_id
                AND res.status IN ('confirmed', 'checked_in', 'present')
                AND (
                    (res.date_arrival <= p_start AND res.date_departure > p_start) OR
                    (res.date_arrival < p_end AND res.date_departure >= p_end) OR
                    (res.date_arrival >= p_start AND res.date_departure <= p_end)
                )
        )
    ORDER BY r.number;
END;
$function$;