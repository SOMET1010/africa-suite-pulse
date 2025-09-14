import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useGDPRCompliance } from './useGDPRCompliance';

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
  const { 
    needsConsent, 
    canStoreConversations, 
    canUseVoiceProcessing,
    logDataProcessingEvent 
  } = useGDPRCompliance();
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [phraseTemplates, setPhraseTemplates] = useState<PhraseTemplate[]>([]);
  const [currentSession, setCurrentSession] = useState<LanguageSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGDPRModal, setShowGDPRModal] = useState(false);

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
    // Check GDPR compliance before opening
    if (needsConsent) {
      setShowGDPRModal(true);
      return;
    }
    
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
      const sessionData = {
        id: Date.now().toString(),
        guest_id: guestId,
        target_language: selectedLanguage,
        context_data: sanitizeContextData(context || {}),
        messages: [],
        is_active: true,
        created_at: new Date().toISOString(),
        gdpr_compliant: true
      };

      // Only store if consent allows
      if (canStoreConversations()) {
        const sessions = JSON.parse(localStorage.getItem('language-assistant-sessions') || '[]');
        sessions.push(sessionData);
        localStorage.setItem('language-assistant-sessions', JSON.stringify(sessions));
      }

      setCurrentSession(sessionData);
      
      // Log session start for audit
      await logDataProcessingEvent('session_started', {
        sessionId: sessionData.id,
        guestId: guestId ? 'masked' : null,
        language: selectedLanguage,
        storageEnabled: canStoreConversations()
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
      // Check voice processing consent
      if (!canUseVoiceProcessing()) {
        toast({
          title: "Fonctionnalité non autorisée",
          description: "Le traitement vocal n'est pas autorisé par vos préférences RGPD",
          variant: "destructive"
        });
        return;
      }

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sanitizeTextForSpeech(text));
        utterance.lang = selectedLanguage === 'ar' ? 'ar-SA' : `${selectedLanguage}-${selectedLanguage.toUpperCase()}`;
        speechSynthesis.speak(utterance);

        // Log voice processing for audit
        await logDataProcessingEvent('voice_synthesis', {
          textLength: text.length,
          language: selectedLanguage,
          sessionId: currentSession?.id
        });
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

  // Utility functions for data sanitization
  const sanitizeContextData = (context: any) => {
    const sanitized = { ...context };
    // Remove sensitive personal data
    delete sanitized.fullName;
    delete sanitized.email;
    delete sanitized.phone;
    delete sanitized.documentNumber;
    delete sanitized.taxId;
    return sanitized;
  };

  const sanitizeTextForSpeech = (text: string) => {
    // Remove potential PII patterns
    return text
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD NUMBER]') // Credit cards
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Emails
      .replace(/\b\d{10,}\b/g, '[NUMBER]'); // Long numbers
  };

  // Real translation using Edge Function
  const translateText = useCallback(async (text: string, targetLanguage: string, context?: any): Promise<string> => {
    console.log(`🔄 Translating "${text}" to ${targetLanguage}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: {
          text,
          targetLanguage,
          context: {
            ...context,
            category: 'reception' // Default category for language assistant
          }
        }
      });

      if (error) {
        console.error('Translation error:', error);
        return `[${targetLanguage.toUpperCase()}] ${text}`;
      }

      return data.translatedText;
    } catch (error) {
      console.error('Failed to translate:', error);
      return `[${targetLanguage.toUpperCase()}] ${text}`;
    }
  }, []);

  return {
    isOpen,
    selectedLanguage,
    setSelectedLanguage,
    phraseTemplates,
    currentSession,
    loading,
    showGDPRModal,
    setShowGDPRModal,
    openAssistant,
    closeAssistant,
    startSession,
    endSession,
    getPhrase,
    getPhrasesByCategory,
    speakText,
    translateText,
    needsConsent,
    canStoreConversations,
    canUseVoiceProcessing
  };
};