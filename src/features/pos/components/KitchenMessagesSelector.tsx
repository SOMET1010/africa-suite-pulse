import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Plus, X, Clock, AlertTriangle, Volume2, Search, Filter, Utensils, ChefHat, Timer, Zap } from 'lucide-react';

interface KitchenMessage {
  id: string;
  category: string;
  message_text: string;
  icon: string;
  color: string;
  is_priority: boolean;
  workstation?: string;
  estimated_time?: number;
  sound_alert?: boolean;
  auto_conditions?: string[];
}

interface MessageTemplate {
  id: string;
  name: string;
  messages: string[];
  customMessage?: string;
  category: string;
}

interface KitchenMessagesSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    messages: string[];
    customMessage?: string;
    priority: 'normal' | 'urgent' | 'critical';
    workstation?: string;
    estimatedTime?: number;
    soundAlert: boolean;
    template?: string;
  }) => void;
  selectedMessages?: string[];
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  allergens?: string[];
  currentWorkstation?: string;
}

const WORKSTATIONS = [
  { id: 'grill', name: 'Grill', icon: '🔥' },
  { id: 'fryer', name: 'Friteuse', icon: '🍟' },
  { id: 'saute', name: 'Sauteuse', icon: '🍳' },
  { id: 'pastry', name: 'Pâtisserie', icon: '🧁' },
  { id: 'cold', name: 'Froid', icon: '🥗' },
  { id: 'garnish', name: 'Garniture', icon: '🌿' }
];

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'rush-hour',
    name: 'Service Rush',
    messages: ['timing-rush', 'cooking-fast'],
    category: 'timing'
  },
  {
    id: 'allergy-severe',
    name: 'Allergie Sévère',
    messages: ['allergy-nuts', 'special-clean'],
    customMessage: 'ATTENTION: Allergie sévère - Nettoyer tous les ustensiles',
    category: 'allergy'
  },
  {
    id: 'vip-table',
    name: 'Table VIP',
    messages: ['special-presentation', 'timing-priority'],
    category: 'special'
  }
];

