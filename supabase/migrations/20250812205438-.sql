-- Add org_id column to pos_categories and update migration
ALTER TABLE public.pos_categories 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.hotel_settings(org_id) NOT NULL DEFAULT get_current_user_org_id();

-- Insert test data for POS system using existing organization
DO $$
DECLARE
    existing_org_id UUID;
    restaurant_outlet_id UUID := gen_random_uuid();
    bar_outlet_id UUID := gen_random_uuid();
    spa_outlet_id UUID := gen_random_uuid();
    room_service_outlet_id UUID := gen_random_uuid();
    entrees_cat_id UUID := gen_random_uuid();
    plats_cat_id UUID := gen_random_uuid();
    cocktails_cat_id UUID := gen_random_uuid();
BEGIN
    -- Get the existing organization ID
    SELECT org_id INTO existing_org_id 
    FROM public.hotel_settings 
    LIMIT 1;
    
    IF existing_org_id IS NULL THEN
        RAISE EXCEPTION 'No organization found in hotel_settings';
    END IF;

    -- Insert test outlets
    INSERT INTO public.pos_outlets (id, org_id, code, name, description, outlet_type, is_active) VALUES
    (restaurant_outlet_id, existing_org_id, 'REST01', 'Restaurant Principal', 'Restaurant principal de l''hôtel avec service complet', 'restaurant', true),
    (bar_outlet_id, existing_org_id, 'BAR01', 'Bar Lounge', 'Bar lounge avec vue panoramique', 'bar', true),
    (spa_outlet_id, existing_org_id, 'SPA01', 'Spa Wellness', 'Centre de bien-être et spa', 'spa', true),
    (room_service_outlet_id, existing_org_id, 'ROOM01', 'Room Service', 'Service en chambre 24h/24', 'room_service', true);

    -- Insert test categories
    INSERT INTO public.pos_categories (id, org_id, outlet_id, code, name, description, color, sort_order, is_active) VALUES
    (entrees_cat_id, existing_org_id, restaurant_outlet_id, 'ENTR', 'Entrées', 'Entrées et amuse-bouches', '#10B981', 1, true),
    (plats_cat_id, existing_org_id, restaurant_outlet_id, 'PLAT', 'Plats Principaux', 'Plats principaux du chef', '#3B82F6', 2, true),
    (gen_random_uuid(), existing_org_id, restaurant_outlet_id, 'DESS', 'Desserts', 'Desserts maison', '#F59E0B', 3, true),
    (cocktails_cat_id, existing_org_id, bar_outlet_id, 'COCK', 'Cocktails', 'Cocktails signature', '#8B5CF6', 1, true),
    (gen_random_uuid(), existing_org_id, bar_outlet_id, 'WINE', 'Vins', 'Sélection de vins', '#DC2626', 2, true),
    (gen_random_uuid(), existing_org_id, spa_outlet_id, 'MASS', 'Massages', 'Soins et massages', '#06B6D4', 1, true);

    -- Insert test products for restaurant
    INSERT INTO public.pos_products (id, outlet_id, category_id, code, name, description, base_price, is_active, image_url, preparation_time) VALUES
    (gen_random_uuid(), restaurant_outlet_id, entrees_cat_id, 'ENT001', 'Foie gras poêlé', 'Foie gras poêlé aux figues confites', 28.50, true, null, 15),
    (gen_random_uuid(), restaurant_outlet_id, entrees_cat_id, 'ENT002', 'Carpaccio de bœuf', 'Carpaccio de bœuf aux copeaux de parmesan', 22.00, true, null, 10),
    (gen_random_uuid(), restaurant_outlet_id, plats_cat_id, 'PLAT001', 'Filet de bœuf', 'Filet de bœuf grillé sauce béarnaise', 45.00, true, null, 25),
    (gen_random_uuid(), restaurant_outlet_id, plats_cat_id, 'PLAT002', 'Poisson du jour', 'Poisson frais du marché aux légumes de saison', 38.00, true, null, 20);

    -- Insert test products for bar
    INSERT INTO public.pos_products (id, outlet_id, category_id, code, name, description, base_price, is_active, image_url, preparation_time) VALUES
    (gen_random_uuid(), bar_outlet_id, cocktails_cat_id, 'COCK001', 'Mojito Royal', 'Mojito classique avec rhum premium', 15.00, true, null, 5),
    (gen_random_uuid(), bar_outlet_id, cocktails_cat_id, 'COCK002', 'Cosmopolitan', 'Cocktail signature de la maison', 18.00, true, null, 5);

    -- Insert test tables for restaurant
    INSERT INTO public.pos_tables (id, org_id, outlet_id, table_number, capacity, zone, status, is_active) VALUES
    (gen_random_uuid(), existing_org_id, restaurant_outlet_id, '01', 4, 'Salle principale', 'available', true),
    (gen_random_uuid(), existing_org_id, restaurant_outlet_id, '02', 2, 'Salle principale', 'available', true),
    (gen_random_uuid(), existing_org_id, restaurant_outlet_id, '03', 6, 'Terrasse', 'available', true),
    (gen_random_uuid(), existing_org_id, restaurant_outlet_id, '04', 8, 'Salon privé', 'available', true);

    -- Insert test tables for bar
    INSERT INTO public.pos_tables (id, org_id, outlet_id, table_number, capacity, zone, status, is_active) VALUES
    (gen_random_uuid(), existing_org_id, bar_outlet_id, 'B01', 4, 'Zone bar', 'available', true),
    (gen_random_uuid(), existing_org_id, bar_outlet_id, 'B02', 2, 'Zone lounge', 'available', true);

    RAISE NOTICE 'Test data inserted successfully for organization: %', existing_org_id;

END $$;