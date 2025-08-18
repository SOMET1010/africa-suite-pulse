-- Correction: Insérer les rôles manquants sans ON CONFLICT
-- et créer la fonction de test

-- 1. Insérer le rôle pos_server pour Marie si pas déjà présent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = '00000000-0000-0000-0000-000000000001'
    AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
    AND role = 'pos_server'
  ) THEN
    INSERT INTO user_roles (user_id, org_id, role)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      '7e389008-3dd1-4f54-816d-4f1daff1f435',
      'pos_server'::app_role
    );
  END IF;
END $$;

-- 2. Créer une fonction de test pour l'authentification POS
CREATE OR REPLACE FUNCTION test_pos_authentication(p_pin text, p_org_id uuid DEFAULT '7e389008-3dd1-4f54-816d-4f1daff1f435'::uuid)
RETURNS TABLE(
  test_result text,
  user_found boolean,
  role_assigned boolean,
  auth_successful boolean,
  error_details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_record RECORD;
  v_has_role boolean;
  v_auth_result RECORD;
BEGIN
  -- Test 1: Vérifier si l'utilisateur existe
  SELECT pu.user_id, pu.display_name
  INTO v_user_record
  FROM pos_users pu
  WHERE pu.org_id = p_org_id
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true;
  
  IF v_user_record.user_id IS NULL THEN
    RETURN QUERY SELECT 
      'User not found'::text,
      false,
      false,
      false,
      'No POS user found with PIN: ' || p_pin;
    RETURN;
  END IF;
  
  -- Test 2: Vérifier si le rôle est assigné
  v_has_role := public.check_user_role_safe(v_user_record.user_id, 'pos_server');
  
  IF NOT v_has_role THEN
    RETURN QUERY SELECT 
      'Role not assigned'::text,
      true,
      false,
      false,
      'User found but no pos_server role assigned';
    RETURN;
  END IF;
  
  -- Test 3: Tester l'authentification complète
  BEGIN
    SELECT session_token, user_id, display_name, role_name, org_id, outlet_id
    INTO v_auth_result
    FROM authenticate_pos_user(p_pin, p_org_id)
    LIMIT 1;
    
    RETURN QUERY SELECT 
      'Authentication successful'::text,
      true,
      true,
      true,
      'User: ' || v_user_record.display_name || ', Session created successfully';
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'Authentication failed'::text,
      true,
      true,
      false,
      'Error: ' || SQLERRM;
  END;
END;
$function$;