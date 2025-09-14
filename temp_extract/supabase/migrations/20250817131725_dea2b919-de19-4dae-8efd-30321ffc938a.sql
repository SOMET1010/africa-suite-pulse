-- AUDIT DE SÉCURITÉ CRITIQUE - Phase 2.5
-- Correction de la fonction pms_search_free_rooms pour base_rate

-- Corriger la fonction qui cause l'erreur 'column r.base_rate does not exist'
CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(
  p_org uuid, 
  p_start date, 
  p_end date, 
  p_exclude_room_ids uuid[] DEFAULT '{}'::uuid[]
)
RETURNS TABLE(
  id uuid, 
  number text, 
  type text, 
  floor text, 
  features jsonb, 
  base_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.number,
    r.type,
    r.floor,
    r.features,
    COALESCE(rt.base_rate, 50000::numeric) as base_rate -- Récupérer le tarif depuis room_types ou défaut
  FROM public.rooms r
  LEFT JOIN public.room_types rt ON rt.code = r.type AND rt.org_id = r.org_id
  WHERE r.org_id = p_org
    AND r.is_active = true
    AND r.status = 'clean'
    AND r.id != ALL(p_exclude_room_ids)
    AND NOT EXISTS (
      -- Vérifier qu'il n'y a pas de réservation qui chevauche
      SELECT 1 
      FROM public.reservations res
      WHERE res.room_id = r.id
        AND res.status IN ('confirmed', 'present', 'option')
        AND res.date_arrival < p_end
        AND res.date_departure > p_start
    )
  ORDER BY r.number;
END;
$$;