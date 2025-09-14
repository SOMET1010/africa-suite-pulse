-- CORRECTIONS FINALES DE SÉCURITÉ - Phase 4 (Corrigée)

-- 1. Correction de la dernière fonction SECURITY DEFINER vulnérable
CREATE OR REPLACE FUNCTION public.calculate_reservation_rate_enhanced(p_room_type text, p_date_arrival date, p_date_departure date, p_guest_type text DEFAULT 'individual'::text, p_arrangement_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(base_rate numeric, total_rate numeric, breakdown jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
  v_base_rate numeric := 0;
  v_total_rate numeric := 0;
  v_breakdown jsonb := '[]'::jsonb;
  v_nights integer;
  v_arrangement_price numeric := 0;
  v_service_total numeric := 0;
BEGIN
  -- Validation stricte de l'accès utilisateur
  v_org_id := get_current_user_org_id();
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  -- Validation des paramètres d'entrée
  IF p_room_type IS NULL OR p_date_arrival IS NULL OR p_date_departure IS NULL THEN
    RAISE EXCEPTION 'Invalid input parameters';
  END IF;

  v_nights := (p_date_departure - p_date_arrival);
  IF v_nights <= 0 THEN
    RAISE EXCEPTION 'Invalid date range: departure must be after arrival';
  END IF;

  -- Récupération sécurisée du tarif de base
  SELECT COALESCE(rt.base_rate, 50000) INTO v_base_rate
  FROM room_types rt 
  WHERE rt.org_id = v_org_id AND rt.code = p_room_type;

  v_total_rate := v_base_rate * v_nights;

  -- Traitement sécurisé de l'arrangement
  IF p_arrangement_id IS NOT NULL THEN
    SELECT COALESCE(a.base_price, 0) INTO v_arrangement_price
    FROM arrangements a 
    WHERE a.id = p_arrangement_id AND a.org_id = v_org_id AND a.is_active = true;
    
    SELECT COALESCE(SUM(asrv.quantity * COALESCE(asrv.unit_price, s.unit_price, 0)), 0) INTO v_service_total
    FROM arrangement_services asrv
    JOIN services s ON asrv.service_id = s.id
    WHERE asrv.arrangement_id = p_arrangement_id AND asrv.is_included = true;
    
    v_total_rate := v_total_rate + v_arrangement_price + v_service_total;
  END IF;

  v_breakdown := jsonb_build_array(
    jsonb_build_object('type', 'base_rate', 'amount', v_base_rate, 'nights', v_nights),
    jsonb_build_object('type', 'arrangement', 'amount', v_arrangement_price),
    jsonb_build_object('type', 'services', 'amount', v_service_total)
  );

  RETURN QUERY SELECT v_base_rate, v_total_rate, v_breakdown;
END;
$function$;

-- 2. Sécurisation définitive de la table rate_limits
DROP POLICY IF EXISTS "Rate limits are managed by system" ON rate_limits;
DROP POLICY IF EXISTS "Public rate limit access" ON rate_limits;
DROP POLICY IF EXISTS "Anyone can read rate limits" ON rate_limits;

-- Nouvelle politique ultra-sécurisée pour rate_limits
CREATE POLICY "Super admins only can manage rate limits" 
ON rate_limits FOR ALL 
TO authenticated 
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Politique système pour les fonctions internes
CREATE POLICY "System functions can manage rate limits" 
ON rate_limits FOR ALL 
TO authenticated 
USING (
  -- Seules les fonctions système peuvent accéder sans restriction
  current_setting('role', true) = 'service_role' OR
  -- Ou utilisateurs avec rôle super_admin
  has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  current_setting('role', true) = 'service_role' OR
  has_role(auth.uid(), 'super_admin')
);

-- 3. Fonction de validation finale de sécurité
CREATE OR REPLACE FUNCTION public.validate_final_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  security_status jsonb;
  definer_functions_count INTEGER;
  vulnerable_policies_count INTEGER;
BEGIN
  -- Comptage des fonctions SECURITY DEFINER sans search_path
  SELECT COUNT(*) INTO definer_functions_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND prosecdef = true
    AND NOT EXISTS (
      SELECT 1 FROM pg_proc_config(p.oid) 
      WHERE unnest LIKE 'search_path=%'
    );

  -- Comptage des politiques potentiellement vulnérables
  SELECT COUNT(*) INTO vulnerable_policies_count
  FROM pg_policies 
  WHERE schemaname = 'public'
    AND (
      qual ILIKE '%true%' OR
      with_check ILIKE '%true%' OR
      (tablename = 'rate_limits' AND policyname NOT LIKE '%super_admin%')
    );

  security_status := jsonb_build_object(
    'status', CASE 
      WHEN definer_functions_count = 0 AND vulnerable_policies_count = 0 THEN 'SECURE'
      ELSE 'VULNERABLE'
    END,
    'definer_functions_without_search_path', definer_functions_count,
    'vulnerable_policies', vulnerable_policies_count,
    'last_check', now(),
    'manual_actions_required', jsonb_build_array(
      'Set OTP expiry to 300 seconds in Supabase Dashboard > Authentication > Settings',
      'Verify all deployment environments use same security settings'
    )
  );

  RETURN security_status;
END;
$function$;