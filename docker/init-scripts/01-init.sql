-- Initialize PostgreSQL for self-hosted AfricaSuite
-- This script replaces Supabase for on-premise deployments

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create basic auth schema (simplified Supabase auth replacement)
CREATE SCHEMA IF NOT EXISTS auth;

-- Users table (simplified auth.users replacement)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    email_confirmed_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    confirmation_token VARCHAR(255),
    confirmation_sent_at TIMESTAMPTZ,
    recovery_token VARCHAR(255),
    recovery_sent_at TIMESTAMPTZ,
    email_change_token_new VARCHAR(255),
    email_change VARCHAR(255),
    email_change_sent_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    phone VARCHAR(15),
    phone_confirmed_at TIMESTAMPTZ,
    phone_change VARCHAR(15),
    phone_change_token VARCHAR(255),
    phone_change_sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ DEFAULT NOW(),
    email_change_token_current VARCHAR(255) DEFAULT '',
    email_change_confirm_status SMALLINT DEFAULT 0,
    banned_until TIMESTAMPTZ,
    reauthentication_token VARCHAR(255),
    reauthentication_sent_at TIMESTAMPTZ,
    is_sso_user BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- Create public schema tables (sample - based on AfricaSuite schema)
CREATE TABLE IF NOT EXISTS public.hotel_settings (
    org_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Mon Hôtel',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    default_currency VARCHAR(3) DEFAULT 'EUR',
    default_language VARCHAR(5) DEFAULT 'fr',
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App users table
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.hotel_settings(org_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    login VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    profile_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles
CREATE TYPE app_role AS ENUM (
    'super_admin',
    'admin', 
    'manager',
    'user',
    'pos_server',
    'pos_cashier', 
    'pos_manager'
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.hotel_settings(org_id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, org_id)
);

-- Create default organization
INSERT INTO public.hotel_settings (name, created_at, updated_at) 
VALUES ('AfricaSuite Demo Hotel', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create default admin user
INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    confirmed_at,
    raw_user_meta_data,
    created_at, 
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@africasuite.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    '{"full_name": "Administrateur AfricaSuite"}',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Link admin user to organization
INSERT INTO public.app_users (
    user_id, 
    org_id, 
    email, 
    full_name, 
    login, 
    active
) SELECT 
    '00000000-0000-0000-0000-000000000001',
    org_id,
    'admin@africasuite.com',
    'Administrateur AfricaSuite',
    'admin',
    TRUE
FROM public.hotel_settings 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Assign admin role
INSERT INTO public.user_roles (
    user_id, 
    org_id, 
    role
) SELECT 
    '00000000-0000-0000-0000-000000000001',
    org_id,
    'admin'::app_role
FROM public.hotel_settings 
LIMIT 1
ON CONFLICT DO NOTHING;

COMMIT;