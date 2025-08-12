-- Fix security issues: Add search_path to functions
-- Update functions to have proper search_path security

CREATE OR REPLACE FUNCTION calculate_next_maintenance_date(
  equipment_id_param UUID
) RETURNS DATE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  freq_days INTEGER;
  last_date DATE;
  next_date DATE;
BEGIN
  SELECT maintenance_frequency_days, last_maintenance_date
  INTO freq_days, last_date
  FROM equipment
  WHERE id = equipment_id_param;
  
  IF last_date IS NULL THEN
    next_date := CURRENT_DATE + INTERVAL '1 day' * freq_days;
  ELSE
    next_date := last_date + INTERVAL '1 day' * freq_days;
  END IF;
  
  RETURN next_date;
END;
$$;

CREATE OR REPLACE FUNCTION update_next_maintenance_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.next_maintenance_date := calculate_next_maintenance_date(NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_spare_parts_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.movement_type = 'in' THEN
    UPDATE spare_parts 
    SET current_stock = current_stock + NEW.quantity,
        last_restocked_date = CASE WHEN NEW.reason = 'purchase' THEN CURRENT_DATE ELSE last_restocked_date END
    WHERE id = NEW.spare_part_id;
  ELSIF NEW.movement_type = 'out' THEN
    UPDATE spare_parts 
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.spare_part_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE spare_parts 
    SET current_stock = NEW.quantity
    WHERE id = NEW.spare_part_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_maintenance_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM maintenance_requests
  WHERE org_id = NEW.org_id
  AND request_number ~ '^MAINT-[0-9]+$';
  
  formatted_number := 'MAINT-' || LPAD(next_number::TEXT, 6, '0');
  NEW.request_number := formatted_number;
  
  RETURN NEW;
END;
$$;