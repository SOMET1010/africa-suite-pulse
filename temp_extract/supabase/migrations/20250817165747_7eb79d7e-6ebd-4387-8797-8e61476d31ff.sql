-- Create test POS users with proper organization links
-- First, ensure we have the default organization
DO $$
DECLARE
    default_org_id UUID;
    test_user_1 UUID := '11111111-1111-1111-1111-111111111111';
    test_user_2 UUID := '22222222-2222-2222-2222-222222222222';
    test_user_3 UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    -- Get or use the default organization
    SELECT org_id INTO default_org_id FROM hotel_settings LIMIT 1;
    
    IF default_org_id IS NULL THEN
        INSERT INTO hotel_settings (name, created_at, updated_at) 
        VALUES ('AfricaSuite Demo Hotel', NOW(), NOW())
        RETURNING org_id INTO default_org_id;
    END IF;
    
    -- Create test users in auth.users if they don't exist
    INSERT INTO auth.users (
        id, email, encrypted_password, email_confirmed_at, confirmed_at,
        raw_user_meta_data, created_at, updated_at
    ) VALUES 
        (test_user_1, 'marie.pos@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(),
         '{"full_name": "Marie Serveur"}', NOW(), NOW()),
        (test_user_2, 'jean.pos@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(),
         '{"full_name": "Jean Caissier"}', NOW(), NOW()),
        (test_user_3, 'sophie.pos@test.com', crypt('password123', gen_salt('bf')), NOW(), NOW(),
         '{"full_name": "Sophie Manager"}', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    -- Create app_users entries
    INSERT INTO app_users (
        user_id, org_id, email, full_name, login, active
    ) VALUES 
        (test_user_1, default_org_id, 'marie.pos@test.com', 'Marie Serveur', 'marie', TRUE),
        (test_user_2, default_org_id, 'jean.pos@test.com', 'Jean Caissier', 'jean', TRUE),
        (test_user_3, default_org_id, 'sophie.pos@test.com', 'Sophie Manager', 'sophie', TRUE)
    ON CONFLICT (user_id, org_id) DO NOTHING;
    
    -- Create user roles
    INSERT INTO user_roles (user_id, org_id, role) VALUES 
        (test_user_1, default_org_id, 'pos_server'),
        (test_user_2, default_org_id, 'pos_cashier'),
        (test_user_3, default_org_id, 'pos_manager')
    ON CONFLICT (user_id, org_id) DO NOTHING;
    
    -- Create POS users with correct PIN hashes
    INSERT INTO pos_users (
        org_id, user_id, display_name, pin_hash, role, is_active
    ) VALUES 
        (default_org_id, test_user_1, 'Marie Serveur', md5('1234'), 'server', TRUE),
        (default_org_id, test_user_2, 'Jean Caissier', md5('5678'), 'cashier', TRUE),
        (default_org_id, test_user_3, 'Sophie Manager', md5('9999'), 'manager', TRUE)
    ON CONFLICT (org_id, user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        pin_hash = EXCLUDED.pin_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active;
        
    RAISE NOTICE 'Test POS users created for organization: %', default_org_id;
END $$;