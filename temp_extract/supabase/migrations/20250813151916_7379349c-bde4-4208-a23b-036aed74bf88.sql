-- Update get_server_tables function to accept org_id parameter
CREATE OR REPLACE FUNCTION public.get_server_tables(p_server_id uuid, p_org_id uuid DEFAULT NULL)
 RETURNS TABLE(assignment_id uuid, table_id uuid, table_number text, zone text, capacity integer, status text, assigned_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  -- Use provided org_id or fall back to current user's org
  v_org_id := COALESCE(p_org_id, get_current_user_org_id());
  
  RETURN QUERY
  SELECT 
    ta.id as assignment_id,
    pt.id as table_id,
    pt.table_number,
    pt.zone,
    pt.capacity,
    ta.status,
    ta.assigned_at
  FROM public.table_assignments ta
  JOIN public.pos_tables pt ON ta.table_id = pt.id
  WHERE ta.server_id = p_server_id 
    AND ta.shift_date = CURRENT_DATE
    AND ta.status = 'active'
    AND ta.org_id = v_org_id
  ORDER BY pt.table_number;
END;
$function$;