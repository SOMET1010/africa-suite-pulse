-- Phase 1: Extension du moteur fiscal ISCA - Journal temps réel immutable (Correction)

-- Table principale des événements fiscaux avec chaînage cryptographique
CREATE TABLE public.pos_fiscal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  sequence_number BIGINT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('SALE_LINE', 'PAYMENT', 'DISCOUNT', 'REFUND', 'VOID', 'X_CLOSURE', 'Z_CLOSURE', 'CORRECTION')),
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Référence à l'objet concerné (commande, article, etc.)
  reference_type TEXT NOT NULL CHECK (reference_type IN ('order', 'order_item', 'payment', 'session', 'closure')),
  reference_id UUID NOT NULL,
  
  -- Données de l'événement (JSON canonique pour signature)
  event_data JSONB NOT NULL,
  
  -- Chaînage cryptographique SHA-256
  previous_hash TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  
  -- Signature JWS de l'événement
  digital_signature TEXT NOT NULL,
  signature_algorithm TEXT NOT NULL DEFAULT 'ES256',
  
  -- Métadonnées fiscales
  fiscal_period DATE NOT NULL DEFAULT CURRENT_DATE,
  cashier_id UUID,
  pos_station_id TEXT,
  
  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Contraintes d'intégrité
  UNIQUE(org_id, sequence_number)
);

-- Table des clôtures Z quotidiennes avec signature PKI
CREATE TABLE public.pos_daily_closures_z (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  closure_date DATE NOT NULL,
  pos_station_id TEXT NOT NULL,
  cashier_id UUID NOT NULL,
  
  -- Données de clôture
  closure_data JSONB NOT NULL,
  
  -- Totalisations de contrôle
  total_sales_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_transactions_count INTEGER NOT NULL DEFAULT 0,
  
  -- Hash de la chaîne des événements de la journée
  daily_chain_hash TEXT NOT NULL,
  
  -- Signature PKI de la clôture (scellement)
  closure_signature TEXT NOT NULL,
  signature_certificate TEXT NOT NULL,
  signature_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Métadonnées NTP
  ntp_server TEXT,
  ntp_timestamp TIMESTAMPTZ,
  
  -- Status de conformité
  is_sealed BOOLEAN NOT NULL DEFAULT false,
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'validated', 'error')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Contraintes d'unicité
  UNIQUE(org_id, closure_date, pos_station_id)
);

-- Table des signatures cryptographiques et certificats
CREATE TABLE public.pos_fiscal_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  certificate_type TEXT NOT NULL CHECK (certificate_type IN ('daily_signing', 'archive_sealing', 'event_signing')),
  
  -- Certificat X.509
  certificate_pem TEXT NOT NULL,
  private_key_id TEXT NOT NULL, -- Référence sécurisée vers la clé privée (HSM/vault)
  
  -- Métadonnées du certificat
  subject_dn TEXT NOT NULL,
  issuer_dn TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  
  -- Algorithmes supportés
  signature_algorithms TEXT[] NOT NULL DEFAULT ARRAY['ES256', 'RS256'],
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  revocation_reason TEXT,
  revoked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- Index pour les performances et la conformité
CREATE INDEX idx_pos_fiscal_events_org_sequence ON public.pos_fiscal_events(org_id, sequence_number);
CREATE INDEX idx_pos_fiscal_events_period ON public.pos_fiscal_events(org_id, fiscal_period);
CREATE INDEX idx_pos_fiscal_events_type ON public.pos_fiscal_events(event_type, event_timestamp);
CREATE INDEX idx_pos_fiscal_events_reference ON public.pos_fiscal_events(reference_type, reference_id);

CREATE INDEX idx_pos_daily_closures_z_org_date ON public.pos_daily_closures_z(org_id, closure_date);
CREATE INDEX idx_pos_daily_closures_z_station ON public.pos_daily_closures_z(pos_station_id, closure_date);

CREATE INDEX idx_pos_fiscal_certificates_org_type ON public.pos_fiscal_certificates(org_id, certificate_type);
CREATE INDEX idx_pos_fiscal_certificates_validity ON public.pos_fiscal_certificates(valid_from, valid_until);

-- RLS Policies
ALTER TABLE public.pos_fiscal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_daily_closures_z ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_fiscal_certificates ENABLE ROW LEVEL SECURITY;

