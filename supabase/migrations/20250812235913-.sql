-- Create test POS users manually with hashed PINs
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
  
  -- Insert POS users directly with simple hash
  INSERT INTO public.pos_users (org_id, user_id, pin_hash, display_name, employee_code, created_by)
  VALUES 
    (v_org_id, v_server_user_id, md5('1234'), 'Marie Dubois', 'SRV001', v_server_user_id),
    (v_org_id, v_cashier_user_id, md5('5678'), 'Jean Martin', 'CSH001', v_cashier_user_id),
    (v_org_id, v_manager_user_id, md5('9999'), 'Sophie Lefebvre', 'MGR001', v_manager_user_id);
  
  -- Assign roles
  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES 
    (v_server_user_id, v_org_id, 'pos_server'),
    (v_cashier_user_id, v_org_id, 'pos_cashier'),
    (v_manager_user_id, v_org_id, 'pos_manager');
  
END $$;