import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Package, AlertTriangle, Clock, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInventoryData } from "../../hooks/useInventoryData";

interface Notification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning' | 'reorder_point';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  item?: any;
  timestamp: Date;
  acknowledged: boolean;
}

interface InventoryNotificationsProps {
  onRestockClick?: (items: any[]) => void;
}

export function InventoryNotifications({ onRestockClick }: InventoryNotificationsProps) {
  const { toast } = useToast();
  const { stockItems, lowStockItems } = useInventoryData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [stockItems, lowStockItems]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];

    // Out of stock notifications
    const outOfStockItems = stockItems.filter(item => item.current_stock <= 0);
    outOfStockItems.forEach(item => {
      newNotifications.push({
        id: `out-of-stock-${item.id}`,
        type: 'out_of_stock',
        title: 'Rupture de stock',
        message: `${item.name} est en rupture de stock`,
        priority: 'critical',
        item,
        timestamp: new Date(),
        acknowledged: false
      });
    });

    // Low stock notifications
    const criticalLowStock = lowStockItems.filter(item => 
      item.current_stock > 0 && item.current_stock <= item.min_stock_level * 0.5
    );
    criticalLowStock.forEach(item => {
      newNotifications.push({
        id: `critical-low-${item.id}`,
        type: 'low_stock',
        title: 'Stock critique',
        message: `${item.name} a un stock critique (${item.current_stock} restant)`,
        priority: 'high',
        item,
        timestamp: new Date(),
        acknowledged: false
      });
    });

    // Regular low stock notifications
    const regularLowStock = lowStockItems.filter(item => 
      item.current_stock > item.min_stock_level * 0.5 && item.current_stock <= item.min_stock_level
    );
    regularLowStock.forEach(item => {
      newNotifications.push({
        id: `low-stock-${item.id}`,
        type: 'low_stock',
        title: 'Stock faible',
        message: `${item.name} approche du seuil minimum (${item.current_stock}/${item.min_stock_level})`,
        priority: 'medium',
        item,
        timestamp: new Date(),
        acknowledged: false
      });
    });

    // Expiry warnings (mock for demonstration)
    const expiringItems = stockItems.filter(item => 
      item.expiry_date && new Date(item.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
    expiringItems.forEach(item => {
      newNotifications.push({
        id: `expiry-${item.id}`,
        type: 'expiry_warning',
        title: 'Expiration proche',
        message: `${item.name} expire le ${new Date(item.expiry_date!).toLocaleDateString('fr-FR')}`,
        priority: 'high',
        item,
        timestamp: new Date(),
        acknowledged: false
      });
    });

    // Sort by priority and timestamp
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    newNotifications.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setNotifications(newNotifications);
  };

  const acknowledgeNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, acknowledged: true } : notif
    ));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock':
      case 'low_stock':
        return Package;
      case 'expiry_warning':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const activeNotifications = notifications.filter(n => !n.acknowledged);
  const displayedNotifications = showAll ? notifications : activeNotifications.slice(0, 5);

  const handleQuickRestock = () => {
    const restockItems = notifications
      .filter(n => (n.type === 'low_stock' || n.type === 'out_of_stock') && n.item)
      .map(n => n.item);
    
    if (restockItems.length > 0 && onRestockClick) {
      onRestockClick(restockItems);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications Inventaire
            {activeNotifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeNotifications.length}
              </Badge>
            )}
          </CardTitle>
          {activeNotifications.length > 0 && (
            <Button 
              size="sm" 
              onClick={handleQuickRestock}
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              Réapprovisionner
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-600">Tout va bien !</p>
            <p className="text-muted-foreground">Aucune alerte d'inventaire en cours.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    notification.acknowledged ? 'bg-muted/50 opacity-60' : 'bg-background'
                  } transition-all`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`} />
                  <Icon className="w-5 h-5 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <Badge 
                        variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.acknowledged && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => acknowledgeNotification(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {!showAll && notifications.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                className="w-full"
              >
                Voir toutes les notifications ({notifications.length})
              </Button>
            )}
            
            {showAll && notifications.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(false)}
                className="w-full"
              >
                Réduire
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}