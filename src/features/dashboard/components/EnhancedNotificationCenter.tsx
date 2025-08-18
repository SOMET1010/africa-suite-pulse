import React from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, ExternalLink, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useRealtimeNotifications, NotificationData } from '../hooks/useRealtimeNotifications';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';

const NOTIFICATION_ICONS = {
  reservation: Info,
  payment: CheckCircle,
  maintenance: AlertTriangle,
  alert: AlertTriangle,
  system: Info
};

const PRIORITY_STYLES = {
  low: 'border-l-blue-400 bg-blue-50/10',
  medium: 'border-l-yellow-400 bg-yellow-50/10',
  high: 'border-l-orange-400 bg-orange-50/10',
  critical: 'border-l-red-400 bg-red-50/10'
};

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  onAction?: (notification: NotificationData) => void;
}

function NotificationItem({ notification, onMarkAsRead, onRemove, onAction }: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type];
  const navigate = useNavigate();
  
  const handleAction = () => {
    if (notification.action_url) {
      navigate(notification.action_url);
    } else if (onAction) {
      onAction(notification);
    }
    onMarkAsRead(notification.id);
  };

  return (
    <div className={cn(
      "p-3 border-l-4 space-y-2 transition-all",
      PRIORITY_STYLES[notification.priority],
      notification.read ? 'opacity-60' : ''
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate">
              {notification.title}
            </h4>
            <Badge variant="outline" className="text-xs">
              {notification.priority}
            </Badge>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {notification.timestamp.toLocaleTimeString()}
            </span>
            
            <div className="flex gap-1">
              {(notification.action_url || onAction) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAction}
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Voir
                </Button>
              )}
              
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 px-2 text-xs"
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(notification.id)}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnhancedNotificationCenter() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  } = useRealtimeNotifications();

  const handleNotificationAction = (notification: NotificationData) => {
    // Default action handlers based on type
    switch (notification.type) {
      case 'reservation':
        if (notification.context_id) {
          navigate(`/reservations/${notification.context_id}`);
        } else {
          navigate('/rack');
        }
        break;
      case 'payment':
        if (notification.context_id) {
          navigate(`/payments/${notification.context_id}`);
        } else {
          navigate('/payments');
        }
        break;
      case 'maintenance':
        navigate('/maintenance');
        break;
      default:
        logger.warn('No default action for notification type', { type: notification.type });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Tout marquer comme lu
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAll}
                  className="text-xs"
                >
                  Effacer tout
                </Button>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={(id) => {
                      // Remove from local state (notifications hook handles this)
                      markAsRead(id);
                    }}
                    onAction={handleNotificationAction}
                  />
                  {index < notifications.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions Footer */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Actions rapides:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/rack/new-reservation')}
                className="h-6 px-2 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Réservation
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/guests/new')}
                className="h-6 px-2 text-xs"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Client
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}