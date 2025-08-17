-- Phase 3A FINALE - Dernières 9 fonctions search_path

-- Corriger les dernières fonctions sans SET search_path

-- 1. log_user_activity
CREATE OR REPLACE FUNCTION public.log_user_activity(p_action text, p_entity_type text, p_entity_id uuid DEFAULT NULL::uuid, p_entity_name text DEFAULT NULL::text, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.activity_logs (
    org_id, user_id, action, entity_type, entity_id, 
    entity_name, description, metadata
  ) VALUES (
    get_current_user_org_id(), auth.uid(), p_action, p_entity_type, 
    p_entity_id, p_entity_name, p_description, p_metadata
  );
END;
$function$;

-- 2. create_notification
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_title text, p_message text, p_type text DEFAULT 'info'::text, p_priority text DEFAULT 'medium'::text, p_action_url text DEFAULT NULL::text, p_context_id uuid DEFAULT NULL::uuid, p_context_type text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_notification_id UUID;
  v_org_id UUID;
BEGIN
  v_org_id := get_current_user_org_id();
  
  INSERT INTO public.notifications (
    org_id, user_id, title, message, type, priority,
    action_url, context_id, context_type, metadata, expires_at
  ) VALUES (
    v_org_id, p_user_id, p_title, p_message, p_type, p_priority,
    p_action_url, p_context_id, p_context_type, p_metadata, p_expires_at
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$function$;

-- 3. generate_fiscal_archive
CREATE OR REPLACE FUNCTION public.generate_fiscal_archive(p_org_id uuid, p_archive_type text, p_period_start date, p_period_end date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_archive_id UUID;
  v_certificate_number TEXT;
  v_hash_signature TEXT;
  v_digital_signature TEXT;
  v_archive_data JSONB;
BEGIN
  v_certificate_number := 'NF525-' || to_char(now(), 'YYYY') || '-' || p_org_id || '-' || extract(epoch from now());
  
  SELECT jsonb_build_object(
    'orders', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', po.id,
          'order_number', po.order_number,
          'total_amount', po.total_amount,
          'tax_amount', po.tax_amount,
          'status', po.status,
          'created_at', po.created_at
        )
      ), '[]'::jsonb)
      FROM public.pos_orders po
      WHERE po.org_id = p_org_id
      AND DATE(po.created_at) BETWEEN p_period_start AND p_period_end
    ),
    'payments', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', pt.id,
          'amount', pt.amount,
          'payment_method', pt.payment_method,
          'created_at', pt.created_at
        )
      ), '[]'::jsonb)
      FROM public.payment_transactions pt
      WHERE pt.org_id = p_org_id
      AND DATE(pt.created_at) BETWEEN p_period_start AND p_period_end
    )
  ) INTO v_archive_data;
  
  v_hash_signature := encode(sha256(v_archive_data::text::bytea), 'hex');
  v_digital_signature := encode(sha256((v_hash_signature || v_certificate_number)::bytea), 'hex');
  
  INSERT INTO public.fiscal_archives (
    org_id,
    archive_date,
    archive_type,
    period_start,
    period_end,
    archive_data,
    hash_signature,
    certificate_number,
    software_version,
    digital_signature,
    status,
    created_by
  ) VALUES (
    p_org_id,
    CURRENT_DATE,
    p_archive_type,
    p_period_start,
    p_period_end,
    v_archive_data,
    v_hash_signature,
    v_certificate_number,
    'POS-V1.0.0',
    v_digital_signature,
    'processed',
    auth.uid()
  ) RETURNING id INTO v_archive_id;
  
  INSERT INTO public.fiscal_compliance_logs (
    org_id,
    event_type,
    event_description,
    archive_id,
    performed_by
  ) VALUES (
    p_org_id,
    'archive_created',
    'Fiscal archive created for period ' || p_period_start || ' to ' || p_period_end,
    v_archive_id,
    auth.uid()
  );
  
  RETURN v_archive_id;
END;
$function$;

-- 4. search_guests_secure
CREATE OR REPLACE FUNCTION public.search_guests_secure(search_term text, limit_count integer)
 RETURNS TABLE(id uuid, first_name text, last_name text, email text, phone text, guest_type text, masked_document text, city text, country text)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, g.first_name, g.last_name, g.email,
        g.phone, g.guest_type,
        CASE WHEN LENGTH(g.document_number) > 4 
             THEN LEFT(g.document_number, 4) || '***'
             ELSE g.document_number
        END as masked_document,
        g.city, g.country
    FROM guests g
    WHERE (
        g.first_name ILIKE '%' || search_term || '%' OR
        g.last_name ILIKE '%' || search_term || '%' OR
        g.email ILIKE '%' || search_term || '%' OR
        g.phone ILIKE '%' || search_term || '%'
    )
    ORDER BY g.last_name, g.first_name
    LIMIT limit_count;
END;
$function$;

