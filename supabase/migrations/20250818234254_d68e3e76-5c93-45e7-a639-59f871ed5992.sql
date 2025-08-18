-- Correction finale: Créer une fonction hash simplifiée et des données de test
-- En utilisant uniquement des fonctions disponibles dans Supabase

-- 1. Créer une fonction hash simple et sécurisée
CREATE OR REPLACE FUNCTION public.hash_pos_pin_simple(pin_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  salt TEXT;
  hashed TEXT;
BEGIN
  -- Générer un salt simple à partir d'un UUID
  salt := replace(gen_random_uuid()::text, '-', '');
  
  -- Créer un hash sécurisé
  hashed := encode(sha256((pin_text || salt)::bytea), 'hex');
  
  -- Retourner salt:hash
  RETURN salt || ':' || hashed;
END;
$$;

-- 2. Corriger la fonction verify_pos_pin pour utiliser le nouveau format
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

-- 3. Insérer des utilisateurs de test avec des hash simples mais sécurisés
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
  -- Gestionnaire de test
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(),
    'MGR001',
    'Manager POS',
    hash_pos_pin_simple('1234'),
    'pos_manager',
    true,
    '{"department": "management", "shift": "all"}'
  ),
  -- Caissier de test  
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(), 
    'CASH01',
    'Marie Caissière',
    hash_pos_pin_simple('5678'),
    'pos_cashier',
    true,
    '{"department": "cashier", "shift": "morning"}'
  ),
  -- Serveur de test
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(),
    'SRV001', 
    'Pierre Serveur',
    hash_pos_pin_simple('9999'),
    'pos_server',
    true,
    '{"department": "service", "shift": "evening"}'
  ),
  -- Hôtesse de test
  (
    'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
    gen_random_uuid(),
    'HOST01',
    'Sophie Hôtesse', 
    hash_pos_pin_simple('1111'),
    'pos_hostess',
    true,
    '{"department": "front_desk", "shift": "day"}'
  );

-- 4. Créer des rôles POS dans user_roles
INSERT INTO public.user_roles (user_id, org_id, role)
SELECT 
  pas.user_id,
  pas.org_id,
  pas.role_name::app_role
FROM public.pos_auth_system pas
WHERE pas.org_id = 'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = pas.user_id 
      AND ur.org_id = pas.org_id 
      AND ur.role::text = pas.role_name
  );

-- 5. Corriger la fonction principale hash_pos_pin pour utiliser la version simple
CREATE OR REPLACE FUNCTION public.hash_pos_pin(pin_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN hash_pos_pin_simple(pin_text);
END;
$$;