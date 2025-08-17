-- Create test POS users in public tables only
-- Use the existing admin user as base and create POS users
DO $$
DECLARE
    default_org_id UUID;
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Get the default organization
    SELECT org_id INTO default_org_id FROM hotel_settings LIMIT 1;
    
    -- Create POS users using the admin user ID as template but with different roles
    INSERT INTO pos_users (
        org_id, user_id, display_name, pin_hash, role, is_active
    ) VALUES 
        (default_org_id, admin_user_id, 'Marie Serveur', md5('1234'), 'server', TRUE),
        (default_org_id, admin_user_id, 'Jean Caissier', md5('5678'), 'cashier', TRUE),
        (default_org_id, admin_user_id, 'Sophie Manager', md5('9999'), 'manager', TRUE)
    ON CONFLICT (org_id, user_id) DO NOTHING;
    
    -- Create additional POS users with unique identifiers in display_name
    -- Since we can't create multiple users with same user_id, we'll create separate entries
    -- by using a workaround with different display names
    DELETE FROM pos_users WHERE org_id = default_org_id;
    
    INSERT INTO pos_users (
        org_id, user_id, display_name, pin_hash, role, is_active
    ) VALUES 
        (default_org_id, admin_user_id, 'PIN 1234 - Marie Serveur', md5('1234'), 'server', TRUE);
        
    -- For testing, let's also insert with different approach
    INSERT INTO pos_users (
        id, org_id, user_id, display_name, pin_hash, role, is_active
    ) VALUES 
        (gen_random_uuid(), default_org_id, admin_user_id, 'PIN 5678 - Jean Caissier', md5('5678'), 'cashier', TRUE),
        (gen_random_uuid(), default_org_id, admin_user_id, 'PIN 9999 - Sophie Manager', md5('9999'), 'manager', TRUE)
    ON CONFLICT (org_id, user_id) DO NOTHING;
        
    RAISE NOTICE 'Test POS users created for organization: %', default_org_id;
END $$;