-- Fix the authenticate_pos_user function to use md5 instead of crypt
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_org_id uuid, p_pin text)
RETURNS TABLE(user_id uuid, display_name text, role_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_display_name TEXT;
  v_role_name TEXT;
BEGIN
  -- Find user with matching PIN hash using md5
  SELECT pu.user_id, pu.display_name INTO v_user_id, v_display_name
  FROM public.pos_users pu
  WHERE pu.org_id = p_org_id 
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true;
  
  IF v_user_id IS NULL THEN
    RETURN; -- Invalid PIN
  END IF;
  
  -- Get the user's POS role
  SELECT ur.role::TEXT INTO v_role_name
  FROM public.user_roles ur
  WHERE ur.user_id = v_user_id 
    AND ur.org_id = p_org_id
    AND ur.role IN ('pos_server', 'pos_cashier', 'pos_manager')
  LIMIT 1;
  
  -- Update last login time
  UPDATE public.pos_users 
  SET last_login_at = now(), updated_at = now()
  WHERE user_id = v_user_id AND org_id = p_org_id;
  
  -- Return user info
  RETURN QUERY SELECT v_user_id, v_display_name, COALESCE(v_role_name, 'pos_server');
END;
$$;

-- Create test POS users manually without foreign key issues
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
  
  -- Insert test users in auth.users first
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
  VALUES 
    (v_server_user_id, 'marie.dubois@test.com', 'temp', now(), now(), now(), '{"full_name": "Marie Dubois"}'::jsonb),
    (v_cashier_user_id, 'jean.martin@test.com', 'temp', now(), now(), now(), '{"full_name": "Jean Martin"}'::jsonb),
    (v_manager_user_id, 'sophie.lefebvre@test.com', 'temp', now(), now(), now(), '{"full_name": "Sophie Lefebvre"}'::jsonb)
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into app_users
  INSERT INTO public.app_users (user_id, org_id, email, full_name, login)
  VALUES 
    (v_server_user_id, v_org_id, 'marie.dubois@test.com', 'Marie Dubois', 'marie'),
    (v_cashier_user_id, v_org_id, 'jean.martin@test.com', 'Jean Martin', 'jean'),
    (v_manager_user_id, v_org_id, 'sophie.lefebvre@test.com', 'Sophie Lefebvre', 'sophie')
  ON CONFLICT (user_id, org_id) DO NOTHING;
  
  -- Insert POS users
  INSERT INTO public.pos_users (org_id, user_id, pin_hash, display_name, employee_code, created_by)
  VALUES 
    (v_org_id, v_server_user_id, md5('1234'), 'Marie Dubois', 'SRV001', v_server_user_id),
    (v_org_id, v_cashier_user_id, md5('5678'), 'Jean Martin', 'CSH001', v_cashier_user_id),
    (v_org_id, v_manager_user_id, md5('9999'), 'Sophie Lefebvre', 'MGR001', v_manager_user_id)
  ON CONFLICT (user_id, org_id) DO NOTHING;
  
  -- Assign roles
  INSERT INTO public.user_roles (user_id, org_id, role)
  VALUES 
    (v_server_user_id, v_org_id, 'pos_server'),
    (v_cashier_user_id, v_org_id, 'pos_cashier'),
    (v_manager_user_id, v_org_id, 'pos_manager')
  ON CONFLICT (user_id, org_id) DO UPDATE SET role = EXCLUDED.role;
  
END $$;