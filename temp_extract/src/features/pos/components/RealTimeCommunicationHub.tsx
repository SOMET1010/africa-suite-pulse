import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Send, Bell, AlertTriangle, CheckCircle2, 
  Clock, ChefHat, Users, Smartphone, Volume2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommunicationMessage {
  id: string;
  from: 'kitchen' | 'floor' | 'manager';
  to: 'kitchen' | 'floor' | 'manager' | 'server' | 'all';
  type: 'info' | 'alert' | 'urgent' | 'acknowledge';
  priority: 'low' | 'normal' | 'high' | 'critical';
  message: string;
  context?: {
    order_id?: string;
    table_number?: string;
    server_name?: string;
    station?: string;
  };
  timestamp: string;
  read: boolean;
  acknowledged: boolean;
  requires_ack: boolean;
  auto_generated: boolean;
  handy_sent?: boolean;
  sound_alert?: boolean;
}

interface HandyDevice {
  id: string;
  name: string;
  server_name: string;
  is_online: boolean;
  battery_level: number;
  last_seen: string;
  assigned_tables: string[];
}

interface RealTimeCommunicationHubProps {
  userRole: 'kitchen' | 'floor' | 'manager';
  userId: string;
  userName: string;
}

export function RealTimeCommunicationHub({ 
  userRole, 
  userId, 
  userName 
}: RealTimeCommunicationHubProps) {
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<CommunicationMessage['priority']>('normal');
  const [handyDevices, setHandyDevices] = useState<HandyDevice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('messages');

  // Mock data initialization
  useEffect(() => {
    const mockMessages: CommunicationMessage[] = [
      {
        id: '1',
        from: 'kitchen',
        to: 'floor',
        type: 'alert',
        priority: 'high',
        message: 'Table 12 - Côte de bœuf prête, synchroniser avec les autres plats',
        context: { order_id: 'R1430-001', table_number: '12', server_name: 'Marie' },
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        read: false,
        acknowledged: false,
        requires_ack: true,
        auto_generated: true,
        handy_sent: true,
        sound_alert: true
      },
      {
        id: '2',
        from: 'floor',
        to: 'kitchen',
        type: 'info',
        priority: 'normal',
        message: 'Table 8 demande cuisson bien cuite pour l\'entrecôte',
        context: { table_number: '8', server_name: 'Jean' },
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        read: true,
        acknowledged: true,
        requires_ack: false,
        auto_generated: false
      },
      {
        id: '3',
        from: 'manager',
        to: 'all',
        type: 'urgent',
        priority: 'critical',
        message: 'Client VIP arrivé table 15 - Priorité absolue sur toutes les commandes',
        context: { table_number: '15' },
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        read: false,
        acknowledged: false,
        requires_ack: true,
        auto_generated: false,
        sound_alert: true
      }
    ];

    const mockHandyDevices: HandyDevice[] = [
      {
        id: 'handy-1',
        name: 'Handy 001',
        server_name: 'Marie Dubois',
        is_online: true,
        battery_level: 85,
        last_seen: new Date().toISOString(),
        assigned_tables: ['1', '2', '3', '12']
      },
      {
        id: 'handy-2',
        name: 'Handy 002',
        server_name: 'Jean Martin',
        is_online: true,
        battery_level: 45,
        last_seen: new Date(Date.now() - 3 * 60000).toISOString(),
        assigned_tables: ['4', '5', '6', '8']
      },
      {
        id: 'handy-3',
        name: 'Handy 003',
        server_name: 'Sophie Laurent',
        is_online: false,
        battery_level: 20,
        last_seen: new Date(Date.now() - 15 * 60000).toISOString(),
        assigned_tables: ['7', '9', '10']
      }
    ];

    setMessages(mockMessages);
    setHandyDevices(mockHandyDevices);
    setUnreadCount(mockMessages.filter(m => !m.read).length);
  }, []);

  // Auto-refresh simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new messages occasionally
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const autoMessage: CommunicationMessage = {
          id: Date.now().toString(),
          from: 'kitchen',
          to: 'floor',
          type: 'alert',
          priority: 'normal',
          message: `Commande prête pour service - Table ${Math.floor(Math.random() * 20) + 1}`,
          timestamp: new Date().toISOString(),
          read: false,
          acknowledged: false,
          requires_ack: true,
          auto_generated: true,
          handy_sent: true
        };
        
        setMessages(prev => [autoMessage, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        if (autoMessage.sound_alert) {
          // Simulate sound alert
          toast.success('Nouveau message cuisine', { duration: 3000 });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: CommunicationMessage = {
      id: Date.now().toString(),
      from: userRole,
      to: selectedRecipient as any,
      type: selectedPriority === 'critical' ? 'urgent' : 'info',
      priority: selectedPriority,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      acknowledged: false,
      requires_ack: selectedPriority === 'critical' || selectedPriority === 'high',
      auto_generated: false,
      sound_alert: selectedPriority === 'critical'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');
    
    toast.success(`Message envoyé à ${selectedRecipient === 'all' ? 'tous' : selectedRecipient}`);
    
    // Simulate handy notification for floor staff
    if (selectedRecipient === 'floor' || selectedRecipient === 'all') {
      toast.info('📱 Notification envoyée aux handys', { duration: 2000 });
    }
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const acknowledgeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, acknowledged: true, read: true } : msg
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
    toast.success('Message accusé réception');
  };

  const getMessageIcon = (type: CommunicationMessage['type'], from: CommunicationMessage['from']) => {
    if (type === 'urgent') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (from === 'kitchen') return <ChefHat className="h-4 w-4 text-orange-600" />;
    if (from === 'floor') return <Users className="h-4 w-4 text-blue-600" />;
    return <MessageSquare className="h-4 w-4 text-gray-600" />;
  };

  const getPriorityColor = (priority: CommunicationMessage['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'normal': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'low': return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getHandyStatusColor = (device: HandyDevice) => {
    if (!device.is_online) return 'bg-gray-500';
    if (device.battery_level < 20) return 'bg-red-500';
    if (device.battery_level < 50) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const filteredMessages = messages.filter(msg => {
    // Show messages relevant to user role
    return msg.to === 'all' || msg.to === userRole || msg.from === userRole;
  });

  return (
    <div className="h-full bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <h2 className="text-xl font-bold">Centre de Communication</h2>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount} non lus
                </Badge>
              )}
            </div>
            
            <TabsList className="bg-primary-foreground/20">
              <TabsTrigger value="messages" className="text-primary-foreground">
                Messages
              </TabsTrigger>
              <TabsTrigger value="handys" className="text-primary-foreground">
                Handys
              </TabsTrigger>
              <TabsTrigger value="send" className="text-primary-foreground">
                Envoyer
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Messages Tab */}
        <TabsContent value="messages" className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 space-y-3">
            {filteredMessages.map(message => (
              <Card 
                key={message.id}
                className={cn(
                  "border-l-4 transition-all duration-200",
                  getPriorityColor(message.priority),
                  !message.read && "shadow-md"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getMessageIcon(message.type, message.from)}
                      <div>
                        <div className="font-medium text-sm">
                          De: {message.from === 'kitchen' ? 'Cuisine' : message.from === 'floor' ? 'Salle' : 'Manager'}
                          {message.context?.server_name && ` (${message.context.server_name})`}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR')}
                          {message.handy_sent && (
                            <>
                              <Smartphone className="h-3 w-3" />
                              <span>Handy</span>
                            </>
                          )}
                          {message.sound_alert && (
                            <Volume2 className="h-3 w-3 text-orange-600" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!message.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(message.id)}
                        >
                          Marquer lu
                        </Button>
                      )}
                      
                      {message.requires_ack && !message.acknowledged && (
                        <Button
                          size="sm"
                          onClick={() => acknowledgeMessage(message.id)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Accusé réception
                        </Button>
                      )}
                      
                      {message.acknowledged && (
                        <Badge variant="outline" className="text-green-600">
                          ✓ Accusé
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm mb-2">{message.message}</p>
                  
                  {message.context && (
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                      {message.context.table_number && (
                        <Badge variant="outline">Table {message.context.table_number}</Badge>
                      )}
                      {message.context.order_id && (
                        <Badge variant="outline">Commande {message.context.order_id}</Badge>
                      )}
                      {message.context.station && (
                        <Badge variant="outline">Station {message.context.station}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Handys Tab */}
        <TabsContent value="handys" className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {handyDevices.map(device => (
                <Card key={device.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        {device.name}
                      </CardTitle>
                      <div 
                        className={cn(
                          "w-3 h-3 rounded-full",
                          getHandyStatusColor(device)
                        )}
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <strong>Serveur:</strong> {device.server_name}
                    </div>
                    
                    <div className="text-sm">
                      <strong>Statut:</strong> {device.is_online ? 'En ligne' : 'Hors ligne'}
                    </div>
                    
                    <div className="text-sm">
                      <strong>Batterie:</strong> {device.battery_level}%
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all",
                            device.battery_level > 50 ? "bg-green-500" :
                            device.battery_level > 20 ? "bg-orange-500" : "bg-red-500"
                          )}
                          style={{ width: `${device.battery_level}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <strong>Tables assignées:</strong> {device.assigned_tables.join(', ')}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Dernière activité: {new Date(device.last_seen).toLocaleTimeString('fr-FR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Send Tab */}
        <TabsContent value="send" className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Envoyer un message</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Destinataire</label>
                    <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="kitchen">Cuisine</SelectItem>
                        <SelectItem value="floor">Salle</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priorité</label>
                    <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                        <SelectItem value="critical">Critique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {selectedPriority === 'critical' && 'Envoi avec accusé de réception requis'}
                    {selectedPriority === 'high' && 'Envoi avec notification sonore'}
                  </div>
                  
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}