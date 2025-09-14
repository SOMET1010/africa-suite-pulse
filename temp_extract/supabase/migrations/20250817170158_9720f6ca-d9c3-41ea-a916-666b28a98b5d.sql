-- Create test POS users with correct column structure
DO $$
DECLARE
    default_org_id UUID;
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Get the default organization
    SELECT org_id INTO default_org_id FROM hotel_settings LIMIT 1;
    
    -- Clear existing POS users for clean setup
    DELETE FROM pos_users WHERE org_id = default_org_id;
    
    -- Create test POS users with correct columns (no 'role' column exists)
    INSERT INTO pos_users (
        org_id, user_id, pin_hash, display_name, employee_code, is_active
    ) VALUES 
        (default_org_id, admin_user_id, md5('1234'), 'Marie Serveur', 'SRV001', TRUE);
        
    -- Since we can only have one user_id per org, we'll create additional entries
    -- by inserting with different generated UUIDs but keeping the admin user reference
    INSERT INTO pos_users (
        id, org_id, user_id, pin_hash, display_name, employee_code, is_active
    ) VALUES 
        (gen_random_uuid(), default_org_id, admin_user_id, md5('5678'), 'Jean Caissier', 'CSH001', TRUE),
        (gen_random_uuid(), default_org_id, admin_user_id, md5('9999'), 'Sophie Manager', 'MGR001', TRUE)
    ON CONFLICT (org_id, user_id) DO UPDATE SET
        pin_hash = EXCLUDED.pin_hash,
        display_name = EXCLUDED.display_name,
        employee_code = EXCLUDED.employee_code;
        
    RAISE NOTICE 'Test POS users created for organization: %', default_org_id;
END $$;