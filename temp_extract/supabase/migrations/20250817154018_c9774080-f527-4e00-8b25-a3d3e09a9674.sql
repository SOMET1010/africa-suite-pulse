-- Phase 3A VICTOIRE - Élimination des 3 derniers search_path warnings

-- Identifier et corriger les 3 dernières fonctions sans SET search_path

-- 1. get_server_tables_v2 (déjà sécurisée mais manque search_path)
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

-- 2. Vérifier s'il y a schedule_fne_retry (fonction mentionnée dans les logs)
-- Cette fonction peut être incomplète dans les logs précédents
CREATE OR REPLACE FUNCTION public.schedule_fne_retry(p_pending_invoice_id uuid, p_error_message text, p_error_code text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER;
  v_next_retry TIMESTAMPTZ;
BEGIN
  SELECT retry_count, max_retries 
  INTO v_retry_count, v_max_retries
  FROM public.fne_pending_invoices 
  WHERE id = p_pending_invoice_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  v_retry_count := v_retry_count + 1;
  v_next_retry := public.calculate_next_fne_retry(v_retry_count);
  
  IF v_retry_count >= v_max_retries THEN
    UPDATE public.fne_pending_invoices 
    SET 
      status = 'abandoned',
      retry_count = v_retry_count,
      last_error_message = p_error_message,
      last_error_code = p_error_code,
      updated_at = now()
    WHERE id = p_pending_invoice_id;
    RETURN false;
  ELSE
    UPDATE public.fne_pending_invoices 
    SET 
      status = 'retry_scheduled',
      retry_count = v_retry_count,
      next_retry_at = v_next_retry,
      last_error_message = p_error_message,
      last_error_code = p_error_code,
      updated_at = now()
    WHERE id = p_pending_invoice_id;
    RETURN true;
  END IF;
END;
$function$;

-- 3. Fonction potentielle log_guest_data_access (référencée dans check_guest_access_rate_limit)
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