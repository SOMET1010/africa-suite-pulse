-- Correction: Remplacer gen_random_bytes par gen_random_uuid pour la compatibilité
-- Recréer les fonctions avec une génération de salt compatible

-- 1. Corriger la fonction hash_pos_pin
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
  -- Générer un salt à partir d'un UUID (compatible partout)
  salt := encode(sha256(gen_random_uuid()::text::bytea), 'hex');
  
  -- Créer un hash sécurisé (simulation bcrypt avec SHA256 + salt)
  hashed := encode(sha256((pin_text || salt)::bytea), 'hex');
  
  -- Retourner salt + hash
  RETURN salt || ':' || hashed;
END;
$$;

-- 2. Insérer des utilisateurs POS de test avec la fonction corrigée
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
    hash_pos_pin('1234'),
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
    hash_pos_pin('5678'),
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
    hash_pos_pin('9999'),
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
    hash_pos_pin('1111'),
    'pos_hostess',
    true,
    '{"department": "front_desk", "shift": "day"}'
  )
ON CONFLICT (org_id, employee_code) DO NOTHING;

-- 3. Créer des rôles POS dans user_roles pour les nouveaux utilisateurs
INSERT INTO public.user_roles (user_id, org_id, role)
SELECT 
  pas.user_id,
  pas.org_id,
  pas.role_name::app_role
FROM public.pos_auth_system pas
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = pas.user_id 
    AND ur.org_id = pas.org_id 
    AND ur.role::text = pas.role_name
)
ON CONFLICT (user_id, org_id, role) DO NOTHING;

-- 4. Fonction utilitaire pour créer facilement des utilisateurs POS
CREATE OR REPLACE FUNCTION public.create_pos_user_secure(
  p_org_id UUID,
  p_employee_code TEXT,
  p_display_name TEXT,
  p_pin TEXT,
  p_role_name TEXT DEFAULT 'pos_server'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_pos_user_id UUID;
BEGIN
  -- Valider le rôle
  IF p_role_name NOT IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager') THEN
    RAISE EXCEPTION 'Rôle invalide: %', p_role_name;
  END IF;
  
  -- Générer un user_id unique
  v_user_id := gen_random_uuid();
  
  -- Créer l'utilisateur POS
  INSERT INTO pos_auth_system (
    org_id, user_id, employee_code, display_name, pin_hash, role_name
  ) VALUES (
    p_org_id, v_user_id, p_employee_code, p_display_name, 
    hash_pos_pin(p_pin), p_role_name
  ) RETURNING id INTO v_pos_user_id;
  
  -- Créer le rôle utilisateur
  INSERT INTO user_roles (user_id, org_id, role)
  VALUES (v_user_id, p_org_id, p_role_name::app_role)
  ON CONFLICT (user_id, org_id, role) DO NOTHING;
  
  RETURN v_pos_user_id;
END;
$$;

-- 5. Fonction pour mettre à jour un PIN de manière sécurisée
CREATE OR REPLACE FUNCTION public.update_pos_pin_secure(
  p_pos_user_id UUID,
  p_new_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE pos_auth_system 
  SET pin_hash = hash_pos_pin(p_new_pin),
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = now()
  WHERE id = p_pos_user_id
    AND org_id = get_current_user_org_id();
  
  RETURN FOUND;
END;
$$;