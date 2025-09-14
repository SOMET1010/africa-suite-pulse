-- Créer d'abord le type réservation avec workflow complet
CREATE TYPE reservation_status AS ENUM (
  'draft',           -- Brouillon (en cours de création)
  'option',          -- Option (en attente de confirmation)
  'pending_payment', -- En attente de paiement/acompte
  'confirmed',       -- Confirmé et payé
  'checked_in',      -- Client présent
  'checked_out',     -- Client parti
  'no_show',         -- No-show
  'cancelled',       -- Annulé
  'modified'         -- Modifié (en attente re-confirmation)
);

-- Fonction pour valider les transitions de statut métier
CREATE OR REPLACE FUNCTION validate_reservation_status_transition(
  p_old_status reservation_status,
  p_new_status reservation_status
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Règles de transition métier strictes
  CASE p_old_status
    WHEN 'draft' THEN
      RETURN p_new_status IN ('option', 'confirmed', 'cancelled');
    WHEN 'option' THEN
      RETURN p_new_status IN ('confirmed', 'pending_payment', 'cancelled', 'modified');
    WHEN 'pending_payment' THEN
      RETURN p_new_status IN ('confirmed', 'cancelled');
    WHEN 'confirmed' THEN
      RETURN p_new_status IN ('checked_in', 'no_show', 'cancelled', 'modified');
    WHEN 'checked_in' THEN
      RETURN p_new_status IN ('checked_out');
    WHEN 'checked_out' THEN
      RETURN FALSE; -- État final
    WHEN 'no_show' THEN
      RETURN p_new_status = 'checked_in'; -- Peut arriver tardivement
    WHEN 'cancelled' THEN
      RETURN FALSE; -- État final  
    WHEN 'modified' THEN
      RETURN p_new_status IN ('confirmed', 'cancelled');
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;

-- Fonction de calcul tarifaire enrichie avec subtilités métier
CREATE OR REPLACE FUNCTION calculate_reservation_rate_enhanced(
  p_org_id UUID,
  p_room_id UUID,
  p_date_arrival DATE,
  p_date_departure DATE,
  p_guest_type TEXT DEFAULT 'individual',
  p_promo_code TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_nights INTEGER;
  v_base_rate NUMERIC := 50000;
  v_weekend_rate NUMERIC := 60000;
  v_total_rate NUMERIC := 0;
  v_breakdown JSONB := '[]'::JSONB;
  v_discounts JSONB := '[]'::JSONB;
  v_taxes JSONB := '[]'::JSONB;
  v_supplements JSONB := '[]'::JSONB;
  v_current_date DATE;
  v_day_rate NUMERIC;
  v_is_weekend BOOLEAN;
  v_promo_discount NUMERIC := 0;
  v_loyalty_discount NUMERIC := 0;
  v_city_tax NUMERIC := 1000; -- 1000 XOF par nuit
BEGIN
  v_nights := p_date_departure - p_date_arrival;
  
  -- Calculer le tarif par nuit avec subtilités métier
  FOR i IN 0..(v_nights - 1) LOOP
    v_current_date := p_date_arrival + i;
    v_is_weekend := EXTRACT(DOW FROM v_current_date) IN (0, 6); -- Dimanche = 0, Samedi = 6
    
    -- Tarif selon jour de semaine
    v_day_rate := CASE WHEN v_is_weekend THEN v_weekend_rate ELSE v_base_rate END;
    
    -- Période haute saison (Décembre-Janvier)
    IF EXTRACT(MONTH FROM v_current_date) IN (12, 1) THEN
      v_day_rate := v_day_rate * 1.2;
    END IF;
    
    v_total_rate := v_total_rate + v_day_rate;
    
    -- Ajouter au breakdown détaillé
    v_breakdown := v_breakdown || jsonb_build_object(
      'date', v_current_date::TEXT,
      'rate', v_day_rate,
      'is_weekend', v_is_weekend,
      'is_high_season', EXTRACT(MONTH FROM v_current_date) IN (12, 1)
    );
  END LOOP;
  
  -- Appliquer remises selon type de client
  IF p_guest_type = 'corporate' THEN
    v_loyalty_discount := v_total_rate * 0.1; -- 10% corporate
    v_discounts := v_discounts || jsonb_build_object(
      'type', 'corporate',
      'percentage', 10,
      'amount', v_loyalty_discount,
      'description', 'Remise entreprise'
    );
  ELSIF p_guest_type = 'group' AND v_nights >= 3 THEN
    v_loyalty_discount := v_total_rate * 0.15; -- 15% groupe long séjour
    v_discounts := v_discounts || jsonb_build_object(
      'type', 'group_long_stay',
      'percentage', 15,
      'amount', v_loyalty_discount,
      'description', 'Remise groupe long séjour'
    );
  ELSIF p_guest_type = 'vip' THEN
    v_loyalty_discount := v_total_rate * 0.05; -- 5% VIP
    v_discounts := v_discounts || jsonb_build_object(
      'type', 'vip',
      'percentage', 5,
      'amount', v_loyalty_discount,
      'description', 'Remise client VIP'
    );
  END IF;
  
  -- Codes promo métier
  IF p_promo_code IS NOT NULL THEN
    CASE p_promo_code
      WHEN 'WELCOME10' THEN
        v_promo_discount := v_total_rate * 0.1;
        v_discounts := v_discounts || jsonb_build_object(
          'type', 'promo_code',
          'code', p_promo_code,
          'percentage', 10,
          'amount', v_promo_discount,
          'description', 'Code promo bienvenue'
        );
      WHEN 'EARLY20' THEN
        v_promo_discount := v_total_rate * 0.2;
        v_discounts := v_discounts || jsonb_build_object(
          'type', 'promo_code',
          'code', p_promo_code,
          'percentage', 20,
          'amount', v_promo_discount,
          'description', 'Réservation anticipée'
        );
      WHEN 'LASTMINUTE15' THEN
        v_promo_discount := v_total_rate * 0.15;
        v_discounts := v_discounts || jsonb_build_object(
          'type', 'promo_code',
          'code', p_promo_code,
          'percentage', 15,
          'amount', v_promo_discount,
          'description', 'Dernière minute'
        );
    END CASE;
  END IF;
  
  -- Suppléments métier standard
  v_supplements := jsonb_build_array(
    jsonb_build_object(
      'type', 'breakfast',
      'name', 'Petit-déjeuner continental',
      'price_per_night', 5000,
      'total_price', 5000 * v_nights,
      'included', false,
      'optional', true
    ),
    jsonb_build_object(
      'type', 'parking',
      'name', 'Parking sécurisé',
      'price_per_night', 2000,
      'total_price', 2000 * v_nights,
      'included', false,
      'optional', true
    ),
    jsonb_build_object(
      'type', 'wifi_premium',
      'name', 'WiFi Premium haut débit',
      'price_per_night', 1000,
      'total_price', 1000 * v_nights,
      'included', false,
      'optional', true
    ),
    jsonb_build_object(
      'type', 'late_checkout',
      'name', 'Départ tardif (jusqu''à 16h)',
      'price_per_night', 10000,
      'total_price', 10000,
      'included', false,
      'optional', true
    )
  );
  
  -- Taxes obligatoires métier
  v_taxes := jsonb_build_array(
    jsonb_build_object(
      'type', 'city_tax',
      'name', 'Taxe de séjour municipale',
      'rate_per_night', v_city_tax,
      'total_amount', v_city_tax * v_nights,
      'mandatory', true
    ),
    jsonb_build_object(
      'type', 'service_tax',
      'name', 'Taxe de service',
      'percentage', 5,
      'total_amount', (v_total_rate - v_loyalty_discount - v_promo_discount) * 0.05,
      'mandatory', true
    )
  );
  
  -- Calcul final
  v_total_rate := v_total_rate - v_loyalty_discount - v_promo_discount;
  
  RETURN jsonb_build_object(
    'base_rate', v_base_rate,
    'total_rate', v_total_rate,
    'nights', v_nights,
    'breakdown', v_breakdown,
    'discounts', v_discounts,
    'taxes', v_taxes,
    'supplements', v_supplements,
    'subtotals', jsonb_build_object(
      'accommodation', v_total_rate,
      'total_discounts', v_loyalty_discount + v_promo_discount,
      'total_taxes', v_city_tax * v_nights + (v_total_rate * 0.05)
    )
  );
END;
$$;