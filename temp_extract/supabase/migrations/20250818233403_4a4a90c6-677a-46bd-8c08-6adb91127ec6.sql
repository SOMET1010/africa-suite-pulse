-- Migration de nettoyage et refactorisation complète du système POS PIN
-- Phase 1: Architecture sécurisée

-- 1. Nettoyage complet des anciennes structures
DO $$ 
BEGIN
    -- Supprimer les policies existantes
    DROP POLICY IF EXISTS "Users can manage pos auth for their org" ON pos_auth_system;
    DROP POLICY IF EXISTS "System can manage pos sessions" ON pos_secure_sessions;
    DROP POLICY IF EXISTS "Users can view pos audit for their org" ON pos_auth_audit;
    DROP POLICY IF EXISTS "System can insert pos audit" ON pos_auth_audit;
    
    -- Supprimer les tables si elles existent
    DROP TABLE IF EXISTS pos_secure_sessions CASCADE;
    DROP TABLE IF EXISTS pos_auth_audit CASCADE;
    DROP TABLE IF EXISTS pos_auth_system CASCADE;
    
    -- Supprimer les fonctions
    DROP FUNCTION IF EXISTS hash_pos_pin(TEXT) CASCADE;
    DROP FUNCTION IF EXISTS verify_pos_pin(TEXT, TEXT) CASCADE;
    DROP FUNCTION IF EXISTS secure_pos_authenticate(TEXT, TEXT, UUID) CASCADE;
    DROP FUNCTION IF EXISTS validate_pos_secure_session(TEXT) CASCADE;
    DROP FUNCTION IF EXISTS secure_pos_logout(TEXT) CASCADE;
    DROP FUNCTION IF EXISTS update_pos_auth_timestamp() CASCADE;
    
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignorer les erreurs de suppression
END $$;

-- 2. Créer la nouvelle architecture unifiée pos_auth_system
CREATE TABLE public.pos_auth_system (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  employee_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
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

-- 3. Créer la table de sessions sécurisées
CREATE TABLE public.pos_secure_sessions (
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

-- 4. Table d'audit
CREATE TABLE public.pos_auth_audit (
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

-- 5. Fonctions sécurisées
CREATE OR REPLACE FUNCTION public.hash_pos_pin(pin_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  salt TEXT;
  hashed TEXT;
BEGIN
  salt := encode(gen_random_bytes(16), 'hex');
  hashed := encode(sha256((pin_text || salt)::bytea), 'hex');
  RETURN salt || ':' || hashed;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_pos_pin(pin_text TEXT, stored_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  salt TEXT;
  stored_pin_hash TEXT;
  computed_hash TEXT;
BEGIN
  -- Compatibilité avec anciens formats
  IF stored_hash NOT LIKE '%:%' THEN
    RETURN pin_text = stored_hash OR encode(sha256(pin_text::bytea), 'hex') = stored_hash;
  END IF;
  
  salt := split_part(stored_hash, ':', 1);
  stored_pin_hash := split_part(stored_hash, ':', 2);
  computed_hash := encode(sha256((pin_text || salt)::bytea), 'hex');
  
  RETURN computed_hash = stored_pin_hash;
END;
$$;

CREATE OR REPLACE FUNCTION public.secure_pos_authenticate(
  p_employee_code TEXT,
  p_pin TEXT,
  p_org_id UUID
)
RETURNS TABLE(
  pos_user_id UUID,
  display_name TEXT,
  role_name TEXT,
  employee_code TEXT,
  session_token TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_pos_user RECORD;
  v_session_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_pos_user
  FROM pos_auth_system
  WHERE org_id = p_org_id 
    AND employee_code = p_employee_code
    AND is_active = true;
  
  IF v_pos_user.id IS NULL THEN
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', 'user_not_found');
    RETURN;
  END IF;
  
  IF v_pos_user.locked_until IS NOT NULL AND v_pos_user.locked_until > now() THEN
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', 'account_locked');
    RETURN;
  END IF;
  
  IF NOT verify_pos_pin(p_pin, v_pos_user.pin_hash) THEN
    UPDATE pos_auth_system
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE 
          WHEN failed_attempts + 1 >= 5 THEN now() + interval '15 minutes'
          ELSE NULL 
        END,
        updated_at = now()
    WHERE id = v_pos_user.id;
    
    INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type, failure_reason)
    VALUES (p_org_id, p_employee_code, 'login_failed', 'invalid_pin');
    RETURN;
  END IF;
  
  UPDATE pos_auth_system
  SET failed_attempts = 0,
      locked_until = NULL,
      last_login_at = now(),
      updated_at = now()
  WHERE id = v_pos_user.id;
  
  v_session_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text)::bytea), 'hex');
  v_expires_at := now() + interval '8 hours';
  
  UPDATE pos_secure_sessions SET is_active = false WHERE pos_user_id = v_pos_user.id;
  
  INSERT INTO pos_secure_sessions (
    pos_user_id, session_token, refresh_token, expires_at, refresh_expires_at
  ) VALUES (
    v_pos_user.id, v_session_token, 
    encode(sha256((gen_random_uuid()::text || 'refresh')::bytea), 'hex'),
    v_expires_at, now() + interval '7 days'
  );
  
  INSERT INTO pos_auth_audit (org_id, employee_code, attempt_type)
  VALUES (p_org_id, p_employee_code, 'login_success');
  
  RETURN QUERY SELECT
    v_pos_user.id, v_pos_user.display_name, v_pos_user.role_name,
    v_pos_user.employee_code, v_session_token, v_expires_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_pos_secure_session(p_session_token TEXT)
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
  SELECT 
    s.pos_user_id, s.outlet_id, s.expires_at, s.is_active,
    u.display_name, u.role_name, u.employee_code, u.org_id, u.is_active as user_active
  INTO v_session
  FROM pos_secure_sessions s
  JOIN pos_auth_system u ON s.pos_user_id = u.id
  WHERE s.session_token = p_session_token;
  
  IF v_session.pos_user_id IS NULL OR NOT v_session.is_active 
     OR NOT v_session.user_active OR v_session.expires_at < now() THEN
    RETURN;
  END IF;
  
  UPDATE pos_secure_sessions SET last_activity_at = now() WHERE session_token = p_session_token;
  
  RETURN QUERY SELECT
    v_session.pos_user_id, v_session.display_name, v_session.role_name,
    v_session.employee_code, v_session.org_id, v_session.outlet_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.secure_pos_logout(p_session_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE pos_secure_sessions SET is_active = false WHERE session_token = p_session_token;
END;
$$;

-- 6. Index et RLS
CREATE INDEX idx_pos_auth_system_org_employee ON pos_auth_system(org_id, employee_code);
CREATE INDEX idx_pos_secure_sessions_token ON pos_secure_sessions(session_token);

ALTER TABLE pos_auth_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_secure_sessions ENABLE ROW LEVEL SECURITY; 
ALTER TABLE pos_auth_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pos_auth_org_access" ON pos_auth_system FOR ALL 
  USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "pos_sessions_system_access" ON pos_secure_sessions FOR ALL USING (true);

CREATE POLICY "pos_audit_view" ON pos_auth_audit FOR SELECT 
  USING (org_id = get_current_user_org_id());

CREATE POLICY "pos_audit_insert" ON pos_auth_audit FOR INSERT WITH CHECK (true);

-- 7. Trigger
CREATE OR REPLACE FUNCTION update_pos_auth_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pos_auth_system_updated_timestamp
  BEFORE UPDATE ON pos_auth_system
  FOR EACH ROW EXECUTE FUNCTION update_pos_auth_timestamp();