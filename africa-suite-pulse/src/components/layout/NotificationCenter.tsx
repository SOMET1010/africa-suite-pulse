import React, { useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter() {
  // Mock notifications - in real app, this would come from a context or API
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Nouvelle réservation',
      message: 'Réservation confirmée pour la chambre 205',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Maintenance requise',
      message: 'Chambre 301 nécessite une inspection',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Paiement reçu',
      message: 'Facture #1234 réglée avec succès',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative hover:bg-soft-primary transition-elegant"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-danger text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 glass-card border-accent-gold/20 shadow-luxury"
      >
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-accent-gold/20" />
        
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id}
                  className={`p-3 hover:bg-soft-primary transition-elegant cursor-pointer ${
                    !notification.read ? 'bg-soft-info/50' : ''
                  }`}
                >
                  <div className="flex gap-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-charcoal truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-info rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(notification.timestamp)}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-accent-gold/20" />
            <DropdownMenuItem className="text-center hover:bg-soft-primary transition-elegant">
              <span className="w-full text-sm text-primary font-medium">
                Voir toutes les notifications
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}