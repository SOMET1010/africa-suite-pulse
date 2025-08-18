-- Temporairement désactiver le trigger pour permettre les modifications de rôles
ALTER TABLE user_roles DISABLE TRIGGER ALL;

-- Supprimer l'ancien rôle et ajouter les nouveaux
DELETE FROM user_roles WHERE user_id = '0c9f3463-d30b-4f0b-8c77-63e4636ec034';

INSERT INTO user_roles (
  user_id,
  org_id,
  role
) VALUES 
  ('0c9f3463-d30b-4f0b-8c77-63e4636ec034', '7e389008-3dd1-4f54-816d-4f1daff1f435', 'receptionist'::app_role),
  ('0c9f3463-d30b-4f0b-8c77-63e4636ec034', '7e389008-3dd1-4f54-816d-4f1daff1f435', 'pos_server'::app_role);

-- Réactiver le trigger
ALTER TABLE user_roles ENABLE TRIGGER ALL;