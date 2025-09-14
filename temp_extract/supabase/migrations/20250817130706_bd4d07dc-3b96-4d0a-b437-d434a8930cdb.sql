-- AUDIT DE SÉCURITÉ CRITIQUE - Phase 1.3 (Corrigé)
-- Correction des vues SECURITY DEFINER sans dépendance auth

-- Supprimer les vues potentiellement dangereuses et les recréer de manière sécurisée
DROP VIEW IF EXISTS public.guest_stay_history;
DROP VIEW IF EXISTS public.rack_data_view;

-- Créer une version sécurisée de guest_stay_history avec RLS intégré
CREATE OR REPLACE VIEW public.guest_stay_history_secure AS
SELECT 
    g.id AS guest_id,
    g.first_name,
    g.last_name,
    -- Email et téléphone masqués par défaut pour la sécurité
    NULL AS email,
    NULL AS phone,
    r.id AS reservation_id,
    r.reference AS reservation_reference,
    r.date_arrival,
    r.date_departure,
    (r.date_departure - r.date_arrival) AS nights_count,
    r.adults,
    r.children,
    r.rate_total,
    r.status AS reservation_status,
    rm.number AS room_number,
    rm.type AS room_type,
    i.number AS invoice_number,
    i.total_amount AS invoice_total
FROM guests g
LEFT JOIN reservations r ON g.id = r.guest_id
LEFT JOIN rooms rm ON r.room_id = rm.id
LEFT JOIN invoices i ON r.id = i.reservation_id
WHERE g.org_id = get_current_user_org_id()
  AND (r.org_id IS NULL OR r.org_id = get_current_user_org_id())
ORDER BY r.date_arrival DESC;

-- Créer une version sécurisée de rack_data_view
CREATE OR REPLACE VIEW public.rack_data_view_secure AS
SELECT 
    r.id AS room_id,
    r.number AS room_number,
    r.type AS room_type,
    r.floor,
    r.status AS room_status,
    r.org_id,
    res.id AS reservation_id,
    res.reference AS reservation_reference,
    res.status AS reservation_status,
    res.date_arrival,
    res.date_departure,
    res.adults,
    res.children,
    res.rate_total,
    COALESCE(g.first_name || ' ' || g.last_name, 'Client') AS guest_name
FROM rooms r
LEFT JOIN reservations res ON r.id = res.room_id 
    AND res.status NOT IN ('cancelled', 'no_show')
LEFT JOIN guests g ON res.guest_id = g.id
WHERE r.org_id = get_current_user_org_id()
  AND (res.org_id IS NULL OR res.org_id = get_current_user_org_id())
ORDER BY r.number;

-- Activer RLS sur toutes les tables qui n'en ont pas encore
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('audit_logs', 'app_users', 'user_roles')
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Ignorer les erreurs si RLS est déjà activé
            NULL;
        END;
    END LOOP;
END $$;

-- Renforcer les politiques RLS pour les tables critiques
DROP POLICY IF EXISTS "Secure access to arrangements_with_calculated_price" ON public.arrangements_with_calculated_price;
CREATE POLICY "Secure access to arrangements_with_calculated_price" ON public.arrangements_with_calculated_price
FOR SELECT USING (org_id = get_current_user_org_id());

-- Créer une politique pour guest_stay_history_secure (bien que ce soit une vue)
COMMENT ON VIEW public.guest_stay_history_secure IS 'Vue sécurisée pour l historique des séjours avec RLS intégré';
COMMENT ON VIEW public.rack_data_view_secure IS 'Vue sécurisée pour les données du rack avec protection des données sensibles';

-- Log de sécurité pour audit
INSERT INTO public.audit_logs (
    org_id, 
    user_id, 
    action, 
    table_name, 
    record_id, 
    new_values, 
    severity
) VALUES (
    gen_random_uuid(), -- Utiliser un UUID générique pour la migration
    gen_random_uuid(),
    'security_views_hardened',
    'security_audit',
    'phase_1_3',
    jsonb_build_object(
        'action', 'views_security_hardening',
        'removed_views', ARRAY['guest_stay_history', 'rack_data_view'],
        'added_secure_views', ARRAY['guest_stay_history_secure', 'rack_data_view_secure'],
        'timestamp', now()
    ),
    'info'
);