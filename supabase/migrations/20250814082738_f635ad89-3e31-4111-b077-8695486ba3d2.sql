-- Insert initial hotel phrase templates for multilingual support
INSERT INTO public.hotel_phrase_templates (category, context, phrase_key, translations, variables, priority) VALUES

-- Check-in phrases
('checkin', 'arrival', 'welcome_greeting', 
 '{"fr": "Bonjour et bienvenue à l''hôtel {hotel_name}. Comment puis-je vous aider ?", 
   "en": "Hello and welcome to {hotel_name}. How may I help you?", 
   "es": "Hola y bienvenido al hotel {hotel_name}. ¿Cómo puedo ayudarle?", 
   "pt": "Olá e bem-vindo ao hotel {hotel_name}. Como posso ajudá-lo?", 
   "ar": "مرحباً وأهلاً بكم في فندق {hotel_name}. كيف يمكنني مساعدتكم؟"}', 
 '["hotel_name"]', 10),

('checkin', 'documents', 'request_passport', 
 '{"fr": "Puis-je voir votre passeport ou pièce d''identité, s''il vous plaît ?", 
   "en": "May I see your passport or ID, please?", 
   "es": "¿Puedo ver su pasaporte o documento de identidad, por favor?", 
   "pt": "Posso ver seu passaporte ou documento de identidade, por favor?", 
   "ar": "هل يمكنني رؤية جواز سفركم أو بطاقة الهوية من فضلكم؟"}', 
 '[]', 9),

('checkin', 'room_assignment', 'room_ready', 
 '{"fr": "Votre chambre {room_number} est prête. Voici vos clés.", 
   "en": "Your room {room_number} is ready. Here are your keys.", 
   "es": "Su habitación {room_number} está lista. Aquí están sus llaves.", 
   "pt": "Seu quarto {room_number} está pronto. Aqui estão suas chaves.", 
   "ar": "غرفتكم رقم {room_number} جاهزة. إليكم مفاتيحكم."}', 
 '["room_number"]', 8),

-- Services phrases
('services', 'breakfast', 'breakfast_inquiry', 
 '{"fr": "Souhaitez-vous réserver le petit-déjeuner ? Il est servi de {start_time} à {end_time}.", 
   "en": "Would you like to book breakfast? It is served from {start_time} to {end_time}.", 
   "es": "¿Le gustaría reservar el desayuno? Se sirve de {start_time} a {end_time}.", 
   "pt": "Gostaria de reservar o café da manhã? É servido das {start_time} às {end_time}.", 
   "ar": "هل تودون حجز وجبة الإفطار؟ يتم تقديمها من {start_time} إلى {end_time}."}', 
 '["start_time", "end_time"]', 7),

('services', 'wake_up', 'wake_up_call', 
 '{"fr": "À quelle heure souhaitez-vous votre réveil ?", 
   "en": "What time would you like your wake-up call?", 
   "es": "¿A qué hora le gustaría su llamada de despertador?", 
   "pt": "A que horas gostaria de receber a chamada para acordar?", 
   "ar": "في أي وقت تودون مكالمة الإيقاظ؟"}', 
 '[]', 6),

-- Checkout phrases
('checkout', 'departure', 'checkout_time', 
 '{"fr": "Le check-out est à {checkout_time}. Souhaitez-vous une facture ?", 
   "en": "Check-out is at {checkout_time}. Would you like a receipt?", 
   "es": "El check-out es a las {checkout_time}. ¿Le gustaría una factura?", 
   "pt": "O check-out é às {checkout_time}. Gostaria de um recibo?", 
   "ar": "تسجيل المغادرة في {checkout_time}. هل تودون إيصالاً؟"}', 
 '["checkout_time"]', 8),

-- Emergency phrases
('emergency', 'medical', 'call_doctor', 
 '{"fr": "Avez-vous besoin d''un médecin ? Je peux appeler l''assistance médicale.", 
   "en": "Do you need a doctor? I can call medical assistance.", 
   "es": "¿Necesita un médico? Puedo llamar a asistencia médica.", 
   "pt": "Precisa de um médico? Posso chamar assistência médica.", 
   "ar": "هل تحتاجون طبيباً؟ يمكنني الاتصال بالمساعدة الطبية."}', 
 '[]', 10),

-- Politeness phrases
('politeness', 'general', 'please_wait', 
 '{"fr": "Un moment s''il vous plaît, je vérifie pour vous.", 
   "en": "One moment please, I''ll check for you.", 
   "es": "Un momento por favor, verificaré para usted.", 
   "pt": "Um momento por favor, vou verificar para você.", 
   "ar": "لحظة من فضلكم، سأتحقق لكم."}', 
 '[]', 5),

('politeness', 'general', 'thank_you', 
 '{"fr": "Merci beaucoup. Passez un excellent séjour !", 
   "en": "Thank you very much. Have an excellent stay!", 
   "es": "Muchas gracias. ¡Que tenga una excelente estadía!", 
   "pt": "Muito obrigado. Tenha uma excelente estadia!", 
   "ar": "شكراً جزيلاً. أتمنى لكم إقامة ممتعة!"}', 
 '[]', 4);

-- Insert sample language sessions for testing
INSERT INTO public.language_sessions (guest_id, target_language, context_data, is_active) 
SELECT 
  g.id,
  'en',
  '{"reservation_id": null, "room_number": null, "session_type": "checkin"}',
  false
FROM public.guests g 
LIMIT 1;