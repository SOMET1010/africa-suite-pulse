-- Phase 1: Optimisation Backend - Vue SQL combinée et RPC pour KPIs

-- Créer une vue optimisée pour les données du rack
CREATE OR REPLACE VIEW public.rack_data_view AS
SELECT 
  r.id as room_id,
  r.number as room_number,
  r.type as room_type,
  r.floor,
  r.status as room_status,
  r.org_id,
  res.id as reservation_id,
  res.reference as reservation_reference,
  res.status as reservation_status,
  res.date_arrival,
  res.date_departure,
  res.adults,
  res.children,
  res.rate_total,
  g.first_name || ' ' || g.last_name as guest_name
FROM public.rooms r
LEFT JOIN public.reservations res ON r.id = res.room_id 
  AND res.status NOT IN ('cancelled', 'no_show')
LEFT JOIN public.guests g ON res.guest_id = g.id
WHERE r.org_id = get_current_user_org_id()
ORDER BY r.number;

-- Activer RLS sur la vue
ALTER VIEW public.rack_data_view SET (security_invoker = true);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_reservations_date_range_org 
ON public.reservations(org_id, date_arrival, date_departure) 
WHERE status NOT IN ('cancelled', 'no_show');

CREATE INDEX IF NOT EXISTS idx_rooms_org_number 
ON public.rooms(org_id, number);

-- RPC pour calculer les KPIs côté serveur
CREATE OR REPLACE FUNCTION public.calculate_rack_kpis(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_rooms INTEGER;
  v_total_cells INTEGER;
  v_occupied_cells INTEGER;
  v_arrivals INTEGER;
  v_presents INTEGER;
  v_out_of_order INTEGER;
  v_days INTEGER;
  v_occupancy_rate INTEGER;
BEGIN
  -- Calculer le nombre de jours
  v_days := (p_end_date - p_start_date) + 1;
  
  -- Nombre total de chambres
  SELECT COUNT(*) INTO v_total_rooms
  FROM public.rooms 
  WHERE org_id = p_org_id;
  
  -- Cellules totales (chambres × jours)
  v_total_cells := v_total_rooms * v_days;
  
  -- Cellules occupées
  SELECT COUNT(*) INTO v_occupied_cells
  FROM public.rooms r
  CROSS JOIN generate_series(p_start_date, p_end_date, '1 day'::interval) AS day_series(day)
  WHERE r.org_id = p_org_id
  AND EXISTS (
    SELECT 1 FROM public.reservations res 
    WHERE res.room_id = r.id 
    AND res.org_id = p_org_id
    AND res.date_arrival <= day_series.day::date
    AND res.date_departure > day_series.day::date
    AND res.status NOT IN ('cancelled', 'no_show')
  );
  
  -- Arrivées du premier jour
  SELECT COUNT(*) INTO v_arrivals
  FROM public.reservations
  WHERE org_id = p_org_id
  AND date_arrival = p_start_date
  AND status NOT IN ('cancelled', 'no_show');
  
  -- Présents
  SELECT COUNT(*) INTO v_presents
  FROM public.reservations
  WHERE org_id = p_org_id
  AND status = 'present';
  
  -- Chambres hors service
  SELECT COUNT(*) INTO v_out_of_order
  FROM public.rooms
  WHERE org_id = p_org_id
  AND status = 'out_of_order';
  
  -- Taux d'occupation
  v_occupancy_rate := CASE 
    WHEN v_total_cells > 0 THEN ROUND((v_occupied_cells::NUMERIC / v_total_cells) * 100)
    ELSE 0 
  END;
  
  RETURN jsonb_build_object(
    'occ', v_occupancy_rate,
    'arrivals', v_arrivals,
    'presents', v_presents,
    'hs', v_out_of_order,
    'total_rooms', v_total_rooms,
    'occupied_cells', v_occupied_cells,
    'total_cells', v_total_cells
  );
END;
$$;

-- RPC pour récupérer les données rack optimisées
CREATE OR REPLACE FUNCTION public.get_rack_data_optimized(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rooms JSONB;
  v_reservations JSONB;
  v_kpis JSONB;
BEGIN
  -- Récupérer les chambres
  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'number', number,
    'type', type,
    'floor', COALESCE(floor::integer, 0),
    'status', status
  ) ORDER BY number) INTO v_rooms
  FROM public.rooms 
  WHERE org_id = p_org_id;
  
  -- Récupérer les réservations dans la période
  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'room_id', room_id,
    'reference', COALESCE(reference, 'Réservation'),
    'status', CASE WHEN status = 'noshow' THEN 'cancelled' ELSE status END,
    'date_arrival', date_arrival,
    'date_departure', date_departure,
    'adults', COALESCE(adults, 0),
    'children', COALESCE(children, 0),
    'rate_total', COALESCE(rate_total, 0)
  )) INTO v_reservations
  FROM public.reservations
  WHERE org_id = p_org_id
  AND room_id IS NOT NULL
  AND status NOT IN ('cancelled', 'no_show')
  AND (
    (date_arrival <= p_end_date AND date_departure > p_start_date)
  );
  
  -- Calculer les KPIs
  SELECT public.calculate_rack_kpis(p_org_id, p_start_date, p_end_date) INTO v_kpis;
  
  RETURN jsonb_build_object(
    'rooms', COALESCE(v_rooms, '[]'::jsonb),
    'reservations', COALESCE(v_reservations, '[]'::jsonb),
    'kpis', v_kpis,
    'generated_at', now()
  );
END;
$$;