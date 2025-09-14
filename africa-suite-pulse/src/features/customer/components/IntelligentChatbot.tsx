import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Bot, User, Loader2, Languages } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    provider?: string;
    confidence?: number;
  };
}

interface IntelligentChatbotProps {
  guestId?: string;
  orgId: string;
  context?: {
    roomNumber?: string;
    guestName?: string;
    currentOrder?: any[];
  };
  language?: 'fr' | 'en';
  onOrderSuggestion?: (item: any) => void;
  className?: string;
}

export const IntelligentChatbot: React.FC<IntelligentChatbotProps> = ({
  guestId,
  orgId,
  context,
  language = 'fr',
  onOrderSuggestion,
  className = ""
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Message de bienvenue
  useEffect(() => {
    const welcomeMessage = language === 'fr' 
      ? `Bonjour${context?.guestName ? ` ${context.guestName}` : ''} ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?`
      : `Hello${context?.guestName ? ` ${context.guestName}` : ''}! I'm your AI assistant. How can I help you today?`;

    setMessages([{
      id: '1',
      type: 'bot',
      content: welcomeMessage,
      timestamp: new Date(),
      metadata: { provider: 'system' }
    }]);
  }, [context?.guestName, language]);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-assistant', {
        body: {
          message: userMessage.content,
          context: {
            ...context,
            guestId,
            orgId,
            previousMessages: messages.slice(-5) // Contexte des 5 derniers messages
          },
          orgId,
          language
        }
      });

      if (error) throw error;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          provider: data.provider,
          confidence: data.confidence || 0.8
        }
      };

      setMessages(prev => [...prev, botMessage]);

      // Détecter les suggestions de commande dans la réponse
      if (onOrderSuggestion && data.suggestions) {
        data.suggestions.forEach((suggestion: any) => {
          onOrderSuggestion(suggestion);
        });
      }

    } catch (error) {
      console.error('Erreur chatbot:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: language === 'fr' 
          ? "Désolé, je rencontre un problème technique. Veuillez réessayer."
          : "Sorry, I'm experiencing technical issues. Please try again.",
        timestamp: new Date(),
        metadata: { provider: 'error' }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickSuggestions = language === 'fr' 
    ? [
        "Quels sont vos plats populaires ?",
        "Avez-vous des options végétariennes ?",
        "Combien de temps pour être servi ?",
        "Pouvez-vous m'aider à commander ?"
      ]
    : [
        "What are your popular dishes?",
        "Do you have vegetarian options?",
        "How long for service?",
        "Can you help me order?"
      ];

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg ${className}`}
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-80 h-96 shadow-lg z-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4 text-primary" />
            Assistant IA
            <Badge variant="outline" className="text-xs">
              <Languages className="h-3 w-3 mr-1" />
              {language.toUpperCase()}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-full">
        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[70%] space-y-1`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    {message.metadata?.provider && message.metadata.provider !== 'system' && (
                      <Badge variant="outline" className="text-xs h-4">
                        {message.metadata.provider}
                      </Badge>
                    )}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Loader2 className="h-3 w-3 text-primary animate-spin" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions rapides */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="text-xs text-muted-foreground mb-2">Suggestions :</div>
            <div className="flex flex-wrap gap-1">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setInputValue(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === 'fr' ? "Tapez votre message..." : "Type your message..."}
              disabled={isLoading}
              className="text-sm"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};