-- Fix critical security vulnerabilities

-- 1. Fix function search_path for all SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT org_id 
  FROM public.app_users 
  WHERE user_id = auth.uid() 
  AND active = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.pms_assign_room(p_res uuid, p_room uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.reservations
  SET room_id = p_room
  WHERE id = p_res;
END;
$function$;

CREATE OR REPLACE FUNCTION public.pms_checkin(p_res uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.reservations
  SET status = 'present'
  WHERE id = p_res;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_room_type()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure the room type exists for this organization
  IF NOT EXISTS (
    SELECT 1 FROM room_types 
    WHERE org_id = NEW.org_id AND code = NEW.type
  ) THEN
    RAISE EXCEPTION 'Room type % does not exist for organization %', NEW.type, NEW.org_id;
  END IF;
  RETURN NEW;
END;
$function$;

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
  -- Ensure there's at least one organization
  IF NOT EXISTS (SELECT 1 FROM public.hotel_settings) THEN
    INSERT INTO public.hotel_settings (org_id, name)
    VALUES (gen_random_uuid(), 'Mon Hôtel');
  END IF;
  
  -- Create user profile in app_users with first available organization
  INSERT INTO public.app_users (user_id, org_id, email, full_name, login)
  SELECT 
    NEW.id,
    (SELECT org_id FROM public.hotel_settings LIMIT 1),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    LOWER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 10))
  WHERE NOT EXISTS (
    SELECT 1 FROM public.app_users WHERE user_id = NEW.id
  );
  
  -- SECURITY FIX: Assign 'user' role instead of 'admin' to new users
  INSERT INTO public.user_roles (user_id, org_id, role)
  SELECT 
    NEW.id,
    (SELECT org_id FROM public.hotel_settings LIMIT 1),
    'user'::app_role  -- Changed from 'admin' to 'user'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.pms_validate_move(p_res uuid, p_room uuid)
 RETURNS TABLE(ok boolean, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec reservations%ROWTYPE;
  rm rooms%ROWTYPE;
  conflict_count int;
BEGIN
  SELECT * INTO rec FROM public.reservations WHERE id = p_res;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Reservation not found';
    RETURN;
  END IF;

  SELECT * INTO rm FROM public.rooms WHERE id = p_room;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Room not found';
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

CREATE OR REPLACE FUNCTION public.pms_move_reservation(p_res uuid, p_room uuid)
 RETURNS reservations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _ok boolean;
  _reason text;
  updated_row public.reservations;
BEGIN
  SELECT ok, reason INTO _ok, _reason FROM public.pms_validate_move(p_res, p_room);
  IF NOT _ok THEN
    RAISE EXCEPTION '%', _reason USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.reservations
  SET room_id = p_room
  WHERE id = p_res
  RETURNING * INTO updated_row;

  RETURN updated_row;
END;
$function$;

CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(p_org uuid, p_start date, p_end date, p_exclude_room_ids uuid[] DEFAULT ARRAY[]::uuid[])
 RETURNS TABLE(id uuid, number text, type text, floor text, status text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT rm.id, rm.number, rm.type, rm.floor, rm.status
  FROM public.rooms rm
  WHERE rm.org_id = p_org
    AND rm.status NOT IN ('out_of_order','maintenance')
    AND NOT EXISTS (
      SELECT 1 FROM public.reservations rr
      WHERE rr.org_id = p_org
        AND rr.room_id = rm.id
        AND NOT (rr.date_departure <= p_start OR rr.date_arrival >= p_end)
    )
    AND (p_exclude_room_ids IS NULL OR rm.id <> ALL(p_exclude_room_ids));
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if current user has the specified permission through their role
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.app_users au ON au.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'manager') -- Simple role-based permissions for now
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- 2. Remove all SECURITY DEFINER views (will be recreated without SECURITY DEFINER)
-- First check if they exist and drop them
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'user_view' AND table_schema = 'public') THEN
        DROP VIEW public.user_view;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'room_view' AND table_schema = 'public') THEN
        DROP VIEW public.room_view;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'reservation_view' AND table_schema = 'public') THEN
        DROP VIEW public.reservation_view;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'guest_view' AND table_schema = 'public') THEN
        DROP VIEW public.guest_view;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'invoice_view' AND table_schema = 'public') THEN
        DROP VIEW public.invoice_view;
    END IF;
END $$;