-- Politique pour les événements fiscaux
CREATE POLICY "Users can manage fiscal events for their org"
ON public.pos_fiscal_events
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Politique pour les clôtures Z
CREATE POLICY "Users can manage daily closures for their org"
ON public.pos_daily_closures_z
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Politique pour les certificats
CREATE POLICY "Users can manage certificates for their org"
ON public.pos_fiscal_certificates
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Fonction pour générer le hash SHA-256 canonique d'un événement
CREATE OR REPLACE FUNCTION public.generate_fiscal_event_hash(
  p_sequence_number BIGINT,
  p_event_type TEXT,
  p_event_timestamp TIMESTAMPTZ,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_event_data JSONB,
  p_previous_hash TEXT
) RETURNS TEXT AS $$
DECLARE
  canonical_string TEXT;
  hash_result TEXT;
BEGIN
  -- Construire la chaîne canonique pour signature
  canonical_string := 
    p_sequence_number::TEXT || '|' ||
    p_event_type || '|' ||
    extract(epoch from p_event_timestamp)::TEXT || '|' ||
    p_reference_type || '|' ||
    p_reference_id::TEXT || '|' ||
    p_event_data::TEXT || '|' ||
    p_previous_hash;
  
  -- Calculer le hash SHA-256
  hash_result := encode(digest(canonical_string, 'sha256'), 'hex');
  
  RETURN hash_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le prochain numéro de séquence
CREATE OR REPLACE FUNCTION public.get_next_fiscal_sequence(p_org_id UUID) 
RETURNS BIGINT AS $$
DECLARE
  next_seq BIGINT;
BEGIN
  SELECT COALESCE(MAX(sequence_number), 0) + 1 
  INTO next_seq
  FROM public.pos_fiscal_events 
  WHERE org_id = p_org_id;
  
  RETURN next_seq;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le dernier hash de la chaîne
CREATE OR REPLACE FUNCTION public.get_last_fiscal_hash(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  last_hash TEXT;
BEGIN
  SELECT event_hash 
  INTO last_hash
  FROM public.pos_fiscal_events 
  WHERE org_id = p_org_id 
  ORDER BY sequence_number DESC 
  LIMIT 1;
  
  RETURN COALESCE(last_hash, '0000000000000000000000000000000000000000000000000000000000000000');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer un événement fiscal avec chaînage automatique
CREATE OR REPLACE FUNCTION public.create_fiscal_event(
  p_org_id UUID,
  p_event_type TEXT,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_event_data JSONB,
  p_cashier_id UUID DEFAULT NULL,
  p_pos_station_id TEXT DEFAULT 'POS-01'
) RETURNS UUID AS $$
DECLARE
  v_sequence_number BIGINT;
  v_previous_hash TEXT;
  v_event_hash TEXT;
  v_digital_signature TEXT;
  v_event_id UUID;
  v_timestamp TIMESTAMPTZ := now();
BEGIN
  -- Obtenir le prochain numéro de séquence
  v_sequence_number := public.get_next_fiscal_sequence(p_org_id);
  
  -- Obtenir le hash précédent
  v_previous_hash := public.get_last_fiscal_hash(p_org_id);
  
  -- Générer le hash de l'événement
  v_event_hash := public.generate_fiscal_event_hash(
    v_sequence_number,
    p_event_type,
    v_timestamp,
    p_reference_type,
    p_reference_id,
    p_event_data,
    v_previous_hash
  );
  
  -- Générer une signature simplifiée (à remplacer par une vraie signature JWS en production)
  v_digital_signature := encode(digest(v_event_hash || p_org_id::TEXT, 'sha256'), 'hex');
  
  -- Insérer l'événement
  INSERT INTO public.pos_fiscal_events (
    org_id,
    sequence_number,
    event_type,
    event_timestamp,
    reference_type,
    reference_id,
    event_data,
    previous_hash,
    event_hash,
    digital_signature,
    cashier_id,
    pos_station_id,
    created_by
  ) VALUES (
    p_org_id,
    v_sequence_number,
    p_event_type,
    v_timestamp,
    p_reference_type,
    p_reference_id,
    p_event_data,
    v_previous_hash,
    v_event_hash,
    v_digital_signature,
    p_cashier_id,
    p_pos_station_id,
    auth.uid()
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;