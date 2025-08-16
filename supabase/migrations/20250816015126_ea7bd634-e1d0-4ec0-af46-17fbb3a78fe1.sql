-- Insertion de catégories supplémentaires pour enrichir le catalogue
INSERT INTO pos_categories (org_id, name, description, color, sort_order, is_active) VALUES
  (get_current_user_org_id(), 'Entrées', 'Hors-d''œuvre et amuse-bouches', '#FF6B6B', 1, true),
  (get_current_user_org_id(), 'Plats Principaux', 'Plats de résistance', '#4ECDC4', 2, true),
  (get_current_user_org_id(), 'Desserts', 'Desserts et pâtisseries', '#45B7D1', 3, true),
  (get_current_user_org_id(), 'Boissons Chaudes', 'Café, thé et autres boissons chaudes', '#F39C12', 4, true),
  (get_current_user_org_id(), 'Boissons Froides', 'Jus, sodas et boissons fraîches', '#3498DB', 5, true),
  (get_current_user_org_id(), 'Alcools', 'Vins, bières et spiritueux', '#9B59B6', 6, true),
  (get_current_user_org_id(), 'Snacks', 'Collations et amuse-gueules', '#E67E22', 7, true),
  (get_current_user_org_id(), 'Pizzas', 'Pizzas et pâtes', '#E74C3C', 8, true),
  (get_current_user_org_id(), 'Grillades', 'Viandes et poissons grillés', '#27AE60', 9, true),
  (get_current_user_org_id(), 'Salades', 'Salades fraîches et composées', '#2ECC71', 10, true)
ON CONFLICT (org_id, name) DO NOTHING;

-- Récupération des IDs des catégories pour les produits
WITH category_ids AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (ORDER BY sort_order) as rn
  FROM pos_categories 
  WHERE org_id = get_current_user_org_id()
)

-- Insertion de produits variés pour enrichir le catalogue
INSERT INTO pos_products (org_id, outlet_id, category_id, name, description, price_ht, price_ttc, unit_sale, preparation_time, is_active, allergens, dietary_options, image_url, product_code) 
SELECT 
  get_current_user_org_id(),
  (SELECT id FROM pos_outlets WHERE org_id = get_current_user_org_id() LIMIT 1),
  cat.id,
  prod.name,
  prod.description,
  prod.price_ht,
  prod.price_ttc,
  prod.unit_sale,
  prod.preparation_time,
  true,
  prod.allergens,
  prod.dietary_options,
  prod.image_url,
  prod.product_code
