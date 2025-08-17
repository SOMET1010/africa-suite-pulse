-- Phase 3A Compléments - Ajouter les fonctions manquantes

-- Créer la fonction manquante get_services_with_family
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
  service_family_label text,
  family_id uuid,
  family_code text,
  family_label text,
  family_color text,
  family_icon text,
  price numeric,
  vat_rate numeric,
  is_free_price boolean,
  cost_price numeric,
  profit_margin numeric,
  min_quantity numeric,
  max_quantity numeric,
  tags jsonb
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
    s.id,
    s.org_id,
    s.code,
    s.label,
    s.description,
    s.unit_price,
    s.unit,
    s.category,
    s.service_family_id,
    s.is_active,
    s.tax_rate,
    s.created_at,
    s.updated_at,
    sf.code AS service_family_code,
    sf.label AS service_family_label,
    -- Alias supplémentaires pour compatibilité
    s.service_family_id AS family_id,
    sf.code AS family_code,
    sf.label AS family_label,
    sf.color AS family_color,
    sf.icon AS family_icon,
    s.unit_price AS price,
    s.tax_rate AS vat_rate,
    COALESCE(s.is_free_price, false) AS is_free_price,
    s.cost_price,
    s.profit_margin,
    s.min_quantity,
    s.max_quantity,
    s.tags
  FROM services s
  LEFT JOIN service_families sf ON s.service_family_id = sf.id
  WHERE s.org_id = v_org_id
    AND (p_service_id IS NULL OR s.id = p_service_id);
END;
$$;

-- Ajouter la dernière vue manquante arrangements_with_calculated_price avec RLS
-- (Cette vue existe déjà mais on s'assure qu'elle a les bonnes politiques RLS)

-- Créer des politiques RLS pour la vue arrangements_with_calculated_price
DROP POLICY IF EXISTS "Users can view arrangements with calculated price for their org" ON public.arrangements_with_calculated_price;

-- Les vues ne peuvent pas avoir de politiques RLS directement, 
-- elles héritent des politiques des tables sous-jacentes

-- Vérifier que les autres fonctions manquantes existent ou les créer

-- Fonction pour get_operational_metrics (utilisée dans analytics)
CREATE OR REPLACE FUNCTION public.get_operational_metrics(
  p_org_id uuid DEFAULT NULL,
  p_from_date date DEFAULT NULL,
  p_to_date date DEFAULT NULL
)
RETURNS TABLE(
  metric_name text,
  current_value numeric,
  previous_value numeric,
  percentage_change numeric,
  trend text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
  v_from_date date;
  v_to_date date;
BEGIN
  -- Utiliser l'org de l'utilisateur si non spécifié
  v_org_id := COALESCE(p_org_id, get_current_user_org_id());
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Access denied: No organization found';
  END IF;

  -- Dates par défaut (30 derniers jours)
  v_to_date := COALESCE(p_to_date, CURRENT_DATE);
  v_from_date := COALESCE(p_from_date, v_to_date - INTERVAL '30 days');

  RETURN QUERY
  SELECT 
    'occupancy_rate'::text AS metric_name,
    COALESCE(
      (SELECT COUNT(*) * 100.0 / NULLIF(
        (SELECT COUNT(*) FROM rooms WHERE org_id = v_org_id), 0
      )
      FROM reservations r 
      WHERE r.org_id = v_org_id 
        AND r.status IN ('confirmed', 'present')
        AND r.date_arrival <= CURRENT_DATE 
        AND r.date_departure > CURRENT_DATE), 0
    ) AS current_value,
    50.0 AS previous_value, -- Valeur fictive pour l'exemple
    COALESCE(
      ((SELECT COUNT(*) * 100.0 / NULLIF(
        (SELECT COUNT(*) FROM rooms WHERE org_id = v_org_id), 0
      )
      FROM reservations r 
      WHERE r.org_id = v_org_id 
        AND r.status IN ('confirmed', 'present')
        AND r.date_arrival <= CURRENT_DATE 
        AND r.date_departure > CURRENT_DATE) - 50.0) / NULLIF(50.0, 0) * 100, 0
    ) AS percentage_change,
    CASE 
      WHEN (SELECT COUNT(*) FROM reservations r 
            WHERE r.org_id = v_org_id 
              AND r.status IN ('confirmed', 'present')
              AND r.date_arrival <= CURRENT_DATE 
              AND r.date_departure > CURRENT_DATE) > 
           (SELECT COUNT(*) FROM rooms WHERE org_id = v_org_id) * 0.5 
      THEN 'up'
      ELSE 'stable'
    END AS trend

  UNION ALL

  SELECT 
    'total_revenue'::text,
    COALESCE((SELECT SUM(rate_total) FROM reservations 
              WHERE org_id = v_org_id 
                AND date_arrival >= v_from_date 
                AND date_arrival <= v_to_date), 0) AS current_value,
    100000.0 AS previous_value, -- Valeur fictive
    10.0 AS percentage_change, -- Valeur fictive
    'up'::text AS trend

  UNION ALL

  SELECT 
    'total_reservations'::text,
    COALESCE((SELECT COUNT(*) FROM reservations 
              WHERE org_id = v_org_id 
                AND date_arrival >= v_from_date 
                AND date_arrival <= v_to_date), 0) AS current_value,
    50.0 AS previous_value, -- Valeur fictive
    5.0 AS percentage_change, -- Valeur fictive
    'up'::text AS trend;
END;
$$;