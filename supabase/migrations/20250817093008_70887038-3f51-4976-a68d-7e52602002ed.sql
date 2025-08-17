-- Créer seulement les fonctions manquantes pour remplacer les données fictives

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

-- Fonction pour calculer les tarifs automatiquement
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
  nights INTEGER,
  breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_nights INTEGER;
  v_room_type TEXT;
  v_base_rate NUMERIC := 50000; -- Tarif par défaut
  v_total NUMERIC := 0;
  v_breakdown JSONB := '[]';
  v_current_date DATE;
  v_rate_window RECORD;
BEGIN
  -- Calculer le nombre de nuits
  v_nights := p_departure_date - p_arrival_date;
  
  IF v_nights <= 0 THEN
    v_nights := 1;
  END IF;
  
  -- Récupérer le type de chambre
  SELECT type INTO v_room_type
  FROM public.rooms 
  WHERE id = p_room_id AND org_id = p_org_id;
  
  -- Pour chaque nuit, trouver le tarif applicable
  FOR i IN 0..(v_nights-1) LOOP
    v_current_date := p_arrival_date + i;
    
    -- Chercher une fenêtre tarifaire applicable si elle existe
    SELECT * INTO v_rate_window
    FROM public.rate_windows rw
    WHERE rw.org_id = p_org_id
      AND rw.is_active = true
      AND v_current_date BETWEEN rw.valid_from AND rw.valid_until
      AND (rw.room_type_id IS NULL OR rw.room_type_id = v_room_type)
    ORDER BY rw.priority DESC, rw.base_rate DESC
    LIMIT 1;
    
    IF FOUND THEN
      v_base_rate := v_rate_window.base_rate;
      
      -- Ajuster pour occupant simple ou supplémentaire
      IF p_adults = 1 AND v_rate_window.single_rate IS NOT NULL THEN
        v_base_rate := v_rate_window.single_rate;
      ELSIF p_adults > 2 AND v_rate_window.extra_person_rate IS NOT NULL THEN
        v_base_rate := v_base_rate + ((p_adults - 2) * v_rate_window.extra_person_rate);
      END IF;
    ELSE
      -- Utiliser le tarif de base de la chambre si disponible
      SELECT COALESCE(base_rate, 50000) INTO v_base_rate
      FROM public.rooms 
      WHERE id = p_room_id AND org_id = p_org_id;
      
      -- Si pas de chambre trouvée, garder le tarif par défaut
      v_base_rate := COALESCE(v_base_rate, 50000);
    END IF;
    
    v_total := v_total + v_base_rate;
    
    -- Ajouter au détail
    v_breakdown := v_breakdown || jsonb_build_object(
      'date', v_current_date,
      'rate', v_base_rate,
      'rate_window', CASE WHEN FOUND THEN v_rate_window.name ELSE 'Tarif de base' END
    );
  END LOOP;
  
  RETURN QUERY SELECT 
    (v_total / v_nights)::NUMERIC as base_rate,
    v_total as total_rate,
    v_nights as nights,
    v_breakdown as breakdown;
END;
$$;