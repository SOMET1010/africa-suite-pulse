-- Phase 3A Compléments - Correction des conflits de fonctions

-- Supprimer les fonctions existantes qui créent des conflits
DROP FUNCTION IF EXISTS public.get_operational_metrics(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_services_with_family(uuid);

-- Créer la fonction get_services_with_family corrigée
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
    sf.label AS service_family_label
  FROM services s
  LEFT JOIN service_families sf ON s.service_family_id = sf.id
  WHERE s.org_id = v_org_id
    AND (p_service_id IS NULL OR s.id = p_service_id);
END;
$$;