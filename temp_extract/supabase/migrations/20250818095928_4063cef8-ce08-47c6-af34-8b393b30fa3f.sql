-- Correction: Ajouter le rôle pos_server à Marie et créer d'autres utilisateurs POS

-- 1. Ajouter le rôle pos_server à Marie (en plus de receptionist)
INSERT INTO user_roles (user_id, org_id, role)
VALUES (
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  'pos_server'::app_role
)
ON CONFLICT (user_id, org_id, role) DO NOTHING;

-- 2. Créer d'autres utilisateurs POS pour test
INSERT INTO pos_users (org_id, user_id, display_name, pin_hash, is_active)
VALUES 
  -- Utilisateur POS Manager avec PIN 5678
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', 'Paul Manager', md5('5678'), true),
  -- Utilisateur POS Cashier avec PIN 9876  
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', 'Sophie Caisse', md5('9876'), true),
  -- Utilisateur POS Server avec PIN 1111
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', 'Marc Serveur', md5('1111'), true)
ON CONFLICT (org_id, user_id, display_name) DO NOTHING;

-- 3. Ajouter les rôles correspondants
INSERT INTO user_roles (user_id, org_id, role)
VALUES 
  ('0c9f3463-d30b-4f0b-8c77-63e4636ec034', '7e389008-3dd1-4f54-816d-4f1daff1f435', 'pos_manager'::app_role),
  ('0c9f3463-d30b-4f0b-8c77-63e4636ec034', '7e389008-3dd1-4f54-816d-4f1daff1f435', 'pos_cashier'::app_role)
ON CONFLICT (user_id, org_id, role) DO NOTHING;

-- 4. Créer fonction de test pour tous les PINs
CREATE OR REPLACE FUNCTION test_all_pos_pins()
RETURNS TABLE(pin text, result jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  test_pins text[] := ARRAY['1234', '5678', '9876', '1111'];
  test_pin text;
  auth_result RECORD;
BEGIN
  FOREACH test_pin IN ARRAY test_pins
  LOOP
    BEGIN
      SELECT * INTO auth_result
      FROM authenticate_pos_user(test_pin, '7e389008-3dd1-4f54-816d-4f1daff1f435'::uuid)
      LIMIT 1;
      
      RETURN QUERY SELECT 
        test_pin,
        jsonb_build_object(
          'success', true,
          'user_id', auth_result.user_id,
          'display_name', auth_result.display_name,
          'role', auth_result.role_name
        );
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        test_pin,
        jsonb_build_object(
          'success', false,
          'error', SQLERRM
        );
    END;
  END LOOP;
END;
$function$;