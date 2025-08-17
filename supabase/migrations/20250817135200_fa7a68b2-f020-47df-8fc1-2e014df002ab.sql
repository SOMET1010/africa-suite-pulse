-- Phase 3A: Élimination des vues SECURITY DEFINER critiques - CORRECTION
-- Suppression complète et recréation des fonctions sécurisées

-- 1. D'abord supprimer toutes les fonctions existantes qui peuvent avoir des conflits
DROP FUNCTION IF EXISTS public.get_guest_stay_history_secure(uuid);
DROP FUNCTION IF EXISTS public.get_reservations_with_details_secure(uuid);
DROP FUNCTION IF EXISTS public.get_housekeeping_tasks_with_staff(uuid);
DROP FUNCTION IF EXISTS public.get_rack_reservations_enriched(date, date);
DROP FUNCTION IF EXISTS public.get_room_status_summary(text);
DROP FUNCTION IF EXISTS public.get_services_with_family(uuid);
DROP FUNCTION IF EXISTS public.get_daily_revenue(date, date);
DROP FUNCTION IF EXISTS public.get_reservations_arrivals(date);

-- 2. Supprimer les vues existantes
DROP VIEW IF EXISTS public.guest_stay_history_secure CASCADE;
DROP VIEW IF EXISTS public.reservations_view_arrivals CASCADE;
DROP VIEW IF EXISTS public.reservations_with_details CASCADE;
DROP VIEW IF EXISTS public.housekeeping_tasks_with_staff CASCADE;
DROP VIEW IF EXISTS public.rack_reservations_enriched CASCADE;
DROP VIEW IF EXISTS public.room_status_summary CASCADE;
DROP VIEW IF EXISTS public.services_with_family CASCADE;
DROP VIEW IF EXISTS public.v_daily_revenue CASCADE;

-- 3. Maintenant créer les fonctions sécurisées

-- Fonction de sécurité pour l'historique des clients
CREATE OR REPLACE FUNCTION public.get_guest_stay_history_secure(p_guest_id uuid DEFAULT NULL)
RETURNS TABLE(
  guest_id uuid,
  reservation_id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  room_number text,
  room_type text,
  date_arrival date,
  date_departure date,
  nights_count integer,
  adults integer,
  children integer,
  rate_total numeric,
  invoice_total numeric,
  invoice_number text,
  reservation_reference text,
  reservation_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Validation d'accès
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
$$;

-- Fonction sécurisée pour les arrivées
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
$$;

-- Fonction sécurisée pour les détails de réservation
CREATE OR REPLACE FUNCTION public.get_reservations_with_details_secure(p_reservation_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  guest_id uuid,
  room_id uuid,
  status text,
  date_arrival date,
  date_departure date,
  guest_name text,
  guest_email text,
  guest_phone text,
  room_number text,
  room_type text,
  rate_total numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Fonction sécurisée pour les tâches de ménage avec personnel
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
  notes text,
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
$$;

-- Fonction sécurisée pour les réservations enrichies du rack
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
$$;

-- 4. Garder les vues simples qui ne posent pas de problème de sécurité
-- mais les recréer sans SECURITY DEFINER

-- Vue pour les arrangements avec prix calculé (pas de problème de sécurité)
CREATE OR REPLACE VIEW public.arrangements_with_calculated_price AS
SELECT 
  a.id,
  a.org_id,
  a.code,
  a.label,
  a.description,
  a.base_price,
  a.is_active,
  a.valid_from,
  a.valid_until,
  a.min_nights,
  a.max_nights,
  a.created_at,
  a.updated_at,
  (COALESCE((
    SELECT SUM(
      CASE WHEN ars.is_included THEN 0 
           ELSE (ars.quantity * COALESCE(ars.unit_price, 0))
      END
    ) 
    FROM arrangement_services ars 
    WHERE ars.arrangement_id = a.id
  ), 0) + COALESCE(a.base_price, 0)) AS calculated_price,
  (SELECT COUNT(*) FROM arrangement_services ars WHERE ars.arrangement_id = a.id) AS services_count
FROM arrangements a;