FROM category_ids cat
CROSS JOIN (
  -- Entrées (catégorie 1)
  SELECT 1 as cat_rn, 'Salade César' as name, 'Salade romaine, parmesan, croûtons, sauce césar' as description, 2500 as price_ht, 2950 as price_ttc, 'portion' as unit_sale, 8 as preparation_time, '["gluten"]'::jsonb as allergens, '["vegetarian"]'::jsonb as dietary_options, '/placeholder.svg' as image_url, 'ENT001' as product_code
  UNION ALL SELECT 1, 'Bruschetta Tomate', 'Pain grillé, tomates fraîches, basilic, huile d''olive', 1800, 2124, 'portion', 5, '["gluten"]', '["vegetarian"]', '/placeholder.svg', 'ENT002'
  UNION ALL SELECT 1, 'Soupe du Jour', 'Soupe fraîche préparée quotidiennement', 1500, 1770, 'bol', 3, '[]', '["vegetarian", "vegan"]', '/placeholder.svg', 'ENT003'
  UNION ALL SELECT 1, 'Carpaccio de Bœuf', 'Lamelles de bœuf, roquette, parmesan, huile de truffe', 3500, 4130, 'portion', 10, '["lactose"]', '[]', '/placeholder.svg', 'ENT004'
  
  -- Plats Principaux (catégorie 2)
  UNION ALL SELECT 2, 'Escalope Milanaise', 'Escalope panée, spaghettis à la tomate', 4500, 5310, 'portion', 18, '["gluten", "lactose"]', '[]', '/placeholder.svg', 'PLAT001'
  UNION ALL SELECT 2, 'Saumon Grillé', 'Pavé de saumon, légumes de saison, sauce hollandaise', 5500, 6490, 'portion', 15, '["poisson", "lactose"]', '[]', '/placeholder.svg', 'PLAT002'
  UNION ALL SELECT 2, 'Couscous Royal', 'Semoule, agneau, merguez, légumes, bouillon', 4800, 5664, 'portion', 25, '["gluten"]', '[]', '/placeholder.svg', 'PLAT003'
  UNION ALL SELECT 2, 'Curry de Légumes', 'Légumes variés au lait de coco, riz basmati', 3500, 4130, 'portion', 20, '[]', '["vegetarian", "vegan"]', '/placeholder.svg', 'PLAT004'
  UNION ALL SELECT 2, 'Entrecôte Grillée', 'Entrecôte 300g, frites maison, salade', 6500, 7670, 'portion', 12, '[]', '[]', '/placeholder.svg', 'PLAT005'
  
  -- Desserts (catégorie 3)
  UNION ALL SELECT 3, 'Tiramisu Maison', 'Mascarpone, café, cacao, biscuits à la cuillère', 2500, 2950, 'portion', 5, '["lactose", "œufs", "gluten"]', '["vegetarian"]', '/placeholder.svg', 'DES001'
  UNION ALL SELECT 3, 'Tarte Tatin', 'Tarte aux pommes caramélisées, chantilly', 2200, 2596, 'part', 8, '["gluten", "lactose", "œufs"]', '["vegetarian"]', '/placeholder.svg', 'DES002'
  UNION ALL SELECT 3, 'Mousse au Chocolat', 'Mousse légère au chocolat noir 70%', 1800, 2124, 'portion', 3, '["lactose", "œufs"]', '["vegetarian"]', '/placeholder.svg', 'DES003'
  UNION ALL SELECT 3, 'Salade de Fruits', 'Fruits frais de saison, coulis de fruits', 1500, 1770, 'bol', 5, '[]', '["vegetarian", "vegan"]', '/placeholder.svg', 'DES004'
  
  -- Boissons Chaudes (catégorie 4)
  UNION ALL SELECT 4, 'Café Expresso', 'Café italien traditionnel', 800, 944, 'tasse', 2, '[]', '["vegan"]', '/placeholder.svg', 'BC001'
  UNION ALL SELECT 4, 'Cappuccino', 'Expresso, lait vapeur, mousse de lait', 1200, 1416, 'tasse', 3, '["lactose"]', '["vegetarian"]', '/placeholder.svg', 'BC002'
  UNION ALL SELECT 4, 'Thé Vert Menthe', 'Thé vert parfumé à la menthe fraîche', 1000, 1180, 'théière', 4, '[]', '["vegan"]', '/placeholder.svg', 'BC003'
  UNION ALL SELECT 4, 'Chocolat Chaud', 'Chocolat chaud onctueux, chantilly', 1500, 1770, 'tasse', 5, '["lactose"]', '["vegetarian"]', '/placeholder.svg', 'BC004'
  
  -- Boissons Froides (catégorie 5)
  UNION ALL SELECT 5, 'Coca-Cola', 'Soda classique 33cl', 1000, 1180, 'canette', 1, '[]', '["vegan"]', '/placeholder.svg', 'BF001'
  UNION ALL SELECT 5, 'Jus d''Orange Frais', 'Jus d''orange pressé minute', 1500, 1770, 'verre', 3, '[]', '["vegan"]', '/placeholder.svg', 'BF002'
  UNION ALL SELECT 5, 'Smoothie Mangue', 'Mangue, banane, lait de coco', 2000, 2360, 'verre', 4, '[]', '["vegan"]', '/placeholder.svg', 'BF003'
  UNION ALL SELECT 5, 'Eau Minérale', 'Eau plate ou gazeuse 50cl', 800, 944, 'bouteille', 1, '[]', '["vegan"]', '/placeholder.svg', 'BF004'
  
  -- Alcools (catégorie 6)
  UNION ALL SELECT 6, 'Vin Rouge Maison', 'Vin rouge du domaine', 2500, 2950, 'verre', 1, '[]', '["vegan"]', '/placeholder.svg', 'ALC001'
  UNION ALL SELECT 6, 'Bière Pression', 'Bière blonde 25cl', 1500, 1770, 'verre', 2, '[]', '["vegan"]', '/placeholder.svg', 'ALC002'
  UNION ALL SELECT 6, 'Mojito', 'Rhum blanc, menthe, citron vert, eau gazeuse', 3500, 4130, 'verre', 5, '[]', '["vegan"]', '/placeholder.svg', 'ALC003'
  UNION ALL SELECT 6, 'Whisky Single Malt', 'Whisky écossais 12 ans d''âge', 4500, 5310, 'verre', 1, '[]', '["vegan"]', '/placeholder.svg', 'ALC004'
  
  -- Snacks (catégorie 7)
  UNION ALL SELECT 7, 'Olives Marinées', 'Mélange d''olives aux herbes', 1200, 1416, 'bol', 2, '[]', '["vegan"]', '/placeholder.svg', 'SNK001'
  UNION ALL SELECT 7, 'Chips Maison', 'Chips de pommes de terre artisanales', 1000, 1180, 'bol', 3, '[]', '["vegan"]', '/placeholder.svg', 'SNK002'
  UNION ALL SELECT 7, 'Plateau de Charcuterie', 'Sélection de charcuteries locales', 2800, 3304, 'plateau', 8, '["nitrites"]', '[]', '/placeholder.svg', 'SNK003'
  UNION ALL SELECT 7, 'Houmous Légumes', 'Houmous maison avec bâtonnets de légumes', 1800, 2124, 'portion', 5, '["sésame"]', '["vegan"]', '/placeholder.svg', 'SNK004'
  
  -- Pizzas (catégorie 8)
  UNION ALL SELECT 8, 'Pizza Margherita', 'Tomate, mozzarella, basilic frais', 3500, 4130, 'pizza', 12, '["gluten", "lactose"]', '["vegetarian"]', '/placeholder.svg', 'PIZ001'
  UNION ALL SELECT 8, 'Pizza 4 Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 4200, 4956, 'pizza', 14, '["gluten", "lactose"]', '["vegetarian"]', '/placeholder.svg', 'PIZ002'
  UNION ALL SELECT 8, 'Pizza Pepperoni', 'Tomate, mozzarella, pepperoni épicé', 4500, 5310, 'pizza', 13, '["gluten", "lactose"]', '[]', '/placeholder.svg', 'PIZ003'
  UNION ALL SELECT 8, 'Pizza Végétarienne', 'Légumes grillés, fromage de chèvre, pesto', 4000, 4720, 'pizza', 15, '["gluten", "lactose"]', '["vegetarian"]', '/placeholder.svg', 'PIZ004'
  
  -- Grillades (catégorie 9)
  UNION ALL SELECT 9, 'Brochettes d''Agneau', 'Cubes d''agneau marinés, légumes grillés', 5500, 6490, 'portion', 18, '[]', '[]', '/placeholder.svg', 'GRI001'
  UNION ALL SELECT 9, 'Dorade Grillée', 'Dorade entière, citron, herbes de Provence', 4800, 5664, 'portion', 20, '["poisson"]', '[]', '/placeholder.svg', 'GRI002'
  UNION ALL SELECT 9, 'Côtelettes de Porc', 'Côtelettes marinées, sauce moutarde', 4200, 4956, 'portion', 15, '["moutarde"]', '[]', '/placeholder.svg', 'GRI003'
  UNION ALL SELECT 9, 'Brochettes de Crevettes', 'Crevettes géantes grillées à l''ail', 6000, 7080, 'portion', 12, '["crustacés"]', '[]', '/placeholder.svg', 'GRI004'
  
  -- Salades (catégorie 10)
  UNION ALL SELECT 10, 'Salade Niçoise', 'Salade, thon, œufs, olives, tomates', 3200, 3776, 'salade', 10, '["poisson", "œufs"]', '[]', '/placeholder.svg', 'SAL001'
  UNION ALL SELECT 10, 'Salade de Chèvre Chaud', 'Mesclun, crottin de chèvre grillé, noix', 2800, 3304, 'salade', 8, '["lactose", "noix"]', '["vegetarian"]', '/placeholder.svg', 'SAL002'
  UNION ALL SELECT 10, 'Salade Quinoa', 'Quinoa, légumes croquants, vinaigrette citron', 2500, 2950, 'salade', 6, '[]', '["vegan"]', '/placeholder.svg', 'SAL003'
  UNION ALL SELECT 10, 'Salade de Poulet', 'Émincé de poulet grillé, crudités, sauce yaourt', 3500, 4130, 'salade', 12, '["lactose"]', '[]', '/placeholder.svg', 'SAL004'
) prod
WHERE cat.rn = prod.cat_rn
ON CONFLICT (org_id, product_code) DO NOTHING;

