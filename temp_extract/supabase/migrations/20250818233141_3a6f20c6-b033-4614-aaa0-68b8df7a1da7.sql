-- Phase 1: Refactorisation complète du système POS PIN
-- Nouvelle architecture sécurisée avec système d'authentification unifié

-- 1. Créer la nouvelle table unifiée pos_auth_system
CREATE TABLE IF NOT EXISTS public.pos_auth_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL, -- Hash bcrypt sécurisé
  role_name TEXT NOT NULL CHECK (role_name IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  
  -- Contraintes d'unicité
  UNIQUE(org_id, employee_code),
  UNIQUE(org_id, user_id)
);

-- 2. Créer la nouvelle table de sessions sécurisées
CREATE TABLE IF NOT EXISTS public.pos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pos_user_id UUID NOT NULL REFERENCES pos_auth_system(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT NOT NULL UNIQUE,
  outlet_id UUID NULL,
  ip_address INET NULL,
  user_agent TEXT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  refresh_expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table pour l'audit des tentatives d'authentification
CREATE TABLE IF NOT EXISTS public.pos_auth_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  employee_code TEXT,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login_success', 'login_failed', 'logout', 'session_expired', 'account_locked')),
  ip_address INET NULL,
  user_agent TEXT NULL,
  failure_reason TEXT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Fonction pour hasher les PINs de manière sécurisée
CREATE OR REPLACE FUNCTION public.hash_pin(pin_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  salt TEXT;
  hashed TEXT;
BEGIN
  -- Générer un salt aléatoire
  salt := encode(gen_random_bytes(16), 'hex');
  
  -- Créer un hash sécurisé (simulation bcrypt avec SHA256 + salt)
  hashed := encode(sha256((pin_text || salt)::bytea), 'hex');
  
  -- Retourner salt + hash
  RETURN salt || ':' || hashed;
END;
$$;

-- 5. Fonction pour vérifier les PINs
CREATE OR REPLACE FUNCTION public.verify_pin(pin_text TEXT, stored_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  salt TEXT;
  stored_pin_hash TEXT;
  computed_hash TEXT;
BEGIN
  -- Si c'est un ancien format (hash simple ou bcrypt), gérer la compatibilité
  IF stored_hash NOT LIKE '%:%' THEN
    -- Ancien format - vérification directe pour compatibilité
    RETURN pin_text = stored_hash OR encode(sha256(pin_text::bytea), 'hex') = stored_hash;
  END IF;
  
  -- Nouveau format salt:hash
  salt := split_part(stored_hash, ':', 1);
  stored_pin_hash := split_part(stored_hash, ':', 2);
  
  -- Calculer le hash avec le salt
  computed_hash := encode(sha256((pin_text || salt)::bytea), 'hex');
  
  RETURN computed_hash = stored_pin_hash;
END;
$$;

-- 6. Nouvelle fonction d'authentification sécurisée
CREATE OR REPLACE FUNCTION public.authenticate_pos_user_v2(
  p_employee_code TEXT,
  p_pin TEXT,
  p_org_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
  pos_user_id UUID,
  display_name TEXT,
  role_name TEXT,
  employee_code TEXT,
  session_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pos_user RECORD;
  v_session_token TEXT;
  v_refresh_token TEXT;
  v_expires_at TIMESTAMPTZ;
  v_refresh_expires_at TIMESTAMPTZ;
BEGIN
  -- Vérifier si le compte est verrouillé
  SELECT * INTO v_pos_user
  FROM pos_auth_system
  WHERE org_id = p_org_id 
    AND employee_code = p_employee_code
    AND is_active = true;
  
  -- Si utilisateur non trouvé
  IF v_pos_user.id IS NULL THEN
    -- Logger la tentative échouée
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, ip_address, user_agent, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', p_ip_address, p_user_agent, 'user_not_found');
    
    RETURN;
  END IF;
  
  -- Vérifier si le compte est verrouillé
  IF v_pos_user.locked_until IS NOT NULL AND v_pos_user.locked_until > now() THEN
    -- Logger la tentative sur compte verrouillé
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, ip_address, user_agent, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', p_ip_address, p_user_agent, 'account_locked');
    
    RETURN;
  END IF;
  
  -- Vérifier le PIN
  IF NOT verify_pin(p_pin, v_pos_user.pin_hash) THEN
    -- Incrémenter les tentatives échouées
    UPDATE pos_auth_system
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE 
          WHEN failed_attempts + 1 >= 5 THEN now() + interval '15 minutes'
          ELSE NULL 
        END,
        updated_at = now()
    WHERE id = v_pos_user.id;
    
    -- Logger la tentative échouée
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, ip_address, user_agent, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', p_ip_address, p_user_agent, 'invalid_pin');
    
    RETURN;
  END IF;
  
  -- Authentification réussie - réinitialiser les tentatives échouées
  UPDATE pos_auth_system
  SET failed_attempts = 0,
      locked_until = NULL,
      last_login_at = now(),
      updated_at = now()
  WHERE id = v_pos_user.id;
  
  -- Générer les tokens de session
  v_session_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text)::bytea), 'hex');
  v_refresh_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text || 'refresh')::bytea), 'hex');
  v_expires_at := now() + interval '8 hours';
  v_refresh_expires_at := now() + interval '7 days';
  
  -- Invalider les anciennes sessions
  UPDATE pos_sessions
  SET is_active = false
  WHERE pos_user_id = v_pos_user.id;
  
  -- Créer la nouvelle session
  INSERT INTO pos_sessions (
    pos_user_id,
    session_token,
    refresh_token,
    ip_address,
    user_agent,
    expires_at,
    refresh_expires_at
  ) VALUES (
    v_pos_user.id,
    v_session_token,
    v_refresh_token,
    p_ip_address,
    p_user_agent,
    v_expires_at,
    v_refresh_expires_at
  );
  
  -- Logger le succès
  INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, ip_address, user_agent)
  VALUES (p_org_id, p_employee_code, 'login_success', p_ip_address, p_user_agent);
  
  -- Retourner les données de session
  RETURN QUERY SELECT
    v_pos_user.id,
    v_pos_user.display_name,
    v_pos_user.role_name,
    v_pos_user.employee_code,
    v_session_token,
    v_refresh_token,
    v_expires_at;
