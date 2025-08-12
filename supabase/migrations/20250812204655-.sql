-- Insert test data for POS system
DO $$
DECLARE
    test_org_id UUID := gen_random_uuid();
BEGIN
    -- Insert test outlets
    INSERT INTO public.pos_outlets (id, org_id, code, name, description, outlet_type, is_active) VALUES
    (gen_random_uuid(), test_org_id, 'REST01', 'Restaurant Principal', 'Restaurant principal de l''hôtel avec service complet', 'restaurant', true),
    (gen_random_uuid(), test_org_id, 'BAR01', 'Bar Lounge', 'Bar lounge avec vue panoramique', 'bar', true),
    (gen_random_uuid(), test_org_id, 'SPA01', 'Spa Wellness', 'Centre de bien-être et spa', 'spa', true),
    (gen_random_uuid(), test_org_id, 'ROOM01', 'Room Service', 'Service en chambre 24h/24', 'room_service', true);

    -- Insert test categories for restaurant
    INSERT INTO public.pos_categories (id, outlet_id, code, name, description, color, sort_order, is_active) 
    SELECT 
        gen_random_uuid(),
        outlets.id,
        CASE WHEN outlets.code = 'REST01' THEN 'ENTR' WHEN outlets.code = 'BAR01' THEN 'COCK' END,
        CASE WHEN outlets.code = 'REST01' THEN 'Entrées' WHEN outlets.code = 'BAR01' THEN 'Cocktails' END,
        CASE WHEN outlets.code = 'REST01' THEN 'Entrées et amuse-bouches' WHEN outlets.code = 'BAR01' THEN 'Cocktails signature' END,
        CASE WHEN outlets.code = 'REST01' THEN '#10B981' WHEN outlets.code = 'BAR01' THEN '#8B5CF6' END,
        1,
        true
    FROM pos_outlets outlets 
    WHERE outlets.org_id = test_org_id AND outlets.code IN ('REST01', 'BAR01');

    -- Insert more categories for restaurant
    INSERT INTO public.pos_categories (id, outlet_id, code, name, description, color, sort_order, is_active) 
    SELECT 
        gen_random_uuid(),
        outlets.id,
        'PLAT',
        'Plats Principaux',
        'Plats principaux',
        '#3B82F6',
        2,
        true
    FROM pos_outlets outlets 
    WHERE outlets.org_id = test_org_id AND outlets.code = 'REST01';

    -- Insert test products
    INSERT INTO public.pos_products (id, outlet_id, category_id, code, name, description, base_price, is_active) 
    SELECT 
        gen_random_uuid(),
        cat.outlet_id,
        cat.id,
        'ENT001',
        'Foie gras poêlé',
        'Foie gras poêlé aux figues confites',
        28.50,
        true
    FROM pos_categories cat 
    JOIN pos_outlets outlets ON cat.outlet_id = outlets.id
    WHERE outlets.org_id = test_org_id AND cat.code = 'ENTR';

    -- Insert test tables
    INSERT INTO public.pos_tables (id, org_id, outlet_id, table_number, capacity, zone, status, is_active) 
    SELECT 
        gen_random_uuid(),
        test_org_id,
        outlets.id,
        '01',
        4,
        'Salle principale',
        'available',
        true
    FROM pos_outlets outlets 
    WHERE outlets.org_id = test_org_id AND outlets.code = 'REST01';

END $$;