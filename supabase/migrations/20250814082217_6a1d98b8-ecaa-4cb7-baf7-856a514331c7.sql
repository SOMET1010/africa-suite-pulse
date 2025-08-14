-- Create hotel phrase templates table
CREATE TABLE public.hotel_phrase_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  intent_id TEXT NOT NULL,
  category TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  templates JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create language sessions table for tracking conversations
CREATE TABLE public.language_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  guest_id UUID REFERENCES public.guests(id),
  staff_user_id UUID REFERENCES public.app_users(user_id),
  client_language TEXT NOT NULL,
  staff_language TEXT NOT NULL DEFAULT 'fr',
  session_notes TEXT,
  interaction_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotel_phrase_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage hotel phrase templates for their org"
ON public.hotel_phrase_templates
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage language sessions for their org"
ON public.language_sessions
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes
CREATE INDEX idx_hotel_phrase_templates_org_category ON public.hotel_phrase_templates(org_id, category);
CREATE INDEX idx_hotel_phrase_templates_intent ON public.hotel_phrase_templates(intent_id);
CREATE INDEX idx_language_sessions_org_guest ON public.language_sessions(org_id, guest_id);

-- Insert default French hotel phrase templates
INSERT INTO public.hotel_phrase_templates (org_id, intent_id, category, variables, templates) VALUES
(gen_random_uuid(), 'greet.welcome', 'Accueil', '["guest_name"]', '{
  "fr": "Bonjour {guest_name}, bienvenue dans notre établissement !",
  "en": "Hello {guest_name}, welcome to our establishment!",
  "es": "¡Hola {guest_name}, bienvenido a nuestro establecimiento!",
  "pt": "Olá {guest_name}, bem-vindo ao nosso estabelecimento!",
  "ar": "مرحباً {guest_name}، أهلاً وسهلاً في منشأتنا!"
}'),
(gen_random_uuid(), 'checkin.request_id', 'Check-in', '["guest_name"]', '{
  "fr": "Bonjour {guest_name}, puis-je voir une pièce d''identité, s''il vous plaît ?",
  "en": "Hello {guest_name}, may I see a photo ID, please?",
  "es": "Hola {guest_name}, ¿podría ver un documento de identidad, por favor?",
  "pt": "Olá {guest_name}, posso ver um documento de identidade, por favor?",
  "ar": "مرحباً {guest_name}، هل يمكنني رؤية هوية شخصية من فضلك؟"
}'),
(gen_random_uuid(), 'checkin.deposit_explain', 'Check-in', '["amount", "currency"]', '{
  "fr": "Une pré-autorisation de {amount} {currency} sera effectuée à l''arrivée. Aucun débit immédiat.",
  "en": "A pre-authorization of {amount} {currency} will be placed at check-in. No immediate charge.",
  "es": "Se realizará una preautorización de {amount} {currency} al registrarse. Sin cargo inmediato.",
  "pt": "Uma pré-autorização de {amount} {currency} será feita no check-in. Sem cobrança imediata.",
  "ar": "سيتم إجراء تفويض مسبق بقيمة {amount} {currency} عند تسجيل الوصول. لا توجد رسوم فورية."
}'),
(gen_random_uuid(), 'payment.mobile_money', 'Paiement', '[]', '{
  "fr": "Acceptez-vous de régler via Mobile Money ? Nous supportons Orange, MTN, Moov, Wave.",
  "en": "Would you like to pay via Mobile Money? We support Orange, MTN, Moov, Wave.",
  "es": "¿Le gustaría pagar a través de Mobile Money? Admitimos Orange, MTN, Moov, Wave.",
  "pt": "Gostaria de pagar via Mobile Money? Suportamos Orange, MTN, Moov, Wave.",
  "ar": "هل تود الدفع عبر موبايل موني؟ ندعم Orange، MTN، Moov، Wave."
}'),
(gen_random_uuid(), 'issue.plumbing_apology_eta', 'Problèmes', '["eta_minutes"]', '{
  "fr": "Nous sommes désolés pour le désagrément. Notre technicien arrivera dans {eta_minutes} minutes.",
  "en": "We''re sorry for the inconvenience. Our technician will arrive in {eta_minutes} minutes.",
  "es": "Lamentamos las molestias. Nuestro técnico llegará en {eta_minutes} minutos.",
  "pt": "Pedimos desculpas pelo inconveniente. Nosso técnico chegará em {eta_minutes} minutos.",
  "ar": "نعتذر عن الإزعاج. سيصل الفني الخاص بنا خلال {eta_minutes} دقيقة."
}'),
(gen_random_uuid(), 'info.breakfast', 'Infos hôtel', '["breakfast_from", "breakfast_to"]', '{
  "fr": "Le petit-déjeuner est servi de {breakfast_from} à {breakfast_to} au restaurant du rez-de-chaussée.",
  "en": "Breakfast is served from {breakfast_from} to {breakfast_to} in the ground-floor restaurant.",
  "es": "El desayuno se sirve de {breakfast_from} a {breakfast_to} en el restaurante de la planta baja.",
  "pt": "O café da manhã é servido das {breakfast_from} às {breakfast_to} no restaurante do térreo.",
  "ar": "يُقدم الإفطار من {breakfast_from} إلى {breakfast_to} في مطعم الطابق الأرضي."
}'),
(gen_random_uuid(), 'checkout.late_policy', 'Check-out', '["checkout_time"]', '{
  "fr": "Le départ est à {checkout_time}. Un late check-out peut être proposé selon disponibilité, avec supplément.",
  "en": "Check-out is at {checkout_time}. Late check-out is subject to availability and an extra fee.",
  "es": "La salida es a las {checkout_time}. La salida tardía está sujeta a disponibilidad y tarifa adicional.",
  "pt": "O check-out é às {checkout_time}. Check-out tardio sujeito à disponibilidade e taxa extra.",
  "ar": "تسجيل المغادرة في {checkout_time}. تسجيل المغادرة المتأخر يخضع للتوفر ورسوم إضافية."
}');

-- Update org_id for default templates to match system org
UPDATE public.hotel_phrase_templates SET org_id = (
  SELECT org_id FROM public.app_users WHERE user_id = auth.uid() LIMIT 1
) WHERE org_id = gen_random_uuid();

-- Create trigger for updated_at
CREATE TRIGGER update_hotel_phrase_templates_updated_at
  BEFORE UPDATE ON public.hotel_phrase_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_language_sessions_updated_at
  BEFORE UPDATE ON public.language_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();