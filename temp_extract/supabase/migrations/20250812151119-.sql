-- PHASE 1: Correction des vues critiques (suppression SECURITY DEFINER et ajout RLS)

-- 1. Supprimer et recréer les vues sans SECURITY DEFINER
DROP VIEW IF EXISTS public.arrangements_with_calculated_price;
DROP VIEW IF EXISTS public.reservations_with_details;
DROP VIEW IF EXISTS public.guest_stay_history;
DROP VIEW IF EXISTS public.rack_reservations_enriched;
DROP VIEW IF EXISTS public.reservations_view_arrivals;

-- 2. Recréer les vues avec RLS (sans SECURITY DEFINER)
CREATE VIEW public.arrangements_with_calculated_price AS
SELECT 
  a.*,
  COALESCE(a.base_price, 0) + COALESCE(SUM(
    CASE 
      WHEN ars.is_included = false THEN ars.unit_price * ars.quantity
      ELSE 0
    END
  ), 0) as calculated_price,
  COUNT(ars.id) as services_count
FROM arrangements a
LEFT JOIN arrangement_services ars ON a.id = ars.arrangement_id
GROUP BY a.id, a.code, a.label, a.description, a.org_id, a.base_price, a.is_active, 
         a.valid_from, a.valid_until, a.min_nights, a.max_nights, a.created_at, a.updated_at;

-- Activer RLS sur la vue
ALTER VIEW public.arrangements_with_calculated_price SET (security_invoker = on);

CREATE VIEW public.reservations_with_details AS
SELECT 
  r.*,
  COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom') as guest_name,
  g.email as guest_email,
  g.phone as guest_phone,
  rm.number as room_number,
  rm.type as room_type,
  t.label as tariff_label,
  t.base_rate as tariff_base_rate,
  cp.label as cancellation_policy_label,
  a.partner_name as allotment_partner,
  p.label as promotion_label,
  p.discount_type,
  p.discount_value,
  rg.group_name,
  rg.group_leader_name
FROM reservations r
LEFT JOIN guests g ON r.guest_id = g.id
LEFT JOIN rooms rm ON r.room_id = rm.id
LEFT JOIN tariffs t ON r.tariff_id = t.id
LEFT JOIN cancellation_policies cp ON r.cancellation_policy_id = cp.id
LEFT JOIN allotments a ON r.allotment_id = a.id
LEFT JOIN promotions p ON r.promotion_code = p.code
LEFT JOIN reservation_groups rg ON r.group_id = rg.id;

-- Activer RLS sur la vue
ALTER VIEW public.reservations_with_details SET (security_invoker = on);

CREATE VIEW public.guest_stay_history AS
SELECT 
  r.id as reservation_id,
  r.guest_id,
  g.first_name,
  g.last_name,
  g.email,
  g.phone,
  r.reference as reservation_reference,
  r.date_arrival,
  r.date_departure,
  r.date_departure - r.date_arrival as nights_count,
  r.adults,
  r.children,
  r.rate_total,
  r.status as reservation_status,
  rm.number as room_number,
  rm.type as room_type,
  inv.number as invoice_number,
  inv.total_amount as invoice_total
FROM reservations r
LEFT JOIN guests g ON r.guest_id = g.id
LEFT JOIN rooms rm ON r.room_id = rm.id
LEFT JOIN invoices inv ON r.id = inv.reservation_id;

-- Activer RLS sur la vue
ALTER VIEW public.guest_stay_history SET (security_invoker = on);

CREATE VIEW public.rack_reservations_enriched AS
SELECT 
  r.id,
  r.org_id,
  r.date_arrival,
  r.date_departure,
  r.room_id,
  r.adults,
  r.children,
  r.rate_total,
  r.reference,
  r.status,
  rm.number as room_number,
  rm.type as room_type_code,
  rm.floor as room_floor
FROM reservations r
LEFT JOIN rooms rm ON r.room_id = rm.id;

-- Activer RLS sur la vue
ALTER VIEW public.rack_reservations_enriched SET (security_invoker = on);

CREATE VIEW public.reservations_view_arrivals AS
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
  COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom') as guest_name,
  rm.number as room_number
FROM reservations r
LEFT JOIN guests g ON r.guest_id = g.id
LEFT JOIN rooms rm ON r.room_id = rm.id
WHERE r.date_arrival = CURRENT_DATE;

-- Activer RLS sur la vue
ALTER VIEW public.reservations_view_arrivals SET (security_invoker = on);

-- PHASE 2: Sécuriser la table invoices avec RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour invoices
CREATE POLICY "Users can manage invoices for their org" 
ON public.invoices 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can view invoices for their org" 
ON public.invoices 
FOR SELECT 
USING (org_id = get_current_user_org_id());

-- PHASE 3: Sécuriser les fonctions existantes avec search_path
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT org_id 
  FROM public.app_users 
  WHERE user_id = auth.uid() 
  AND active = true
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_profile_id uuid;
  v_role public.app_role;
BEGIN
  IF public.has_role(auth.uid(), 'super_admin') THEN
    RETURN true;
  END IF;

  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_role = 'manager' THEN
    RETURN true;
  END IF;

  SELECT profile_id INTO v_profile_id
  FROM public.app_users
  WHERE user_id = auth.uid()
    AND active = true
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profile_permissions pp
    WHERE pp.profile_id = v_profile_id
      AND pp.permission_key = p_permission
      AND pp.allowed = true
  );
END;
$function$;

-- PHASE 4: Durcir la sécurité des données sensibles
-- Créer une fonction pour masquer les données sensibles des logs d'audit
CREATE OR REPLACE FUNCTION public.audit_row_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_action text;
  v_org_id uuid;
  v_record_id uuid;
  v_old_values jsonb;
  v_new_values jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    
    -- Masquer les données sensibles pour certaines tables
    v_new_values := to_jsonb(NEW);
    IF TG_TABLE_NAME = 'guests' THEN
      v_new_values := v_new_values - 'document_number' - 'tax_id';
    END IF;
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, NULL, v_new_values);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    
    -- Masquer les données sensibles
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    IF TG_TABLE_NAME = 'guests' THEN
      v_old_values := v_old_values - 'document_number' - 'tax_id';
      v_new_values := v_new_values - 'document_number' - 'tax_id';
    END IF;
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, v_old_values, v_new_values);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_org_id := COALESCE(OLD.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(OLD)->>'id')::uuid;
    
    -- Masquer les données sensibles
    v_old_values := to_jsonb(OLD);
    IF TG_TABLE_NAME = 'guests' THEN
      v_old_values := v_old_values - 'document_number' - 'tax_id';
    END IF;
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, v_old_values, NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;