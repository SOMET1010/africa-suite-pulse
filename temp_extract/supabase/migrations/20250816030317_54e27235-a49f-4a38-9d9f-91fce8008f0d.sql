-- Phase 2: Extensions FNE DGI - Base de données

-- Extension de la table pos_orders pour FNE
ALTER TABLE public.pos_orders 
ADD COLUMN fne_invoice_id TEXT,
ADD COLUMN fne_qr_code TEXT,
ADD COLUMN fne_status TEXT CHECK (fne_status IN ('pending', 'submitted', 'validated', 'rejected', 'error')) DEFAULT 'pending',
ADD COLUMN fne_submitted_at TIMESTAMPTZ,
ADD COLUMN fne_validated_at TIMESTAMPTZ,
ADD COLUMN fne_reference_number TEXT,
ADD COLUMN fne_error_message TEXT;

-- Index pour les requêtes FNE
CREATE INDEX idx_pos_orders_fne_status ON public.pos_orders(fne_status);
CREATE INDEX idx_pos_orders_fne_submitted ON public.pos_orders(fne_submitted_at);

-- Table pour la queue offline des factures FNE
CREATE TABLE public.fne_pending_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  order_id UUID NOT NULL,
  
  -- Payload pour l'API DGI
  invoice_payload JSONB NOT NULL,
  
  -- Gestion des tentatives
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMPTZ,
  
  -- Status et erreurs
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'abandoned')),
  last_error_message TEXT,
  last_error_code TEXT,
  
  -- Horodatage
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  
  -- Métadonnées
  priority INTEGER NOT NULL DEFAULT 1, -- 1=normal, 2=high, 3=urgent
  processing_timeout TIMESTAMPTZ,
  
  UNIQUE(org_id, order_id)
);

-- Index pour la queue offline
CREATE INDEX idx_fne_pending_status ON public.fne_pending_invoices(status, next_retry_at);
CREATE INDEX idx_fne_pending_org_created ON public.fne_pending_invoices(org_id, created_at);
CREATE INDEX idx_fne_pending_priority ON public.fne_pending_invoices(priority DESC, created_at);

-- Table pour les logs API DGI
CREATE TABLE public.fne_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  order_id UUID,
  
  -- Détails de l'appel API
  api_endpoint TEXT NOT NULL,
  http_method TEXT NOT NULL DEFAULT 'POST',
  request_headers JSONB,
  request_payload JSONB,
  
  -- Réponse API
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,
  response_time_ms INTEGER,
  
  -- Identification DGI
  fne_invoice_id TEXT,
  fne_reference_number TEXT,
  
  -- Status et erreurs
  operation_type TEXT NOT NULL, -- 'submit_invoice', 'validate_invoice', 'cancel_invoice'
  success BOOLEAN NOT NULL DEFAULT false,
  error_code TEXT,
  error_message TEXT,
  
  -- Horodatage NTP pour conformité
  api_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ntp_synchronized BOOLEAN DEFAULT false,
  ntp_offset_ms INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les logs API
CREATE INDEX idx_fne_api_logs_org_date ON public.fne_api_logs(org_id, created_at DESC);
CREATE INDEX idx_fne_api_logs_order ON public.fne_api_logs(order_id, created_at DESC);
CREATE INDEX idx_fne_api_logs_success ON public.fne_api_logs(success, created_at DESC);
CREATE INDEX idx_fne_api_logs_operation ON public.fne_api_logs(operation_type, created_at DESC);

-- RLS Policies pour fne_pending_invoices
ALTER TABLE public.fne_pending_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage FNE pending invoices for their org"
ON public.fne_pending_invoices
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies pour fne_api_logs
ALTER TABLE public.fne_api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view FNE API logs for their org"
ON public.fne_api_logs
FOR SELECT
USING (org_id = get_current_user_org_id());

CREATE POLICY "System can insert FNE API logs"
ON public.fne_api_logs
FOR INSERT
WITH CHECK (org_id = get_current_user_org_id());

-- Fonction pour nettoyer les anciens logs (rétention 2 ans)
CREATE OR REPLACE FUNCTION public.cleanup_old_fne_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.fne_api_logs 
  WHERE created_at < now() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer le délai de retry avec backoff exponentiel
CREATE OR REPLACE FUNCTION public.calculate_next_fne_retry(
  p_retry_count INTEGER,
  p_base_delay_minutes INTEGER DEFAULT 5
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  delay_minutes INTEGER;
BEGIN
  -- Backoff exponentiel: 5min, 10min, 20min, 40min, 80min
  delay_minutes := p_base_delay_minutes * POWER(2, LEAST(p_retry_count, 4));
  
  -- Maximum 2 heures de délai
  delay_minutes := LEAST(delay_minutes, 120);
  
  RETURN now() + (delay_minutes || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer une facture comme échec et programmer retry
CREATE OR REPLACE FUNCTION public.schedule_fne_retry(
  p_pending_invoice_id UUID,
  p_error_message TEXT,
  p_error_code TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER;
  v_next_retry TIMESTAMPTZ;
BEGIN
  -- Récupérer les informations actuelles
  SELECT retry_count, max_retries 
  INTO v_retry_count, v_max_retries
  FROM public.fne_pending_invoices 
  WHERE id = p_pending_invoice_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Incrémenter le compteur de retry
  v_retry_count := v_retry_count + 1;
  
  -- Calculer le prochain retry
  v_next_retry := public.calculate_next_fne_retry(v_retry_count);
  
  -- Mettre à jour la facture
  IF v_retry_count >= v_max_retries THEN
    -- Abandonner après trop de tentatives
    UPDATE public.fne_pending_invoices 
    SET 
      status = 'abandoned',
      retry_count = v_retry_count,
      last_error_message = p_error_message,
      last_error_code = p_error_code,
      updated_at = now()
    WHERE id = p_pending_invoice_id;
  ELSE
    -- Programmer un nouveau retry
    UPDATE public.fne_pending_invoices 
    SET 
      status = 'pending',
      retry_count = v_retry_count,
      next_retry_at = v_next_retry,
      last_error_message = p_error_message,
      last_error_code = p_error_code,
      updated_at = now()
    WHERE id = p_pending_invoice_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;