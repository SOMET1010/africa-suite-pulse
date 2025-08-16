-- Create helper functions for organization settings since table may not be in generated types yet

CREATE OR REPLACE FUNCTION public.get_organization_settings()
RETURNS TABLE(
  id uuid,
  org_id uuid,
  setting_key text,
  setting_value jsonb,
  category text,
  description text,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if organization_settings table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'organization_settings'
  ) THEN
    RETURN QUERY
    SELECT 
      os.id,
      os.org_id,
      os.setting_key,
      os.setting_value,
      os.category,
      os.description,
      os.is_active
    FROM public.organization_settings os
    WHERE os.org_id = get_current_user_org_id()
    AND os.is_active = true
    ORDER BY os.category;
  ELSE
    -- Return empty result if table doesn't exist yet
    RETURN;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_organization_setting(
  setting_key text,
  setting_value jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
  result jsonb;
BEGIN
  v_org_id := get_current_user_org_id();
  
  -- Check if organization_settings table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'organization_settings'
  ) THEN
    INSERT INTO public.organization_settings (
      org_id, setting_key, setting_value, category, is_active
    ) VALUES (
      v_org_id, setting_key, setting_value, 'general', true
    )
    ON CONFLICT (org_id, setting_key) 
    DO UPDATE SET 
      setting_value = EXCLUDED.setting_value,
      updated_at = now()
    RETURNING to_jsonb(organization_settings.*) INTO result;
    
    RETURN result;
  ELSE
    -- Return a basic success response if table doesn't exist
    RETURN jsonb_build_object('success', true, 'message', 'Settings table not available');
  END IF;
END;
$$;