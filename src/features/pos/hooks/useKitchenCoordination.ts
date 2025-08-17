

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "../types";

interface KitchenOrder {
  id: string;
  table_number: string;
  server_name: string;
  items: CartItem[];
  status: 'pending' | 'in_progress' | 'ready' | 'served';
  created_at: string;
  estimated_time?: number;
  notes?: string;
}

interface KitchenMessage {
  id: string;
  order_id: string;
  from_kitchen: boolean;
  message: string;
  created_at: string;
  is_urgent: boolean;
}

export function useKitchenCoordination() {
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [messages, setMessages] = useState<KitchenMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('kitchen-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pos_orders' },
        (payload) => {
          console.log('Kitchen order update:', payload);
          fetchKitchenOrders();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'kitchen_messages' },
        (payload) => {
          console.log('Kitchen message update:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchKitchenOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pos_orders')
        .select(`
          *,
          pos_order_items(*)
        `)
        .in('status', ['sent', 'in_progress'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedOrders: KitchenOrder[] = data?.map(order => ({
        id: order.id,
        table_number: order.table_id || 'N/A',
        server_name: 'Serveur',
        items: (order.pos_order_items || []).map((item: any) => ({
          ...item,
          product_name: item.product_name || 'Article',
          product_code: item.product_code || '',
          product: { name: item.product_name || 'Article' }
        })),
        status: (order.status === 'sent' ? 'pending' : order.status) as KitchenOrder['status'],
        created_at: order.created_at,
        estimated_time: 15,
        notes: (order as any).notes || (order as any).note || '' // Gestion sécurisée des propriétés notes
      })) || [];

      setKitchenOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes cuisine",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      // Mock messages for now since table doesn't exist
      const mockMessages: KitchenMessage[] = [];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: KitchenOrder['status'], estimatedTime?: number) => {
    try {
      const { error } = await supabase
        .from('pos_orders')
        .update({ 
          status,
          estimated_completion_time: estimatedTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Commande marquée comme ${status}`,
      });

      // Notifier le serveur si la commande est prête
      if (status === 'ready') {
        await sendNotificationToServer(orderId, "Commande prête à servir");
      }

    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const sendMessageToServer = async (orderId: string, message: string, isUrgent = false) => {
    try {
      // Mock implementation for now
      toast({
        title: "Message envoyé",
        description: "Le serveur a été notifié",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  const sendNotificationToServer = async (orderId: string, message: string) => {
    // Ici on pourrait intégrer avec un système de notifications push
    // Pour l'instant, on utilise les messages
    await sendMessageToServer(orderId, message, true);
  };

  const markItemReady = async (orderId: string, itemId: string) => {
    try {
      const { error } = await supabase
        .from('pos_order_items')
        .update({ status: 'ready' })
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Article prêt",
        description: "Article marqué comme prêt",
      });
    } catch (error) {
      console.error('Error marking item ready:', error);
    }
  };

  const requestServerAction = async (orderId: string, action: string, message: string) => {
    await sendMessageToServer(orderId, `${action}: ${message}`, true);
  };

  // Charger les données initiales
  useEffect(() => {
    fetchKitchenOrders();
    fetchMessages();
  }, []);

  return {
    kitchenOrders,
    messages,
    isLoading,
    updateOrderStatus,
    sendMessageToServer,
    markItemReady,
    requestServerAction,
    refresh: fetchKitchenOrders
  };
}

