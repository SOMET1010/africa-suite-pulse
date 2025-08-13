-- Phase 1A: Sécurisation finale - Corriger les dernières fonctions SECURITY DEFINER

-- 1. Convertir get_current_user_role() en SECURITY INVOKER avec vérification explicite
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ur.role 
  FROM public.user_roles ur
  JOIN public.app_users au ON ur.user_id = au.user_id
  WHERE ur.user_id = auth.uid() 
    AND au.org_id = get_current_user_org_id()
    AND au.active = true
  LIMIT 1;
$function$;

-- 2. Convertir pms_search_free_rooms() en SECURITY INVOKER avec contrôles renforcés
CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(p_org uuid, p_start date, p_end date, p_exclude_room_ids uuid[] DEFAULT ARRAY[]::uuid[])
RETURNS TABLE(id uuid, number text, type text, floor text, status text)
LANGUAGE sql
STABLE SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT rm.id, rm.number, rm.type, rm.floor, rm.status
  FROM public.rooms rm
  WHERE rm.org_id = p_org
    AND rm.org_id = get_current_user_org_id() -- Sécurité: vérifier que l'utilisateur appartient à cette org
    AND rm.status NOT IN ('out_of_order','maintenance')
    AND NOT EXISTS (
      SELECT 1 FROM public.reservations rr
      WHERE rr.org_id = p_org
        AND rr.room_id = rm.id
        AND NOT (rr.date_departure <= p_start OR rr.date_arrival >= p_end)
    )
    AND (p_exclude_room_ids IS NULL OR rm.id <> ALL(p_exclude_room_ids));
$function$;

-- 3. Corriger pms_validate_move() avec contrôles de sécurité renforcés
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
  
  -- Sécurité: Vérifier que la réservation appartient à l'org de l'utilisateur
  SELECT * INTO rec FROM public.reservations WHERE id = p_res AND org_id = current_org;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Reservation not found or access denied'::text;
    RETURN;
  END IF;

  -- Sécurité: Vérifier que la chambre appartient à l'org de l'utilisateur  
  SELECT * INTO rm FROM public.rooms WHERE id = p_room AND org_id = current_org;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Room not found or access denied'::text;
    RETURN;
  END IF;

  -- Vérifications métier (inchangées)
  IF rm.status IN ('out_of_order','maintenance') THEN
    RETURN QUERY SELECT false, 'Room is blocked'::text;
    RETURN;
  END IF;

  -- Conflits de réservation
  SELECT COUNT(*) INTO conflict_count
  FROM public.reservations r
  WHERE r.id <> rec.id
    AND r.org_id = rec.org_id
    AND r.room_id = p_room
    AND NOT (r.date_departure <= rec.date_arrival OR r.date_arrival >= rec.date_departure);

  IF conflict_count > 0 THEN
    RETURN QUERY SELECT false, 'Conflicting reservation(s) in target room'::text;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, NULL::text;
END;
$function$;

-- 4. Améliorer la sécurité d'has_role() avec contrôles org
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.app_users au ON ur.user_id = au.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND au.active = true
      AND au.org_id = get_current_user_org_id()
  );
$function$;

-- 5. Corriger la fonction has_permission avec vérifications org renforcées
CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_profile_id uuid;
  v_role public.app_role;
  v_org_id uuid;
BEGIN
  -- Récupérer l'org de l'utilisateur
  v_org_id := get_current_user_org_id();
  
  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Super admin check avec vérification org
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.app_users au ON ur.user_id = au.user_id
    WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND au.org_id = v_org_id
      AND au.active = true
  ) THEN
    RETURN true;
  END IF;

  -- Manager check avec vérification org
  SELECT ur.role INTO v_role
  FROM public.user_roles ur
  JOIN public.app_users au ON ur.user_id = au.user_id
  WHERE ur.user_id = auth.uid()
    AND au.org_id = v_org_id
    AND au.active = true
  LIMIT 1;

  IF v_role = 'manager' THEN
    RETURN true;
  END IF;

  -- Profile permission check avec vérification org
  SELECT au.profile_id INTO v_profile_id
  FROM public.app_users au
  WHERE au.user_id = auth.uid()
    AND au.org_id = v_org_id
    AND au.active = true
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