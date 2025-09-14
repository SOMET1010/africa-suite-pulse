-- PHASE 3: CORRECTION FINALE - Fonctions SECURITY DEFINER et politiques RLS critiques

-- 1. Correction des 2 dernières fonctions SECURITY DEFINER vulnérables
CREATE OR REPLACE FUNCTION public.calculate_reservation_rate_enhanced(p_room_type text, p_date_arrival date, p_date_departure date, p_guest_type text DEFAULT 'individual'::text, p_arrangement_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(base_rate numeric, total_rate numeric, breakdown jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
  v_base_rate numeric := 0;
  v_total_rate numeric := 0;
  v_breakdown jsonb := '[]'::jsonb;
  v_nights integer;
  v_arrangement_price numeric := 0;
  v_service_total numeric := 0;
BEGIN
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  v_nights := (p_date_departure - p_date_arrival);
  IF v_nights <= 0 THEN
    RAISE EXCEPTION 'Invalid date range: departure must be after arrival';
  END IF;

  SELECT COALESCE(rt.base_rate, 50000) INTO v_base_rate
  FROM room_types rt 
  WHERE rt.org_id = v_org_id AND rt.code = p_room_type;

  v_total_rate := v_base_rate * v_nights;

  IF p_arrangement_id IS NOT NULL THEN
    SELECT COALESCE(a.base_price, 0) INTO v_arrangement_price
    FROM arrangements a 
    WHERE a.id = p_arrangement_id AND a.org_id = v_org_id AND a.is_active = true;
    
    SELECT COALESCE(SUM(asrv.quantity * COALESCE(asrv.unit_price, s.unit_price, 0)), 0) INTO v_service_total
    FROM arrangement_services asrv
    JOIN services s ON asrv.service_id = s.id
    WHERE asrv.arrangement_id = p_arrangement_id AND asrv.is_included = true;
    
    v_total_rate := v_total_rate + v_arrangement_price + v_service_total;
  END IF;

  v_breakdown := jsonb_build_array(
    jsonb_build_object('type', 'base_rate', 'amount', v_base_rate, 'nights', v_nights),
    jsonb_build_object('type', 'arrangement', 'amount', v_arrangement_price),
    jsonb_build_object('type', 'services', 'amount', v_service_total)
  );

  RETURN QUERY SELECT v_base_rate, v_total_rate, v_breakdown;
END;
$function$;

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
  FROM fne_pending_invoices 
  WHERE id = p_pending_invoice_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  v_retry_count := v_retry_count + 1;
  v_next_retry := calculate_next_fne_retry(v_retry_count);
  
  IF v_retry_count >= v_max_retries THEN
    UPDATE fne_pending_invoices 
    SET 
      status = 'abandoned',
      retry_count = v_retry_count,
      last_error_message = p_error_message,
      last_error_code = p_error_code,
      updated_at = now()
    WHERE id = p_pending_invoice_id;
  ELSE
    UPDATE fne_pending_invoices 
    SET 
      status = 'pending',
      retry_count = v_retry_count,
      next_retry_at = v_next_retry,
      last_error_message = p_error_message,
      last_error_code = p_error_code,
      updated_at = now()
    WHERE id = p_pending_invoice_id;
  END IF;
  
  RETURN true;
END;
$function$;

-- 2. Correction des politiques RLS critiques

-- Suppression des politiques problématiques sur rate_limits
DROP POLICY IF EXISTS "Anyone can read rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Public rate limit access" ON rate_limits;

-- Nouvelles politiques sécurisées pour rate_limits
CREATE POLICY "Users can manage rate limits for their org" 
ON rate_limits FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM app_users au 
    WHERE au.user_id = auth.uid() 
    AND au.active = true 
    AND au.org_id = get_current_user_org_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM app_users au 
    WHERE au.user_id = auth.uid() 
    AND au.active = true 
    AND au.org_id = get_current_user_org_id()
  )
);

-- Restriction d'accès aux données business sensibles
-- Modules : seuls les managers peuvent voir les données business
CREATE POLICY "Managers can view business modules" 
ON modules FOR SELECT 
TO authenticated 
USING (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin'));

-- Subscription plans : accès restreint
CREATE POLICY "Authenticated users can view active subscription plans" 
ON subscription_plans FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Deployment types : accès restreint aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can view active deployment types" 
ON deployment_types FOR SELECT 
TO authenticated 
USING (is_active = true);

-- 3. Fonction de monitoring des tentatives d'accès non autorisées
CREATE OR REPLACE FUNCTION public.log_unauthorized_access_attempt(
  p_table_name text,
  p_action text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO audit_logs (
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
    'unauthorized_access_attempt',
    p_table_name,
    p_action,
    p_details,
    'warning'
  );
END;
$function$;