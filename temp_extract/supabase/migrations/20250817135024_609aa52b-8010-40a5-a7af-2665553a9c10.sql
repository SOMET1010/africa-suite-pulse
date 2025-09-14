-- Phase 3A: Élimination des vues SECURITY DEFINER critiques
-- Conversion des 8 vues problématiques en fonctions sécurisées

-- 1. Supprimer les vues existantes et les remplacer par des fonctions sécurisées

-- Conversion de guest_stay_history_secure en fonction
DROP VIEW IF EXISTS public.guest_stay_history_secure;

CREATE OR REPLACE FUNCTION public.get_guest_stay_history_secure(p_guest_id uuid DEFAULT NULL)
RETURNS TABLE(
  guest_id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  reservation_id uuid,
  reservation_reference text,
  date_arrival date,
  date_departure date,
  nights_count integer,
  adults integer,
  children integer,
  rate_total numeric,
  reservation_status text,
  room_number text,
  room_type text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  RETURN QUERY
  SELECT 
    g.id AS guest_id,
    g.first_name,
    g.last_name,
    NULL::text AS email,  -- Masquer les données sensibles
    NULL::text AS phone,  -- Masquer les données sensibles
    r.id AS reservation_id,
    r.reference AS reservation_reference,
    r.date_arrival,
    r.date_departure,
    (r.date_departure - r.date_arrival) AS nights_count,
    r.adults,
    r.children,
    r.rate_total,
    r.status AS reservation_status,
    rm.number AS room_number,
    rm.type AS room_type
  FROM guests g
  LEFT JOIN reservations r ON g.id = r.guest_id
  LEFT JOIN rooms rm ON r.room_id = rm.id
  WHERE g.org_id = v_org_id 
    AND (r.org_id IS NULL OR r.org_id = v_org_id)
    AND (p_guest_id IS NULL OR g.id = p_guest_id)
  ORDER BY r.date_arrival DESC;
END;
$$;

-- Conversion de reservations_view_arrivals en fonction
DROP VIEW IF EXISTS public.reservations_view_arrivals;

CREATE OR REPLACE FUNCTION public.get_reservations_arrivals(p_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(
  id uuid,
  org_id uuid,
  date_arrival text,
  room_id uuid,
  adults integer,
  children integer,
  planned_time text,
  reference text,
  status text,
  rate_total numeric,
  guest_name text,
  room_number text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.org_id,
    r.date_arrival::text AS date_arrival,
    r.room_id,
    r.adults,
    r.children,
    r.planned_time::text AS planned_time,
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
$$;

-- Conversion de reservations_with_details en fonction
DROP VIEW IF EXISTS public.reservations_with_details;

CREATE OR REPLACE FUNCTION public.get_reservations_with_details_secure(p_reservation_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  org_id uuid,
  date_arrival date,
  planned_time time,
  status text,
  room_id uuid,
  reference text,
  adults integer,
  children integer,
  rate_total numeric,
  date_departure date,
  guest_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  source text,
  source_reference text,
  special_requests text,
  notes text,
  confirmed_at timestamp with time zone,
  confirmed_by uuid,
  checked_in_at timestamp with time zone,
  checked_out_at timestamp with time zone,
  created_by uuid,
  group_id uuid,
  tariff_id uuid,
  promotion_code text,
  allotment_id uuid,
  cancellation_policy_id uuid,
  is_duplicate_from uuid,
  discount_amount numeric,
  original_rate numeric,
  group_billing_mode text,
  guest_name text,
  guest_email text,
  guest_phone text,
  room_number text,
  room_type text,
  tariff_label text,
  tariff_base_rate numeric,
  cancellation_policy_label text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  RETURN QUERY
  SELECT 
    r.id, r.org_id, r.date_arrival, r.planned_time, r.status, r.room_id,
    r.reference, r.adults, r.children, r.rate_total, r.date_departure, r.guest_id,
    r.created_at, r.updated_at, r.source, r.source_reference, r.special_requests,
    r.notes, r.confirmed_at, r.confirmed_by, r.checked_in_at, r.checked_out_at,
    r.created_by, r.group_id, r.tariff_id, r.promotion_code, r.allotment_id,
    r.cancellation_policy_id, r.is_duplicate_from, r.discount_amount, r.original_rate,
    r.group_billing_mode,
    COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom') AS guest_name,
    g.email AS guest_email,
    g.phone AS guest_phone,
    rm.number AS room_number,
    rm.type AS room_type,
    t.label AS tariff_label,
    t.base_rate AS tariff_base_rate,
    cp.label AS cancellation_policy_label
  FROM reservations r
  LEFT JOIN guests g ON r.guest_id = g.id
  LEFT JOIN rooms rm ON r.room_id = rm.id
  LEFT JOIN tariffs t ON r.tariff_id = t.id
  LEFT JOIN cancellation_policies cp ON r.cancellation_policy_id = cp.id
  WHERE r.org_id = v_org_id
    AND (p_reservation_id IS NULL OR r.id = p_reservation_id);
END;
$$;

-- Conversion de housekeeping_tasks_with_staff en fonction
DROP VIEW IF EXISTS public.housekeeping_tasks_with_staff;

CREATE OR REPLACE FUNCTION public.get_housekeeping_tasks_with_staff(p_task_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  org_id uuid,
  room_number text,
  task_type text,
  status text,
  priority text,
  assigned_to uuid,
  estimated_duration integer,
  actual_duration integer,
  checklist_items jsonb,
  notes text,
  special_instructions text,
  guest_status text,
  scheduled_start timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  quality_score integer,
  quality_notes text,
  linen_change_details jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid,
  assigned_staff_name text,
  assigned_staff_role text,
  assigned_staff_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  RETURN QUERY
  SELECT 
    t.id, t.org_id, t.room_number, t.task_type, t.status, t.priority, t.assigned_to,
    t.estimated_duration, t.actual_duration, t.checklist_items, t.notes,
    t.special_instructions, t.guest_status, t.scheduled_start, t.started_at,
    t.completed_at, t.quality_score, t.quality_notes, t.linen_change_details,
    t.created_at, t.updated_at, t.created_by,
    s.name AS assigned_staff_name,
    s.role AS assigned_staff_role,
    s.status AS assigned_staff_status
  FROM housekeeping_tasks t
  LEFT JOIN housekeeping_staff s ON t.assigned_to = s.id
  WHERE t.org_id = v_org_id
    AND (p_task_id IS NULL OR t.id = p_task_id);
END;
$$;

-- Conversion de rack_reservations_enriched en fonction
DROP VIEW IF EXISTS public.rack_reservations_enriched;

CREATE OR REPLACE FUNCTION public.get_rack_reservations_enriched(p_start_date date DEFAULT NULL, p_end_date date DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  org_id uuid,
  date_arrival date,
  date_departure date,
  room_id uuid,
  adults integer,
  children integer,
  rate_total numeric,
  reference text,
  status text,
  room_number text,
  room_type_code text,
  room_floor text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
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
$$;

-- Conversion de room_status_summary en fonction
DROP VIEW IF EXISTS public.room_status_summary;

CREATE OR REPLACE FUNCTION public.get_room_status_summary(p_room_number text DEFAULT NULL)
RETURNS TABLE(
  org_id uuid,
  room_number text,
  guest_status text,
  pending_tasks bigint,
  in_progress_tasks bigint,
  completed_tasks bigint,
  last_task_update timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  RETURN QUERY
  SELECT 
    t.org_id,
    t.room_number,
    t.guest_status,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_tasks,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_tasks,
    MAX(t.updated_at) AS last_task_update
  FROM housekeeping_tasks t
  WHERE t.org_id = v_org_id
    AND (p_room_number IS NULL OR t.room_number = p_room_number)
  GROUP BY t.org_id, t.room_number, t.guest_status;
END;
$$;

-- Conversion de services_with_family en fonction
DROP VIEW IF EXISTS public.services_with_family;

CREATE OR REPLACE FUNCTION public.get_services_with_family(p_service_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  org_id uuid,
  code text,
  label text,
  description text,
  unit_price numeric,
  unit text,
  category text,
  service_family_id uuid,
  is_active boolean,
  tax_rate numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  service_family_code text,
  service_family_label text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  RETURN QUERY
  SELECT 
    s.id, s.org_id, s.code, s.label, s.description, s.unit_price, s.unit,
    s.category, s.service_family_id, s.is_active, s.tax_rate, s.created_at, s.updated_at,
    sf.code AS service_family_code,
    sf.label AS service_family_label
  FROM services s
  LEFT JOIN service_families sf ON s.service_family_id = sf.id
  WHERE s.org_id = v_org_id
    AND (p_service_id IS NULL OR s.id = p_service_id);
END;
$$;

-- Conversion de v_daily_revenue en fonction
DROP VIEW IF EXISTS public.v_daily_revenue;

CREATE OR REPLACE FUNCTION public.get_daily_revenue(p_start_date date DEFAULT NULL, p_end_date date DEFAULT NULL)
RETURNS TABLE(
  revenue_date date,
  org_id uuid,
  total_revenue numeric,
  reservation_revenue numeric,
  service_revenue numeric,
  tax_amount numeric,
  net_revenue numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
  v_start_date date;
  v_end_date date;
BEGIN
  -- Vérifier l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  -- Valeurs par défaut pour les dates
  v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end_date := COALESCE(p_end_date, CURRENT_DATE);

  RETURN QUERY
  SELECT 
    gs.date::date AS revenue_date,
    v_org_id AS org_id,
    COALESCE(SUM(r.rate_total), 0) AS total_revenue,
    COALESCE(SUM(r.rate_total), 0) AS reservation_revenue,
    0::numeric AS service_revenue,  -- À implémenter selon les besoins
    COALESCE(SUM(r.rate_total * 0.18), 0) AS tax_amount,  -- TVA par défaut 18%
    COALESCE(SUM(r.rate_total * 0.82), 0) AS net_revenue
  FROM generate_series(v_start_date, v_end_date, '1 day'::interval) gs(date)
  LEFT JOIN reservations r ON r.org_id = v_org_id 
    AND r.date_arrival <= gs.date::date 
    AND r.date_departure > gs.date::date
    AND r.status IN ('confirmed', 'present')
  GROUP BY gs.date::date
  ORDER BY gs.date::date;
END;
$$;