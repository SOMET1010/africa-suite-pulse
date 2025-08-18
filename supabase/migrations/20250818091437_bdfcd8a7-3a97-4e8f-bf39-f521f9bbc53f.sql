-- Phase 2: Correction des données - Créer les rôles POS manquants

-- 1. Insérer les rôles manquants pour les utilisateurs POS
INSERT INTO user_roles (user_id, org_id, role)
SELECT 
  pu.user_id,
  pu.org_id,
  'pos_server'::app_role
FROM pos_users pu
WHERE pu.org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
  AND pu.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = pu.user_id 
    AND ur.org_id = pu.org_id
  )
ON CONFLICT (user_id, org_id, role) DO NOTHING;

-- 2. Vérifier et corriger les hash PIN si nécessaire
-- Le PIN "1234" devrait avoir le hash: 81dc9bdb52d04dc20036dbd8313ed055
-- Si d'autres utilisateurs existent avec des PIN différents, les ajouter ici

-- 3. Créer une fonction utilitaire pour tester l'authentification
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
    SELECT * INTO v_auth_result
    FROM authenticate_pos_user(p_pin, p_org_id);
    
    RETURN QUERY SELECT 
      'Authentication successful'::text,
      true,
      true,
      true,
      'User: ' || v_user_record.display_name || ', Session: ' || v_auth_result.session_token;
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