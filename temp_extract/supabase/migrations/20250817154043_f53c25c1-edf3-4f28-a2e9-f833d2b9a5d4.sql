-- Phase 3A VICTOIRE CORRECTIVE - Fix log_guest_data_access et finalisation

-- Supprimer d'abord la fonction existante puis la recréer avec search_path
DROP FUNCTION IF EXISTS public.log_guest_data_access(uuid, text, text[]);

-- 1. get_server_tables_v2 (déjà fait dans la migration précédente)
CREATE OR REPLACE FUNCTION public.get_server_tables_v2(p_server_id uuid, p_org_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(assignment_id uuid, table_id uuid, table_number text, zone text, capacity integer, status text, assigned_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
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
    AND ta.org_id = COALESCE(p_org_id, (
      SELECT org_id FROM app_users 
      WHERE user_id = auth.uid() AND active = true 
      LIMIT 1
    ))
  ORDER BY pt.table_number;
$function$;

-- 2. Recréer log_guest_data_access avec search_path
CREATE OR REPLACE FUNCTION public.log_guest_data_access(p_guest_id uuid, p_access_type text, p_details text[] DEFAULT '{}'::text[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    org_id,
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    severity
  ) VALUES (
    get_current_user_org_id(),
    auth.uid(),
    p_access_type,
    'guest_data_access',
    p_guest_id::text,
    jsonb_build_object(
      'guest_id', p_guest_id,
      'access_type', p_access_type,
      'details', p_details,
      'timestamp', now()
    ),
    CASE 
      WHEN p_access_type LIKE '%exceeded%' THEN 'error'
      WHEN p_access_type LIKE '%violation%' THEN 'warning'
      ELSE 'info'
    END
  );
END;
$function$;