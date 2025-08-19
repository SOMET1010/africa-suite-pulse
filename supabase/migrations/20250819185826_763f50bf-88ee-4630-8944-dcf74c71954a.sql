-- Add African restaurant specific products to existing outlet
DO $$
DECLARE
    v_org_id UUID;
    v_outlet_id UUID := 'fe3b78ca-a951-49ab-b01d-335b92220a9e';
    v_cat_appetizers UUID;
    v_cat_mains UUID;
    v_cat_drinks UUID;
BEGIN
    -- Get the organization ID
    SELECT org_id INTO v_org_id FROM public.pos_outlets WHERE id = v_outlet_id;
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Outlet not found';
    END IF;
    
    -- Create African food categories if they don't exist
    INSERT INTO public.pos_categories (org_id, outlet_id, name, code, color, display_order)
    VALUES 
        (v_org_id, v_outlet_id, 'Entrées Africaines', 'african-appetizers', '#10b981', 10),
        (v_org_id, v_outlet_id, 'Plats Africains', 'african-mains', '#f59e0b', 11),
        (v_org_id, v_outlet_id, 'Boissons Africaines', 'african-drinks', '#3b82f6', 12)
    ON CONFLICT (org_id, outlet_id, code) DO NOTHING;
    
    -- Get category IDs
    SELECT id INTO v_cat_appetizers FROM public.pos_categories WHERE code = 'african-appetizers' AND org_id = v_org_id;
    SELECT id INTO v_cat_mains FROM public.pos_categories WHERE code = 'african-mains' AND org_id = v_org_id;
    SELECT id INTO v_cat_drinks FROM public.pos_categories WHERE code = 'african-drinks' AND org_id = v_org_id;
    
    -- Add African products if they don't exist
    INSERT INTO public.pos_products (org_id, outlet_id, category_id, name, code, description, base_price, preparation_time)
    VALUES 
        -- Appetizers
        (v_org_id, v_outlet_id, v_cat_appetizers, 'Samoussa', 'SAM001', 'Samoussa aux légumes croustillant', 2500, 8),
        (v_org_id, v_outlet_id, v_cat_appetizers, 'Accara', 'ACC001', 'Beignets de haricots épicés', 2000, 10),
        (v_org_id, v_outlet_id, v_cat_appetizers, 'Fataya', 'FAT001', 'Chausson feuilleté à la viande', 3000, 12),
        
        -- Main dishes
        (v_org_id, v_outlet_id, v_cat_mains, 'Thieboudienne', 'THI001', 'Riz au poisson, légumes et sauce tomate', 8500, 25),
        (v_org_id, v_outlet_id, v_cat_mains, 'Mafé', 'MAF001', 'Ragoût de viande à la pâte d''arachide', 7500, 30),
        (v_org_id, v_outlet_id, v_cat_mains, 'Yassa Poulet', 'YAS001', 'Poulet mariné aux oignons et citron', 7000, 20),
        (v_org_id, v_outlet_id, v_cat_mains, 'Domoda', 'DOM001', 'Ragoût de légumes à la pâte d''arachide', 6500, 25),
        
        -- Drinks
        (v_org_id, v_outlet_id, v_cat_drinks, 'Bissap', 'BIS001', 'Jus d''hibiscus glacé', 1500, 3),
        (v_org_id, v_outlet_id, v_cat_drinks, 'Gingembre', 'GIN001', 'Jus de gingembre frais', 1500, 3),
        (v_org_id, v_outlet_id, v_cat_drinks, 'Baobab', 'BAO001', 'Jus de fruit de baobab', 2000, 3),
        (v_org_id, v_outlet_id, v_cat_drinks, 'Eau minérale', 'EAU001', 'Bouteille d''eau 50cl', 1000, 1)
    ON CONFLICT (org_id, outlet_id, code) DO NOTHING;
    
    -- Add more tables if needed
    INSERT INTO public.pos_tables (org_id, outlet_id, table_number, table_name, capacity, zone)
    VALUES 
        (v_org_id, v_outlet_id, '5', 'Table Teranga', 4, 'Terrasse'),
        (v_org_id, v_outlet_id, '6', 'Table Baobab', 6, 'Salle principale'),
        (v_org_id, v_outlet_id, '7', 'Table Sahel', 2, 'Terrasse'),
        (v_org_id, v_outlet_id, '8', 'Table Joola', 8, 'Salle principale')
    ON CONFLICT (org_id, outlet_id, table_number) DO NOTHING;
    
END $$;