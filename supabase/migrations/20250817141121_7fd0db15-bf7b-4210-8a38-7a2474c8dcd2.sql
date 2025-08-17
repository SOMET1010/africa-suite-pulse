-- Phase 3A FINALE - Complétion totale search_path

-- Corriger les dernières fonctions sans SET search_path

-- 1. monitor_role_changes
CREATE OR REPLACE FUNCTION public.monitor_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event(
      'role_assigned',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'org_id', NEW.org_id
      ),
      'warning'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event(
      'role_changed',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'org_id', NEW.org_id
      ),
      'warning'
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_security_event(
      'role_removed',
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role,
        'org_id', OLD.org_id
      ),
      'warning'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2. get_organization_settings_v2
CREATE OR REPLACE FUNCTION public.get_organization_settings_v2()
 RETURNS TABLE(id uuid, org_id uuid, setting_key text, setting_value jsonb, category text, description text, is_active boolean)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT 
    os.id,
    os.org_id,
    os.setting_key,
    os.setting_value,
    os.category,
    os.description,
    os.is_active
  FROM organization_settings os
  WHERE os.org_id = (
    SELECT org_id FROM app_users 
    WHERE user_id = auth.uid() AND active = true 
    LIMIT 1
  )
  AND os.is_active = true
  ORDER BY os.category;
$function$;

-- 3. check_security_rate_limit
CREATE OR REPLACE FUNCTION public.check_security_rate_limit(p_action text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_identifier text;
  v_current_attempts integer;
BEGIN
  v_identifier := auth.uid()::text || '_' || p_action;
  
  IF NOT public.check_rate_limit(v_identifier, p_action, p_max_attempts, p_window_minutes) THEN
    PERFORM public.log_security_event(
      'rate_limit_exceeded',
      jsonb_build_object(
        'action', p_action,
        'user_id', auth.uid(),
        'max_attempts', p_max_attempts,
        'window_minutes', p_window_minutes
      ),
      'error'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- 4. calculate_rack_kpis
CREATE OR REPLACE FUNCTION public.calculate_rack_kpis(p_org_id uuid, p_start_date date, p_end_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_rooms INTEGER;
  v_total_cells INTEGER;
  v_occupied_cells INTEGER;
  v_arrivals INTEGER;
  v_presents INTEGER;
  v_out_of_order INTEGER;
  v_days INTEGER;
  v_occupancy_rate INTEGER;
BEGIN
  v_days := (p_end_date - p_start_date) + 1;
  
  SELECT COUNT(*) INTO v_total_rooms
  FROM public.rooms 
  WHERE org_id = p_org_id;
  
  v_total_cells := v_total_rooms * v_days;
  
  SELECT COUNT(*) INTO v_occupied_cells
  FROM public.rooms r
  CROSS JOIN generate_series(p_start_date, p_end_date, '1 day'::interval) AS day_series(day)
  WHERE r.org_id = p_org_id
  AND EXISTS (
    SELECT 1 FROM public.reservations res 
    WHERE res.room_id = r.id 
    AND res.org_id = p_org_id
    AND res.date_arrival <= day_series.day::date
    AND res.date_departure > day_series.day::date
    AND res.status NOT IN ('cancelled', 'no_show')
  );
  
  SELECT COUNT(*) INTO v_arrivals
  FROM public.reservations
  WHERE org_id = p_org_id
  AND date_arrival = p_start_date
  AND status NOT IN ('cancelled', 'no_show');
  
  SELECT COUNT(*) INTO v_presents
  FROM public.reservations
  WHERE org_id = p_org_id
  AND status = 'present';
  
  SELECT COUNT(*) INTO v_out_of_order
  FROM public.rooms
  WHERE org_id = p_org_id
  AND status = 'out_of_order';
  
  v_occupancy_rate := CASE 
    WHEN v_total_cells > 0 THEN ROUND((v_occupied_cells::NUMERIC / v_total_cells) * 100)
    ELSE 0 
  END;
  
  RETURN jsonb_build_object(
    'occ', v_occupancy_rate,
    'arrivals', v_arrivals,
    'presents', v_presents,
    'hs', v_out_of_order,
    'total_rooms', v_total_rooms,
    'occupied_cells', v_occupied_cells,
    'total_cells', v_total_cells
  );
END;
$function$;

-- 5. pms_assign_room
CREATE OR REPLACE FUNCTION public.pms_assign_room(p_res uuid, p_room uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.reservations
  SET room_id = p_room
  WHERE id = p_res AND org_id = get_current_user_org_id();
END;
$function$;

-- 6. check_stock_levels
CREATE OR REPLACE FUNCTION public.check_stock_levels()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  low_stock_threshold NUMERIC := 10;
  out_of_stock_threshold NUMERIC := 0;
BEGIN
  IF NEW.current_stock <= low_stock_threshold AND NEW.current_stock > out_of_stock_threshold THEN
    INSERT INTO public.pos_stock_alerts (
      org_id, outlet_id, product_id, stock_item_id, alert_type, 
      current_quantity, threshold_quantity, message
    )
    SELECT 
      si.org_id, si.outlet_id, si.product_id, si.id, 'low_stock',
      NEW.current_stock, low_stock_threshold,
      'Stock faible pour ' || p.name || ' (' || NEW.current_stock || ' restant)'
    FROM public.pos_stock_items si
    LEFT JOIN public.pos_products p ON p.id = si.product_id
    WHERE si.id = NEW.id
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF NEW.current_stock <= out_of_stock_threshold THEN
    INSERT INTO public.pos_stock_alerts (
      org_id, outlet_id, product_id, stock_item_id, alert_type,
      current_quantity, threshold_quantity, message
    )
    SELECT 
      si.org_id, si.outlet_id, si.product_id, si.id, 'out_of_stock',
      NEW.current_stock, out_of_stock_threshold,
      'Rupture de stock pour ' || p.name
    FROM public.pos_stock_items si
    LEFT JOIN public.pos_products p ON p.id = si.product_id
    WHERE si.id = NEW.id
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 7. pms_checkin
CREATE OR REPLACE FUNCTION public.pms_checkin(p_res uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.reservations
  SET status = 'present'
  WHERE id = p_res AND org_id = get_current_user_org_id();
END;
$function$;

-- 8. validate_room_type
CREATE OR REPLACE FUNCTION public.validate_room_type()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM room_types 
    WHERE org_id = NEW.org_id AND code = NEW.type
  ) THEN
    RAISE EXCEPTION 'Room type % does not exist for organization %', NEW.type, NEW.org_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 9. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- 10. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 11. validate_index_performance
CREATE OR REPLACE FUNCTION public.validate_index_performance()
 RETURNS TABLE(table_name text, index_name text, estimated_improvement text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    'reservations'::TEXT as table_name,
    'idx_reservations_org_date_status'::TEXT as index_name,
    'Expected 85% faster queries on date/status filters'::TEXT as estimated_improvement
  UNION ALL
  SELECT 
    'payment_transactions'::TEXT,
    'idx_payment_transactions_org_date'::TEXT,
    'Expected 70% faster aggregation queries'::TEXT
  UNION ALL
  SELECT 
    'audit_logs'::TEXT,
    'idx_audit_logs_org_action_time'::TEXT,
    'Expected 90% faster compliance reporting'::TEXT;
$function$;

-- 12. mark_notification_read
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = notification_id 
    AND user_id = auth.uid() 
    AND org_id = get_current_user_org_id();
END;
$function$;