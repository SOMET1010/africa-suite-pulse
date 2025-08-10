-- Add missing columns to profiles table for user management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS login_code TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on expires_at queries
CREATE INDEX IF NOT EXISTS idx_profiles_expires_at ON public.profiles(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_login_code ON public.profiles(login_code);