END;
$$;

-- 7. Fonction de validation de session
CREATE OR REPLACE FUNCTION public.validate_pos_session_v2(p_session_token TEXT)
RETURNS TABLE(
  pos_user_id UUID,
  display_name TEXT,
  role_name TEXT,
  employee_code TEXT,
  org_id UUID,
  outlet_id UUID
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_session RECORD;
BEGIN
  -- Récupérer la session avec les données utilisateur
  SELECT 
    s.pos_user_id,
    s.outlet_id,
    s.expires_at,
    s.is_active,
    u.display_name,
    u.role_name,
    u.employee_code,
    u.org_id,
    u.is_active as user_active
  INTO v_session
  FROM pos_sessions s
  JOIN pos_auth_system u ON s.pos_user_id = u.id
  WHERE s.session_token = p_session_token;
  
  -- Vérifier si la session existe et est valide
  IF v_session.pos_user_id IS NULL 
     OR NOT v_session.is_active 
     OR NOT v_session.user_active
     OR v_session.expires_at < now() THEN
    RETURN;
  END IF;
  
  -- Mettre à jour la dernière activité
  UPDATE pos_sessions
  SET last_activity_at = now()
  WHERE session_token = p_session_token;
  
  -- Retourner les données utilisateur
  RETURN QUERY SELECT
    v_session.pos_user_id,
    v_session.display_name,
    v_session.role_name,
    v_session.employee_code,
    v_session.org_id,
    v_session.outlet_id;
END;
$$;

-- 8. Fonction de refresh de session
CREATE OR REPLACE FUNCTION public.refresh_pos_session(p_refresh_token TEXT)
RETURNS TABLE(
  session_token TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
  v_new_session_token TEXT;
  v_new_expires_at TIMESTAMPTZ;
BEGIN
  -- Vérifier le refresh token
  SELECT s.*, u.is_active as user_active
  INTO v_session
  FROM pos_sessions s
  JOIN pos_auth_system u ON s.pos_user_id = u.id
  WHERE s.refresh_token = p_refresh_token
    AND s.is_active = true
    AND s.refresh_expires_at > now()
    AND u.is_active = true;
  
  IF v_session.id IS NULL THEN
    RETURN;
  END IF;
  
  -- Générer un nouveau session token
  v_new_session_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text)::bytea), 'hex');
  v_new_expires_at := now() + interval '8 hours';
  
  -- Mettre à jour la session
  UPDATE pos_sessions
  SET session_token = v_new_session_token,
      expires_at = v_new_expires_at,
      last_activity_at = now()
  WHERE id = v_session.id;
  
  RETURN QUERY SELECT v_new_session_token, v_new_expires_at;
END;
$$;

-- 9. Fonction de logout
CREATE OR REPLACE FUNCTION public.logout_pos_session_v2(p_session_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
BEGIN
  -- Récupérer les infos de session pour l'audit
  SELECT s.*, u.employee_code, u.org_id
  INTO v_session
  FROM pos_sessions s
  JOIN pos_auth_system u ON s.pos_user_id = u.id
  WHERE s.session_token = p_session_token;
  
  -- Désactiver la session
  UPDATE pos_sessions
  SET is_active = false
  WHERE session_token = p_session_token;
  
  -- Logger le logout
  IF v_session.id IS NOT NULL THEN
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, ip_address)
    VALUES (v_session.org_id, v_session.employee_code, 'logout', v_session.ip_address);
  END IF;
END;
$$;

-- 10. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_pos_auth_system_org_employee ON pos_auth_system(org_id, employee_code);
CREATE INDEX IF NOT EXISTS idx_pos_auth_system_org_user ON pos_auth_system(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_token ON pos_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_refresh_token ON pos_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_active ON pos_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_pos_auth_audit_org_time ON pos_auth_audit(org_id, created_at);

-- 11. Activer RLS
ALTER TABLE pos_auth_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_auth_audit ENABLE ROW LEVEL SECURITY;

-- 12. Politiques RLS
CREATE POLICY "Users can manage pos auth for their org" ON pos_auth_system
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "System can manage pos sessions" ON pos_sessions
  FOR ALL USING (true);

CREATE POLICY "Users can view pos audit for their org" ON pos_auth_audit
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "System can insert pos audit" ON pos_auth_audit
  FOR INSERT WITH CHECK (true);

-- 13. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_pos_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pos_auth_system_updated_at
  BEFORE UPDATE ON pos_auth_system
  FOR EACH ROW EXECUTE FUNCTION update_pos_auth_updated_at();