import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Timer,
  Bell,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KitchenNotification {
  id: string;
  type: 'order_ready' | 'delay_warning' | 'special_request' | 'priority_order';
  tableNumber: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}

interface KitchenDisplayNotificationsProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function KitchenDisplayNotifications({
  isVisible,
  onToggle
}: KitchenDisplayNotificationsProps) {
  const [notifications, setNotifications] = useState<KitchenNotification[]>([]);
  const { toast } = useToast();

  // Simulation de notifications temps réel
  useEffect(() => {
    const mockNotifications: KitchenNotification[] = [
      {
        id: '1',
        type: 'order_ready',
        tableNumber: 'T12',
        message: 'Commande T12 prête - 3 plats',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        priority: 'high',
        acknowledged: false
      },
      {
        id: '2', 
        type: 'delay_warning',
        tableNumber: 'T08',
        message: 'Retard prévu T08 - +10min sur estimation',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        priority: 'medium',
        acknowledged: false
      },
      {
        id: '3',
        type: 'special_request',
        tableNumber: 'T15',
        message: 'T15 - Demande sans arachides (allergie)',
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        priority: 'high',
        acknowledged: false
      }
    ];

    setNotifications(mockNotifications);

    // Simulation de nouvelles notifications
    const interval = setInterval(() => {
      const newNotification: KitchenNotification = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'order_ready' : 'delay_warning',
        tableNumber: `T${Math.floor(Math.random() * 20) + 1}`,
        message: Math.random() > 0.7 
          ? `Commande T${Math.floor(Math.random() * 20) + 1} prête`
          : `Retard T${Math.floor(Math.random() * 20) + 1} - +5min`,
        timestamp: new Date(),
        priority: Math.random() > 0.5 ? 'high' : 'medium',
        acknowledged: false
      };

      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, 5);
        
        // Toast pour les notifications importantes
        if (newNotification.priority === 'high') {
          toast({
            title: "🔔 Cuisine",
            description: newNotification.message,
            duration: 4000,
          });
        }
        
        return updated;
      });
    }, 15000); // Nouvelle notification toutes les 15 secondes

    return () => clearInterval(interval);
  }, [toast]);

  const acknowledgeNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, acknowledged: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: KitchenNotification['type']) => {
    switch (type) {
      case 'order_ready':
        return CheckCircle;
      case 'delay_warning':
        return Timer;
      case 'special_request':
        return AlertTriangle;
      case 'priority_order':
        return Bell;
    }
  };

  const getNotificationColor = (priority: KitchenNotification['priority'], acknowledged: boolean) => {
    if (acknowledged) return 'border-green-200 bg-green-50';
    
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: KitchenNotification['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Moyen</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Info</Badge>;
    }
  };

  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="ghost"
        size="sm"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full glass-card shadow-lg z-50"
      >
        <div className="relative">
          <Bell className="h-5 w-5" />
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unacknowledgedCount}
            </span>
          )}
        </div>
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 z-50">
      <Card className="glass-card shadow-elevate border-0">
        <div className="p-4 border-b bg-gradient-to-r from-card to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Notifications Cuisine</h3>
              {unacknowledgedCount > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {unacknowledgedCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-64 overflow-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all ${getNotificationColor(
                    notification.priority,
                    notification.acknowledged
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon 
                      className={`h-4 w-4 mt-0.5 ${
                        notification.acknowledged 
                          ? 'text-green-600' 
                          : notification.priority === 'high' 
                            ? 'text-red-600' 
                            : 'text-orange-600'
                      }`} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {notification.tableNumber}
                        </span>
                        {getPriorityBadge(notification.priority)}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="flex gap-1">
                          {!notification.acknowledged && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => acknowledgeNotification(notification.id)}
                              className="h-6 px-2 text-xs bg-green-100 hover:bg-green-200 text-green-800"
                            >
                              ✓ OK
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className="h-6 px-2 text-xs hover:bg-red-100 text-red-600"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}