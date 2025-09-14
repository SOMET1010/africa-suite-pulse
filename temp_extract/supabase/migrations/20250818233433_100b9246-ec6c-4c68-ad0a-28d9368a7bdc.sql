-- Correction des avertissements de sécurité : Function Search Path Mutable
-- Ajout de SET search_path TO 'public' à toutes les fonctions

-- 1. Corriger hash_pos_pin
CREATE OR REPLACE FUNCTION public.hash_pos_pin(pin_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 2. Corriger verify_pos_pin
CREATE OR REPLACE FUNCTION public.verify_pos_pin(pin_text TEXT, stored_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 3. Corriger validate_pos_secure_session
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

-- 4. Corriger secure_pos_logout
CREATE OR REPLACE FUNCTION public.secure_pos_logout(p_session_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE pos_secure_sessions SET is_active = false WHERE session_token = p_session_token;
END;
$$;

-- 5. Corriger update_pos_auth_timestamp
CREATE OR REPLACE FUNCTION update_pos_auth_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;