import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: string;
}

interface ChatResponse {
  response: string;
  provider: string;
  timestamp: string;
}

export function useAIChat() {
  const { orgId } = useOrgId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string, context?: string, language: 'fr' | 'en' = 'fr') => {
    if (!orgId || !message.trim()) return;

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message,
          context,
          orgId,
          language
        }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp),
        provider: data.provider
      };

      setMessages(prev => [...prev, assistantMessage]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      console.error('Erreur chat IA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  };
}