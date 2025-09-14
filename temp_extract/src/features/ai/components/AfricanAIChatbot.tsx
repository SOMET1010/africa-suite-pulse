import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain,
  Sparkles,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'insight';
  metadata?: {
    confidence?: number;
    source?: string;
    culturalContext?: string;
  };
}

interface AfricanAIChatbotProps {
  className?: string;
  hotelData?: any;
  guestContext?: any;
}

export function AfricanAIChatbot({ className, hotelData, guestContext }: AfricanAIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "🌍 Akwaba ! Je suis Aya, votre assistante IA africaine. Comment puis-je vous aider aujourd'hui ?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
      metadata: {
        confidence: 1.0,
        culturalContext: "Salutation akan (Ghana) - Akwaba signifie 'bienvenue'"
      }
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, isLoading } = useAIChat();

  // Suggestions contextuelles africaines
  const africanSuggestions = [
    "Comment améliorer l'hospitalité Teranga ?",
    "Analyse des revenus avec philosophie Ubuntu",
    "Prédictions d'occupation saisonnière",
    "Optimisation du service client africain",
    "Recommandations menu local",
    "Gestion équipe esprit Harambee"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simulation de réponse IA avec contexte africain
      const aiResponse = await generateAfricanAIResponse(inputMessage, hotelData, guestContext);
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.content,
          sender: 'ai',
          timestamp: new Date(),
          type: aiResponse.type,
          metadata: aiResponse.metadata
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Désolée, je rencontre des difficultés. Comme dit le proverbe akan : 'La patience est la clé de la joie'. Pouvez-vous réessayer ?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
        metadata: {
          confidence: 0.5,
          culturalContext: "Proverbe akan sur la patience"
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const generateAfricanAIResponse = async (message: string, hotelData: any, guestContext: any) => {
    // Simulation d'une IA avec contexte culturel africain
    const responses = {
      'hospitalité': {
        content: "🤗 L'hospitalité Teranga est au cœur de notre service ! Selon la philosophie sénégalaise, chaque client doit se sentir comme un membre de la famille. Je recommande : 1) Accueil personnalisé avec salutation locale, 2) Thé d'accueil offert, 3) Présentation des traditions locales. Votre score Teranga actuel est de 92% - excellent !",
        type: 'insight' as const,
        metadata: {
          confidence: 0.95,
          source: "Analyse comportementale + données satisfaction",
          culturalContext: "Teranga - Hospitalité sénégalaise"
        }
      },
      'ubuntu': {
        content: "🤝 La philosophie Ubuntu 'Je suis parce que nous sommes' peut transformer votre équipe ! Suggestions : 1) Réunions d'équipe quotidiennes, 2) Partage des succès collectifs, 3) Formation croisée entre départements. Votre score Ubuntu actuel : 87%. Objectif : atteindre 95% d'ici 3 mois.",
        type: 'suggestion' as const,
        metadata: {
          confidence: 0.92,
          source: "Analyse RH + performance équipe",
          culturalContext: "Ubuntu - Philosophie sud-africaine"
        }
      },
      'revenus': {
        content: "📈 Analyse des revenus avec sagesse africaine : Comme le baobab qui grandit lentement mais sûrement, vos revenus montrent une croissance stable de +15% ce mois. Opportunités identifiées : 1) Packages culturels (+20% potentiel), 2) Cuisine locale (+12% marge), 3) Expériences authentiques (+25% premium).",
        type: 'insight' as const,
        metadata: {
          confidence: 0.88,
          source: "Données financières + tendances marché",
          culturalContext: "Métaphore du baobab - croissance durable"
        }
      },
      'default': {
        content: "🌍 Merci pour votre question ! En tant qu'IA africaine, je puise dans la sagesse de nos ancêtres et les données modernes pour vous conseiller. Pouvez-vous préciser votre besoin ? Je peux vous aider avec l'hospitalité, la gestion d'équipe, l'analyse des revenus, ou les prédictions d'occupation.",
        type: 'text' as const,
        metadata: {
          confidence: 0.8,
          culturalContext: "Approche holistique africaine"
        }
      }
    };

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hospitalité') || lowerMessage.includes('teranga') || lowerMessage.includes('accueil')) {
      return responses.hospitalité;
    } else if (lowerMessage.includes('ubuntu') || lowerMessage.includes('équipe') || lowerMessage.includes('collaboration')) {
      return responses.ubuntu;
    } else if (lowerMessage.includes('revenus') || lowerMessage.includes('financier') || lowerMessage.includes('chiffre')) {
      return responses.revenus;
    } else {
      return responses.default;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Ici on intégrerait la reconnaissance vocale
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    // Ici on intégrerait la synthèse vocale
  };

  return (
    <Card className={`bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="h-6 w-6 text-amber-700" />
              <Sparkles className="h-3 w-3 text-amber-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <CardTitle className="text-amber-900 text-lg">Aya - IA Africaine</CardTitle>
              <p className="text-sm text-amber-700">Assistante intelligente avec sagesse africaine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">En ligne</Badge>
            <Badge className="bg-amber-100 text-amber-800">🌍 Culturelle</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Zone de messages */}
        <ScrollArea className="h-80 w-full rounded-lg border bg-white/50 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-amber-600 text-white'
                        : message.type === 'insight'
                        ? 'bg-blue-50 border border-blue-200'
                        : message.type === 'suggestion'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === 'ai' && (
                        <div className="flex-shrink-0 mt-1">
                          {message.type === 'insight' ? (
                            <Brain className="h-4 w-4 text-blue-600" />
                          ) : message.type === 'suggestion' ? (
                            <Sparkles className="h-4 w-4 text-green-600" />
                          ) : (
                            <MessageCircle className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {message.content}
                        </p>
                        {message.metadata?.culturalContext && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            💡 {message.metadata.culturalContext}
                          </p>
                        )}
                        {message.metadata?.confidence && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Confiance: {Math.round(message.metadata.confidence * 100)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <div className={`flex-shrink-0 ${message.sender === 'user' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' ? 'bg-amber-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3">
                  <Bot className="h-4 w-4 text-amber-600" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">Aya réfléchit...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggestions rapides */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-amber-900">💡 Suggestions rapides :</p>
          <div className="flex flex-wrap gap-2">
            {africanSuggestions.slice(0, 3).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs border-amber-200 hover:bg-amber-100"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Posez votre question à Aya..."
              className="pr-12 border-amber-200 focus:border-amber-400"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={toggleListening}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={toggleSpeaking}
            className="border-amber-200"
          >
            {isSpeaking ? (
              <VolumeX className="h-4 w-4 text-red-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>

        {/* Informations contextuelles */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2 text-sm">🎭 Sagesse Africaine Intégrée</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <strong>Ubuntu :</strong> Esprit d'équipe
            </div>
            <div>
              <strong>Teranga :</strong> Hospitalité
            </div>
            <div>
              <strong>Harambee :</strong> Travail collectif
            </div>
            <div>
              <strong>Sankofa :</strong> Apprentissage
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

