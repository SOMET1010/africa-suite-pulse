import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  Send, 
  Mic, 
  Heart, 
  Sparkles, 
  Globe, 
  Users, 
  Star,
  MessageCircle,
  Zap,
  Crown,
  Coffee,
  Utensils,
  Bed,
  Calendar,
  TrendingUp,
  Award,
  Gift,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'aya';
  content: string;
  timestamp: Date;
  culturalContext?: string;
  philosophy?: 'ubuntu' | 'teranga' | 'harambee' | 'sankofa';
  suggestions?: string[];
  data?: any;
}

interface AyaCapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  philosophy: string;
}

export default function AyaAIDemoPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Capacités d'Aya avec contexte culturel
  const ayaCapabilities: AyaCapability[] = [
    {
      id: 'hospitality',
      name: 'Hospitalité Teranga',
      description: 'Conseils d\'accueil selon la tradition sénégalaise',
      icon: <Heart className="h-5 w-5 text-orange-600" />,
      examples: [
        'Comment accueillir un client VIP selon Teranga ?',
        'Quels sont les gestes d\'hospitalité africaine ?',
        'Comment personnaliser l\'accueil selon l\'origine du client ?'
      ],
      philosophy: 'Teranga - L\'hospitalité est la richesse du cœur'
    },
    {
      id: 'teamwork',
      name: 'Collaboration Ubuntu',
      description: 'Gestion d\'équipe selon la philosophie Ubuntu',
      icon: <Users className="h-5 w-5 text-amber-700" />,
      examples: [
        'Comment résoudre un conflit d\'équipe avec Ubuntu ?',
        'Organiser une réunion selon l\'esprit communautaire',
        'Motiver l\'équipe avec la sagesse africaine'
      ],
      philosophy: 'Ubuntu - Je suis parce que nous sommes'
    },
    {
      id: 'efficiency',
      name: 'Excellence Harambee',
      description: 'Optimisation selon l\'esprit kenyan Harambee',
      icon: <Zap className="h-5 w-5 text-green-600" />,
      examples: [
        'Comment améliorer l\'efficacité du service ?',
        'Organiser un projet selon Harambee',
        'Atteindre les objectifs ensemble'
      ],
      philosophy: 'Harambee - Travaillons ensemble'
    },
    {
      id: 'wisdom',
      name: 'Sagesse Sankofa',
      description: 'Apprentissage et amélioration continue',
      icon: <Crown className="h-5 w-5 text-yellow-600" />,
      examples: [
        'Analyser les erreurs passées pour progresser',
        'Tirer des leçons des expériences clients',
        'Améliorer les processus avec la sagesse ancestrale'
      ],
      philosophy: 'Sankofa - Il n\'est jamais trop tard pour revenir chercher ce qu\'on a oublié'
    }
  ];

  // Messages d'accueil d'Aya
  const welcomeMessage: ChatMessage = {
    id: '1',
    type: 'aya',
    content: 'Akwaba ! 🌍 Je suis Aya, votre assistante IA culturelle pour Africa Suite Pulse. Je combine l\'intelligence artificielle moderne avec la sagesse ancestrale africaine pour vous aider dans la gestion hôtelière.',
    timestamp: new Date(),
    culturalContext: 'Akwaba signifie "Bienvenue" en langue akan du Ghana',
    philosophy: 'ubuntu',
    suggestions: [
      'Montre-moi l\'hospitalité Teranga',
      'Comment gérer mon équipe avec Ubuntu ?',
      'Aide-moi à améliorer le service client',
      'Analyse les performances de l\'hôtel'
    ]
  };

  // Réponses simulées d'Aya selon le contexte
  const getAyaResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('teranga') || lowerMessage.includes('accueil') || lowerMessage.includes('hospitalité')) {
      return {
        id: Date.now().toString(),
        type: 'aya',
        content: '🤗 Selon la tradition Teranga du Sénégal, l\'hospitalité authentique commence par le cœur. Voici comment appliquer cette philosophie :\n\n• **Accueil chaleureux** : Regardez dans les yeux, souriez sincèrement\n• **Écoute active** : "Nanga def ?" (Comment allez-vous ?) - Intéressez-vous vraiment\n• **Générosité** : Offrez le thé à la menthe, symbole de partage\n• **Respect** : Adaptez-vous aux coutumes du client\n\nComme dit le proverbe wolof : "Teranga mooy jëf" - L\'hospitalité est un acte.',
        timestamp: new Date(),
        culturalContext: 'Teranga est la valeur fondamentale sénégalaise d\'hospitalité',
        philosophy: 'teranga',
        suggestions: [
          'Comment personnaliser selon l\'origine ?',
          'Rituels d\'accueil par région',
          'Former l\'équipe à Teranga'
        ],
        data: {
          metrics: {
            satisfaction: '+25%',
            fidelisation: '+40%',
            recommandations: '+60%'
          }
        }
      };
    }
    
    if (lowerMessage.includes('ubuntu') || lowerMessage.includes('équipe') || lowerMessage.includes('conflit')) {
      return {
        id: Date.now().toString(),
        type: 'aya',
        content: '🤝 L\'esprit Ubuntu nous enseigne que "Je suis parce que nous sommes". Pour résoudre les conflits d\'équipe :\n\n• **Cercle de parole** : Réunissez l\'équipe en cercle, chacun s\'exprime\n• **Écoute empathique** : Comprendre avant d\'être compris\n• **Recherche du consensus** : Trouver une solution qui honore chacun\n• **Responsabilité collective** : Le succès de l\'un est le succès de tous\n\nProverbe zulu : "Umuntu ngumuntu ngabantu" - Une personne est une personne à travers les autres.',
        timestamp: new Date(),
        culturalContext: 'Ubuntu est la philosophie humaniste d\'Afrique australe',
        philosophy: 'ubuntu',
        suggestions: [
          'Organiser un cercle Ubuntu',
          'Médiation selon Ubuntu',
          'Renforcer la cohésion d\'équipe'
        ],
        data: {
          teamMetrics: {
            cohesion: '+35%',
            productivite: '+28%',
            satisfaction: '+42%'
          }
        }
      };
    }
    
    if (lowerMessage.includes('harambee') || lowerMessage.includes('efficacité') || lowerMessage.includes('objectif')) {
      return {
        id: Date.now().toString(),
        type: 'aya',
        content: '💪 Harambee ! "Travaillons ensemble" en swahili. Cette philosophie kenyane transforme les défis en opportunités :\n\n• **Objectif commun** : Définir clairement la vision partagée\n• **Mobilisation collective** : Chacun apporte ses compétences uniques\n• **Entraide** : Les forts aident les faibles, ensemble on va plus loin\n• **Célébration** : Reconnaître les succès collectifs\n\nComme dit le proverbe kenyan : "Haba na haba, hujaza kibaba" - Petit à petit, on remplit la mesure.',
        timestamp: new Date(),
        culturalContext: 'Harambee est l\'esprit de coopération communautaire du Kenya',
        philosophy: 'harambee',
        suggestions: [
          'Organiser un projet Harambee',
          'Mobiliser l\'équipe efficacement',
          'Atteindre les objectifs ensemble'
        ],
        data: {
          performance: {
            objectifs: '+45%',
            delais: '-30%',
            motivation: '+50%'
          }
        }
      };
    }
    
    if (lowerMessage.includes('sankofa') || lowerMessage.includes('améliorer') || lowerMessage.includes('leçon')) {
      return {
        id: Date.now().toString(),
        type: 'aya',
        content: '🔄 Sankofa nous enseigne la sagesse de l\'apprentissage continu. Cet oiseau mythique ghanéen regarde vers l\'arrière tout en avançant :\n\n• **Analyse réflexive** : Examiner les expériences passées sans jugement\n• **Extraction de sagesse** : Identifier les leçons précieuses\n• **Application future** : Intégrer les apprentissages dans les nouvelles actions\n• **Transmission** : Partager la sagesse acquise avec l\'équipe\n\nProverbe akan : "Se wo were fi na wosankofa a yenkyi" - Il n\'est pas tabou de retourner chercher ce que vous avez oublié.',
        timestamp: new Date(),
        culturalContext: 'Sankofa est un symbole adinkra ghanéen de sagesse et d\'apprentissage',
        philosophy: 'sankofa',
        suggestions: [
          'Analyser les retours clients',
          'Améliorer les processus',
          'Capitaliser sur l\'expérience'
        ],
        data: {
          improvement: {
            satisfaction: '+32%',
            efficacite: '+38%',
            innovation: '+55%'
          }
        }
      };
    }
    
    // Réponse générale avec sagesse africaine
    return {
      id: Date.now().toString(),
      type: 'aya',
      content: `🌍 Merci pour votre question ! En tant qu'IA culturelle africaine, je puise dans la richesse de nos traditions pour vous aider. \n\nComme le dit le proverbe bambara : "Ko kelen tè se ka jiri sigi" - Un seul doigt ne peut pas ramasser un caillou. Ensemble, nous trouvons toujours des solutions.\n\nPouvez-vous me donner plus de détails sur votre situation ? Je peux vous aider avec :\n• L'hospitalité Teranga\n• La gestion d'équipe Ubuntu\n• L'efficacité Harambee\n• L'amélioration continue Sankofa`,
      timestamp: new Date(),
      culturalContext: 'Proverbe bambara du Mali sur l\'importance de la coopération',
      philosophy: 'ubuntu',
      suggestions: [
        'Aide-moi avec l\'accueil clients',
        'Résoudre un problème d\'équipe',
        'Améliorer nos performances',
        'Analyser les données de l\'hôtel'
      ]
    };
  };

  // Démonstrations prédéfinies
  const demoScenarios = [
    {
      id: 'vip-welcome',
      title: 'Accueil VIP Teranga',
      description: 'Comment accueillir un client VIP selon la tradition sénégalaise',
      userMessage: 'Comment accueillir un client VIP selon Teranga ?',
      icon: <Crown className="h-4 w-4" />
    },
    {
      id: 'team-conflict',
      title: 'Résolution Conflit Ubuntu',
      description: 'Gérer un conflit d\'équipe avec la philosophie Ubuntu',
      userMessage: 'Comment résoudre un conflit d\'équipe avec Ubuntu ?',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'efficiency-boost',
      title: 'Efficacité Harambee',
      description: 'Améliorer les performances avec l\'esprit Harambee',
      userMessage: 'Comment améliorer l\'efficacité du service avec Harambee ?',
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: 'continuous-improvement',
      title: 'Amélioration Sankofa',
      description: 'Apprendre des erreurs passées selon Sankofa',
      userMessage: 'Comment analyser nos erreurs passées avec Sankofa ?',
      icon: <TrendingUp className="h-4 w-4" />
    }
  ];

  useEffect(() => {
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simuler le temps de réponse d'Aya
    setTimeout(() => {
      const ayaResponse = getAyaResponse(message);
      setMessages(prev => [...prev, ayaResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleDemoClick = (scenario: any) => {
    setSelectedDemo(scenario.id);
    handleSendMessage(scenario.userMessage);
  };

  const getPhilosophyColor = (philosophy?: string) => {
    switch (philosophy) {
      case 'ubuntu': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'teranga': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'harambee': return 'bg-green-100 text-green-800 border-green-200';
      case 'sankofa': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPhilosophyIcon = (philosophy?: string) => {
    switch (philosophy) {
      case 'ubuntu': return <Heart className="h-3 w-3" />;
      case 'teranga': return <Sparkles className="h-3 w-3" />;
      case 'harambee': return <Zap className="h-3 w-3" />;
      case 'sankofa': return <Crown className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">🤖 Aya - Assistant IA Culturel</CardTitle>
                  <CardDescription className="text-blue-100">
                    Intelligence Artificielle avec sagesse africaine authentique
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white">
                  <Globe className="h-3 w-3 mr-1" />
                  4 Philosophies
                </Badge>
                <Badge className="bg-white/20 text-white">
                  🌍 IA Africaine
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/aya-avatar.png" />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      AY
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Conversation avec Aya</CardTitle>
                    <CardDescription>Assistant IA avec sagesse africaine</CardDescription>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">En ligne</span>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'aya' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                          AY
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white ml-auto'
                            : 'bg-white border shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line">{message.content}</p>
                        
                        {message.culturalContext && (
                          <div className="mt-2 p-2 bg-amber-50 rounded text-sm border border-amber-200">
                            <p className="text-amber-800">
                              <span className="font-medium">💭 Contexte culturel :</span> {message.culturalContext}
                            </p>
                          </div>
                        )}
                        
                        {message.philosophy && (
                          <div className="mt-2">
                            <Badge className={`${getPhilosophyColor(message.philosophy)} border`}>
                              {getPhilosophyIcon(message.philosophy)}
                              <span className="ml-1 capitalize">{message.philosophy}</span>
                            </Badge>
                          </div>
                        )}
                        
                        {message.data && (
                          <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm font-medium text-green-900 mb-2">📊 Impact Mesuré :</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(message.data.metrics || message.data.teamMetrics || message.data.performance || message.data.improvement || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-green-700 capitalize">{key} :</span>
                                  <span className="font-medium text-green-800">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {message.suggestions && (
                          <div className="mt-3 space-y-1">
                            <p className="text-sm font-medium text-gray-700">💡 Suggestions :</p>
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="mr-2 mb-1 text-xs"
                                onClick={() => handleSendMessage(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                    
                    {message.type === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          U
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        AY
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white border shadow-sm p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Posez votre question à Aya..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={() => handleSendMessage()} disabled={!inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Démonstrations rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🚀 Démonstrations Rapides</CardTitle>
                <CardDescription>Testez les capacités d'Aya</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoScenarios.map((scenario) => (
                  <Button
                    key={scenario.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleDemoClick(scenario)}
                  >
                    <div className="flex items-start gap-3">
                      {scenario.icon}
                      <div>
                        <p className="font-medium text-sm">{scenario.title}</p>
                        <p className="text-xs text-gray-600">{scenario.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Capacités d'Aya */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎭 Philosophies Africaines</CardTitle>
                <CardDescription>Sagesse intégrée dans Aya</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ayaCapabilities.map((capability) => (
                  <div key={capability.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {capability.icon}
                      <h4 className="font-medium text-sm">{capability.name}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{capability.description}</p>
                    <p className="text-xs italic text-amber-700">{capability.philosophy}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Performance Aya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Précision culturelle</span>
                  <Badge className="bg-green-100 text-green-800">98%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Satisfaction utilisateurs</span>
                  <Badge className="bg-blue-100 text-blue-800">96%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Temps de réponse</span>
                  <Badge className="bg-purple-100 text-purple-800">1.2s</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Langues supportées</span>
                  <Badge className="bg-orange-100 text-orange-800">12</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

