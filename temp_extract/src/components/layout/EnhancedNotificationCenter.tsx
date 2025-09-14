import React, { useState, useCallback } from 'react';
import { Bell, Check, AlertTriangle, Info, User, Bed, Clock, Package, X, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'checkin' | 'room' | 'order' | 'maintenance';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable?: boolean;
  metadata?: {
    entityId?: string;
    entityType?: string;
    roomNumber?: string;
    guestName?: string;
    amount?: number;
  };
}

export function EnhancedNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'checkin',
      title: 'Check-in imminent',
      message: 'Arrivée prévue dans 15 minutes',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: 'high',
      actionable: true,
      metadata: {
        entityId: 'res-001',
        entityType: 'reservation',
        roomNumber: '205',
        guestName: 'Jean Dupont'
      }
    },
    {
      id: '2',
      type: 'room',
      title: 'Chambre prête',
      message: 'Nettoyage terminé et chambre inspectée',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: 'medium',
      actionable: true,
      metadata: {
        entityId: 'room-101',
        entityType: 'room',
        roomNumber: '101'
      }
    },
    {
      id: '3',
      type: 'order',
      title: 'Commande prête',
      message: 'Table 5 - Plat principal prêt à servir',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      read: false,
      priority: 'urgent',
      actionable: true,
      metadata: {
        entityId: 'order-123',
        entityType: 'order',
        roomNumber: 'Table 5'
      }
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'Maintenance requise',
      message: 'Climatisation chambre 302 signalée défaillante',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: 'medium',
      actionable: true,
      metadata: {
        entityId: 'maint-001',
        entityType: 'maintenance',
        roomNumber: '302'
      }
    },
    {
      id: '5',
      type: 'success',
      title: 'Paiement reçu',
      message: 'Règlement facture #FAC-2024-156',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: 'low',
      metadata: {
        entityId: 'inv-156',
        entityType: 'invoice',
        amount: 450.00
      }
    },
  ]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'checkin':
        return <User className="h-4 w-4 text-primary" />;
      case 'room':
        return <Bed className="h-4 w-4 text-success" />;
      case 'order':
        return <Package className="h-4 w-4 text-warning" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 border-l-destructive';
      case 'high':
        return 'bg-warning/10 border-l-warning';
      case 'medium':
        return 'bg-primary/10 border-l-primary';
      case 'low':
        return 'bg-muted/10 border-l-muted-foreground';
      default:
        return 'bg-background border-l-border';
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

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const handleQuickAction = useCallback((notification: Notification) => {
    // Handle quick actions based on notification type
    switch (notification.type) {
      case 'checkin':
        logger.debug('Navigate to check-in', { guestName: notification.metadata?.guestName });
        break;
      case 'room':
        logger.debug('View room status', { roomNumber: notification.metadata?.roomNumber });
        break;
      case 'order':
        logger.debug('Navigate to order', { entityId: notification.metadata?.entityId });
        break;
      case 'maintenance':
        logger.debug('Create maintenance ticket', { roomNumber: notification.metadata?.roomNumber });
        break;
    }
    markAsRead(notification.id);
  }, [markAsRead]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.priority === 'urgent').length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant={urgentCount > 0 ? "destructive" : "default"}
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center",
                urgentCount > 0 && "animate-pulse"
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} non lues` : 'Tout lu'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Tout marquer lu
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications
                .sort((a, b) => {
                  // Sort by: unread first, then by priority, then by timestamp
                  if (a.read !== b.read) return a.read ? 1 : -1;
                  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                  if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
                  return b.timestamp.getTime() - a.timestamp.getTime();
                })
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer border-l-2",
                      !notification.read ? "bg-muted/50" : "hover:bg-muted/30",
                      getPriorityColor(notification.priority)
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "text-sm truncate",
                              !notification.read ? "font-medium" : "font-normal"
                            )}>
                              {notification.title}
                            </p>
                            {notification.priority === 'urgent' && (
                              <Badge variant="destructive" className="text-xs px-1 h-4">
                                URGENT
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          
                          {notification.metadata && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {notification.metadata.roomNumber && (
                                <span className="bg-muted px-2 py-1 rounded">
                                  {notification.metadata.roomNumber}
                                </span>
                              )}
                              {notification.metadata.guestName && (
                                <span>{notification.metadata.guestName}</span>
                              )}
                              {notification.metadata.amount && (
                                <span className="font-medium">
                                  {notification.metadata.amount.toFixed(2)}€
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      {notification.actionable && !notification.read && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAction(notification);
                            }}
                          >
                            Action rapide
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Voir toutes les notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}