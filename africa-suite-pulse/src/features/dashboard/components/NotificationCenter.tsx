import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings,
  AlertTriangle,
  Info,
  XCircle,
  Calendar
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useRealtimeNotifications, NotificationData } from '../hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

const NOTIFICATION_ICONS = {
  reservation: Calendar,
  payment: CheckCheck,
  maintenance: Settings,
  alert: AlertTriangle,
  system: Info
};

const PRIORITY_STYLES = {
  low: 'border-info/50 bg-info/5',
  medium: 'border-warning/50 bg-warning/5',
  high: 'border-destructive/50 bg-destructive/5',
  critical: 'border-destructive bg-destructive/10 animate-pulse'
};

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onRemove 
}: { 
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type];
  
  return (
    <div className={cn(
      'p-3 border rounded-lg transition-all duration-200 hover:shadow-sm',
      PRIORITY_STYLES[notification.priority],
      !notification.read && 'border-l-4 border-l-primary'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-1.5 rounded-full',
          notification.priority === 'critical' && 'bg-destructive/20',
          notification.priority === 'high' && 'bg-destructive/10',
          notification.priority === 'medium' && 'bg-warning/10',
          notification.priority === 'low' && 'bg-info/10'
        )}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn(
              'font-medium text-sm truncate',
              !notification.read && 'font-semibold'
            )}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant={notification.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                {notification.priority}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={() => onRemove(notification.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(notification.timestamp, { 
                addSuffix: true, 
                locale: fr 
              })}
            </span>
            
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="h-3 w-3 mr-1" />
                Lu
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useRealtimeNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Tout marquer
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="group">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onRemove={(id) => {
                          // In a real app, you'd want to confirm this action
                          logger.debug('Remove notification', { id });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}