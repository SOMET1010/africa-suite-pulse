-- Phase 2A: Corriger les vues SECURITY DEFINER restantes
-- Identifier et corriger les 2 dernières vues problématiques

-- Rechercher les vues avec SECURITY DEFINER
-- Cette requête nous aidera à identifier les vues problématiques
-- Note: Les erreurs "Security Definer View" concernent probablement des vues système
-- que nous ne pouvons pas modifier directement, mais on peut créer des alternatives

-- Vérifier s'il y a des vues personnalisées avec SECURITY DEFINER
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Chercher les vues dans le schéma public avec SECURITY DEFINER
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        RAISE NOTICE 'Found view: %.%', view_record.schemaname, view_record.viewname;
    END LOOP;
END $$;

-- Créer des vues alternatives sécurisées pour remplacer celles avec SECURITY DEFINER
-- Si les vues problématiques sont guest_stay_history ou arrangements_with_calculated_price

-- 1. Recréer guest_stay_history comme vue SECURITY INVOKER
DROP VIEW IF EXISTS public.guest_stay_history;
CREATE VIEW public.guest_stay_history 
WITH (security_invoker = true) -- Utiliser SECURITY INVOKER au lieu de DEFINER
AS
SELECT 
    g.id as guest_id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    r.id as reservation_id,
    r.reference as reservation_reference,
    r.date_arrival,
    r.date_departure,
    r.nights_count,
    r.adults,
    r.children,
    r.rate_total,
    r.status as reservation_status,
    rm.number as room_number,
    rm.type as room_type,
    i.number as invoice_number,
    i.total_amount as invoice_total
FROM public.guests g
LEFT JOIN public.reservations r ON g.id = r.guest_id
LEFT JOIN public.rooms rm ON r.room_id = rm.id  
LEFT JOIN public.invoices i ON r.id = i.reservation_id
WHERE g.org_id = get_current_user_org_id()
ORDER BY r.date_arrival DESC;

-- 2. Recréer arrangements_with_calculated_price comme vue SECURITY INVOKER
DROP VIEW IF EXISTS public.arrangements_with_calculated_price;
CREATE VIEW public.arrangements_with_calculated_price
WITH (security_invoker = true) -- Utiliser SECURITY INVOKER au lieu de DEFINER
AS
SELECT 
    a.*,
    COALESCE(
        (SELECT SUM(
            CASE 
                WHEN ars.is_included THEN 0 
                ELSE ars.quantity * COALESCE(ars.unit_price, s.unit_price, 0)
            END
        )
        FROM public.arrangement_services ars
        JOIN public.services s ON ars.service_id = s.id
        WHERE ars.arrangement_id = a.id), 
        0
    ) + COALESCE(a.base_price, 0) as calculated_price,
    (SELECT COUNT(*) 
     FROM public.arrangement_services ars 
     WHERE ars.arrangement_id = a.id) as services_count
FROM public.arrangements a
WHERE a.org_id = get_current_user_org_id();

-- 3. Donner les permissions appropriées sur ces vues
GRANT SELECT ON public.guest_stay_history TO authenticated;
GRANT SELECT ON public.arrangements_with_calculated_price TO authenticated;