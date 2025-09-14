-- Solution corrigée avec création d'utilisateur complet

-- 1. Créer un utilisateur auth complet d'abord
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'marie.serveur@pos.test',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  '{"full_name": "Marie Serveur"}',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 2. Créer l'entrée app_users
INSERT INTO app_users (
  user_id,
  org_id,
  email,
  full_name,
  login,
  active
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT org_id FROM hotel_settings LIMIT 1),
  'marie.serveur@pos.test',
  'Marie Serveur',
  'marie.serveur',
  true
) ON CONFLICT DO NOTHING;

-- 3. Assigner le rôle POS
INSERT INTO user_roles (
  user_id,
  org_id,
  role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT org_id FROM hotel_settings LIMIT 1),
  'pos_server'::app_role
) ON CONFLICT DO NOTHING;

-- 4. Créer l'utilisateur POS avec l'ID utilisateur existant
INSERT INTO pos_users (
  org_id,
  user_id,
  pin_hash,
  display_name,
  employee_code,
  is_active
) VALUES (
  (SELECT org_id FROM hotel_settings LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  '1234', -- PIN en clair pour les tests
  'Marie Serveur',
  'MARIE001',
  true
) ON CONFLICT DO NOTHING;