-- AUDIT DE SÉCURITÉ CRITIQUE - Phase 1.2
-- Identifier et corriger les vues SECURITY DEFINER

-- Vérifier s'il y a des vues avec SECURITY DEFINER
DO $$
DECLARE
    view_record RECORD;
    view_count INTEGER := 0;
BEGIN
    FOR view_record IN 
        SELECT schemaname, viewname, definition 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND (definition ILIKE '%SECURITY DEFINER%' OR definition ILIKE '%security definer%')
    LOOP
        view_count := view_count + 1;
        RAISE NOTICE 'Found SECURITY DEFINER view: %.%', view_record.schemaname, view_record.viewname;
        
        -- Log le problème dans audit_logs
        INSERT INTO public.audit_logs (
            org_id, 
            user_id, 
            action, 
            table_name, 
            record_id, 
            new_values, 
            severity
        ) VALUES (
            (SELECT org_id FROM public.app_users WHERE user_id = auth.uid() LIMIT 1),
            auth.uid(),
            'security_audit',
            'security_definer_views',
            view_record.viewname,
            jsonb_build_object(
                'schema', view_record.schemaname,
                'view_name', view_record.viewname,
                'issue', 'SECURITY DEFINER view detected',
                'risk', 'bypasses RLS policies'
            ),
            'error'
        );
    END LOOP;
    
    IF view_count = 0 THEN
        RAISE NOTICE 'No SECURITY DEFINER views found in public schema';
    ELSE
        RAISE NOTICE 'Found % SECURITY DEFINER views that need attention', view_count;
    END IF;
END $$;

-- Ajouter des politiques RLS manquantes pour les tables publiques critiques
-- Corriger la table rate_limits qui est publiquement accessible
DROP POLICY IF EXISTS "Users can view rate limits for their org" ON public.rate_limits;
CREATE POLICY "Users can view rate limits for their org" ON public.rate_limits
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.app_users au 
        WHERE au.user_id = auth.uid() 
        AND au.active = true
        AND has_role(auth.uid(), 'super_admin')
    )
);

-- Restreindre l'accès aux tables de pricing sensibles
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can view subscription plans" ON public.subscription_plans;
CREATE POLICY "Only authenticated users can view subscription plans" ON public.subscription_plans
FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can view modules" ON public.modules;
CREATE POLICY "Only authenticated users can view modules" ON public.modules
FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE public.module_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only authenticated users can view module packages" ON public.module_packages;
CREATE POLICY "Only authenticated users can view module packages" ON public.module_packages
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Sécuriser la fonction get_current_user_org_id si elle n'existe pas
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID 
LANGUAGE SQL 
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT org_id 
  FROM public.app_users 
  WHERE user_id = auth.uid() 
  AND active = true 
  LIMIT 1;
$$;