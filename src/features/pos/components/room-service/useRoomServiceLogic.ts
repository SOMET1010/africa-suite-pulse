import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import type { DeliveryOptions } from "./RoomServiceDeliveryOptions";

// Local types for room service
interface LocalCartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ReservationForBilling {
  id: string;
  room_number: string;
  guest_name: string;
  adults: number;
  children: number;
}

interface UseRoomServiceLogicProps {
  reservation: ReservationForBilling | null;
}

interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  serviceCharge: number;
  tax: number;
  total: number;
}

export function useRoomServiceLogic({ reservation }: UseRoomServiceLogicProps) {
  const [cartItems, setCartItems] = useState<LocalCartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptions>({
    priority: 'normal',
    specialInstructions: '',
    deliveryTime: 'asap'
  });

  // Calculate totals with room service specific fees
  const calculateTotals = useCallback((): CartTotals => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    
    // Room service delivery fee based on priority
    const deliveryFee = deliveryOptions.priority === 'urgent' ? 2000 : 1000;
    
    // Service charge (10% for room service)
    const serviceCharge = Math.round(subtotal * 0.1);
    
    // Tax calculation (18% on subtotal + fees)
    const taxableAmount = subtotal + deliveryFee + serviceCharge;
    const tax = Math.round(taxableAmount * 0.18);
    
    const total = subtotal + deliveryFee + serviceCharge + tax;

    return {
      subtotal,
      deliveryFee,
      serviceCharge,
      tax,
      total
    };
  }, [cartItems, deliveryOptions.priority]);

  const totals = calculateTotals();

  const handleAddToCart = useCallback((product: any) => {
    const newItem: LocalCartItem = {
      id: `${product.id}-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price_ttc || product.price_ht || 0,
      total_price: product.price_ttc || product.price_ht || 0,
    };

    setCartItems(prev => [...prev, newItem]);
    
    toast({
      title: "Article ajouté",
      description: `${product.name} ajouté à la commande`,
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            quantity, 
            total_price: item.unit_price * quantity 
          }
        : item
    ));
  }, []);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    
    toast({
      title: "Article supprimé",
      description: "L'article a été retiré de la commande",
    });
  }, []);

  const handleUpdateDeliveryOptions = useCallback((updates: Partial<DeliveryOptions>) => {
    setDeliveryOptions(prev => ({ ...prev, ...updates }));
  }, []);

  const handleConfirmOrder = useCallback(async () => {
    if (!reservation || cartItems.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create room service order
      const orderData = {
        reservation_id: reservation.id,
        room_number: reservation.room_number,
        guest_name: reservation.guest_name,
        items: cartItems,
        delivery_options: deliveryOptions,
        totals,
        order_type: 'room_service',
        status: 'confirmed',
        estimated_delivery: calculateEstimatedDelivery()
      };

      console.log('Room Service Order:', orderData);
      
      // Clear cart and reset
      setCartItems([]);
      setDeliveryOptions({
        priority: 'normal',
        specialInstructions: '',
        deliveryTime: 'asap'
      });
      
      toast({
        title: "Commande confirmée",
        description: `Commande room service envoyée pour la chambre ${reservation.room_number}`,
      });
      
    } catch (error) {
      console.error('Error confirming room service order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la commande",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [reservation, cartItems, deliveryOptions, totals]);

  const calculateEstimatedDelivery = useCallback(() => {
    const now = new Date();
    let minutes = 20; // Default delivery time
    
    switch (deliveryOptions.deliveryTime) {
      case '30min':
        minutes = 30;
        break;
      case '1hour':
        minutes = 60;
        break;
      case 'asap':
      default:
        minutes = deliveryOptions.priority === 'urgent' ? 15 : 20;
        break;
    }
    
    return new Date(now.getTime() + minutes * 60000);
  }, [deliveryOptions]);

  return {
    cartItems,
    totals,
    deliveryOptions,
    isProcessing,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleUpdateDeliveryOptions,
    handleConfirmOrder
  };
}