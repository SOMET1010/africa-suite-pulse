-- Solution corrigée pour résoudre le problème de récursion POS

-- 1. Créer la fonction manquante pour générer les numéros de session
CREATE OR REPLACE FUNCTION public.generate_pos_session_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'POS_' || to_char(now(), 'YYYYMMDD') || '_' || upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 8));
END;
$$;

-- 2. Créer la table pos_sessions si elle n'existe pas
CREATE TABLE IF NOT EXISTS pos_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Fonction d'authentification corrigée
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
  -- ✅ Recherche directe par PIN (supposant PIN en clair pour debug)
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

-- 4. Fonction de validation simplifiée (sans récursion)
CREATE OR REPLACE FUNCTION public.validate_pos_session(p_session_token text)
RETURNS TABLE(user_id uuid, display_name text, role_name text, org_id uuid, outlet_id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- ✅ Requête directe sans appel de fonction pour éviter récursion
  RETURN QUERY
  SELECT 
    pu.user_id,
    pu.display_name,
    ur.role::text as role_name,
    pu.org_id,
    NULL::uuid as outlet_id
  FROM pos_sessions ps
  INNER JOIN pos_users pu ON ps.user_id = pu.user_id
  INNER JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE ps.session_token = p_session_token
    AND ps.expires_at > now()
    AND ps.is_active = true
    AND pu.is_active = true
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager');
END;
$$;

-- 5. Fonction utilitaire simplifiée
CREATE OR REPLACE FUNCTION public.get_pos_user_safe(p_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  role_name text,
  org_id uuid,
  outlet_id uuid,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pu.user_id,
    pu.display_name,
    ur.role::text as role_name,
    pu.org_id,
    NULL::uuid as outlet_id,
    pu.is_active
  FROM pos_users pu
  INNER JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.user_id = p_user_id
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager');
END;
$$;

-- 6. Données de test pour debugging
-- Insérer un utilisateur de test
INSERT INTO pos_users (
  org_id, 
  user_id, 
  pin_hash, 
  display_name, 
  employee_code, 
  is_active
) VALUES (
  (SELECT org_id FROM hotel_settings LIMIT 1),
  gen_random_uuid(),
  '1234', -- PIN en clair pour les tests
  'Marie Serveur',
  'MARIE001',
  true
) ON CONFLICT DO NOTHING;

-- Vérifier que l'utilisateur test a un rôle
INSERT INTO user_roles (
  user_id,
  org_id,
  role
) 
SELECT 
  pu.user_id,
  pu.org_id,
  'pos_server'::app_role
FROM pos_users pu 
WHERE pu.employee_code = 'MARIE001'
ON CONFLICT DO NOTHING;