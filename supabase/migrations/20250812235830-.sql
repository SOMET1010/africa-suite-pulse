-- Create test POS users with different roles
DO $$
DECLARE
  v_org_id UUID;
  v_server_user_id UUID := gen_random_uuid();
  v_cashier_user_id UUID := gen_random_uuid();
  v_manager_user_id UUID := gen_random_uuid();
BEGIN
  -- Get the first organization ID
  SELECT org_id INTO v_org_id FROM public.hotel_settings LIMIT 1;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found';
  END IF;
  
  -- Create POS users using the create_pos_user function
  -- Server user (PIN: 1234)
  PERFORM public.create_pos_user(
    v_org_id,
    v_server_user_id,
    '1234',
    'Marie Dubois',
    'pos_server',
    'SRV001'
  );
  
  -- Cashier user (PIN: 5678)
  PERFORM public.create_pos_user(
    v_org_id,
    v_cashier_user_id,
    '5678',
    'Jean Martin',
    'pos_cashier',
    'CSH001'
  );
  
  -- Manager user (PIN: 9999)
  PERFORM public.create_pos_user(
    v_org_id,
    v_manager_user_id,
    '9999',
    'Sophie Lefebvre',
    'pos_manager',
    'MGR001'
  );
  
  RAISE NOTICE 'Created 3 test POS users: Server (PIN: 1234), Cashier (PIN: 5678), Manager (PIN: 9999)';
END $$;