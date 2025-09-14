-- Supprimer et recréer les fonctions avec les bons types de retour

DROP FUNCTION IF EXISTS public.pms_search_free_rooms(UUID, DATE, DATE, UUID[]);
DROP FUNCTION IF EXISTS public.calculate_reservation_rate(UUID, UUID, DATE, DATE, INTEGER);

-- Fonction RPC pour rechercher les chambres libres
CREATE OR REPLACE FUNCTION public.pms_search_free_rooms(
  p_org UUID,
  p_start DATE,
  p_end DATE,
  p_exclude_room_ids UUID[] DEFAULT '{}'
)
RETURNS TABLE(
  id UUID,
  number TEXT,
  type TEXT,
  floor TEXT,
  features JSONB,
  base_rate NUMERIC
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
    r.base_rate
  FROM public.rooms r
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

-- Fonction simplifiée pour calculer les tarifs 
CREATE OR REPLACE FUNCTION public.calculate_reservation_rate(
  p_org_id UUID,
  p_room_id UUID,
  p_arrival_date DATE,
  p_departure_date DATE,
  p_adults INTEGER DEFAULT 2
)
RETURNS TABLE(
  base_rate NUMERIC,
  total_rate NUMERIC,
  nights INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_nights INTEGER;
  v_base_rate NUMERIC := 50000; -- Tarif par défaut
  v_total NUMERIC := 0;
BEGIN
  -- Calculer le nombre de nuits
  v_nights := p_departure_date - p_arrival_date;
  
  IF v_nights <= 0 THEN
    v_nights := 1;
  END IF;
  
  -- Récupérer le tarif de base de la chambre
  SELECT COALESCE(base_rate, 50000) INTO v_base_rate
  FROM public.rooms 
  WHERE id = p_room_id AND org_id = p_org_id;
  
  -- Si pas de chambre trouvée, garder le tarif par défaut
  v_base_rate := COALESCE(v_base_rate, 50000);
  
  -- Calculer le total
  v_total := v_base_rate * v_nights;
  
  RETURN QUERY SELECT 
    v_base_rate as base_rate,
    v_total as total_rate,
    v_nights as nights;
END;
$$;