-- Mise à jour des stocks pour les nouveaux produits
INSERT INTO pos_stock_items (org_id, outlet_id, product_id, current_stock, min_stock, max_stock, unit_purchase, last_cost, supplier_reference)
SELECT 
  p.org_id,
  p.outlet_id,
  p.id,
  CASE 
    WHEN p.name LIKE '%Vin%' OR p.name LIKE '%Bière%' OR p.name LIKE '%Whisky%' THEN 24
    WHEN p.name LIKE '%Pizza%' OR p.name LIKE '%Plat%' THEN 50
    WHEN p.name LIKE '%Salade%' THEN 30
    ELSE 100
  END as current_stock,
  CASE 
    WHEN p.name LIKE '%Vin%' OR p.name LIKE '%Bière%' OR p.name LIKE '%Whisky%' THEN 5
    WHEN p.name LIKE '%Pizza%' OR p.name LIKE '%Plat%' THEN 10
    ELSE 20
  END as min_stock,
  CASE 
    WHEN p.name LIKE '%Vin%' OR p.name LIKE '%Bière%' OR p.name LIKE '%Whisky%' THEN 100
    WHEN p.name LIKE '%Pizza%' OR p.name LIKE '%Plat%' THEN 200
    ELSE 500
  END as max_stock,
  p.unit_sale as unit_purchase,
  p.price_ht * 0.7 as last_cost,
  'SUP-' || p.product_code as supplier_reference
FROM pos_products p
WHERE p.org_id = get_current_user_org_id()
  AND p.product_code IN (
    'ENT001', 'ENT002', 'ENT003', 'ENT004',
    'PLAT001', 'PLAT002', 'PLAT003', 'PLAT004', 'PLAT005',
    'DES001', 'DES002', 'DES003', 'DES004',
    'BC001', 'BC002', 'BC003', 'BC004',
    'BF001', 'BF002', 'BF003', 'BF004',
    'ALC001', 'ALC002', 'ALC003', 'ALC004',
    'SNK001', 'SNK002', 'SNK003', 'SNK004',
    'PIZ001', 'PIZ002', 'PIZ003', 'PIZ004',
    'GRI001', 'GRI002', 'GRI003', 'GRI004',
    'SAL001', 'SAL002', 'SAL003', 'SAL004'
  )
ON CONFLICT (org_id, outlet_id, product_id) DO NOTHING;