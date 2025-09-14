-- Phase 1: CORRECTION FINALE - Identifier et corriger les 3 dernières fonctions
-- Les fonctions les plus susceptibles d'être manquées sont les triggers et fonctions système

-- 1. audit_row_changes trigger function
CREATE OR REPLACE FUNCTION public.audit_row_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_action text;
  v_org_id uuid;
  v_record_id uuid;
  v_old_values jsonb;
  v_new_values jsonb;
  v_sensitive_fields text[] := ARRAY['document_number', 'tax_id', 'pin_hash', 'password', 'credit_card_number', 'bank_account'];
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    
    v_new_values := to_jsonb(NEW);
    FOR i IN 1..array_length(v_sensitive_fields, 1) LOOP
      v_new_values := v_new_values - v_sensitive_fields[i];
    END LOOP;
    
    INSERT INTO audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, NULL, v_new_values);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    FOR i IN 1..array_length(v_sensitive_fields, 1) LOOP
      v_old_values := v_old_values - v_sensitive_fields[i];
      v_new_values := v_new_values - v_sensitive_fields[i];
    END LOOP;
    
    INSERT INTO audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, v_old_values, v_new_values);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_org_id := COALESCE(OLD.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(OLD)->>'id')::uuid;
    
    v_old_values := to_jsonb(OLD);
    FOR i IN 1..array_length(v_sensitive_fields, 1) LOOP
      v_old_values := v_old_values - v_sensitive_fields[i];
    END LOOP;
    
    INSERT INTO audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, v_old_values, NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- 2. check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_attempts integer;
  v_window_start timestamp with time zone;
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < now() - (p_window_minutes || ' minutes')::interval;
  
  SELECT attempts, window_start INTO v_current_attempts, v_window_start
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF NOT FOUND THEN
    INSERT INTO rate_limits (identifier, action, attempts)
    VALUES (p_identifier, p_action, 1);
    RETURN true;
  END IF;
  
  IF v_window_start > now() - (p_window_minutes || ' minutes')::interval THEN
    IF v_current_attempts >= p_max_attempts THEN
      RETURN false;
    ELSE
      UPDATE rate_limits 
      SET attempts = attempts + 1
      WHERE identifier = p_identifier AND action = p_action;
      RETURN true;
    END IF;
  ELSE
    UPDATE rate_limits 
    SET attempts = 1, window_start = now()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN true;
  END IF;
END;
$function$;

-- 3. log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_details jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'info'::text)
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
    p_event_type,
    'security_events',
    gen_random_uuid()::text,
    p_details,
    p_severity
  );
END;
$function$;