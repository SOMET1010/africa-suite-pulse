-- Insertion simplifiée de produits de test pour enrichir le catalogue
-- On évite les contraintes d'unicité en insérant directement
INSERT INTO pos_products (org_id, outlet_id, category_id, name, description, price_ht, price_ttc, unit_sale, preparation_time, is_active, allergens, dietary_options, image_url, product_code) 
SELECT 
  po.org_id,
  po.id as outlet_id,
  pc.id as category_id,
  products.name,
  products.description,
  products.price_ht,
  products.price_ttc,
  products.unit_sale,
  products.preparation_time,
  true,
  products.allergens::jsonb,
  products.dietary_options::jsonb,
  '/placeholder.svg',
  products.product_code
FROM pos_outlets po
CROSS JOIN pos_categories pc
CROSS JOIN (VALUES
  -- Entrées variées
  ('Salade César Gourmet', 'Salade romaine, parmesan reggiano, croûtons maison, sauce césar artisanale', 2800, 3304, 'portion', 8, '["gluten"]', '["vegetarian"]', 'ENT001'),
  ('Bruschetta Tomate Basilic', 'Pain de campagne grillé, tomates cerises, mozzarella di bufala, basilic frais', 2200, 2596, 'portion', 5, '["gluten", "lactose"]', '["vegetarian"]', 'ENT002'),
  ('Velouté de Saison', 'Soupe veloutée aux légumes frais du marché', 1800, 2124, 'bol', 6, '[]', '["vegetarian", "vegan"]', 'ENT003'),
  ('Carpaccio de Bœuf Premium', 'Lamelles de bœuf de Charolais, roquette, copeaux de parmesan, huile de truffe', 3800, 4484, 'portion', 12, '["lactose"]', '[]', 'ENT004'),
  ('Assiette de Charcuterie', 'Sélection de charcuteries artisanales, cornichons, pain de campagne', 3200, 3776, 'plateau', 8, '["gluten", "nitrites"]', '[]', 'ENT005'),
  
  -- Plats principaux copieux
  ('Escalope Milanaise Royale', 'Escalope de veau panée, spaghettis al dente, sauce tomate maison', 5200, 6136, 'portion', 20, '["gluten", "lactose"]', '[]', 'PLAT001'),
  ('Pavé de Saumon Atlantique', 'Saumon grillé, ratatouille provençale, sauce hollandaise', 6200, 7316, 'portion', 18, '["poisson", "lactose"]', '[]', 'PLAT002'),
  ('Couscous Royal Traditionnel', 'Semoule fine, agneau mijoté, merguez, légumes du pot-au-feu', 5500, 6490, 'portion', 28, '["gluten"]', '[]', 'PLAT003'),
  ('Curry Thaï aux Légumes', 'Légumes croquants au lait de coco épicé, riz jasmin parfumé', 4200, 4956, 'portion', 22, '[]', '["vegetarian", "vegan"]', 'PLAT004'),
  ('Côte de Bœuf Grillée', 'Côte de bœuf 400g, frites de Pont-Neuf, salade composée', 7800, 9204, 'portion', 15, '[]', '[]', 'PLAT005'),
  ('Magret de Canard Laqué', 'Magret de canard aux épices, gratin dauphinois, légumes glacés', 6800, 8024, 'portion', 25, '["lactose"]', '[]', 'PLAT006'),
  
  -- Desserts gourmands
  ('Tiramisu Artisanal', 'Mascarpone onctueux, café expresso, cacao de Madagascar', 2800, 3304, 'portion', 5, '["lactose", "œufs", "gluten"]', '["vegetarian"]', 'DES001'),
  ('Tarte Tatin aux Pommes', 'Pommes caramélisées, pâte brisée pur beurre, chantilly', 2500, 2950, 'part', 10, '["gluten", "lactose", "œufs"]', '["vegetarian"]', 'DES002'),
  ('Fondant au Chocolat Noir', 'Cœur coulant chocolat 70%, glace vanille Bourbon', 2200, 2596, 'portion', 8, '["lactose", "œufs", "gluten"]', '["vegetarian"]', 'DES003'),
  ('Salade de Fruits Exotiques', 'Mangue, ananas, fruit de la passion, coulis de fruits rouges', 1800, 2124, 'coupe', 5, '[]', '["vegetarian", "vegan"]', 'DES004'),
  ('Crème Brûlée Vanille', 'Crème à la vanille de Madagascar, sucre caramélisé', 2400, 2832, 'ramequin', 6, '["lactose", "œufs"]', '["vegetarian"]', 'DES005'),
  
  -- Boissons chaudes
  ('Expresso Intense', 'Café pure arabica, torréfaction artisanale', 950, 1121, 'tasse', 2, '[]', '["vegan"]', 'BC001'),
  ('Cappuccino Onctueux', 'Expresso double, lait vapeur, mousse de lait micro-aérée', 1400, 1652, 'tasse', 4, '["lactose"]', '["vegetarian"]', 'BC002'),
  ('Thé Earl Grey Premium', 'Thé noir bergamote, service traditionnel', 1200, 1416, 'théière', 5, '[]', '["vegan"]', 'BC003'),
  ('Chocolat Chaud Maison', 'Chocolat noir fondu, lait entier, chantilly artisanale', 1800, 2124, 'tasse', 6, '["lactose"]', '["vegetarian"]', 'BC004'),
  
  -- Boissons fraîches
  ('Jus d''Orange Pressé', 'Oranges de Valencia pressées à la demande', 1600, 1888, 'verre', 3, '[]', '["vegan"]', 'BF001'),
  ('Smoothie Tropical', 'Mangue, passion, banane, lait de coco frais', 2200, 2596, 'grand verre', 5, '[]', '["vegan"]', 'BF002'),
  ('Limonade Artisanale', 'Citrons bio, eau gazeuse, menthe fraîche', 1500, 1770, 'verre', 4, '[]', '["vegan"]', 'BF003'),
  ('Coca-Cola Original', 'Boisson gazeuse 33cl, service glacé', 1200, 1416, 'canette', 1, '[]', '["vegan"]', 'BF004'),
  
  -- Alcools et spiritueux
  ('Vin Rouge Sélection', 'Côtes du Rhône Villages, tanins soyeux', 2800, 3304, 'verre', 1, '[]', '["vegan"]', 'ALC001'),
  ('Bière Blonde Artisanale', 'Bière de blé 33cl, brasserie locale', 1800, 2124, 'bouteille', 2, '[]', '["vegan"]', 'ALC002'),
  ('Mojito Cubain', 'Rhum blanc Havana, menthe fraîche, citron vert, sucre de canne', 4200, 4956, 'verre', 6, '[]', '["vegan"]', 'ALC003'),
  ('Whisky Écossais 12 ans', 'Single malt Highlands, dégustation pure', 5500, 6490, 'verre', 1, '[]', '["vegan"]', 'ALC004'),
  ('Champagne Brut', 'Appellation Champagne contrôlée, flûte cristal', 8500, 10030, 'flûte', 2, '[]', '["vegan"]', 'ALC005'),
  
  -- Pizzas artisanales (si catégorie existe)
  ('Pizza Margherita Napoletana', 'Tomate San Marzano, mozzarella di bufala, basilic frais', 3800, 4484, 'pizza', 14, '["gluten", "lactose"]', '["vegetarian"]', 'PIZ001'),
  ('Pizza Quattro Formaggi', 'Mozzarella, gorgonzola, parmesan, chèvre frais', 4500, 5310, 'pizza', 16, '["gluten", "lactose"]', '["vegetarian"]', 'PIZ002'),
  ('Pizza Chorizo Épicé', 'Tomate épicée, mozzarella, chorizo ibérique, poivrons', 4800, 5664, 'pizza', 15, '["gluten", "lactose"]', '[]', 'PIZ003')
) AS products(name, description, price_ht, price_ttc, unit_sale, preparation_time, allergens, dietary_options, product_code)
WHERE po.is_active = true 
  AND pc.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM pos_products pp 
    WHERE pp.org_id = po.org_id 
    AND pp.product_code = products.product_code
  )
LIMIT 100;