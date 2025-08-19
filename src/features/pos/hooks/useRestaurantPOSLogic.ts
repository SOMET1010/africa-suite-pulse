import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePOSOrderState } from "./usePOSOrderState";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import type { POSOutlet, POSTable } from "../types";

interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'server';
  initials: string;
}

interface UseRestaurantPOSLogicProps {
  selectedOutlet: POSOutlet | null;
  selectedTable: POSTable | null;
  customerCount: number;
}

export function useRestaurantPOSLogic({ 
  selectedOutlet, 
  selectedTable, 
  customerCount 
}: UseRestaurantPOSLogicProps) {
  const [isBillPreviewOpen, setIsBillPreviewOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isTableTransferOpen, setIsTableTransferOpen] = useState(false);
  const [discountApplied, setDiscountApplied] = useState({ type: 'none', value: 0 });
  
  const { toast } = useToast();
  const orderState = usePOSOrderState({ selectedOutlet, selectedTable });

  // Gestionnaires d'actions restauration
  const handleNewOrder = () => {
    if (!selectedTable) {
      toast({
        title: "Table requise",
        description: "Sélectionnez une table pour créer une commande",
        variant: "destructive"
      });
      return;
    }

    if (orderState.cartItems.length > 0) {
      toast({
        title: "Commande en cours",
        description: "Une commande est déjà en cours sur cette table",
        variant: "destructive"
      });
      return;
    }

    orderState.actions.createOrder(customerCount);
  };

  const handleAddToCart = async (product: any, quantity: number = 1) => {
    if (!orderState.currentOrder) {
      if (!selectedTable) {
        toast({
          title: "Table requise",
          description: "Sélectionnez une table avant d'ajouter des articles",
          variant: "destructive"
        });
        return;
      }
      
      try {
        // Créer la commande et attendre qu'elle soit terminée
        await orderState.actions.createOrder(customerCount);
        // Ajouter l'article à la nouvelle commande
        await orderState.actions.addItem(product, quantity);
      } catch (error) {
        console.error("Erreur lors de la création de commande:", error);
      }
    } else {
      // Ajouter l'article à la commande existante
      await orderState.actions.addItem(product, quantity);
    }

    // Retour haptique sur mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const item = orderState.cartItems.find(item => item.product_id === productId);
    if (item) {
      orderState.actions.updateQuantity(item.id, quantity, item.unit_price);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    const item = orderState.cartItems.find(item => item.product_id === productId);
    if (item) {
      orderState.actions.removeItem(item.id);
    }
  };

  const handleSendToKitchen = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Ajoutez des articles avant d'envoyer en cuisine",
        variant: "destructive"
      });
      return;
    }

    const pendingItems = orderState.cartItems.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      toast({
        title: "Aucun nouvel article",
        description: "Tous les articles ont déjà été envoyés",
        variant: "destructive"
      });
      return;
    }

    orderState.actions.sendToKitchen();
  };

  const handleSplitBill = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à séparer",
        variant: "destructive"
      });
      return;
    }
    
    setIsSplitBillOpen(true);
  };

  const handleTransferTable = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à transférer",
        variant: "destructive"
      });
      return;
    }

    setIsTableTransferOpen(true);
  };

  const handleCheckout = () => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à encaisser",
        variant: "destructive"
      });
      return;
    }
    
    // En restauration: d'abord l'addition, puis le paiement
    setIsBillPreviewOpen(true);
  };

  const handleProceedToPayment = () => {
    setIsBillPreviewOpen(false);
    setIsPaymentOpen(true);
  };

  const handleApplyDiscount = (type: 'percentage' | 'amount', value: number) => {
    setDiscountApplied({ type, value });
    toast({
      title: "Remise appliquée",
      description: type === 'percentage' ? `${value}% de remise` : `${value} FCFA de remise`,
    });
  };

  const handleRoomCharge = (roomId: string) => {
    if (orderState.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à facturer",
        variant: "destructive"
      });
      return;
    }
    
    setIsPaymentOpen(true);
    toast({
      title: "Room Charge activé",
      description: `Facturation sur chambre ${roomId}`,
    });
  };

  const handleSelectPrinter = (stationType: 'hot' | 'cold' | 'bar') => {
    toast({
      title: "Station sélectionnée",
      description: `Station ${stationType} active pour les prochains envois`,
    });
  };

  const calculateTotals = () => {
    const subtotal = orderState.cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxRate = 18;
    const serviceChargeRate = 10;
    
    let adjustedSubtotal = subtotal;
    
    if (discountApplied.type === 'percentage') {
      adjustedSubtotal = subtotal * (1 - discountApplied.value / 100);
    } else if (discountApplied.type === 'amount') {
      adjustedSubtotal = Math.max(0, subtotal - discountApplied.value);
    }
    
    const serviceCharge = adjustedSubtotal * (serviceChargeRate / 100);
    const taxAmount = (adjustedSubtotal + serviceCharge) * (taxRate / 100);
    
    return {
      subtotal: adjustedSubtotal,
      serviceCharge,
      taxAmount,
      total: adjustedSubtotal + serviceCharge + taxAmount,
      discount: subtotal - adjustedSubtotal,
    };
  };

  const clearOrderOnly = () => {
    orderState.actions.clearOrder();
    setDiscountApplied({ type: 'none', value: 0 });
  };

  // Modern keyboard shortcuts
  useKeyboardShortcuts({
    onSendToKitchen: handleSendToKitchen,
    onCheckout: handleCheckout,
    onNewOrder: handleNewOrder,
    onSplitBill: handleSplitBill,
    onTransferTable: handleTransferTable,
    disabled: false
  });

  return {
    // State
    orderState,
    isBillPreviewOpen,
    isPaymentOpen,
    isSplitBillOpen,
    isTableTransferOpen,
    discountApplied,

    // Setters
    setIsBillPreviewOpen,
    setIsPaymentOpen,
    setIsSplitBillOpen,
    setIsTableTransferOpen,

    // Handlers
    handleNewOrder,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleSendToKitchen,
    handleSplitBill,
    handleTransferTable,
    handleCheckout,
    handleProceedToPayment,
    handleApplyDiscount,
    handleRoomCharge,
    handleSelectPrinter,
    calculateTotals,
    clearOrderOnly
  };
}