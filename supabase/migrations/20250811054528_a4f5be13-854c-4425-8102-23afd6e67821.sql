-- COMPREHENSIVE RLS SECURITY FIX
-- Fix all permissive policies and add missing protections

-- Step 1: Fix handle_new_user function to use app_users instead of profiles_backup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Ensure there's at least one organization
  IF NOT EXISTS (SELECT 1 FROM public.hotel_settings) THEN
    INSERT INTO public.hotel_settings (org_id, name)
    VALUES (gen_random_uuid(), 'Mon Hôtel');
  END IF;
  
  -- Create user profile in app_users with first available organization
  INSERT INTO public.app_users (user_id, org_id, email, full_name, login)
  SELECT 
    NEW.id,
    (SELECT org_id FROM public.hotel_settings LIMIT 1),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    LOWER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 10))
  WHERE NOT EXISTS (
    SELECT 1 FROM public.app_users WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Step 2: Drop all overly permissive policies
DROP POLICY IF EXISTS "Users can manage arrangement services" ON arrangement_services;
DROP POLICY IF EXISTS "Users can read arrangement services" ON arrangement_services;
DROP POLICY IF EXISTS "Users can manage arrangements" ON arrangements;
DROP POLICY IF EXISTS "Users can read arrangements" ON arrangements;
DROP POLICY IF EXISTS "Users can manage service families" ON service_families;
DROP POLICY IF EXISTS "Users can read service families" ON service_families;
DROP POLICY IF EXISTS "Users can manage services" ON services;
DROP POLICY IF EXISTS "Users can read services" ON services;
DROP POLICY IF EXISTS "Authenticated can read reservations" ON reservations;
DROP POLICY IF EXISTS "Authenticated can update reservations" ON reservations;
DROP POLICY IF EXISTS "sel_res" ON reservations;
DROP POLICY IF EXISTS "upd_res" ON reservations;
DROP POLICY IF EXISTS "Authenticated can manage room types" ON room_types;
DROP POLICY IF EXISTS "Authenticated can read room types" ON room_types;
DROP POLICY IF EXISTS "Authenticated can delete room types" ON room_types;
DROP POLICY IF EXISTS "Authenticated can insert room types" ON room_types;
DROP POLICY IF EXISTS "Authenticated can delete rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated can read rooms" ON rooms;
DROP POLICY IF EXISTS "sel_rooms" ON rooms;
DROP POLICY IF EXISTS "upd_rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated can manage hotel settings" ON hotel_settings;
DROP POLICY IF EXISTS "Authenticated can read hotel settings" ON hotel_settings;

-- Step 3: Create secure policies for arrangement_services
CREATE POLICY "Users can view arrangement services for their org" 
ON arrangement_services FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM arrangements a 
  WHERE a.id = arrangement_services.arrangement_id 
  AND a.org_id = get_current_user_org_id()
));

CREATE POLICY "Users can manage arrangement services for their org" 
ON arrangement_services FOR ALL 
USING (EXISTS (
  SELECT 1 FROM arrangements a 
  WHERE a.id = arrangement_services.arrangement_id 
  AND a.org_id = get_current_user_org_id()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM arrangements a 
  WHERE a.id = arrangement_services.arrangement_id 
  AND a.org_id = get_current_user_org_id()
));

-- Step 4: Create secure policies for arrangements
CREATE POLICY "Users can view arrangements for their org" 
ON arrangements FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage arrangements for their org" 
ON arrangements FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Step 5: Create secure policies for service_families
CREATE POLICY "Users can view service families for their org" 
ON service_families FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage service families for their org" 
ON service_families FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Step 6: Create secure policies for services
CREATE POLICY "Users can view services for their org" 
ON services FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage services for their org" 
ON services FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Step 7: Create secure policies for reservations
CREATE POLICY "Users can view reservations for their org" 
ON reservations FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage reservations for their org" 
ON reservations FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Step 8: Create secure policies for room_types
CREATE POLICY "Users can view room types for their org" 
ON room_types FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage room types for their org" 
ON room_types FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Step 9: Create secure policies for rooms
CREATE POLICY "Users can view rooms for their org" 
ON rooms FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage rooms for their org" 
ON rooms FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Step 10: Create secure policies for hotel_settings
CREATE POLICY "Users can view hotel settings for their org" 
ON hotel_settings FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage hotel settings for their org" 
ON hotel_settings FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Step 11: Add RLS policies for previously unprotected tables

-- Enable RLS on all tables that need it
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_money_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for app_users
CREATE POLICY "Users can view app users for their org" 
ON app_users FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage app users for their org" 
ON app_users FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies for currencies
CREATE POLICY "Users can view currencies for their org" 
ON currencies FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage currencies for their org" 
ON currencies FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies for mobile_money_accounts
CREATE POLICY "Users can view mobile money accounts for their org" 
ON mobile_money_accounts FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage mobile money accounts for their org" 
ON mobile_money_accounts FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies for payment_methods
CREATE POLICY "Users can view payment methods for their org" 
ON payment_methods FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage payment methods for their org" 
ON payment_methods FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies for payment_terminals
CREATE POLICY "Users can view payment terminals for their org" 
ON payment_terminals FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage payment terminals for their org" 
ON payment_terminals FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies for staff_invitations
CREATE POLICY "Users can view staff invitations for their org" 
ON staff_invitations FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage staff invitations for their org" 
ON staff_invitations FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies for user_profiles
CREATE POLICY "Users can view user profiles for their org" 
ON user_profiles FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage user profiles for their org" 
ON user_profiles FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies for permissions (global read access)
CREATE POLICY "Authenticated users can view permissions" 
ON permissions FOR SELECT 
TO authenticated 
USING (true);

-- Policies for profile_permissions (link to user profiles)
CREATE POLICY "Users can view profile permissions for their org" 
ON profile_permissions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.id = profile_permissions.profile_id 
  AND up.org_id = get_current_user_org_id()
));

CREATE POLICY "Users can manage profile permissions for their org" 
ON profile_permissions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.id = profile_permissions.profile_id 
  AND up.org_id = get_current_user_org_id()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_profiles up 
  WHERE up.id = profile_permissions.profile_id 
  AND up.org_id = get_current_user_org_id()
));

-- Policies for organization_members and user_organizations (user-specific)
CREATE POLICY "Users can view their own organization memberships" 
ON organization_members FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own user organizations" 
ON user_organizations FOR SELECT 
USING (user_id = auth.uid());

-- Step 12: Add missing foreign keys for data integrity
ALTER TABLE app_users 
ADD CONSTRAINT fk_app_users_org_id 
FOREIGN KEY (org_id) REFERENCES hotel_settings(org_id);

ALTER TABLE rooms 
ADD CONSTRAINT fk_rooms_room_type_id 
FOREIGN KEY (room_type_id) REFERENCES room_types(id);

ALTER TABLE services 
ADD CONSTRAINT fk_services_family_id 
FOREIGN KEY (family_id) REFERENCES service_families(id);

ALTER TABLE arrangement_services 
ADD CONSTRAINT fk_arrangement_services_arrangement_id 
FOREIGN KEY (arrangement_id) REFERENCES arrangements(id);

ALTER TABLE arrangement_services 
ADD CONSTRAINT fk_arrangement_services_service_id 
FOREIGN KEY (service_id) REFERENCES services(id);