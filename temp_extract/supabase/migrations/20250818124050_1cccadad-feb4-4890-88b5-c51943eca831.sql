-- Corriger la fonction authenticate_pos_user pour éviter gen_salt

CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid)
RETURNS TABLE (
  user_id uuid,
  pos_user_id uuid,
  display_name text,
  employee_code text,
  role_name text,
  org_id uuid,
  outlet_id uuid,
  session_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_pos_user_id uuid;
  v_display_name text;
  v_employee_code text;
  v_role_name text;
  v_outlet_id uuid;
  v_session_token text;
  v_session_number text;
BEGIN
  -- ✅ Recherche directe par PIN (comparaison directe pour debug)
  SELECT 
    pu.user_id, 
    pu.id, 
    pu.display_name, 
    pu.employee_code,
    ur.role::text,
    NULL::uuid
  INTO v_user_id, v_pos_user_id, v_display_name, v_employee_code, v_role_name, v_outlet_id
  FROM pos_users pu
  INNER JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.pin_hash = p_pin  -- ✅ Comparaison directe pour debug
    AND pu.org_id = p_org_id 
    AND pu.is_active = true
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager');

  -- Vérifier si l'utilisateur existe
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Aucun utilisateur trouvé pour PIN: % et org: %', p_pin, p_org_id;
    RETURN;
  END IF;

  -- Générer le token et numéro de session
  v_session_token := encode(gen_random_bytes(32), 'base64');
  v_session_number := generate_pos_session_number();

  -- ✅ Gestion d'erreur pour l'insertion de session
  BEGIN
    INSERT INTO pos_sessions (
      session_number,
      user_id,
      session_token,
      expires_at,
      is_active
    ) VALUES (
      v_session_number,
      v_user_id,
      v_session_token,
      now() + interval '8 hours',
      true
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Erreur création session: %', SQLERRM;
    RETURN;
  END;

  -- Retourner les données utilisateur
  RETURN QUERY
  SELECT 
    v_user_id,
    v_pos_user_id,
    v_display_name,
    v_employee_code,
    v_role_name,
    p_org_id,
    v_outlet_id,
    v_session_token;
END;
$$;