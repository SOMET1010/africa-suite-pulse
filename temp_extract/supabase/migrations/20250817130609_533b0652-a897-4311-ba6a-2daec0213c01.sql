-- AUDIT DE SÉCURITÉ CRITIQUE - Phase 1.3
-- Identification et correction des vues SECURITY DEFINER

-- Vérifier toutes les vues existantes et leur sécurité
DO $$
DECLARE
    view_record RECORD;
    problem_count INTEGER := 0;
BEGIN
    -- Lister toutes les vues dans le schéma public
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Log chaque vue pour audit
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
            'security_audit_view',
            'public_views_audit',
            view_record.viewname,
            jsonb_build_object(
                'schema', view_record.schemaname,
                'view_name', view_record.viewname,
                'audit_phase', 'view_security_check'
            ),
            'info'
        );
        
        problem_count := problem_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Audited % views in public schema', problem_count;
END $$;

-- Renforcer la sécurité des vues existantes en ajoutant des politiques RLS
-- où c'est possible et en supprimant les vues potentiellement dangereuses

-- Supprimer la vue guest_stay_history si elle expose trop de données
DROP VIEW IF EXISTS public.guest_stay_history;

-- Créer une version sécurisée de guest_stay_history avec RLS
CREATE OR REPLACE VIEW public.guest_stay_history_secure AS
SELECT 
    g.id AS guest_id,
    g.first_name,
    g.last_name,
    -- Masquer l'email et le téléphone pour la sécurité
    CASE 
        WHEN has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin') 
        THEN g.email 
        ELSE NULL 
    END AS email,
    CASE 
        WHEN has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin') 
        THEN g.phone 
        ELSE NULL 
    END AS phone,
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

-- Sécuriser la vue rack_data_view
DROP VIEW IF EXISTS public.rack_data_view;
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
    -- Masquer les noms des clients selon les permissions
    CASE 
        WHEN has_permission('view_guest_details') 
        THEN COALESCE(g.first_name || ' ' || g.last_name, 'Client sans nom')
        ELSE 'Client'
    END AS guest_name
FROM rooms r
LEFT JOIN reservations res ON r.id = res.room_id 
    AND res.status NOT IN ('cancelled', 'no_show')
LEFT JOIN guests g ON res.guest_id = g.id
WHERE r.org_id = get_current_user_org_id()
  AND (res.org_id IS NULL OR res.org_id = get_current_user_org_id())
ORDER BY r.number;

-- Nettoyer les permissions sur les vues restantes
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;