-- Identifier et corriger les vues avec SECURITY DEFINER restantes

-- Lister toutes les vues pour identifier celles avec SECURITY DEFINER
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public';

-- Il semble qu'il y ait peut-être encore une vue avec SECURITY DEFINER
-- Vérifions s'il y a une vue services_with_family que nous avons manquée
DROP VIEW IF EXISTS public.services_with_family CASCADE;

-- Recrééer la vue services_with_family si elle existait (sans SECURITY DEFINER)
CREATE VIEW public.services_with_family AS
SELECT 
  s.*,
  sf.label as family_label,
  sf.code as family_code
FROM services s
LEFT JOIN service_families sf ON s.family_id = sf.id;

-- Activer RLS sur la vue
ALTER VIEW public.services_with_family SET (security_invoker = on);

-- Vérifier s'il reste d'autres vues problématiques
-- et les corriger une par une si nécessaire