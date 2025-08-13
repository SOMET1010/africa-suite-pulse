import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDashboardPreferences } from './useDashboardPreferences';

export interface NotificationData {
  id: string;
  type: 'reservation' | 'payment' | 'maintenance' | 'alert' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  data?: any;
  read: boolean;
  action_url?: string;
  context_id?: string;
}

const NOTIFICATION_SOUNDS = {
  low: '/sounds/notification-low.mp3',
  medium: '/sounds/notification-medium.mp3', 
  high: '/sounds/notification-high.mp3',
  critical: '/sounds/notification-critical.mp3'
};

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { preferences } = useDashboardPreferences();

  // Play notification sound
  const playNotificationSound = useCallback((priority: NotificationData['priority']) => {
    if (!preferences.notifications.sound) return;
    
    try {
      const audio = new Audio(NOTIFICATION_SOUNDS[priority]);
      audio.volume = 0.6;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [preferences.notifications.sound]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: NotificationData) => {
    if (!preferences.notifications.desktop) return;
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id
          });
        }
      });
    }
  }, [preferences.notifications.desktop]);

  // Add new notification with enhanced context
  const addNotification = useCallback((notificationData: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    const notification: NotificationData = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep last 100
    setUnreadCount(prev => prev + 1);

    // Store in localStorage for persistence
    try {
      const stored = localStorage.getItem('notifications_cache') || '[]';
      const cachedNotifications = JSON.parse(stored);
      cachedNotifications.unshift(notification);
      localStorage.setItem('notifications_cache', JSON.stringify(cachedNotifications.slice(0, 100)));
    } catch (error) {
      console.error('Error caching notification:', error);
    }

    // Check if notification type is enabled
    const isEnabled = preferences.notifications[notification.type as keyof typeof preferences.notifications];
    if (!isEnabled) return;

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.priority === 'critical' || notification.priority === 'high' ? 'destructive' : 'default'
    });

    // Play sound
    playNotificationSound(notification.priority);

    // Show desktop notification
    showDesktopNotification(notification);

    return notification;
  }, [preferences.notifications, toast, playNotificationSound, showDesktopNotification]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Load cached notifications on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('notifications_cache');
      if (cached) {
        const cachedNotifications = JSON.parse(cached);
        setNotifications(cachedNotifications);
        setUnreadCount(cachedNotifications.filter((n: NotificationData) => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading cached notifications:', error);
    }
  }, []);

  // Set up realtime listeners
  useEffect(() => {
    const setupListeners = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

    console.log('🔔 Setting up realtime notification listeners');

    // Listen to reservations for booking notifications
    const reservationsChannel = supabase
      .channel('reservation-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          const reservation = payload.new;
          addNotification({
            type: 'reservation',
            title: 'Nouvelle Réservation',
            message: `Réservation ${reservation.reference || 'nouvelle'} créée`,
            priority: 'medium',
            data: reservation,
            action_url: `/reservations/${reservation.id}`,
            context_id: reservation.id
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          const reservation = payload.new;
          const oldReservation = payload.old;
          
          // Check if status changed to checked_in  
          if (oldReservation.status !== 'present' && reservation.status === 'present') {
            addNotification({
              type: 'reservation',
              title: 'Check-in Effectué',
              message: `Check-in confirmé pour la réservation ${reservation.reference}`,
              priority: 'medium',
              data: reservation,
              action_url: `/reservations/${reservation.id}`,
              context_id: reservation.id
            });
          }
        }
      )
      .subscribe();

    // Listen to payments
    const paymentsChannel = supabase
      .channel('payment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payment_transactions'
        },
        (payload) => {
          const payment = payload.new;
          addNotification({
            type: 'payment',
            title: 'Nouveau Paiement',
            message: `Paiement de ${payment.amount} XOF reçu`,
            priority: 'low',
            data: payment,
            action_url: `/payments/${payment.id}`,
            context_id: payment.id
          });
        }
      )
      .subscribe();

      return () => {
        console.log('🔔 Cleaning up notification listeners');
        supabase.removeChannel(reservationsChannel);
        supabase.removeChannel(paymentsChannel);
      };
    };

    setupListeners();
  }, [addNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };
}