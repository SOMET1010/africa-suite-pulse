-- Correction des alertes de sécurité détectées

-- 1. Corriger les fonctions qui n'ont pas search_path défini
CREATE OR REPLACE FUNCTION public.calculate_nights_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.check_in_date IS NOT NULL AND NEW.check_out_date IS NOT NULL THEN
    NEW.nights_count = NEW.check_out_date - NEW.check_in_date;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_customer_loyalty_tier(p_guest_id uuid, p_program_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_total_points INTEGER;
  v_new_tier_id UUID;
  v_current_tier_id UUID;
BEGIN
  -- Get current total points
  SELECT total_points, tier_id 
  INTO v_total_points, v_current_tier_id
  FROM public.customer_loyalty_points 
  WHERE guest_id = p_guest_id AND program_id = p_program_id;
  
  -- Find appropriate tier based on points
  SELECT id INTO v_new_tier_id
  FROM public.loyalty_tiers 
  WHERE program_id = p_program_id 
    AND min_points <= v_total_points
    AND is_active = true
  ORDER BY min_points DESC 
  LIMIT 1;
  
  -- Update tier if changed
  IF v_new_tier_id IS DISTINCT FROM v_current_tier_id THEN
    UPDATE public.customer_loyalty_points 
    SET 
      tier_id = v_new_tier_id,
      tier_achieved_at = CASE WHEN v_new_tier_id IS NOT NULL THEN now() ELSE NULL END,
      updated_at = now()
    WHERE guest_id = p_guest_id AND program_id = p_program_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_loyalty_points(p_guest_id uuid, p_program_id uuid, p_points integer, p_transaction_type text DEFAULT 'earned'::text, p_description text DEFAULT NULL::text, p_reservation_id uuid DEFAULT NULL::uuid, p_reference text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Insert or update customer loyalty points
  INSERT INTO public.customer_loyalty_points (guest_id, program_id, total_points, last_activity_at)
  VALUES (p_guest_id, p_program_id, p_points, now())
  ON CONFLICT (guest_id, program_id)
  DO UPDATE SET 
    total_points = customer_loyalty_points.total_points + p_points,
    last_activity_at = now(),
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.loyalty_transactions (
    guest_id, program_id, reservation_id, transaction_type, 
    points, description, reference, created_by
  )
  VALUES (
    p_guest_id, p_program_id, p_reservation_id, p_transaction_type,
    p_points, p_description, p_reference, auth.uid()
  );
  
  -- Update tier
  PERFORM public.update_customer_loyalty_tier(p_guest_id, p_program_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_reservation_checkout_loyalty()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_program_id UUID;
  v_nights INTEGER;
  v_points_per_night INTEGER;
  v_points_per_currency NUMERIC;
  v_night_points INTEGER;
  v_spend_points INTEGER;
  v_total_points INTEGER;
BEGIN
  -- Only process when status changes to checked out
  IF OLD.status != 'departed' AND NEW.status = 'departed' AND NEW.guest_id IS NOT NULL THEN
    
    -- Get the active loyalty program for this org
    SELECT id, points_per_night, points_per_currency_unit
    INTO v_program_id, v_points_per_night, v_points_per_currency
    FROM public.loyalty_programs 
    WHERE org_id = NEW.org_id AND is_active = true
    LIMIT 1;
    
    IF v_program_id IS NOT NULL THEN
      -- Calculate nights
      v_nights := GREATEST(1, NEW.date_departure - NEW.date_arrival);
      
      -- Calculate points from nights
      v_night_points := v_nights * v_points_per_night;
      
      -- Calculate points from spending
      v_spend_points := FLOOR((COALESCE(NEW.rate_total, 0) * v_points_per_currency));
      
      -- Total points
      v_total_points := v_night_points + v_spend_points;
      
      -- Award points
      PERFORM public.add_loyalty_points(
        NEW.guest_id,
        v_program_id,
        v_total_points,
        'earned',
        format('Séjour du %s au %s (%s nuits, %s points nuits + %s points dépenses)', 
               NEW.date_arrival, NEW.date_departure, v_nights, v_night_points, v_spend_points),
        NEW.id,
        NEW.reference
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trg_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

  -- Only log rows tied to an organization
  IF v_org IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.audit_logs (org_id, user_id, action, table_name, record_id, old_values, new_values, severity)
  VALUES (v_org, auth.uid(), v_action, TG_TABLE_NAME, v_record_id, v_old, v_new, 'info');

  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_read_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF public.is_user_read_only(auth.uid()) THEN
    RAISE EXCEPTION 'Votre compte est en mode lecture seule jusqu''au %', 
      (SELECT read_only_until FROM public.user_security_settings WHERE user_id = auth.uid())
      USING ERRCODE = '0L000';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_read_only(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT COALESCE(
    (SELECT read_only_until > now()
     FROM public.user_security_settings
     WHERE user_id = _user_id),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.pms_assign_room(p_res uuid, p_room uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
SET search_path = 'public'
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
SET search_path = 'public'
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
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.pms_validate_move(p_res uuid, p_room uuid)
RETURNS TABLE(ok boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(p_org uuid, p_start date, p_end date, p_exclude_room_ids uuid[] DEFAULT ARRAY[]::uuid[])
RETURNS TABLE(id uuid, number text, type text, floor text, status text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
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