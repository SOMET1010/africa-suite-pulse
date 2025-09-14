-- Module Maintenance & Technique
-- Tables principales pour la gestion de la maintenance

-- Table des équipements
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  equipment_code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hvac', 'plumbing', 'electrical', 'elevator', 'kitchen', 'laundry', 'cleaning', 'security', 'other'
  location TEXT, -- 'room_123', 'lobby', 'kitchen', 'basement', etc.
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_until DATE,
  installation_date DATE,
  status TEXT NOT NULL DEFAULT 'operational', -- 'operational', 'maintenance', 'out_of_order', 'retired'
  maintenance_frequency_days INTEGER DEFAULT 30, -- Fréquence de maintenance préventive en jours
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  specifications JSONB DEFAULT '{}',
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Table des pièces détachées
CREATE TABLE public.spare_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  part_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'hvac', 'plumbing', 'electrical', 'mechanical', 'consumable', 'other'
  supplier TEXT,
  supplier_part_number TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  max_stock_level INTEGER DEFAULT 50,
  unit_cost NUMERIC(10,2),
  unit TEXT DEFAULT 'piece', -- 'piece', 'meter', 'liter', 'kg', etc.
  storage_location TEXT,
  last_restocked_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Table des demandes de maintenance
CREATE TABLE public.maintenance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  request_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  category TEXT NOT NULL, -- 'corrective', 'preventive', 'improvement'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  equipment_id UUID, -- Peut être NULL si ce n'est pas lié à un équipement spécifique
  location TEXT, -- Localisation spécifique (chambre, étage, zone)
  room_id UUID, -- Lien vers une chambre si applicable
  reported_by UUID, -- Utilisateur qui a signalé le problème
  assigned_to UUID, -- Technicien assigné
  estimated_duration_hours NUMERIC(5,2),
  estimated_cost NUMERIC(10,2),
  actual_duration_hours NUMERIC(5,2),
  actual_cost NUMERIC(10,2),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  parts_used JSONB DEFAULT '[]', -- Array des pièces utilisées avec quantités
  work_performed TEXT, -- Description du travail effectué
  photos_before JSONB DEFAULT '[]', -- URLs des photos avant intervention
  photos_after JSONB DEFAULT '[]', -- URLs des photos après intervention
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Table de suivi des stocks de pièces détachées
CREATE TABLE public.spare_parts_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  spare_part_id UUID NOT NULL REFERENCES spare_parts(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10,2),
  reason TEXT, -- 'purchase', 'used_for_maintenance', 'inventory_adjustment', 'expired', etc.
  maintenance_request_id UUID, -- Si utilisé pour une maintenance
  reference_document TEXT, -- Numéro de facture, bon de commande, etc.
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Table des plannings de maintenance préventive
CREATE TABLE public.maintenance_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  frequency_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'
  frequency_value INTEGER NOT NULL DEFAULT 1, -- Tous les X jours/semaines/mois
  last_executed_date DATE,
  next_execution_date DATE NOT NULL,
  task_template TEXT NOT NULL, -- Description des tâches à effectuer
  estimated_duration_hours NUMERIC(5,2),
  required_parts JSONB DEFAULT '[]', -- Liste des pièces potentiellement nécessaires
  assigned_technician UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Fonction pour calculer la prochaine date de maintenance
CREATE OR REPLACE FUNCTION calculate_next_maintenance_date(
  equipment_id_param UUID
) RETURNS DATE AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement la prochaine date de maintenance
CREATE OR REPLACE FUNCTION update_next_maintenance_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.next_maintenance_date := calculate_next_maintenance_date(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_next_maintenance_date
  BEFORE INSERT OR UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_next_maintenance_date();

-- Trigger pour mettre à jour le stock après mouvement de pièces
CREATE OR REPLACE FUNCTION update_spare_parts_stock()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_spare_parts_stock
  AFTER INSERT ON spare_parts_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_spare_parts_stock();

-- Fonction pour générer automatiquement les numéros de demande de maintenance
CREATE OR REPLACE FUNCTION generate_maintenance_request_number()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_maintenance_request_number
  BEFORE INSERT ON maintenance_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
  EXECUTE FUNCTION generate_maintenance_request_number();

-- Indexes pour optimiser les performances
CREATE INDEX idx_equipment_org_id ON equipment(org_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_next_maintenance ON equipment(next_maintenance_date);
CREATE INDEX idx_spare_parts_org_id ON spare_parts(org_id);
CREATE INDEX idx_spare_parts_stock_level ON spare_parts(current_stock, min_stock_level);
CREATE INDEX idx_maintenance_requests_org_id ON maintenance_requests(org_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX idx_maintenance_requests_scheduled_date ON maintenance_requests(scheduled_date);
CREATE INDEX idx_maintenance_schedules_org_id ON maintenance_schedules(org_id);
CREATE INDEX idx_maintenance_schedules_next_execution ON maintenance_schedules(next_execution_date);

-- RLS Policies
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE spare_parts_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;

-- Policies pour equipment
CREATE POLICY "Users can manage equipment for their org" ON equipment
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- Policies pour spare_parts
CREATE POLICY "Users can manage spare parts for their org" ON spare_parts
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- Policies pour maintenance_requests
CREATE POLICY "Users can manage maintenance requests for their org" ON maintenance_requests
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- Policies pour spare_parts_movements
CREATE POLICY "Users can manage spare parts movements for their org" ON spare_parts_movements
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- Policies pour maintenance_schedules
CREATE POLICY "Users can manage maintenance schedules for their org" ON maintenance_schedules
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());