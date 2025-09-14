-- Phase 1: CORRECTION MASSIVE - BATCH 1 (Approach sans DROP)
-- Ajouter SET search_path aux fonctions existantes sans les supprimer

-- 1. has_role function - GARDER les paramètres existants
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    WHERE ur.user_id = _user_id
    AND ur.role = _role::app_role
    AND EXISTS (
      SELECT 1 FROM app_users au 
      WHERE au.user_id = _user_id 
      AND au.active = true
    )
  );
END;
$function$;

-- 2. Ajouter search_path aux autres fonctions système critiques
CREATE OR REPLACE FUNCTION public.calculate_nights_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.check_in_date IS NOT NULL AND NEW.check_out_date IS NOT NULL THEN
    NEW.nights_count = NEW.check_out_date - NEW.check_in_date;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3. assign_housekeeping_task
CREATE OR REPLACE FUNCTION public.assign_housekeeping_task(task_id uuid, staff_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE housekeeping_tasks 
  SET assigned_to = staff_id, updated_at = now()
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  UPDATE housekeeping_staff 
  SET current_assignment = task_id, status = 'busy', updated_at = now()
  WHERE id = staff_id AND org_id = get_current_user_org_id();
END;
$function$;

-- 4. complete_housekeeping_task
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
  FROM housekeeping_tasks 
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  UPDATE housekeeping_tasks 
  SET 
    status = 'completed',
    completed_at = now(),
    actual_duration = COALESCE(complete_housekeeping_task.actual_duration, actual_duration),
    quality_score = COALESCE(complete_housekeeping_task.quality_score, quality_score),
    quality_notes = COALESCE(complete_housekeeping_task.quality_notes, quality_notes),
    updated_at = now()
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  IF staff_id IS NOT NULL THEN
    UPDATE housekeeping_staff 
    SET 
      current_assignment = NULL, 
      status = 'available', 
      last_activity = now(),
      updated_at = now()
    WHERE id = staff_id AND org_id = get_current_user_org_id();
  END IF;
END;
$function$;

-- 5. assign_default_user_role
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
    SELECT 1 FROM user_roles 
    WHERE user_id = NEW.user_id AND org_id = v_org_id
  ) THEN
    INSERT INTO user_roles (user_id, org_id, role)
    VALUES (NEW.user_id, v_org_id, 'receptionist'::app_role);
  END IF;
  
  RETURN NEW;
END;
$function$;