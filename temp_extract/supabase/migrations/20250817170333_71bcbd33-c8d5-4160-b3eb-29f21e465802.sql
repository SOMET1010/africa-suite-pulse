-- Create test POS users one by one to avoid conflicts
DO $$
DECLARE
    default_org_id UUID;
    admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- Get the default organization
    SELECT org_id INTO default_org_id FROM hotel_settings LIMIT 1;
    
    -- Clear existing POS users for clean setup
    DELETE FROM pos_users WHERE org_id = default_org_id;
    
    -- Create first POS user with PIN 1234
    INSERT INTO pos_users (
        org_id, user_id, pin_hash, display_name, employee_code, is_active
    ) VALUES 
        (default_org_id, admin_user_id, md5('1234'), 'Marie Serveur', 'SRV001', TRUE);
        
    RAISE NOTICE 'Created POS user with PIN 1234 for organization: %', default_org_id;
END $$;