export function KitchenMessagesSelector({
  isOpen,
  onClose,
  onConfirm,
  selectedMessages = [],
  orderType = 'dine-in',
  allergens = [],
  currentWorkstation
}: KitchenMessagesSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedMessages);
  const [customMessage, setCustomMessage] = useState('');
  const [activeTab, setActiveTab] = useState('cooking');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [workstation, setWorkstation] = useState(currentWorkstation || '');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [soundAlert, setSoundAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulation des données - dans la vraie app, cela viendrait de Supabase
  const messages: KitchenMessage[] = [
    // Messages de cuisson
    { id: 'cooking-1', category: 'cooking', message_text: 'Cuisson à point', icon: '🔥', color: '#ef4444', is_priority: false, workstation: 'grill', estimated_time: 2 },
    { id: 'cooking-2', category: 'cooking', message_text: 'Bien cuit', icon: '🥩', color: '#dc2626', is_priority: false, workstation: 'grill', estimated_time: 3 },
    { id: 'cooking-3', category: 'cooking', message_text: 'Saignant', icon: '🩸', color: '#b91c1c', is_priority: true, workstation: 'grill', estimated_time: 1 },
    { id: 'cooking-fast', category: 'cooking', message_text: 'Service rapide demandé', icon: '⚡', color: '#f59e0b', is_priority: true, estimated_time: 0, sound_alert: true },
    
    // Messages d'allergies
    { id: 'allergy-nuts', category: 'allergy', message_text: 'SANS FRUITS À COQUE', icon: '🚫', color: '#dc2626', is_priority: true, sound_alert: true },
    { id: 'allergy-gluten', category: 'allergy', message_text: 'SANS GLUTEN', icon: '🌾', color: '#dc2626', is_priority: true, sound_alert: true },
    { id: 'allergy-dairy', category: 'allergy', message_text: 'SANS LACTOSE', icon: '🥛', color: '#dc2626', is_priority: true, sound_alert: true },
    
    // Messages spéciaux
    { id: 'special-1', category: 'special', message_text: 'Présentation soignée', icon: '✨', color: '#8b5cf6', is_priority: false, estimated_time: 2 },
    { id: 'special-clean', category: 'special', message_text: 'Changer ustensiles', icon: '🧽', color: '#06b6d4', is_priority: true, estimated_time: 1 },
    { id: 'special-presentation', category: 'special', message_text: 'Présentation VIP', icon: '👑', color: '#f59e0b', is_priority: true, estimated_time: 3 },
    
    // Messages de timing
    { id: 'timing-1', category: 'timing', message_text: 'Synchroniser avec table 5', icon: '⏰', color: '#10b981', is_priority: false },
    { id: 'timing-rush', category: 'timing', message_text: 'URGENT - Service rush', icon: '🚨', color: '#dc2626', is_priority: true, sound_alert: true },
    { id: 'timing-priority', category: 'timing', message_text: 'Priorité absolue', icon: '🔴', color: '#dc2626', is_priority: true, sound_alert: true }
  ];

  // Suggestions automatiques basées sur le contexte
  const recommendedMessages = useMemo(() => {
    const recommendations: string[] = [];
    
    // Suggestions basées sur les allergènes
    if (allergens.includes('nuts')) recommendations.push('allergy-nuts');
    if (allergens.includes('gluten')) recommendations.push('allergy-gluten');
    if (allergens.includes('dairy')) recommendations.push('allergy-dairy');
    
    // Suggestions basées sur le type de commande
    if (orderType === 'delivery') recommendations.push('special-1');
    if (orderType === 'takeaway') recommendations.push('cooking-fast');
    
    // Suggestions basées sur le poste de travail
    if (currentWorkstation === 'grill') {
      recommendations.push('cooking-1', 'cooking-2', 'cooking-3');
    }
    
    return recommendations;
  }, [allergens, orderType, currentWorkstation]);

  // Filtrage des messages
  const filteredMessages = useMemo(() => {
    let filtered = messages;
    
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.message_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (showOnlyRecommended) {
      filtered = filtered.filter(msg => recommendedMessages.includes(msg.id));
    }
    
    if (workstation) {
      filtered = filtered.filter(msg => 
        !msg.workstation || msg.workstation === workstation
      );
    }
    
    return filtered;
  }, [messages, searchTerm, showOnlyRecommended, recommendedMessages, workstation]);

  const messagesByCategory = filteredMessages.reduce((acc, message) => {
    if (!acc[message.category]) {
      acc[message.category] = [];
    }
    acc[message.category].push(message);
    return acc;
  }, {} as Record<string, KitchenMessage[]>);

  const categories = Object.keys(messagesByCategory);

  // Auto-sélection des messages recommandés
  useEffect(() => {
    if (isOpen && recommendedMessages.length > 0) {
      setSelected(prev => [...new Set([...prev, ...recommendedMessages])]);
    }
  }, [isOpen, recommendedMessages]);

  const toggleMessage = useCallback((messageId: string) => {
    setSelected(prev => 
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  const applyTemplate = useCallback((template: MessageTemplate) => {
    setSelected(template.messages);
    setCustomMessage(template.customMessage || '');
    setActiveTab(template.category);
    setSelectedTemplate(template.id);
  }, []);

  const calculateTotalTime = useCallback(() => {
    return selected.reduce((total, msgId) => {
      const message = messages.find(m => m.id === msgId);
      return total + (message?.estimated_time || 0);
    }, 0);
  }, [selected, messages]);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    
    // Simulation d'une validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedMessagesData = selected.map(id => messages.find(m => m.id === id)).filter(Boolean);
    const hasUrgentMessages = selectedMessagesData.some(m => m?.is_priority);
    
    onConfirm({
      messages: selected,
      customMessage: customMessage.trim() || undefined,
      priority: hasUrgentMessages ? 'urgent' : priority,
      workstation: workstation || undefined,
      estimatedTime: calculateTotalTime(),
      soundAlert: soundAlert || selectedMessagesData.some(m => m?.sound_alert),
      template: selectedTemplate || undefined
    });
    
    setIsLoading(false);
    onClose();
  }, [selected, customMessage, priority, workstation, soundAlert, selectedTemplate, onConfirm, onClose, calculateTotalTime, messages]);

  const getCategoryLabel = (category: string) => {
    const labels = {
      cooking: 'Cuisson',
      allergy: 'Allergies',
      special: 'Spécial',
      timing: 'Timing'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      cooking: <ChefHat className="h-4 w-4" />,
      allergy: <AlertTriangle className="h-4 w-4" />,
      special: <Utensils className="h-4 w-4" />,
      timing: <Timer className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <MessageSquare className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      urgent: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages pour la cuisine
              {selected.length > 0 && (
                <Badge variant="secondary">{selected.length} sélectionné(s)</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {calculateTotalTime() > 0 && (
                <Badge className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  +{calculateTotalTime()}min
                </Badge>
              )}
              <Badge className={getPriorityColor(priority)}>
                {priority === 'normal' ? 'Normal' : priority === 'urgent' ? 'Urgent' : 'Critique'}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Filtres et recherche */}
        <div className="space-y-3 border-b pb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={workstation} onValueChange={setWorkstation}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les postes</SelectItem>
                {WORKSTATIONS.map(ws => (
                  <SelectItem key={ws.id} value={ws.id}>
                    {ws.icon} {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommended"
                  checked={showOnlyRecommended}
                  onCheckedChange={(checked) => setShowOnlyRecommended(checked === true)}
                />
                <Label htmlFor="recommended" className="text-sm">
                  Seulement les recommandés ({recommendedMessages.length})
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sound"
                  checked={soundAlert}
                  onCheckedChange={(checked) => setSoundAlert(checked === true)}
                />
                <Label htmlFor="sound" className="text-sm flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  Alerte sonore
                </Label>
              </div>
            </div>

            <Select value={selectedTemplate} onValueChange={(value) => {
              const template = MESSAGE_TEMPLATES.find(t => t.id === value);
              if (template) applyTemplate(template);
            }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Modèles prédéfinis" />
              </SelectTrigger>
              <SelectContent>
                {MESSAGE_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {getCategoryLabel(category)}
                  <Badge variant="outline" className="ml-1">
                    {messagesByCategory[category]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 overflow-y-auto space-y-4 mt-4">
              {categories.map(category => (
                <TabsContent key={category} value={category} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {messagesByCategory[category]?.map(message => {
                      const isSelected = selected.includes(message.id);
                      const isRecommended = recommendedMessages.includes(message.id);
                      
                      return (
                        <Button
                          key={message.id}
                          variant={isSelected ? "default" : "outline"}
                          className="justify-start h-auto p-4 relative group"
                          onClick={() => toggleMessage(message.id)}
                          style={{
                            borderColor: isSelected ? message.color : isRecommended ? '#f59e0b' : undefined,
                            backgroundColor: isSelected ? message.color + '20' : isRecommended ? '#fef3c7' : undefined
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl">{message.icon}</span>
                            <div className="text-left">
                              <div className="text-sm font-medium">{message.message_text}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                {message.workstation && (
                                  <span>📍 {WORKSTATIONS.find(w => w.id === message.workstation)?.name}</span>
                                )}
                                {message.estimated_time && (
                                  <span>⏱️ +{message.estimated_time}min</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {message.is_priority && (
                            <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                              ⚠️
                            </Badge>
                          )}
                          
                          {isRecommended && !isSelected && (
                            <Badge className="absolute -top-2 -left-2 px-2 py-1 text-xs bg-amber-500">
                              ⭐
                            </Badge>
                          )}
                          
                          {message.sound_alert && (
                            <Volume2 className="h-3 w-3 text-orange-500" />
                          )}
                          
                          {isSelected && (
                            <X className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        {/* Section message personnalisé et paramètres */}
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-message" className="text-sm font-medium">
                Message personnalisé
              </Label>
              <Textarea
                id="custom-message"
                placeholder="Instructions spéciales pour la cuisine..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Priorité</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">🟢 Normal</SelectItem>
                    <SelectItem value="urgent">🟡 Urgent</SelectItem>
                    <SelectItem value="critical">🔴 Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Temps estimé supplémentaire</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  className="mt-1"
                  placeholder="minutes"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selected.length > 0 && (
                <span>
                  {selected.length} message(s) • Temps total: +{calculateTotalTime() + estimatedTime}min
                  {soundAlert && " • 🔊 Alerte sonore"}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleConfirm} 
                disabled={isLoading || selected.length === 0}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}