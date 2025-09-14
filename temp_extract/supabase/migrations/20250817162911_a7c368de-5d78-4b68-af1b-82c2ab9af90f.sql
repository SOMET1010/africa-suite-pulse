-- CORRECTION FINALE - Version compatible PostgreSQL

-- Corriger les 2 fonctions les plus probables sans search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Ajouter search_path aux autres fonctions triggers courantes
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