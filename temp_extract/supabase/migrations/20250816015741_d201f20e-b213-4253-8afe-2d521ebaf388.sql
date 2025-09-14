-- Insertion de produits de test enrichis pour le catalogue POS
INSERT INTO pos_products (org_id, outlet_id, category_id, code, name, description, base_price, price_ht, unit_sale, preparation_time, is_active, allergens, image_url) 
SELECT 
  po.org_id,
  po.id as outlet_id,
  pc.id as category_id,
  products.code,
  products.name,
  products.description,
  products.base_price,
  products.price_ht,
  products.unit_sale,
  products.preparation_time,
  true,
  products.allergens::jsonb,
  '/placeholder.svg'
FROM pos_outlets po
CROSS JOIN pos_categories pc
CROSS JOIN (VALUES
  -- Entrées variées pour tester le KDS
  ('ENT001', 'Salade César Gourmet', 'Salade romaine, parmesan reggiano, croûtons maison', 3304, 2800, 'portion', 8, '["gluten"]'),
  ('ENT002', 'Bruschetta Tomate Basilic', 'Pain grillé, tomates cerises, mozzarella di bufala', 2596, 2200, 'portion', 5, '["gluten", "lactose"]'),
  ('ENT003', 'Velouté de Légumes', 'Soupe veloutée aux légumes frais du marché', 2124, 1800, 'bol', 6, '[]'),
  ('ENT004', 'Carpaccio de Bœuf', 'Lamelles de bœuf, roquette, parmesan, huile de truffe', 4484, 3800, 'portion', 12, '["lactose"]'),
  ('ENT005', 'Plateau Charcuterie', 'Sélection charcuteries artisanales, cornichons', 3776, 3200, 'plateau', 8, '["nitrites"]'),
  
  -- Plats principaux copieux
  ('PLAT001', 'Escalope Milanaise', 'Escalope panée, spaghettis al dente, sauce tomate', 6136, 5200, 'portion', 20, '["gluten"]'),
  ('PLAT002', 'Pavé de Saumon', 'Saumon grillé, ratatouille, sauce hollandaise', 7316, 6200, 'portion', 18, '["poisson", "lactose"]'),
  ('PLAT003', 'Couscous Royal', 'Semoule, agneau mijoté, merguez, légumes', 6490, 5500, 'portion', 28, '["gluten"]'),
  ('PLAT004', 'Curry Thaï Légumes', 'Légumes au lait de coco épicé, riz jasmin', 4956, 4200, 'portion', 22, '[]'),
  ('PLAT005', 'Côte de Bœuf 400g', 'Côte de bœuf grillée, frites, salade composée', 9204, 7800, 'portion', 15, '[]'),
  ('PLAT006', 'Magret de Canard', 'Magret laqué, gratin dauphinois, légumes glacés', 8024, 6800, 'portion', 25, '["lactose"]'),
  
  -- Desserts gourmands
  ('DES001', 'Tiramisu Artisanal', 'Mascarpone, café expresso, cacao de Madagascar', 3304, 2800, 'portion', 5, '["lactose", "œufs", "gluten"]'),
  ('DES002', 'Tarte Tatin', 'Pommes caramélisées, pâte pur beurre, chantilly', 2950, 2500, 'part', 10, '["gluten", "lactose", "œufs"]'),
  ('DES003', 'Fondant Chocolat', 'Cœur coulant chocolat 70%, glace vanille', 2596, 2200, 'portion', 8, '["lactose", "œufs", "gluten"]'),
  ('DES004', 'Salade Fruits Exotiques', 'Mangue, ananas, passion, coulis fruits rouges', 2124, 1800, 'coupe', 5, '[]'),
  ('DES005', 'Crème Brûlée', 'Crème vanille Madagascar, sucre caramélisé', 2832, 2400, 'ramequin', 6, '["lactose", "œufs"]'),
  
  -- Boissons chaudes
  ('BC001', 'Expresso Intense', 'Café pure arabica, torréfaction artisanale', 1121, 950, 'tasse', 2, '[]'),
  ('BC002', 'Cappuccino Onctueux', 'Expresso double, lait vapeur, mousse micro-aérée', 1652, 1400, 'tasse', 4, '["lactose"]'),
  ('BC003', 'Thé Earl Grey', 'Thé noir bergamote, service traditionnel', 1416, 1200, 'théière', 5, '[]'),
  ('BC004', 'Chocolat Chaud Maison', 'Chocolat noir fondu, chantilly artisanale', 2124, 1800, 'tasse', 6, '["lactose"]'),
  
  -- Boissons fraîches
  ('BF001', 'Jus Orange Pressé', 'Oranges Valencia pressées à la demande', 1888, 1600, 'verre', 3, '[]'),
  ('BF002', 'Smoothie Tropical', 'Mangue, passion, banane, lait de coco', 2596, 2200, 'grand verre', 5, '[]'),
  ('BF003', 'Limonade Artisanale', 'Citrons bio, eau gazeuse, menthe fraîche', 1770, 1500, 'verre', 4, '[]'),
  ('BF004', 'Coca-Cola', 'Boisson gazeuse 33cl, service glacé', 1416, 1200, 'canette', 1, '[]'),
  
  -- Alcools et spiritueux
  ('ALC001', 'Vin Rouge Sélection', 'Côtes du Rhône Villages, tanins soyeux', 3304, 2800, 'verre', 1, '[]'),
  ('ALC002', 'Bière Blonde Artisanale', 'Bière de blé 33cl, brasserie locale', 2124, 1800, 'bouteille', 2, '[]'),
  ('ALC003', 'Mojito Cubain', 'Rhum blanc, menthe fraîche, citron vert', 4956, 4200, 'verre', 6, '[]'),
  ('ALC004', 'Whisky 12 ans', 'Single malt Highlands, dégustation pure', 6490, 5500, 'verre', 1, '[]'),
  ('ALC005', 'Champagne Brut', 'Appellation contrôlée, flûte cristal', 10030, 8500, 'flûte', 2, '[]'),
  
  -- Pizzas artisanales
  ('PIZ001', 'Pizza Margherita', 'Tomate San Marzano, mozzarella di bufala, basilic', 4484, 3800, 'pizza', 14, '["gluten", "lactose"]'),
  ('PIZ002', 'Pizza Quattro Formaggi', 'Mozzarella, gorgonzola, parmesan, chèvre', 5310, 4500, 'pizza', 16, '["gluten", "lactose"]'),
  ('PIZ003', 'Pizza Chorizo', 'Tomate épicée, mozzarella, chorizo ibérique', 5664, 4800, 'pizza', 15, '["gluten", "lactose"]'),
  
  -- Snacks et amuse-bouches
  ('SNK001', 'Olives Marinées', 'Mélange olives aux herbes de Provence', 1416, 1200, 'bol', 2, '[]'),
  ('SNK002', 'Chips Artisanales', 'Pommes de terre du terroir, cuisson traditionnelle', 1180, 1000, 'bol', 3, '[]'),
  ('SNK003', 'Houmous Légumes', 'Houmous maison, bâtonnets légumes croquants', 2124, 1800, 'portion', 5, '["sésame"]'),
  
  -- Salades fraîches
  ('SAL001', 'Salade Niçoise', 'Salade, thon, œufs, olives, tomates cerises', 3776, 3200, 'salade', 10, '["poisson", "œufs"]'),
  ('SAL002', 'Salade Chèvre Chaud', 'Mesclun, crottin de chèvre grillé, noix', 3304, 2800, 'salade', 8, '["lactose", "noix"]'),
  ('SAL003', 'Salade Quinoa', 'Quinoa, légumes croquants, vinaigrette citron', 2950, 2500, 'salade', 6, '[]'),
  ('SAL004', 'Salade de Poulet', 'Émincé de poulet grillé, crudités, sauce yaourt', 4130, 3500, 'salade', 12, '["lactose"]')
) AS products(code, name, description, base_price, price_ht, unit_sale, preparation_time, allergens)
WHERE po.is_active = true 
  AND pc.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM pos_products pp 
    WHERE pp.org_id = po.org_id 
    AND pp.code = products.code
  )
LIMIT 50;