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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, Plus, X, Clock, AlertTriangle, Volume2, Search, Filter, 
  Utensils, ChefHat, Timer, Zap, User, Users, Table, UserCheck, 
  Settings, Info, Target, CheckCircle
} from 'lucide-react';

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
  applicable_modes?: ('direct' | 'assigned')[];
}

interface Server {
  id: string;
  name: string;
  is_active: boolean;
  current_tables: number;
  max_tables: number;
  shift_type: 'morning' | 'evening' | 'full';
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  section: string;
  is_occupied: boolean;
  server_id?: string;
  server_name?: string;
  order_start_time?: Date;
}

interface OrderMode {
  mode: 'direct' | 'assigned';
  server?: Server;
  table?: Table;
  session_info?: {
    current_user: string;
    role: 'server' | 'manager' | 'host';
    permissions: string[];
  };
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
    orderMode: OrderMode;
    tableInfo?: {
      tableNumber: string;
      serverName: string;
      guestCount?: number;
      specialRequests?: string[];
    };
  }) => void;
  selectedMessages?: string[];
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  allergens?: string[];
  currentWorkstation?: string;
  initialOrderMode?: OrderMode;
  availableServers?: Server[];
  availableTables?: Table[];
}

const WORKSTATIONS = [
  { id: 'grill', name: 'Grill', icon: '🔥', color: '#ef4444' },
  { id: 'fryer', name: 'Friteuse', icon: '🍟', color: '#f59e0b' },
  { id: 'saute', name: 'Sauteuse', icon: '🍳', color: '#eab308' },
  { id: 'pastry', name: 'Pâtisserie', icon: '🧁', color: '#ec4899' },
  { id: 'cold', name: 'Froid', icon: '🥗', color: '#10b981' },
  { id: 'garnish', name: 'Garniture', icon: '🌿', color: '#84cc16' }
];

// Messages adaptés aux différents modes
const KITCHEN_MESSAGES: KitchenMessage[] = [
  // Messages communs aux deux modes
  { 
    id: 'cooking-1', 
    category: 'cooking', 
    message_text: 'Cuisson à point', 
    icon: '🔥', 
    color: '#ef4444', 
    is_priority: false, 
    workstation: 'grill', 
    estimated_time: 2,
    applicable_modes: ['direct', 'assigned']
  },
  { 
    id: 'cooking-2', 
    category: 'cooking', 
    message_text: 'Bien cuit', 
    icon: '🥩', 
    color: '#dc2626', 
    is_priority: false, 
    workstation: 'grill', 
    estimated_time: 3,
    applicable_modes: ['direct', 'assigned']
  },
  
  // Messages spécifiques au mode direct (serveur prend directement)
  { 
    id: 'direct-rush', 
    category: 'timing', 
    message_text: 'Service direct - Client pressé', 
    icon: '⚡', 
    color: '#f59e0b', 
    is_priority: true, 
    sound_alert: true,
    applicable_modes: ['direct']
  },
  { 
    id: 'direct-vip', 
    category: 'special', 
    message_text: 'Client VIP - Service direct', 
    icon: '👑', 
    color: '#8b5cf6', 
    is_priority: true,
    applicable_modes: ['direct']
  },
  
  // Messages spécifiques au mode assigné (table ouverte avec serveur)
  { 
    id: 'assigned-sync', 
    category: 'timing', 
    message_text: 'Synchroniser avec autres plats table', 
    icon: '🔄', 
    color: '#10b981', 
    is_priority: false,
    applicable_modes: ['assigned']
  },
  { 
    id: 'assigned-first', 
    category: 'timing', 
    message_text: 'Premier service de la table', 
    icon: '1️⃣', 
    color: '#06b6d4', 
    is_priority: false,
    applicable_modes: ['assigned']
  },
  { 
    id: 'assigned-followup', 
    category: 'timing', 
    message_text: 'Suite de commande - même table', 
    icon: '➕', 
    color: '#8b5cf6', 
    is_priority: false,
    applicable_modes: ['assigned']
  },
  
  // Messages d'allergies (communs)
  { 
    id: 'allergy-nuts', 
    category: 'allergy', 
    message_text: 'SANS FRUITS À COQUE', 
    icon: '🚫', 
    color: '#dc2626', 
    is_priority: true, 
    sound_alert: true,
    applicable_modes: ['direct', 'assigned']
  },
  { 
    id: 'allergy-gluten', 
    category: 'allergy', 
    message_text: 'SANS GLUTEN', 
    icon: '🌾', 
    color: '#dc2626', 
    is_priority: true, 
    sound_alert: true,
    applicable_modes: ['direct', 'assigned']
  },
  
  // Messages spéciaux
  { 
    id: 'special-presentation', 
    category: 'special', 
    message_text: 'Présentation soignée', 
    icon: '✨', 
    color: '#8b5cf6', 
    is_priority: false, 
    estimated_time: 2,
    applicable_modes: ['direct', 'assigned']
  },
  { 
    id: 'special-manager', 
    category: 'special', 
    message_text: 'Validation manager requise', 
    icon: '👨‍💼', 
    color: '#dc2626', 
    is_priority: true,
    applicable_modes: ['assigned']
  }
];

