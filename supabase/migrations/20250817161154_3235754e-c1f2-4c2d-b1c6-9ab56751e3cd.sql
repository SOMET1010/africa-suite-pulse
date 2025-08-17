-- Phase 1 - MISSION FINALE: Les 3 dernières fonctions 
-- Recherche par élimination des fonctions système les plus courantes

-- 1. handle_new_user function
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

-- 2. update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 3. validate_room_type function
CREATE OR REPLACE FUNCTION public.validate_room_type()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM room_types 
    WHERE org_id = NEW.org_id AND code = NEW.type
  ) THEN
    RAISE EXCEPTION 'Room type % does not exist for organization %', NEW.type, NEW.org_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. auto_assign_all_tables_to_server function
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
    SELECT 1 FROM table_assignments 
    WHERE server_id = p_server_id 
      AND shift_date = CURRENT_DATE 
      AND status = 'active'
      AND org_id = p_org_id
  ) THEN
    FOR table_record IN
      SELECT id FROM pos_tables 
      WHERE org_id = p_org_id AND is_active = true
    LOOP
      INSERT INTO table_assignments (
        org_id, table_id, server_id, shift_date, assigned_by
      ) VALUES (
        p_org_id, table_record.id, p_server_id, CURRENT_DATE, p_server_id
      );
    END LOOP;
  END IF;
END;
$function$;

-- 5. assign_table_to_server function
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
  
  UPDATE table_assignments 
  SET status = 'transferred', updated_at = now()
  WHERE table_id = p_table_id 
    AND shift_date = CURRENT_DATE 
    AND status = 'active'
    AND org_id = v_org_id;
  
  INSERT INTO table_assignments (
    org_id, table_id, server_id, assigned_by, shift_date
  ) VALUES (
    v_org_id, p_table_id, p_server_id, p_assigned_by, CURRENT_DATE
  ) RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$function$;