-- Test de l'intégration FNE DGI
-- Insertion d'une commande test pour vérifier le système

-- 1. Créer une commande de test
INSERT INTO public.pos_orders (
  org_id,
  outlet_id,
  order_number,
  total_amount,
  tax_amount,
  status,
  fne_status
) VALUES (
  get_current_user_org_id(),
  (SELECT id FROM pos_outlets WHERE org_id = get_current_user_org_id() LIMIT 1),
  'TEST-FNE-001',
  15000,
  2250,
  'completed',
  'pending'
);

-- 2. Vérifier que la commande est créée
SELECT 
  id,
  order_number,
  total_amount,
  fne_status,
  created_at
FROM public.pos_orders 
WHERE order_number = 'TEST-FNE-001';

-- 3. Tester l'ajout manuel à la queue FNE
INSERT INTO public.fne_pending_invoices (
  org_id,
  order_id,
  invoice_payload,
  priority
) VALUES (
  get_current_user_org_id(),
  (SELECT id FROM pos_orders WHERE order_number = 'TEST-FNE-001'),
  jsonb_build_object(
    'orderId', (SELECT id FROM pos_orders WHERE order_number = 'TEST-FNE-001'),
    'orgId', get_current_user_org_id(),
    'orderNumber', 'TEST-FNE-001',
    'totalAmount', 15000,
    'taxAmount', 2250,
    'items', jsonb_build_array(
      jsonb_build_object(
        'name', 'Article Test FNE',
        'quantity', 1,
        'unitPrice', 15000,
        'totalPrice', 15000,
        'taxRate', 18
      )
    ),
    'timestamp', now()
  ),
  2
);

-- 4. Vérifier la queue
SELECT * FROM public.fne_pending_invoices WHERE org_id = get_current_user_org_id();