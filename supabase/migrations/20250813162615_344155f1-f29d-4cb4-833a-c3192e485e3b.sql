-- Créer la méthode de paiement Room Charge avec le bon type
INSERT INTO public.payment_methods (org_id, code, label, kind, capture_mode, active, metadata)
VALUES (
  (SELECT org_id FROM public.hotel_settings LIMIT 1),
  'ROOM_CHARGE',
  'Facturation Chambre',
  'check',
  'passive',
  true,
  '{"icon": "🏨", "color": "#3b82f6", "description": "Facturation directe sur la chambre du client"}'
) ON CONFLICT (org_id, code) DO UPDATE SET
  label = EXCLUDED.label,
  kind = EXCLUDED.kind,
  capture_mode = EXCLUDED.capture_mode,
  active = EXCLUDED.active,
  metadata = EXCLUDED.metadata;