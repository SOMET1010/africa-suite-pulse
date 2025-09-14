-- Insert test data for POS system
DO $$
DECLARE
    test_org_id UUID := 'test-org-id-123456789'::UUID;
BEGIN
    -- Insert test outlets
    INSERT INTO public.pos_outlets (id, org_id, code, name, description, outlet_type, is_active) VALUES
    ('01234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, 'REST01', 'Restaurant Principal', 'Restaurant principal de l''hôtel avec service complet', 'restaurant', true),
    ('11234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, 'BAR01', 'Bar Lounge', 'Bar lounge avec vue panoramique', 'bar', true),
    ('21234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, 'SPA01', 'Spa Wellness', 'Centre de bien-être et spa', 'spa', true),
    ('31234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, 'ROOM01', 'Room Service', 'Service en chambre 24h/24', 'room_service', true);

    -- Insert test categories
    INSERT INTO public.pos_categories (id, outlet_id, code, name, description, color, sort_order, is_active) VALUES
    ('c1234567-89ab-cdef-0123-456789abcdef'::UUID, '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'ENTR', 'Entrées', 'Entrées et amuse-bouches', '#10B981', 1, true),
    ('c2234567-89ab-cdef-0123-456789abcdef'::UUID, '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'PLAT', 'Plats Principaux', 'Plats principaux', '#3B82F6', 2, true),
    ('c3234567-89ab-cdef-0123-456789abcdef'::UUID, '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'DESS', 'Desserts', 'Desserts maison', '#F59E0B', 3, true),
    ('c4234567-89ab-cdef-0123-456789abcdef'::UUID, '11234567-89ab-cdef-0123-456789abcdef'::UUID, 'COCK', 'Cocktails', 'Cocktails signature', '#8B5CF6', 1, true),
    ('c5234567-89ab-cdef-0123-456789abcdef'::UUID, '11234567-89ab-cdef-0123-456789abcdef'::UUID, 'WINE', 'Vins', 'Sélection de vins', '#EF4444', 2, true);

    -- Insert test products
    INSERT INTO public.pos_products (id, outlet_id, category_id, code, name, description, base_price, is_active) VALUES
    ('p1234567-89ab-cdef-0123-456789abcdef'::UUID, '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'c1234567-89ab-cdef-0123-456789abcdef'::UUID, 'ENT001', 'Foie gras poêlé', 'Foie gras poêlé aux figues confites', 28.50, true),
    ('p2234567-89ab-cdef-0123-456789abcdef'::UUID, '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'c2234567-89ab-cdef-0123-456789abcdef'::UUID, 'PLAT001', 'Filet de bœuf', 'Filet de bœuf aux morilles', 45.00, true),
    ('p3234567-89ab-cdef-0123-456789abcdef'::UUID, '01234567-89ab-cdef-0123-456789abcdef'::UUID, 'c3234567-89ab-cdef-0123-456789abcdef'::UUID, 'DESS001', 'Soufflé au chocolat', 'Soufflé au chocolat noir 70%', 12.50, true),
    ('p4234567-89ab-cdef-0123-456789abcdef'::UUID, '11234567-89ab-cdef-0123-456789abcdef'::UUID, 'c4234567-89ab-cdef-0123-456789abcdef'::UUID, 'COCK001', 'Mojito Royal', 'Mojito avec champagne', 16.00, true),
    ('p5234567-89ab-cdef-0123-456789abcdef'::UUID, '11234567-89ab-cdef-0123-456789abcdef'::UUID, 'c5234567-89ab-cdef-0123-456789abcdef'::UUID, 'WINE001', 'Bordeaux 2020', 'Bordeaux rouge millésime 2020', 85.00, true);

    -- Insert test tables
    INSERT INTO public.pos_tables (id, org_id, outlet_id, table_number, capacity, zone, status, is_active) VALUES
    ('t1234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, '01234567-89ab-cdef-0123-456789abcdef'::UUID, '01', 2, 'Terrasse', 'available', true),
    ('t2234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, '01234567-89ab-cdef-0123-456789abcdef'::UUID, '02', 4, 'Salle principale', 'occupied', true),
    ('t3234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, '01234567-89ab-cdef-0123-456789abcdef'::UUID, '03', 6, 'Salle VIP', 'available', true),
    ('t4234567-89ab-cdef-0123-456789abcdef'::UUID, test_org_id, '11234567-89ab-cdef-0123-456789abcdef'::UUID, 'BAR01', 8, 'Comptoir', 'available', true);

END $$;