import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PhraseTemplate {
  id: string;
  category: string;
  context: string;
  phrase_key: string;
  translations: Record<string, string>;
  variables: string[];
  priority: number;
}

interface LanguageSession {
  id: string;
  guest_id?: string;
  target_language: string;
  context_data: Record<string, any>;
  messages: any[];
  is_active: boolean;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const useLanguageAssistant = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [phraseTemplates, setPhraseTemplates] = useState<PhraseTemplate[]>([]);
  const [currentSession, setCurrentSession] = useState<LanguageSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Load phrase templates
  useEffect(() => {
    const loadPhraseTemplates = async () => {
      try {
        // Using mock data for now since tables are being set up
        setPhraseTemplates([
          {
            id: '1',
            category: 'checkin',
            context: 'arrival',
            phrase_key: 'welcome_greeting',
            translations: {
              fr: 'Bonjour et bienvenue à l\'hôtel. Comment puis-je vous aider ?',
              en: 'Hello and welcome to the hotel. How may I help you?',
              es: 'Hola y bienvenido al hotel. ¿Cómo puedo ayudarle?',
              pt: 'Olá e bem-vindo ao hotel. Como posso ajudá-lo?',
              ar: 'مرحباً وأهلاً بكم في الفندق. كيف يمكنني مساعدتكم؟'
            },
            variables: [],
            priority: 10
          },
          {
            id: '2',
            category: 'checkin',
            context: 'documents',
            phrase_key: 'request_passport',
            translations: {
              fr: 'Puis-je voir votre passeport, s\'il vous plaît ?',
              en: 'May I see your passport, please?',
              es: '¿Puedo ver su pasaporte, por favor?',
              pt: 'Posso ver seu passaporte, por favor?',
              ar: 'هل يمكنني رؤية جواز سفركم من فضلكم؟'
            },
            variables: [],
            priority: 9
          }
        ]);
      } catch (error) {
        console.error('Error loading phrase templates:', error);
      }
    };

    loadPhraseTemplates();
  }, []);

  const openAssistant = (context?: { guestId?: string; roomNumber?: string }) => {
    setIsOpen(true);
    if (context?.guestId) {
      // Create or resume session for specific guest
      startSession(context.guestId, context);
    }
  };

  const closeAssistant = () => {
    setIsOpen(false);
    if (currentSession?.is_active) {
      endSession();
    }
  };

  const startSession = async (guestId?: string, context?: any) => {
    setLoading(true);
    try {
      // Create mock session for development
      setCurrentSession({
        id: Date.now().toString(),
        guest_id: guestId,
        target_language: selectedLanguage,
        context_data: context || {},
        messages: [],
        is_active: true
      });
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;
    setCurrentSession(null);
  };

  const getPhrase = (phraseKey: string, variables?: Record<string, string>) => {
    const template = phraseTemplates.find(t => t.phrase_key === phraseKey);
    if (!template) return '';

    const translation = template.translations[selectedLanguage] || template.translations['en'] || '';
    
    if (!variables) return translation;

    // Replace variables in the translation
    return Object.entries(variables).reduce((text, [key, value]) => {
      return text.replace(new RegExp(`{${key}}`, 'g'), value);
    }, translation);
  };

  const getPhrasesByCategory = (category: string) => {
    return phraseTemplates.filter(template => template.category === category);
  };

  const speakText = async (text: string) => {
    try {
      // For now, use browser's speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLanguage === 'ar' ? 'ar-SA' : `${selectedLanguage}-${selectedLanguage.toUpperCase()}`;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error speaking text:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire le texte à voix haute",
        variant: "destructive"
      });
    }
  };

  return {
    isOpen,
    selectedLanguage,
    setSelectedLanguage,
    phraseTemplates,
    currentSession,
    loading,
    openAssistant,
    closeAssistant,
    startSession,
    endSession,
    getPhrase,
    getPhrasesByCategory,
    speakText
  };
};