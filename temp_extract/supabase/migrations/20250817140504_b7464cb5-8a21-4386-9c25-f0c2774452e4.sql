-- Phase 3A FINALE - Correction avec le bon schéma

-- Ajouter SET search_path TO 'public' à toutes les fonctions SECURITY DEFINER manquantes

-- 1. can_access_sensitive_data
CREATE OR REPLACE FUNCTION public.can_access_sensitive_data()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('manager', 'super_admin')
  );
$function$;

-- 2. pms_search_free_rooms
CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(p_org uuid, p_start date, p_end date, p_exclude_room_ids uuid[] DEFAULT '{}'::uuid[])
 RETURNS TABLE(id uuid, number text, type text, floor text, features jsonb, base_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.number,
    r.type,
    r.floor,
    r.features,
    COALESCE(rt.base_rate, 50000::numeric) as base_rate
  FROM public.rooms r
  LEFT JOIN public.room_types rt ON rt.code = r.type AND rt.org_id = r.org_id
  WHERE r.org_id = p_org
    AND r.is_active = true
    AND r.status = 'clean'
    AND r.id != ALL(p_exclude_room_ids)
    AND NOT EXISTS (
      SELECT 1 
      FROM public.reservations res
      WHERE res.room_id = r.id
        AND res.status IN ('confirmed', 'present', 'option')
        AND res.date_arrival < p_end
        AND res.date_departure > p_start
    )
  ORDER BY r.number;
END;
$function$;

-- 3. calculate_nights_count
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

-- 4. get_guest_stay_history_secure
CREATE OR REPLACE FUNCTION public.get_guest_stay_history_secure(p_guest_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(guest_id uuid, reservation_id uuid, first_name text, last_name text, email text, phone text, room_number text, room_type text, date_arrival date, date_departure date, nights_count integer, adults integer, children integer, rate_total numeric, invoice_total numeric, invoice_number text, reservation_reference text, reservation_status text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  RETURN QUERY
  SELECT 
    g.id AS guest_id,
    r.id AS reservation_id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    rm.number AS room_number,
    rm.type AS room_type,
    r.date_arrival,
    r.date_departure,
    (r.date_departure - r.date_arrival) AS nights_count,
    r.adults,
    r.children,
    r.rate_total,
    NULL::numeric AS invoice_total,
    NULL::text AS invoice_number,
    r.reference AS reservation_reference,
    r.status AS reservation_status
  FROM guests g
  LEFT JOIN reservations r ON g.id = r.guest_id
  LEFT JOIN rooms rm ON r.room_id = rm.id
  WHERE g.org_id = v_org_id 
    AND (r.org_id IS NULL OR r.org_id = v_org_id)
    AND (p_guest_id IS NULL OR g.id = p_guest_id)
  ORDER BY r.date_arrival DESC;
END;
$function$;

-- 5. get_reservations_arrivals
CREATE OR REPLACE FUNCTION public.get_reservations_arrivals(p_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(id uuid, org_id uuid, date_arrival text, room_id uuid, adults integer, children integer, planned_time text, reference text, status text, rate_total numeric, guest_name text, room_number text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.org_id,
    r.date_arrival::text,
    r.room_id,
    r.adults,
    r.children,
    r.planned_time::text,
    r.reference,
    r.status,
    r.rate_total,
    COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom') AS guest_name,
    rm.number AS room_number
  FROM reservations r
  LEFT JOIN guests g ON r.guest_id = g.id
  LEFT JOIN rooms rm ON r.room_id = rm.id
  WHERE r.org_id = v_org_id 
    AND r.date_arrival = p_date;
END;
$function$;

-- 6. get_reservations_with_details_secure
CREATE OR REPLACE FUNCTION public.get_reservations_with_details_secure(p_reservation_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, guest_id uuid, room_id uuid, status text, date_arrival date, date_departure date, guest_name text, guest_email text, guest_phone text, room_number text, room_type text, rate_total numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.guest_id,
    r.room_id,
    r.status,
    r.date_arrival,
    r.date_departure,
    COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom') AS guest_name,
    g.email AS guest_email,
    g.phone AS guest_phone,
    rm.number AS room_number,
    rm.type AS room_type,
    r.rate_total
  FROM reservations r
  LEFT JOIN guests g ON r.guest_id = g.id
  LEFT JOIN rooms rm ON r.room_id = rm.id
  WHERE r.org_id = v_org_id
    AND (p_reservation_id IS NULL OR r.id = p_reservation_id);
END;
$function$;

-- 7. get_housekeeping_tasks_with_staff
CREATE OR REPLACE FUNCTION public.get_housekeeping_tasks_with_staff(p_task_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, org_id uuid, room_number text, task_type text, status text, priority text, assigned_to uuid, estimated_duration integer, actual_duration integer, notes text, assigned_staff_name text, assigned_staff_role text, assigned_staff_status text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    t.id,
    t.org_id,
    t.room_number,
    t.task_type,
    t.status,
    t.priority,
    t.assigned_to,
    t.estimated_duration,
    t.actual_duration,
    t.notes,
    s.name AS assigned_staff_name,
    s.role AS assigned_staff_role,
    s.status AS assigned_staff_status
  FROM housekeeping_tasks t
  LEFT JOIN housekeeping_staff s ON t.assigned_to = s.id
  WHERE t.org_id = v_org_id
    AND (p_task_id IS NULL OR t.id = p_task_id);
END;
$function$;

-- 8. get_rack_reservations_enriched
CREATE OR REPLACE FUNCTION public.get_rack_reservations_enriched(p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date)
 RETURNS TABLE(id uuid, org_id uuid, date_arrival date, date_departure date, room_id uuid, adults integer, children integer, rate_total numeric, reference text, status text, room_number text, room_type_code text, room_floor text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    r.id, r.org_id, r.date_arrival, r.date_departure, r.room_id,
    r.adults, r.children, r.rate_total, r.reference, r.status,
    rm.number AS room_number,
    rm.type AS room_type_code,
    rm.floor AS room_floor
  FROM reservations r
  LEFT JOIN rooms rm ON r.room_id = rm.id
  WHERE r.org_id = v_org_id
    AND (p_start_date IS NULL OR r.date_arrival >= p_start_date)
    AND (p_end_date IS NULL OR r.date_departure <= p_end_date);
END;
$function$;

-- 9. get_organization_settings
CREATE OR REPLACE FUNCTION public.get_organization_settings()
 RETURNS TABLE(id uuid, org_id uuid, setting_key text, setting_value jsonb, category text, description text, is_active boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'organization_settings'
  ) THEN
    RETURN QUERY
    SELECT 
      os.id,
      os.org_id,
      os.setting_key,
      os.setting_value,
      os.category,
      os.description,
      os.is_active
    FROM public.organization_settings os
    WHERE os.org_id = get_current_user_org_id()
    AND os.is_active = true
    ORDER BY os.category;
  ELSE
    RETURN;
  END IF;
END;
$function$;

-- 10. can_access_view_data
CREATE OR REPLACE FUNCTION public.can_access_view_data()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.app_users 
    WHERE user_id = auth.uid() 
    AND active = true 
    AND org_id IS NOT NULL
  );
END;
$function$;

-- 11. update_customer_loyalty_tier
CREATE OR REPLACE FUNCTION public.update_customer_loyalty_tier(p_guest_id uuid, p_program_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_points INTEGER;
  v_new_tier_id UUID;
  v_current_tier_id UUID;
BEGIN
  SELECT total_points, tier_id 
  INTO v_total_points, v_current_tier_id
  FROM public.customer_loyalty_points 
  WHERE guest_id = p_guest_id AND program_id = p_program_id;
  
  SELECT id INTO v_new_tier_id
  FROM public.loyalty_tiers 
  WHERE program_id = p_program_id 
    AND min_points <= v_total_points
    AND is_active = true
  ORDER BY min_points DESC 
  LIMIT 1;
  
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

-- 12. assign_housekeeping_task
CREATE OR REPLACE FUNCTION public.assign_housekeeping_task(task_id uuid, staff_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.housekeeping_tasks 
  SET assigned_to = staff_id, updated_at = now()
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  UPDATE public.housekeeping_staff 
  SET current_assignment = task_id, status = 'busy', updated_at = now()
  WHERE id = staff_id AND org_id = get_current_user_org_id();
END;
$function$;

-- CORRIGER L'ERREUR SECURITY DEFINER VIEW
-- Supprimer la vue et la remplacer par une fonction sécurisée

DROP VIEW IF EXISTS public.arrangements_with_calculated_price;

CREATE OR REPLACE FUNCTION public.get_arrangements_with_calculated_price()
RETURNS TABLE(
    id uuid,
    org_id uuid,
    code text,
    label text,
    description text,
    base_price numeric,
    calculated_price numeric,
    services_count bigint,
    is_active boolean,
    valid_from date,
    valid_until date,
    min_nights integer,
    max_nights integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT 
        a.id,
        a.org_id,
        a.code,
        a.label,
        a.description,
        a.base_price,
        COALESCE(a.base_price, 0) + COALESCE(SUM(
            CASE 
                WHEN asrv.is_included THEN asrv.quantity * COALESCE(asrv.unit_price, 0)
                ELSE 0 
            END
        ), 0) AS calculated_price,
        COUNT(asrv.id) AS services_count,
        a.is_active,
        a.valid_from,
        a.valid_until,
        a.min_nights,
        a.max_nights,
        a.created_at,
        a.updated_at
    FROM arrangements a
    LEFT JOIN arrangement_services asrv ON a.id = asrv.arrangement_id
    WHERE a.org_id = get_current_user_org_id()
    GROUP BY a.id, a.org_id, a.code, a.label, a.description, a.base_price, 
             a.is_active, a.valid_from, a.valid_until, a.min_nights, a.max_nights, 
             a.created_at, a.updated_at;
$function$;