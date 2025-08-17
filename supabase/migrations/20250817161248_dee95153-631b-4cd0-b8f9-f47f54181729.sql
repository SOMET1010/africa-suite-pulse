-- PHASE 2: CORRECTION OTP - Problème d'expiration trop longue
-- Le linter indique que l'expiration OTP dépasse le seuil recommandé
-- Nous devons corriger cela au niveau de l'organisation

-- Création d'une fonction pour ajuster les paramètres OTP
CREATE OR REPLACE FUNCTION public.fix_otp_expiry_settings()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Note: L'expiration OTP se configure principalement via l'interface Supabase
  -- Cette fonction sert de documentation des bonnes pratiques
  
  -- L'utilisateur doit configurer dans Supabase Dashboard > Authentication > Settings:
  -- - OTP expiry: 300 secondes (5 minutes) maximum
  -- - Token expiry: 3600 secondes (1 heure) recommandé
  
  -- Log de la configuration recommandée
  INSERT INTO audit_logs (
    org_id,
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    severity
  ) VALUES (
    (SELECT org_id FROM app_users WHERE user_id = auth.uid() LIMIT 1),
    auth.uid(),
    'otp_configuration_check',
    'auth_settings',
    gen_random_uuid()::text,
    jsonb_build_object(
      'recommended_otp_expiry', '300 seconds',
      'recommended_token_expiry', '3600 seconds',
      'requires_manual_config', true,
      'dashboard_path', 'Authentication > Settings'
    ),
    'warning'
  );
END;
$function$;

-- Exécuter la fonction de documentation
SELECT fix_otp_expiry_settings();

-- Créer une fonction de validation des paramètres de sécurité
CREATE OR REPLACE FUNCTION public.validate_auth_security_settings()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  result := jsonb_build_object(
    'status', 'requires_manual_configuration',
    'critical_actions', jsonb_build_array(
      'Set OTP expiry to 300 seconds maximum in Supabase Dashboard',
      'Configure appropriate redirect URLs',
      'Enable email confirmation if needed',
      'Review authentication providers settings'
    ),
    'dashboard_url', 'https://supabase.com/dashboard/project/' || current_setting('app.settings.project_id', true) || '/auth/providers',
    'documentation', 'https://supabase.com/docs/guides/platform/going-into-prod#security'
  );
  
  RETURN result;
END;
$function$;