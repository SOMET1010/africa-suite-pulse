-- Utiliser l'utilisateur admin existant pour créer un utilisateur POS de test

-- 1. Assigner le rôle POS à l'utilisateur admin existant
INSERT INTO user_roles (
  user_id,
  org_id,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- ID de l'admin du script d'init
  (SELECT org_id FROM hotel_settings LIMIT 1),
  'pos_server'::app_role
) ON CONFLICT DO NOTHING;

-- 2. Créer l'utilisateur POS avec l'ID admin existant
INSERT INTO pos_users (
  org_id,
  user_id,
  pin_hash,
  display_name,
  employee_code,
  is_active
) VALUES (
  (SELECT org_id FROM hotel_settings LIMIT 1),
  '00000000-0000-0000-0000-000000000001',
  '1234', -- PIN en clair pour les tests
  'Marie Serveur (Admin)',
  'ADMIN001',
  true
) ON CONFLICT DO NOTHING;