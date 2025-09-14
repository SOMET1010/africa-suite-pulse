-- Créer un catalogue de test enrichi avec des produits variés
-- D'abord, créer quelques catégories de base
DO $$
DECLARE
    outlet_uuid uuid;
    org_uuid uuid;
    cat_entrees uuid;
    cat_plats uuid;
    cat_desserts uuid;
    cat_boissons uuid;
    cat_alcools uuid;
BEGIN
    -- Récupérer l'organisation et outlet existants
    SELECT org_id, id INTO org_uuid, outlet_uuid 
    FROM pos_outlets 
    WHERE is_active = true 
    LIMIT 1;
    
    IF org_uuid IS NULL THEN
        RAISE NOTICE 'Aucun outlet trouvé, impossible de créer les produits de test';
        RETURN;
    END IF;
    
    -- Insérer les catégories avec gestion des conflits
    INSERT INTO pos_categories (org_id, outlet_id, code, name, description, color, sort_order, is_active) 
    VALUES 
        (org_uuid, outlet_uuid, 'ENTREES', 'Entrées', 'Hors-d''œuvre et amuse-bouches', '#FF6B6B', 1, true),
        (org_uuid, outlet_uuid, 'PLATS', 'Plats Principaux', 'Plats de résistance', '#4ECDC4', 2, true),
        (org_uuid, outlet_uuid, 'DESSERTS', 'Desserts', 'Desserts et pâtisseries', '#45B7D1', 3, true),
        (org_uuid, outlet_uuid, 'BOISSONS', 'Boissons', 'Boissons chaudes et froides', '#F39C12', 4, true),
        (org_uuid, outlet_uuid, 'ALCOOLS', 'Alcools', 'Vins, bières et spiritueux', '#9B59B6', 5, true),
        (org_uuid, outlet_uuid, 'PIZZAS', 'Pizzas', 'Pizzas et pâtes', '#E74C3C', 6, true),
        (org_uuid, outlet_uuid, 'SALADES', 'Salades', 'Salades fraîches', '#2ECC71', 7, true)
    ON CONFLICT (org_id, code) DO NOTHING;
    
    -- Récupérer les IDs des catégories
    SELECT id INTO cat_entrees FROM pos_categories WHERE org_id = org_uuid AND code = 'ENTREES';
    SELECT id INTO cat_plats FROM pos_categories WHERE org_id = org_uuid AND code = 'PLATS';
    SELECT id INTO cat_desserts FROM pos_categories WHERE org_id = org_uuid AND code = 'DESSERTS';
    SELECT id INTO cat_boissons FROM pos_categories WHERE org_id = org_uuid AND code = 'BOISSONS';
    SELECT id INTO cat_alcools FROM pos_categories WHERE org_id = org_uuid AND code = 'ALCOOLS';
    
    -- Insérer les produits de test
    INSERT INTO pos_products (org_id, outlet_id, category_id, name, description, price_ht, price_ttc, unit_sale, preparation_time, is_active, allergens, dietary_options, image_url, product_code) 
    VALUES 
        -- Entrées
        (org_uuid, outlet_uuid, cat_entrees, 'Salade César', 'Salade romaine, parmesan, croûtons, sauce césar', 2500, 2950, 'portion', 8, true, '["gluten"]'::jsonb, '["vegetarian"]'::jsonb, '/placeholder.svg', 'ENT001'),
        (org_uuid, outlet_uuid, cat_entrees, 'Bruschetta Tomate', 'Pain grillé, tomates fraîches, basilic', 1800, 2124, 'portion', 5, true, '["gluten"]'::jsonb, '["vegetarian"]'::jsonb, '/placeholder.svg', 'ENT002'),
        (org_uuid, outlet_uuid, cat_entrees, 'Soupe du Jour', 'Soupe fraîche quotidienne', 1500, 1770, 'bol', 3, true, '[]'::jsonb, '["vegetarian", "vegan"]'::jsonb, '/placeholder.svg', 'ENT003'),
        (org_uuid, outlet_uuid, cat_entrees, 'Carpaccio de Bœuf', 'Lamelles de bœuf, roquette, parmesan', 3500, 4130, 'portion', 10, true, '["lactose"]'::jsonb, '[]'::jsonb, '/placeholder.svg', 'ENT004'),
        
        -- Plats principaux
        (org_uuid, outlet_uuid, cat_plats, 'Escalope Milanaise', 'Escalope panée, spaghettis à la tomate', 4500, 5310, 'portion', 18, true, '["gluten", "lactose"]'::jsonb, '[]'::jsonb, '/placeholder.svg', 'PLAT001'),
        (org_uuid, outlet_uuid, cat_plats, 'Saumon Grillé', 'Pavé de saumon, légumes de saison', 5500, 6490, 'portion', 15, true, '["poisson", "lactose"]'::jsonb, '[]'::jsonb, '/placeholder.svg', 'PLAT002'),
        (org_uuid, outlet_uuid, cat_plats, 'Couscous Royal', 'Semoule, agneau, merguez, légumes', 4800, 5664, 'portion', 25, true, '["gluten"]'::jsonb, '[]'::jsonb, '/placeholder.svg', 'PLAT003'),
        (org_uuid, outlet_uuid, cat_plats, 'Curry de Légumes', 'Légumes au lait de coco, riz basmati', 3500, 4130, 'portion', 20, true, '[]'::jsonb, '["vegetarian", "vegan"]'::jsonb, '/placeholder.svg', 'PLAT004'),
        (org_uuid, outlet_uuid, cat_plats, 'Entrecôte Grillée', 'Entrecôte 300g, frites, salade', 6500, 7670, 'portion', 12, true, '[]'::jsonb, '[]'::jsonb, '/placeholder.svg', 'PLAT005'),
        
        -- Desserts
        (org_uuid, outlet_uuid, cat_desserts, 'Tiramisu Maison', 'Mascarpone, café, cacao', 2500, 2950, 'portion', 5, true, '["lactose", "œufs", "gluten"]'::jsonb, '["vegetarian"]'::jsonb, '/placeholder.svg', 'DES001'),
        (org_uuid, outlet_uuid, cat_desserts, 'Tarte Tatin', 'Tarte aux pommes caramélisées', 2200, 2596, 'part', 8, true, '["gluten", "lactose", "œufs"]'::jsonb, '["vegetarian"]'::jsonb, '/placeholder.svg', 'DES002'),
        (org_uuid, outlet_uuid, cat_desserts, 'Mousse au Chocolat', 'Mousse légère au chocolat noir', 1800, 2124, 'portion', 3, true, '["lactose", "œufs"]'::jsonb, '["vegetarian"]'::jsonb, '/placeholder.svg', 'DES003'),
        (org_uuid, outlet_uuid, cat_desserts, 'Salade de Fruits', 'Fruits frais de saison', 1500, 1770, 'bol', 5, true, '[]'::jsonb, '["vegetarian", "vegan"]'::jsonb, '/placeholder.svg', 'DES004'),
        
        -- Boissons
        (org_uuid, outlet_uuid, cat_boissons, 'Café Expresso', 'Café italien traditionnel', 800, 944, 'tasse', 2, true, '[]'::jsonb, '["vegan"]'::jsonb, '/placeholder.svg', 'BC001'),
        (org_uuid, outlet_uuid, cat_boissons, 'Cappuccino', 'Expresso, lait vapeur, mousse', 1200, 1416, 'tasse', 3, true, '["lactose"]'::jsonb, '["vegetarian"]'::jsonb, '/placeholder.svg', 'BC002'),
        (org_uuid, outlet_uuid, cat_boissons, 'Jus d''Orange Frais', 'Jus d''orange pressé minute', 1500, 1770, 'verre', 3, true, '[]'::jsonb, '["vegan"]'::jsonb, '/placeholder.svg', 'BF002'),
        (org_uuid, outlet_uuid, cat_boissons, 'Coca-Cola', 'Soda classique 33cl', 1000, 1180, 'canette', 1, true, '[]'::jsonb, '["vegan"]'::jsonb, '/placeholder.svg', 'BF001'),
        
        -- Alcools
        (org_uuid, outlet_uuid, cat_alcools, 'Vin Rouge Maison', 'Vin rouge du domaine', 2500, 2950, 'verre', 1, true, '[]'::jsonb, '["vegan"]'::jsonb, '/placeholder.svg', 'ALC001'),
        (org_uuid, outlet_uuid, cat_alcools, 'Bière Pression', 'Bière blonde 25cl', 1500, 1770, 'verre', 2, true, '[]'::jsonb, '["vegan"]'::jsonb, '/placeholder.svg', 'ALC002'),
        (org_uuid, outlet_uuid, cat_alcools, 'Mojito', 'Rhum blanc, menthe, citron vert', 3500, 4130, 'verre', 5, true, '[]'::jsonb, '["vegan"]'::jsonb, '/placeholder.svg', 'ALC003'),
        (org_uuid, outlet_uuid, cat_alcools, 'Whisky Single Malt', 'Whisky écossais 12 ans', 4500, 5310, 'verre', 1, true, '[]'::jsonb, '["vegan"]'::jsonb, '/placeholder.svg', 'ALC004')
    ON CONFLICT (org_id, product_code) DO NOTHING;
    
    RAISE NOTICE 'Catalogue de test créé avec succès pour l''organisation %', org_uuid;
    
END $$;