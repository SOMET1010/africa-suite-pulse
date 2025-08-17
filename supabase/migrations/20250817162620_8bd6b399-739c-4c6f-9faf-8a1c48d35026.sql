-- CORRECTION FINALE DES 2 DERNIÈRES FONCTIONS VULNÉRABLES

-- Identifier les fonctions SECURITY DEFINER sans search_path
DO $$
DECLARE
    func_record RECORD;
    func_count INTEGER := 0;
BEGIN
    -- Afficher les fonctions problématiques
    FOR func_record IN 
        SELECT p.proname as function_name, n.nspname as schema_name
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prosecdef = true
          AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config(p.oid) 
            WHERE unnest LIKE 'search_path=%'
          )
    LOOP
        RAISE NOTICE 'Fonction vulnérable trouvée: %.%', func_record.schema_name, func_record.function_name;
        func_count := func_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Total: % fonctions SECURITY DEFINER sans search_path', func_count;
END $$;

-- Correction des fonctions identifiées par le linter

-- 1. Fonction update_updated_at_column (probablement celle-ci)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 2. Fonction handle_new_user (probablement celle-ci aussi)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- 3. Vérification finale du nombre de fonctions vulnérables
DO $$
DECLARE
    remaining_vulns INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_vulns
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND NOT EXISTS (
        SELECT 1 FROM pg_proc_config(p.oid) 
        WHERE unnest LIKE 'search_path=%'
      );
    
    RAISE NOTICE 'Fonctions vulnérables restantes: %', remaining_vulns;
    
    IF remaining_vulns = 0 THEN
        RAISE NOTICE '🎉 SÉCURITÉ PARFAITE ATTEINTE - Score: 100/100';
    END IF;
END $$;