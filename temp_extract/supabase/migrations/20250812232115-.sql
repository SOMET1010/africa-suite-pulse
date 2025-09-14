-- Corriger la structure des tables POS et ajouter le système Room Charge

-- Ajouter les colonnes manquantes à pos_order_items
ALTER TABLE pos_order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;

-- Mettre à jour les colonnes existantes si elles sont vides
UPDATE pos_order_items 
SET 
  product_name = COALESCE(product_name, 'Produit'),
  quantity = COALESCE(quantity, 1),
  unit_price = COALESCE(unit_price, 0),
  total_price = COALESCE(total_price, 0)
WHERE product_name IS NULL OR quantity IS NULL OR unit_price IS NULL OR total_price IS NULL;

-- Rendre les nouvelles colonnes NOT NULL après mise à jour
ALTER TABLE pos_order_items 
ALTER COLUMN product_name SET NOT NULL,
ALTER COLUMN quantity SET NOT NULL,
ALTER COLUMN unit_price SET NOT NULL,
ALTER COLUMN total_price SET NOT NULL;

-- Créer la table des Room Charges (charges de chambre)
CREATE TABLE IF NOT EXISTS public.room_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  reservation_id UUID NOT NULL,
  pos_order_id UUID,
  room_number TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_signature TEXT, -- Base64 de la signature
  charge_type TEXT NOT NULL DEFAULT 'pos', -- 'pos', 'service', 'manual'
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'XOF',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'transferred', 'cancelled'
  transferred_at TIMESTAMP WITH TIME ZONE,
  transferred_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS sur room_charges
ALTER TABLE public.room_charges ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour room_charges
CREATE POLICY "Users can manage room charges for their org" 
ON public.room_charges 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Ajouter une méthode de paiement "Room Charge" en utilisant 'voucher' comme kind
INSERT INTO public.payment_methods (org_id, code, label, kind, capture_mode, active, metadata)
SELECT 
  hs.org_id,
  'ROOM_CHARGE',
  'Facturation Chambre',
  'voucher', -- Utiliser un kind existant
  'passive',
  true,
  '{"icon": "🏨", "color": "#3b82f6", "requires_room": true, "requires_signature": true}'::jsonb
FROM public.hotel_settings hs
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_methods pm 
  WHERE pm.org_id = hs.org_id AND pm.code = 'ROOM_CHARGE'
);

-- Fonction pour transférer les charges vers folio
CREATE OR REPLACE FUNCTION public.transfer_room_charge_to_folio(p_room_charge_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_room_charge room_charges%ROWTYPE;
  v_invoice_id BIGINT;
  v_service_id UUID;
BEGIN
  -- Récupérer la room charge
  SELECT * INTO v_room_charge 
  FROM public.room_charges 
  WHERE id = p_room_charge_id AND org_id = get_current_user_org_id();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room charge not found';
  END IF;
  
  IF v_room_charge.status != 'pending' THEN
    RAISE EXCEPTION 'Room charge already processed';
  END IF;
  
  -- Trouver ou créer une facture pour cette réservation
  SELECT id INTO v_invoice_id
  FROM public.invoices
  WHERE reservation_id = v_room_charge.reservation_id 
  AND status = 'pending'
  LIMIT 1;
  
  IF v_invoice_id IS NULL THEN
    -- Créer une nouvelle facture
    INSERT INTO public.invoices (
      org_id, reservation_id, guest_name, room_number, 
      status, folio_number, subtotal, total_amount
    )
    SELECT 
      v_room_charge.org_id,
      v_room_charge.reservation_id,
      v_room_charge.guest_name,
      v_room_charge.room_number,
      'pending',
      2, -- Folio extras
      0,
      0
    RETURNING id INTO v_invoice_id;
  END IF;
  
  -- Créer un service générique pour POS si il n'existe pas
  SELECT id INTO v_service_id
  FROM public.services
  WHERE org_id = v_room_charge.org_id AND code = 'POS_CHARGE'
  LIMIT 1;
  
  IF v_service_id IS NULL THEN
    INSERT INTO public.services (
      org_id, code, label, family_id, price
    )
    VALUES (
      v_room_charge.org_id,
      'POS_CHARGE',
      'Consommation Restaurant/Bar',
      NULL,
      0
    )
    RETURNING id INTO v_service_id;
  END IF;
  
  -- Ajouter l'item à la facture
  INSERT INTO public.invoice_items (
    org_id, invoice_id, service_code, description,
    quantity, unit_price, total_price, folio_number
  )
  VALUES (
    v_room_charge.org_id,
    v_invoice_id,
    'POS_CHARGE',
    v_room_charge.description,
    1,
    v_room_charge.amount,
    v_room_charge.amount,
    2
  );
  
  -- Ajouter le service à la réservation
  INSERT INTO public.reservation_services (
    org_id, reservation_id, service_id, quantity, 
    unit_price, total_price, folio_number, billing_condition,
    valid_from, valid_until, is_applied
  )
  VALUES (
    v_room_charge.org_id,
    v_room_charge.reservation_id,
    v_service_id,
    1,
    v_room_charge.amount,
    v_room_charge.amount,
    2,
    'stay',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day',
    true
  );
  
  -- Mettre à jour le statut de la room charge
  UPDATE public.room_charges
  SET 
    status = 'transferred',
    transferred_at = now(),
    transferred_by = auth.uid(),
    updated_at = now()
  WHERE id = p_room_charge_id;
  
  -- Mettre à jour le total de la facture
  UPDATE public.invoices
  SET 
    subtotal = (SELECT COALESCE(SUM(total_price), 0) FROM public.invoice_items WHERE invoice_id = v_invoice_id),
    total_amount = (SELECT COALESCE(SUM(total_price), 0) FROM public.invoice_items WHERE invoice_id = v_invoice_id),
    updated_at = now()
  WHERE id = v_invoice_id;
  
  RETURN true;
END;
$$;

-- Trigger pour mise à jour automatique des timestamps
CREATE TRIGGER update_room_charges_updated_at
BEFORE UPDATE ON public.room_charges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();