// Serveurs de démonstration
const DEMO_SERVERS: Server[] = [
  { id: '1', name: 'Marie Dubois', is_active: true, current_tables: 3, max_tables: 5, shift_type: 'full' },
  { id: '2', name: 'Jean Martin', is_active: true, current_tables: 2, max_tables: 4, shift_type: 'morning' },
  { id: '3', name: 'Sophie Laurent', is_active: true, current_tables: 4, max_tables: 6, shift_type: 'evening' },
  { id: '4', name: 'Pierre Moreau', is_active: false, current_tables: 0, max_tables: 4, shift_type: 'evening' }
];

// Tables de démonstration
const DEMO_TABLES: Table[] = [
  { id: '1', number: '01', capacity: 2, section: 'Terrasse', is_occupied: false },
  { id: '2', number: '02', capacity: 4, section: 'Salle', is_occupied: true, server_id: '1', server_name: 'Marie Dubois' },
  { id: '3', number: '03', capacity: 6, section: 'Salle', is_occupied: false },
  { id: '4', number: '10', capacity: 2, section: 'Bar', is_occupied: true, server_id: '2', server_name: 'Jean Martin' }
];

export function KitchenMessagesSelector({
  isOpen,
  onClose,
  onConfirm,
  selectedMessages = [],
  orderType = 'dine-in',
  allergens = [],
  currentWorkstation,
  initialOrderMode,
  availableServers = DEMO_SERVERS,
  availableTables = DEMO_TABLES
}: KitchenMessagesSelectorProps) {
  // États principaux
  const [selected, setSelected] = useState<string[]>(selectedMessages);
  const [customMessage, setCustomMessage] = useState('');
  const [activeTab, setActiveTab] = useState('cooking');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [workstation, setWorkstation] = useState(currentWorkstation || '');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [soundAlert, setSoundAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // États pour les modes de commande
  const [orderMode, setOrderMode] = useState<OrderMode>(
    initialOrderMode || { mode: 'direct' }
  );
  const [selectedServer, setSelectedServer] = useState<Server | undefined>(
    initialOrderMode?.server
  );
  const [selectedTable, setSelectedTable] = useState<Table | undefined>(
    initialOrderMode?.table
  );
  const [guestCount, setGuestCount] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);

  // Messages filtrés selon le mode actuel
  const applicableMessages = useMemo(() => {
    return KITCHEN_MESSAGES.filter(msg => 
      !msg.applicable_modes || msg.applicable_modes.includes(orderMode.mode)
    );
  }, [orderMode.mode]);

  // Suggestions automatiques basées sur le contexte et le mode
  const recommendedMessages = useMemo(() => {
    const recommendations: string[] = [];
    
    // Suggestions basées sur le mode
    if (orderMode.mode === 'direct') {
      if (orderType === 'takeaway') recommendations.push('direct-rush');
    } else {
      // Mode assigné
      if (selectedTable?.is_occupied) {
        recommendations.push('assigned-followup');
      } else {
        recommendations.push('assigned-first');
      }
      
      if (selectedServer && selectedServer.current_tables >= selectedServer.max_tables - 1) {
        recommendations.push('assigned-sync');
      }
    }
    
    // Suggestions basées sur les allergènes
    if (allergens.includes('nuts')) recommendations.push('allergy-nuts');
    if (allergens.includes('gluten')) recommendations.push('allergy-gluten');
    
    // Suggestions basées sur le poste de travail
    if (currentWorkstation === 'grill') {
      recommendations.push('cooking-1', 'cooking-2');
    }
    
    return recommendations;
  }, [orderMode, selectedTable, selectedServer, allergens, orderType, currentWorkstation]);

  // Filtrage des messages
  const filteredMessages = useMemo(() => {
    let filtered = applicableMessages;
    
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.message_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (workstation) {
      filtered = filtered.filter(msg => 
        !msg.workstation || msg.workstation === workstation
      );
    }
    
    return filtered;
  }, [applicableMessages, searchTerm, workstation]);

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

  const calculateTotalTime = useCallback(() => {
    return selected.reduce((total, msgId) => {
      const message = applicableMessages.find(m => m.id === msgId);
      return total + (message?.estimated_time || 0);
    }, 0);
  }, [selected, applicableMessages]);

  const handleModeChange = useCallback((mode: 'direct' | 'assigned') => {
    setOrderMode({ mode });
    setSelectedServer(undefined);
    setSelectedTable(undefined);
    setSelected([]); // Reset sélection car messages différents
  }, []);

  const handleServerSelection = useCallback((serverId: string) => {
    const server = availableServers.find(s => s.id === serverId);
    setSelectedServer(server);
    setOrderMode(prev => ({ ...prev, server }));
  }, [availableServers]);

  const handleTableSelection = useCallback((tableId: string) => {
    const table = availableTables.find(t => t.id === tableId);
    setSelectedTable(table);
    setOrderMode(prev => ({ ...prev, table }));
  }, [availableTables]);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const selectedMessagesData = selected.map(id => applicableMessages.find(m => m.id === id)).filter(Boolean);
    const hasUrgentMessages = selectedMessagesData.some(m => m?.is_priority);
    
    const tableInfo = orderMode.mode === 'assigned' && selectedTable && selectedServer ? {
      tableNumber: selectedTable.number,
      serverName: selectedServer.name,
      guestCount,
      specialRequests
    } : undefined;
    
    onConfirm({
      messages: selected,
      customMessage: customMessage.trim() || undefined,
      priority: hasUrgentMessages ? 'urgent' : priority,
      workstation: workstation || undefined,
      estimatedTime: calculateTotalTime(),
      soundAlert: soundAlert || selectedMessagesData.some(m => m?.sound_alert),
      orderMode: {
        ...orderMode,
        server: selectedServer,
        table: selectedTable
      },
      tableInfo
    });
    
    setIsLoading(false);
    onClose();
  }, [selected, customMessage, priority, workstation, soundAlert, orderMode, selectedServer, selectedTable, guestCount, specialRequests, onConfirm, onClose, calculateTotalTime, applicableMessages]);

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

  const canConfirm = selected.length > 0 && (
    orderMode.mode === 'direct' || 
    (orderMode.mode === 'assigned' && selectedServer && selectedTable)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages pour la cuisine
              {selected.length > 0 && (
                <Badge variant="secondary">{selected.length} sélectionné(s)</Badge>
              )}
            </div>
            <Badge className={`${
              orderMode.mode === 'direct' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {orderMode.mode === 'direct' ? '🎯 Mode Direct' : '📋 Mode Assigné'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Sélection du mode de prise de commande */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Mode de prise de commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={orderMode.mode === 'direct' ? 'default' : 'outline'}
                className="h-20 flex flex-col gap-2"
                onClick={() => handleModeChange('direct')}
              >
                <Target className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Service Direct</div>
                  <div className="text-xs opacity-70">Serveur prend directement</div>
                </div>
              </Button>
              
              <Button
                variant={orderMode.mode === 'assigned' ? 'default' : 'outline'}
                className="h-20 flex flex-col gap-2"
                onClick={() => handleModeChange('assigned')}
              >
                <Users className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Table Assignée</div>
                  <div className="text-xs opacity-70">Table ouverte + serveur</div>
                </div>
              </Button>
            </div>

            {/* Configuration mode assigné */}
            {orderMode.mode === 'assigned' && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Serveur assigné</Label>
                  <Select value={selectedServer?.id || ''} onValueChange={handleServerSelection}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choisir un serveur" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableServers.filter(s => s.is_active).map(server => (
                        <SelectItem key={server.id} value={server.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{server.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {server.current_tables}/{server.max_tables}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Table</Label>
                  <Select value={selectedTable?.id || ''} onValueChange={handleTableSelection}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choisir une table" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map(table => (
                        <SelectItem 
                          key={table.id} 
                          value={table.id}
                          disabled={table.is_occupied && !table.server_id}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>Table {table.number}</span>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline">{table.capacity}p</Badge>
                              {table.is_occupied && (
                                <Badge variant="secondary">Occupée</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedServer && selectedTable && (
                  <div className="col-span-2 flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="text-sm">
                      <strong>{selectedServer.name}</strong> → Table <strong>{selectedTable.number}</strong> 
                      ({selectedTable.section}, {selectedTable.capacity} places)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Configuration mode direct */}
            {orderMode.mode === 'direct' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Info className="h-4 w-4" />
                  Mode service direct activé - Commande prise directement par le serveur
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Filtres et recherche */}
        <div className="flex gap-2 py-2">
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sound"
              checked={soundAlert}
              onCheckedChange={(checked) => setSoundAlert(checked === true)}
            />
            <Label htmlFor="sound" className="text-sm flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              Son
            </Label>
          </div>
        </div>

        {/* Messages */}
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
                                {message.applicable_modes && (
                                  <Badge className="text-xs">
                                    {message.applicable_modes.includes('direct') && message.applicable_modes.includes('assigned') 
                                      ? 'Tous modes' 
                                      : message.applicable_modes[0] === 'direct' ? 'Direct' : 'Assigné'}
                                  </Badge>
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

        {/* Message personnalisé */}
        <div className="border-t pt-4">
          <Label htmlFor="custom-message" className="text-sm font-medium">
            Message personnalisé
          </Label>
          <Textarea
            id="custom-message"
            placeholder="Instructions spéciales pour la cuisine..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selected.length > 0 && (
              <span>
                {selected.length} message(s) • +{calculateTotalTime() + estimatedTime}min
                {orderMode.mode === 'assigned' && selectedServer && selectedTable && 
                  ` • ${selectedServer.name} - Table ${selectedTable.number}`
                }
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading || !canConfirm}
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
      </DialogContent>
    </Dialog>
  );
}