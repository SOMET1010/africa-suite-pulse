-- Créer simplement les autres utilisateurs POS
INSERT INTO pos_users (org_id, user_id, display_name, pin_hash, is_active)
VALUES 
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', 'Paul Manager', md5('5678'), true),
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', 'Sophie Caisse', md5('9876'), true),
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', 'Marc Serveur', md5('1111'), true);