-- 5. calculate_organization_module_cost
CREATE OR REPLACE FUNCTION public.calculate_organization_module_cost(p_org_id uuid)
 RETURNS TABLE(total_monthly_cost numeric, total_setup_fees numeric, module_count integer, active_modules jsonb)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_monthly_cost numeric := 0;
  v_setup_fees numeric := 0;
  v_count integer := 0;
  v_modules jsonb := '[]'::jsonb;
BEGIN
  SELECT 
    COALESCE(SUM(
      COALESCE(om.custom_price, m.base_price_monthly) * dt.price_modifier
    ), 0),
    COALESCE(SUM(dt.setup_fee), 0),
    COUNT(*)::integer,
    jsonb_agg(jsonb_build_object(
      'module_code', m.code,
      'module_name', m.name,
      'deployment_type', dt.name,
      'monthly_cost', COALESCE(om.custom_price, m.base_price_monthly) * dt.price_modifier,
      'is_trial', om.trial_until IS NOT NULL AND om.trial_until >= CURRENT_DATE
    ))
  INTO v_monthly_cost, v_setup_fees, v_count, v_modules
  FROM organization_modules om
  JOIN modules m ON om.module_id = m.id
  JOIN deployment_types dt ON om.deployment_type_id = dt.id
  WHERE om.org_id = p_org_id AND om.is_active = true;
  
  RETURN QUERY SELECT v_monthly_cost, v_setup_fees, v_count, v_modules;
END;
$function$;

-- 6. generate_fiscal_event_hash
CREATE OR REPLACE FUNCTION public.generate_fiscal_event_hash(p_sequence_number bigint, p_event_type text, p_event_timestamp timestamp with time zone, p_reference_type text, p_reference_id uuid, p_event_data jsonb, p_previous_hash text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  canonical_string TEXT;
  hash_result TEXT;
BEGIN
  canonical_string := 
    p_sequence_number::TEXT || '|' ||
    p_event_type || '|' ||
    extract(epoch from p_event_timestamp)::TEXT || '|' ||
    p_reference_type || '|' ||
    p_reference_id::TEXT || '|' ||
    p_event_data::TEXT || '|' ||
    p_previous_hash;
  
  hash_result := encode(digest(canonical_string, 'sha256'), 'hex');
  
  RETURN hash_result;
END;
$function$;

-- 7. get_next_fiscal_sequence
CREATE OR REPLACE FUNCTION public.get_next_fiscal_sequence(p_org_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_seq BIGINT;
BEGIN
  SELECT COALESCE(MAX(sequence_number), 0) + 1 
  INTO next_seq
  FROM public.pos_fiscal_events 
  WHERE org_id = p_org_id;
  
  RETURN next_seq;
END;
$function$;

-- 8. get_last_fiscal_hash
CREATE OR REPLACE FUNCTION public.get_last_fiscal_hash(p_org_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  last_hash TEXT;
BEGIN
  SELECT event_hash 
  INTO last_hash
  FROM public.pos_fiscal_events 
  WHERE org_id = p_org_id 
  ORDER BY sequence_number DESC 
  LIMIT 1;
  
  RETURN COALESCE(last_hash, '0000000000000000000000000000000000000000000000000000000000000000');
END;
$function$;

-- 9. create_fiscal_event
CREATE OR REPLACE FUNCTION public.create_fiscal_event(p_org_id uuid, p_event_type text, p_reference_type text, p_reference_id uuid, p_event_data jsonb, p_cashier_id uuid DEFAULT NULL::uuid, p_pos_station_id text DEFAULT 'POS-01'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sequence_number BIGINT;
  v_previous_hash TEXT;
  v_event_hash TEXT;
  v_digital_signature TEXT;
  v_event_id UUID;
  v_timestamp TIMESTAMPTZ := now();
BEGIN
  v_sequence_number := public.get_next_fiscal_sequence(p_org_id);
  v_previous_hash := public.get_last_fiscal_hash(p_org_id);
  
  v_event_hash := public.generate_fiscal_event_hash(
    v_sequence_number,
    p_event_type,
    v_timestamp,
    p_reference_type,
    p_reference_id,
    p_event_data,
    v_previous_hash
  );
  
  v_digital_signature := encode(digest(v_event_hash || p_org_id::TEXT, 'sha256'), 'hex');
  
  INSERT INTO public.pos_fiscal_events (
    org_id,
    sequence_number,
    event_type,
    event_timestamp,
    reference_type,
    reference_id,
    event_data,
    previous_hash,
    event_hash,
    digital_signature,
    cashier_id,
    pos_station_id,
    created_by
  ) VALUES (
    p_org_id,
    v_sequence_number,
    p_event_type,
    v_timestamp,
    p_reference_type,
    p_reference_id,
    p_event_data,
    v_previous_hash,
    v_event_hash,
    v_digital_signature,
    p_cashier_id,
    p_pos_station_id,
    auth.uid()
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$function$;