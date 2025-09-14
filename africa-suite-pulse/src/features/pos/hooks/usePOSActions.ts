/**
 * Centralized POS Actions - Phase 1: Architecture Foundation
 * Business logic separated from UI components
 */

import { useToast } from "@/hooks/use-toast";
import { usePOSStore } from '../store/usePOSStore';

export function usePOSActions() {
  const { toast } = useToast();
  const store = usePOSStore();

  const handleNewOrder = () => {
    if (!store.selectedTable) {
      toast({
        title: "Table requise",
        description: "Sélectionnez une table pour créer une commande",
        variant: "destructive"
      });
      return;
    }

    if (store.cartItems.length > 0) {
      toast({
        title: "Commande en cours",
        description: "Une commande est déjà en cours sur cette table",
        variant: "destructive"
      });
      return;
    }

    store.createOrder(store.customerCount);
    toast({
      title: "Nouvelle commande",
      description: `Commande créée pour ${store.customerCount} personnes`,
    });
  };

  const handleAddToCart = (product: any, quantity: number = 1) => {
    if (!store.currentOrder && !store.selectedTable) {
      toast({
        title: "Table requise",
        description: "Sélectionnez une table avant d'ajouter des articles",
        variant: "destructive"
      });
      return;
    }

    if (!store.currentOrder) {
      store.createOrder(store.customerCount);
    }

    store.addToCart(product, quantity);
    
    // Retour haptique sur mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    toast({
      title: "Article ajouté",
      description: `${product.name} x${quantity}`,
    });
  };

  const handleSendToKitchen = () => {
    if (store.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Ajoutez des articles avant d'envoyer en cuisine",
        variant: "destructive"
      });
      return;
    }

    const pendingItems = store.cartItems.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) {
      toast({
        title: "Aucun nouvel article",
        description: "Tous les articles ont déjà été envoyés",
        variant: "destructive"
      });
      return;
    }

    store.sendToKitchen();
    toast({
      title: "Envoyé en cuisine",
      description: `${pendingItems.length} articles envoyés`,
    });
  };

  const handleCheckout = () => {
    if (store.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à encaisser",
        variant: "destructive"
      });
      return;
    }
    
    store.setPaymentOpen(true);
  };

  const handleSplitBill = () => {
    if (store.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à séparer",
        variant: "destructive"
      });
      return;
    }
    
    store.setSplitBillOpen(true);
  };

  const handleTransferTable = () => {
    if (store.cartItems.length === 0) {
      toast({
        title: "Commande vide",
        description: "Aucune commande à transférer",
        variant: "destructive"
      });
      return;
    }

    store.setTableTransferOpen(true);
  };

  const handleApplyDiscount = (type: 'percentage' | 'amount', value: number) => {
    store.setDiscount(type, value);
    toast({
      title: "Remise appliquée",
      description: type === 'percentage' ? `${value}% de remise` : `${value} FCFA de remise`,
    });
  };

  const handleModeSwitch = (mode: 'serveur-rush' | 'caissier' | 'manager') => {
    store.setMode(mode);
    toast({
      title: "Mode changé",
      description: `Mode ${mode} activé`,
    });
  };

  return {
    handleNewOrder,
    handleAddToCart,
    handleSendToKitchen,
    handleCheckout,
    handleSplitBill,
    handleTransferTable,
    handleApplyDiscount,
    handleModeSwitch,
  };
}