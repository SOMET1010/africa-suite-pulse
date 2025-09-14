-- Insérer des données de test pour les outlets POS
INSERT INTO pos_outlets (org_id, code, name, description, outlet_type, is_active) VALUES
  (get_current_user_org_id(), 'REST', 'Restaurant Principal', 'Restaurant gastronomique avec service à table', 'restaurant', true),
  (get_current_user_org_id(), 'BAR', 'Bar Lounge', 'Bar à cocktails et spiritueux', 'bar', true),
  (get_current_user_org_id(), 'ROOM', 'Room Service', 'Service en chambre 24h/24', 'room_service', true),
  (get_current_user_org_id(), 'SPA', 'Spa & Wellness', 'Services spa et bien-être', 'spa', true);

-- Insérer des catégories POS avec couleurs
INSERT INTO pos_categories (outlet_id, code, name, description, color, sort_order, is_active) VALUES
  -- Restaurant
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 'ENTRY', 'Entrées', 'Plats d''entrée', '#16a34a', 1, true),
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 'MAIN', 'Plats principaux', 'Plats de résistance', '#dc2626', 2, true),
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 'DESERT', 'Desserts', 'Desserts et pâtisseries', '#7c3aed', 3, true),
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 'DRINKS', 'Boissons', 'Boissons chaudes et froides', '#0ea5e9', 4, true),
  
  -- Bar
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 'COCKTAIL', 'Cocktails', 'Cocktails signature', '#f59e0b', 1, true),
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 'WINE', 'Vins', 'Sélection de vins', '#be123c', 2, true),
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 'BEER', 'Bières', 'Bières locales et importées', '#eab308', 3, true),
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 'SPIRITS', 'Spiritueux', 'Whisky, rhum, vodka...', '#6b7280', 4, true),
  
  -- Spa
  ((SELECT id FROM pos_outlets WHERE code = 'SPA' AND org_id = get_current_user_org_id()), 'MASSAGE', 'Massages', 'Soins de massage', '#ec4899', 1, true),
  ((SELECT id FROM pos_outlets WHERE code = 'SPA' AND org_id = get_current_user_org_id()), 'FACIAL', 'Soins visage', 'Traitements du visage', '#8b5cf6', 2, true),
  ((SELECT id FROM pos_outlets WHERE code = 'SPA' AND org_id = get_current_user_org_id()), 'BODY', 'Soins corps', 'Gommages et enveloppements', '#06b6d4', 3, true);

