-- Phase 3A FINALE - Dernières corrections search_path

-- Corriger toutes les fonctions restantes avec SET search_path TO 'public'

-- 1. update_customer_balance (trigger)
CREATE OR REPLACE FUNCTION public.update_customer_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - OLD.total_amount + NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + OLD.amount - NEW.amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - OLD.total_amount,
          updated_at = now()
      WHERE id = OLD.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + OLD.amount,
          updated_at = now()
      WHERE id = OLD.customer_account_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- 2. calculate_net_quantity
CREATE OR REPLACE FUNCTION public.calculate_net_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.net_quantity IS NULL AND NEW.waste_coefficient IS NOT NULL AND NEW.waste_coefficient > 0 THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  IF OLD.gross_quantity IS DISTINCT FROM NEW.gross_quantity AND NEW.waste_coefficient IS NOT NULL THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  IF OLD.waste_coefficient IS DISTINCT FROM NEW.waste_coefficient AND NEW.waste_coefficient IS NOT NULL AND NEW.waste_coefficient > 0 THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. logout_pos_session
CREATE OR REPLACE FUNCTION public.logout_pos_session(p_session_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.pos_auth_sessions 
  SET is_active = false
  WHERE session_token = p_session_token;
END;
$function$;

-- 4. audit_row_changes
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
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
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
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
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
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, v_old_values, NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- 5. check_rate_limit
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
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - (p_window_minutes || ' minutes')::interval;
  
  SELECT attempts, window_start INTO v_current_attempts, v_window_start
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (p_identifier, p_action, 1);
    RETURN true;
  END IF;
  
  IF v_window_start > now() - (p_window_minutes || ' minutes')::interval THEN
    IF v_current_attempts >= p_max_attempts THEN
      RETURN false;
    ELSE
      UPDATE public.rate_limits 
      SET attempts = attempts + 1
      WHERE identifier = p_identifier AND action = p_action;
      RETURN true;
    END IF;
  ELSE
    UPDATE public.rate_limits 
    SET attempts = 1, window_start = now()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN true;
  END IF;
END;
$function$;

-- 6. assign_table_to_server
CREATE OR REPLACE FUNCTION public.assign_table_to_server(p_table_id uuid, p_server_id uuid, p_assigned_by uuid DEFAULT auth.uid())
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id UUID;
  v_assignment_id UUID;
BEGIN
  v_org_id := get_current_user_org_id();
  
  UPDATE public.table_assignments 
  SET status = 'transferred', updated_at = now()
  WHERE table_id = p_table_id 
    AND shift_date = CURRENT_DATE 
    AND status = 'active'
    AND org_id = v_org_id;
  
  INSERT INTO public.table_assignments (
    org_id, table_id, server_id, assigned_by, shift_date
  ) VALUES (
    v_org_id, p_table_id, p_server_id, p_assigned_by, CURRENT_DATE
  ) RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$function$;

-- 7. trg_audit_log
CREATE OR REPLACE FUNCTION public.trg_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_action text;
  v_org uuid;
  v_record_id text;
  v_old jsonb;
  v_new jsonb;
BEGIN
  v_action := lower(TG_OP);
  v_org := COALESCE(NEW.org_id, OLD.org_id);
  v_record_id := COALESCE(
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN (NEW.id)::text END,
    CASE WHEN TG_OP = 'DELETE' THEN (OLD.id)::text END
  );
  v_old := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  v_new := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END;

  IF v_org IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.audit_logs (org_id, user_id, action, table_name, record_id, old_values, new_values, severity)
  VALUES (v_org, auth.uid(), v_action, TG_TABLE_NAME, v_record_id, v_old, v_new, 'info');

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 8. complete_housekeeping_task
CREATE OR REPLACE FUNCTION public.complete_housekeeping_task(task_id uuid, actual_duration integer DEFAULT NULL::integer, quality_score integer DEFAULT NULL::integer, quality_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  staff_id UUID;
BEGIN
  SELECT assigned_to INTO staff_id 
  FROM public.housekeeping_tasks 
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  UPDATE public.housekeeping_tasks 
  SET 
    status = 'completed',
    completed_at = now(),
    actual_duration = COALESCE(complete_housekeeping_task.actual_duration, actual_duration),
    quality_score = COALESCE(complete_housekeeping_task.quality_score, quality_score),
    quality_notes = COALESCE(complete_housekeeping_task.quality_notes, quality_notes),
    updated_at = now()
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  IF staff_id IS NOT NULL THEN
    UPDATE public.housekeeping_staff 
    SET 
      current_assignment = NULL, 
      status = 'available', 
      last_activity = now(),
      updated_at = now()
    WHERE id = staff_id AND org_id = get_current_user_org_id();
  END IF;
END;
$function$;

-- 9. calculate_composed_product_cost
CREATE OR REPLACE FUNCTION public.calculate_composed_product_cost(p_product_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_cost numeric := 0;
  component_record RECORD;
BEGIN
  FOR component_record IN
    SELECT 
      pc.quantity,
      pc.unit,
      p.price_ht,
      p.unit_sale,
      pc.component_product_id
    FROM pos_product_compositions pc
    JOIN pos_products p ON pc.component_product_id = p.id
    WHERE pc.parent_product_id = p_product_id
  LOOP
    total_cost := total_cost + (component_record.quantity * COALESCE(component_record.price_ht, 0));
  END LOOP;
  
  RETURN total_cost;
END;
$function$;

-- 10. check_guest_access_rate_limit
CREATE OR REPLACE FUNCTION public.check_guest_access_rate_limit()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER;
  max_requests INTEGER := 1000;
  window_minutes INTEGER := 60;
BEGIN
  DELETE FROM public.guest_access_rate_limits 
  WHERE window_start < now() - (window_minutes || ' minutes')::interval;
  
  SELECT COALESCE(SUM(access_count), 0) INTO current_count
  FROM public.guest_access_rate_limits
  WHERE user_id = auth.uid()
    AND org_id = get_current_user_org_id()
    AND window_start > now() - (window_minutes || ' minutes')::interval;
  
  IF current_count >= max_requests THEN
    PERFORM public.log_guest_data_access(
      NULL,
      'rate_limit_exceeded',
      ARRAY['current_count: ' || current_count::TEXT]
    );
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.guest_access_rate_limits (user_id, org_id, access_count)
  VALUES (auth.uid(), get_current_user_org_id(), 1)
  ON CONFLICT (user_id, org_id)
  DO UPDATE SET 
    access_count = guest_access_rate_limits.access_count + 1,
    window_start = CASE 
      WHEN guest_access_rate_limits.window_start < now() - (window_minutes || ' minutes')::interval 
      THEN now() 
      ELSE guest_access_rate_limits.window_start 
    END;
  
  RETURN TRUE;
END;
$function$;

-- 11. assign_default_user_role
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id UUID;
BEGIN
  v_org_id := NEW.org_id;
  
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.user_id AND org_id = v_org_id
  ) THEN
    INSERT INTO public.user_roles (user_id, org_id, role)
    VALUES (NEW.user_id, v_org_id, 'receptionist'::public.app_role);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 12. log_security_event
CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_details jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'info'::text)
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
    p_event_type,
    'security_events',
    gen_random_uuid()::text,
    p_details,
    p_severity
  );
END;
$function$;