-- Correction: Simplifier l'insertion des données de test
-- Insérer des utilisateurs de test sans ON CONFLICT pour éviter les erreurs

-- 1. D'abord vérifier et supprimer les doublons potentiels
DELETE FROM public.pos_auth_system 
WHERE employee_code IN ('MGR001', 'CASH01', 'SRV001', 'HOST01')
  AND org_id = 'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f';

-- 2. Insérer des utilisateurs POS de test
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
  );

-- 3. Créer des rôles POS dans user_roles pour les nouveaux utilisateurs
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