-- Insérer des produits avec des prix réalistes
INSERT INTO pos_products (outlet_id, category_id, code, name, description, base_price, preparation_time, is_active, current_stock, min_stock) VALUES
  -- Restaurant - Entrées
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'ENTRY'), 
   'SAL-CESAR', 'Salade César', 'Salade romaine, parmesan, croutons, sauce César', 8500, 10, true, 50, 10),
  
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'ENTRY'), 
   'SOUP-TOMATE', 'Soupe de tomate', 'Velouté de tomates fraîches, basilic', 6500, 8, true, 30, 5),
   
  -- Restaurant - Plats principaux
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'MAIN'), 
   'STEAK-FRITES', 'Steak Frites', 'Entrecôte grillée 300g, frites maison', 28500, 25, true, 20, 5),
   
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'MAIN'), 
   'POISSON-GRILL', 'Poisson Grillé', 'Dorade royale grillée, légumes de saison', 32500, 20, true, 15, 3),
   
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'MAIN'), 
   'PASTA-CARBO', 'Pâtes Carbonara', 'Spaghettis, lardons, crème fraîche, parmesan', 18500, 15, true, 40, 10),
   
  -- Restaurant - Desserts
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'DESERT'), 
   'TIRAMISU', 'Tiramisu', 'Tiramisu traditionnel italien', 7500, 5, true, 25, 5),
   
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'DESERT'), 
   'TARTE-CHOCO', 'Tarte au Chocolat', 'Tarte au chocolat noir, chantilly', 8500, 5, true, 20, 3),
   
  -- Restaurant - Boissons
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'DRINKS'), 
   'CAFE-EXPRESSO', 'Café Expresso', 'Café italien corsé', 2500, 3, true, 100, 20),
   
  ((SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'DRINKS'), 
   'JUS-ORANGE', 'Jus d''Orange', 'Jus d''orange pressé fraîchement', 3500, 3, true, 50, 10),
   
  -- Bar - Cocktails
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'COCKTAIL'), 
   'MOJITO', 'Mojito', 'Rhum blanc, menthe, citron vert, eau gazeuse', 12500, 8, true, 30, 5),
   
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'COCKTAIL'), 
   'PINA-COLADA', 'Piña Colada', 'Rhum, lait de coco, ananas', 14500, 10, true, 25, 5),
   
  -- Bar - Vins
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'WINE'), 
   'BORDEAUX-ROUGE', 'Bordeaux Rouge', 'Vin rouge Bordeaux 2020', 45000, 2, true, 12, 2),
   
  -- Bar - Bières
  ((SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'BEER'), 
   'BIERE-LOCALE', 'Bière Locale', 'Bière artisanale locale 33cl', 4500, 2, true, 48, 12),
   
  -- Spa - Massages
  ((SELECT id FROM pos_outlets WHERE code = 'SPA' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'MASSAGE'), 
   'MASSAGE-RELAXANT', 'Massage Relaxant', 'Massage corps entier 60 min', 65000, 60, true, 8, 2),
   
  ((SELECT id FROM pos_outlets WHERE code = 'SPA' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'MASSAGE'), 
   'MASSAGE-PIERRE', 'Massage Pierres Chaudes', 'Massage aux pierres chaudes 90 min', 85000, 90, true, 6, 1),
   
  -- Spa - Soins visage
  ((SELECT id FROM pos_outlets WHERE code = 'SPA' AND org_id = get_current_user_org_id()), 
   (SELECT id FROM pos_categories WHERE code = 'FACIAL'), 
   'SOIN-HYDRATANT', 'Soin Hydratant', 'Soin du visage hydratant 45 min', 35000, 45, true, 10, 2);

-- Insérer des tables pour le restaurant et le bar
INSERT INTO pos_tables (org_id, outlet_id, table_number, capacity, zone, status, is_active) VALUES
  -- Restaurant
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), '01', 2, 'Terrasse', 'available', true),
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), '02', 4, 'Salle principale', 'available', true),
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), '03', 6, 'Salle principale', 'occupied', true),
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), '04', 2, 'Terrasse', 'available', true),
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), '05', 8, 'Salon privé', 'reserved', true),
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), '06', 4, 'Salle principale', 'available', true),
  
  -- Bar
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 'B01', 3, 'Comptoir', 'available', true),
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 'B02', 4, 'Lounge', 'available', true),
  (get_current_user_org_id(), (SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 'B03', 6, 'Terrasse bar', 'occupied', true);

-- Créer une session POS active pour le restaurant
INSERT INTO pos_sessions (org_id, outlet_id, session_number, cashier_id, opening_cash, status, started_at, total_sales, total_transactions) VALUES
  (get_current_user_org_id(), 
   (SELECT id FROM pos_outlets WHERE code = 'REST' AND org_id = get_current_user_org_id()), 
   'SES-' || extract(epoch from now())::text, 
   auth.uid(), 
   50000, 
   'open', 
   now(), 
   0, 
   0);

-- Créer une session POS active pour le bar
INSERT INTO pos_sessions (org_id, outlet_id, session_number, cashier_id, opening_cash, status, started_at, total_sales, total_transactions) VALUES
  (get_current_user_org_id(), 
   (SELECT id FROM pos_outlets WHERE code = 'BAR' AND org_id = get_current_user_org_id()), 
   'SES-' || (extract(epoch from now()) + 1)::text, 
   auth.uid(), 
   30000, 
   'open', 
   now(), 
   0, 
   0);