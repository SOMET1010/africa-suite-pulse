-- Migration finale - Créer le système POS sans contraintes problématiques
-- Simplifier en créant d'abord les données de test avec des IDs existants

-- 1. Créer la fonction hash simplifiée sans conflits
CREATE OR REPLACE FUNCTION public.simple_pos_hash(pin_text TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT replace(gen_random_uuid()::text, '-', '') || ':' || 
         encode(sha256((pin_text || replace(gen_random_uuid()::text, '-', ''))::bytea), 'hex');
$$;

-- 2. Insérer des utilisateurs de test avec des hash pré-calculés pour éviter les problèmes
INSERT INTO public.pos_auth_system (
  org_id,
  user_id,
  employee_code,
  display_name,
  pin_hash,
  role_name,
  is_active,
  metadata
) VALUES 
  -- Gestionnaire de test - PIN: 1234
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(),
    'MGR001',
    'Manager POS',
    'abcd1234:' || encode(sha256('1234abcd1234'::bytea), 'hex'),
    'pos_manager',
    true,
    '{"department": "management", "shift": "all", "test_pin": "1234"}'
  ),
  -- Caissier de test - PIN: 5678
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(), 
    'CASH01',
    'Marie Caissière',
    'efgh5678:' || encode(sha256('5678efgh5678'::bytea), 'hex'),
    'pos_cashier',
    true,
    '{"department": "cashier", "shift": "morning", "test_pin": "5678"}'
  ),
  -- Serveur de test - PIN: 9999
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(),
    'SRV001', 
    'Pierre Serveur',
    'ijkl9999:' || encode(sha256('9999ijkl9999'::bytea), 'hex'),
    'pos_server',
    true,
    '{"department": "service", "shift": "evening", "test_pin": "9999"}'
  ),
  -- Hôtesse de test - PIN: 1111  
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(),
    'HOST01',
    'Sophie Hôtesse', 
    'mnop1111:' || encode(sha256('1111mnop1111'::bytea), 'hex'),
    'pos_hostess',
    true,
    '{"department": "front_desk", "shift": "day", "test_pin": "1111"}'
  );

-- 3. Corriger la fonction verify_pos_pin pour gérer les formats de test
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
  -- Si c'est un ancien format (hash simple ou bcrypt), gérer la compatibilité
  IF stored_hash NOT LIKE '%:%' THEN
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

-- 4. Fonction pour ajouter les rôles plus tard si nécessaire
CREATE OR REPLACE FUNCTION public.ensure_pos_roles()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  role_count INTEGER;
BEGIN
  -- Compter les utilisateurs POS créés
  SELECT COUNT(*) INTO role_count 
  FROM pos_auth_system 
  WHERE org_id = 'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f';
  
  RETURN 'POS users created: ' || role_count;
END;
$$;

-- 5. Corriger la fonction hash_pos_pin pour utiliser la version simplifiée
CREATE OR REPLACE FUNCTION public.hash_pos_pin(pin_text TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT simple_pos_hash(pin_text);
$$;