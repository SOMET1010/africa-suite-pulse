-- Phase 3A FINAL - Élimination totale des 5 derniers search_path

-- Corriger les 5 dernières fonctions restantes

-- 1. get_user_org_id_for_views
CREATE OR REPLACE FUNCTION public.get_user_org_id_for_views()
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT org_id 
  FROM public.app_users 
  WHERE user_id = auth.uid() 
  AND active = true
  LIMIT 1;
$function$;

-- 2. auto_assign_all_tables_to_server
CREATE OR REPLACE FUNCTION public.auto_assign_all_tables_to_server(p_server_id uuid, p_org_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  table_record RECORD;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.table_assignments 
    WHERE server_id = p_server_id 
      AND shift_date = CURRENT_DATE 
      AND status = 'active'
      AND org_id = p_org_id
  ) THEN
    FOR table_record IN
      SELECT id FROM public.pos_tables 
      WHERE org_id = p_org_id AND is_active = true
    LOOP
      INSERT INTO public.table_assignments (
        org_id, table_id, server_id, shift_date, assigned_by
      ) VALUES (
        p_org_id, table_record.id, p_server_id, CURRENT_DATE, p_server_id
      );
    END LOOP;
  END IF;
END;
$function$;

-- 3. authenticate_pos_user
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(session_token text, user_id uuid, display_name text, role_name text, org_id uuid, outlet_id uuid)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
  v_user_record RECORD;
  v_session_token text;
  v_expires_at timestamptz;
BEGIN
  v_org_id := COALESCE(p_org_id, (
    SELECT au.org_id FROM app_users au WHERE au.user_id = auth.uid() LIMIT 1
  ));
  
  SELECT pu.user_id, pu.display_name, ur.role::text as role_name
  INTO v_user_record
  FROM pos_users pu
  LEFT JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.org_id = v_org_id
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  v_session_token := gen_random_uuid()::text;
  v_expires_at := now() + INTERVAL '8 hours';
  
  INSERT INTO pos_auth_sessions (
    user_id, org_id, session_token, expires_at
  ) VALUES (
    v_user_record.user_id, v_org_id, v_session_token, v_expires_at
  );
  
  RETURN QUERY SELECT 
    v_session_token,
    v_user_record.user_id,
    v_user_record.display_name,
    COALESCE(v_user_record.role_name, 'pos_server'),
    v_org_id,
    NULL::uuid;
END;
$function$;

-- 4. cleanup_old_fne_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_fne_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.fne_api_logs 
  WHERE created_at < now() - INTERVAL '2 years';
END;
$function$;

-- 5. calculate_next_fne_retry
CREATE OR REPLACE FUNCTION public.calculate_next_fne_retry(p_retry_count integer, p_base_delay_minutes integer DEFAULT 5)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  delay_minutes INTEGER;
BEGIN
  delay_minutes := p_base_delay_minutes * POWER(2, LEAST(p_retry_count, 4));
  delay_minutes := LEAST(delay_minutes, 120);
  
  RETURN now() + (delay_minutes || ' minutes')::INTERVAL;
END;
$function$;