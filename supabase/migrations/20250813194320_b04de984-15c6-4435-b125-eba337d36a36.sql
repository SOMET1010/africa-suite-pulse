-- Fix Security Definer Issues: Convert non-critical functions to SECURITY INVOKER
-- Critical functions that MUST remain SECURITY DEFINER: get_current_user_org_id, has_permission, has_role, handle_new_user

-- 1. Fix get_current_user_role - can be SECURITY INVOKER since it only reads user's own data
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$function$;

-- 2. Fix pms_search_free_rooms - can be SECURITY INVOKER with proper RLS
CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(p_org uuid, p_start date, p_end date, p_exclude_room_ids uuid[] DEFAULT ARRAY[]::uuid[])
RETURNS TABLE(id uuid, number text, type text, floor text, status text)
LANGUAGE sql
STABLE SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT rm.id, rm.number, rm.type, rm.floor, rm.status
  FROM public.rooms rm
  WHERE rm.org_id = p_org
    AND rm.org_id = get_current_user_org_id() -- Add explicit org check
    AND rm.status NOT IN ('out_of_order','maintenance')
    AND NOT EXISTS (
      SELECT 1 FROM public.reservations rr
      WHERE rr.org_id = p_org
        AND rr.room_id = rm.id
        AND NOT (rr.date_departure <= p_start OR rr.date_arrival >= p_end)
    )
    AND (p_exclude_room_ids IS NULL OR rm.id <> ALL(p_exclude_room_ids));
$function$;

-- 3. Fix pms_validate_move - can be SECURITY INVOKER with proper checks
CREATE OR REPLACE FUNCTION public.pms_validate_move(p_res uuid, p_room uuid)
RETURNS TABLE(ok boolean, reason text)
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rec reservations%ROWTYPE;
  rm rooms%ROWTYPE;
  conflict_count int;
  current_org uuid;
BEGIN
  -- Get current user's org for security
  current_org := get_current_user_org_id();
  
  SELECT * INTO rec FROM public.reservations WHERE id = p_res AND org_id = current_org;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Reservation not found or access denied';
    RETURN;
  END IF;

  SELECT * INTO rm FROM public.rooms WHERE id = p_room AND org_id = current_org;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Room not found or access denied';
    RETURN;
  END IF;

  -- same organization only
  IF rm.org_id <> rec.org_id THEN
    RETURN QUERY SELECT false, 'Room not in same organization';
    RETURN;
  END IF;

  -- blocked rooms
  IF rm.status IN ('out_of_order','maintenance') THEN
    RETURN QUERY SELECT false, 'Room is blocked';
    RETURN;
  END IF;

  -- conflicts overlap
  SELECT COUNT(*) INTO conflict_count
  FROM public.reservations r
  WHERE r.id <> rec.id
    AND r.org_id = rec.org_id
    AND r.room_id = p_room
    AND NOT (r.date_departure <= rec.date_arrival OR r.date_arrival >= rec.date_departure);

  IF conflict_count > 0 THEN
    RETURN QUERY SELECT false, 'Conflicting reservation(s) in target room';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, NULL::text;
END;
$function$;

-- 4. Add missing search_path to functions that need it
CREATE OR REPLACE FUNCTION public.calculate_nights_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- Added missing search_path
AS $function$
BEGIN
  IF NEW.check_in_date IS NOT NULL AND NEW.check_out_date IS NOT NULL THEN
    NEW.nights_count = NEW.check_out_date - NEW.check_in_date;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_next_maintenance_date()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- Added missing search_path
AS $function$
BEGIN
  NEW.next_maintenance_date := calculate_next_maintenance_date(NEW.id);
  RETURN NEW;
END;
$function$;