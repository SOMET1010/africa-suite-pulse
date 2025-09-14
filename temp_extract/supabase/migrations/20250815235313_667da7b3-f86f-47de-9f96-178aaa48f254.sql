-- Create some test invoice data
INSERT INTO public.invoices (
  org_id,
  number,
  guest_name,
  guest_email,
  guest_phone,
  status,
  subtotal,
  tax_amount,
  total_amount,
  issue_date,
  due_date,
  description,
  room_number,
  check_in_date,
  check_out_date,
  nights_count
) 
SELECT 
  (SELECT org_id FROM app_users WHERE user_id = auth.uid() LIMIT 1) as org_id,
  'FAC-' || LPAD((ROW_NUMBER() OVER())::text, 6, '0') as number,
  guest_names.name as guest_name,
  guest_names.name || '@test.com' as guest_email,
  '+225 ' || (RANDOM() * 89999999 + 10000000)::int as guest_phone,
  (ARRAY['pending', 'paid', 'overdue'])[FLOOR(RANDOM() * 3 + 1)] as status,
  amounts.subtotal,
  ROUND(amounts.subtotal * 0.18, 2) as tax_amount,
  ROUND(amounts.subtotal * 1.18, 2) as total_amount,
  CURRENT_DATE - (RANDOM() * 30)::int as issue_date,
  CURRENT_DATE + (RANDOM() * 30)::int as due_date,
  'Facture de test générée automatiquement' as description,
  '10' || (RANDOM() * 9 + 1)::int as room_number,
  CURRENT_DATE - (RANDOM() * 30)::int as check_in_date,
  CURRENT_DATE - (RANDOM() * 20)::int as check_out_date,
  (RANDOM() * 7 + 1)::int as nights_count
FROM 
  (VALUES 
    ('Jean Dupont'),
    ('Marie Martin'),
    ('Pierre Kouassi'),
    ('Fatou Traore'),
    ('Ahmed Ben Ali')
  ) AS guest_names(name)
CROSS JOIN
  (VALUES 
    (85000),
    (125000),
    (67500),
    (156000),
    (92300)
  ) AS amounts(subtotal)
WHERE (SELECT org_id FROM app_users WHERE user_id = auth.uid() LIMIT 1) IS NOT NULL;