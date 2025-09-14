-- Améliorer le système de tarification avec subtilités métier
CREATE OR REPLACE FUNCTION calculate_reservation_rate_enhanced(
  p_org_id UUID,
  p_room_id UUID,
  p_date_arrival DATE,
  p_date_departure DATE,
  p_guest_type TEXT DEFAULT 'individual',
  p_promo_code TEXT DEFAULT NULL
) RETURNS TABLE(
  base_rate NUMERIC,
  total_rate NUMERIC,
  nights INTEGER,
  breakdown JSONB,
  discounts JSONB,
  taxes JSONB,
  supplements JSONB
) 
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
  
  -- Calculer le tarif par nuit avec subtilités
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
    
    -- Ajouter au breakdown
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
  END IF;
  
  -- Code promo
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
    END CASE;
  END IF;
  
  -- Suppléments par défaut
  v_supplements := jsonb_build_array(
    jsonb_build_object(
      'type', 'breakfast',
      'name', 'Petit-déjeuner',
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
      'name', 'WiFi Premium',
      'price_per_night', 1000,
      'total_price', 1000 * v_nights,
      'included', false,
      'optional', true
    )
  );
  
  -- Taxes obligatoires
  v_taxes := jsonb_build_array(
    jsonb_build_object(
      'type', 'city_tax',
      'name', 'Taxe de séjour',
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
  
  RETURN QUERY SELECT 
    v_base_rate,
    v_total_rate,
    v_nights,
    v_breakdown,
    v_discounts,
    v_taxes,
    v_supplements;
END;
$$;

-- Améliorer les statuts de réservation avec workflow complet
ALTER TYPE reservation_status RENAME TO reservation_status_old;

CREATE TYPE reservation_status AS ENUM (
  'draft',           -- Brouillon (en cours de création)
  'option',          -- Option (en attente de confirmation)
  'pending_payment', -- En attente de paiement/acompte
  'confirmed',       -- Confirmé et payé
  'checked_in',      -- Client présent (ancien 'present')
  'checked_out',     -- Client parti
  'no_show',         -- No-show (ancien 'noshow')
  'cancelled',       -- Annulé
  'modified'         -- Modifié (en attente re-confirmation)
);

-- Fonction pour gérer les transitions de statut
CREATE OR REPLACE FUNCTION validate_reservation_status_transition(
  p_old_status reservation_status,
  p_new_status reservation_status
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- Règles de transition métier
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

-- Ajouter colonnes métier manquantes aux réservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS guest_type TEXT DEFAULT 'individual' CHECK (guest_type IN ('individual', 'corporate', 'group', 'vip')),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS promo_code TEXT,
ADD COLUMN IF NOT EXISTS special_requirements JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS check_in_time TIME,
ADD COLUMN IF NOT EXISTS check_out_time TIME,
ADD COLUMN IF NOT EXISTS late_checkout_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_show_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS city_tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identity_document_type TEXT,
ADD COLUMN IF NOT EXISTS identity_document_number TEXT,
ADD COLUMN IF NOT EXISTS key_cards_issued INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pre_checkin_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS post_checkout_survey_sent BOOLEAN DEFAULT FALSE;

-- Créer table pour les options temporaires
CREATE TABLE IF NOT EXISTS reservation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_release BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT reservation_options_org_fk FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- RLS pour les options
ALTER TABLE reservation_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage reservation options for their org"
ON reservation_options
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Fonction pour libérer automatiquement les options expirées
CREATE OR REPLACE FUNCTION release_expired_options() RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Marquer les réservations avec options expirées comme annulées
  UPDATE reservations 
  SET status = 'cancelled'::reservation_status,
      notes = COALESCE(notes, '') || ' Option expirée automatiquement.'
  WHERE id IN (
    SELECT ro.reservation_id 
    FROM reservation_options ro
    WHERE ro.expires_at < now() 
    AND ro.auto_release = true
  )
  AND status = 'option'::reservation_status;
  
  -- Supprimer les options expirées
  DELETE FROM reservation_options 
  WHERE expires_at < now() AND auto_release = true;
END;
$$;