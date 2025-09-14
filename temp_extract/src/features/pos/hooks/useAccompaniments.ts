import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Accompaniment {
  id: string;
  name: string;
  price: number;
  category: 'rice' | 'bread' | 'vegetable' | 'sauce' | 'drink';
  is_default: boolean;
  is_free: boolean;
  max_quantity: number;
}

interface ProductAccompaniment {
  product_id: string;
  accompaniment_id: string;
  is_required: boolean;
  is_included: boolean;
  default_quantity: number;
}

interface OfferItem {
  id: string;
  reason: string;
  value: number;
  type: 'percentage' | 'amount' | 'free_item';
  applied_by: string;
  applied_at: string;
}

export function useAccompaniments() {
  const [accompaniments, setAccompaniments] = useState<Accompaniment[]>([]);
  const [productAccompaniments, setProductAccompaniments] = useState<ProductAccompaniment[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const { toast } = useToast();

  // Données mock pour démonstration
  useEffect(() => {
    setAccompaniments([
      { id: '1', name: 'Riz blanc', price: 500, category: 'rice', is_default: true, is_free: false, max_quantity: 3 },
      { id: '2', name: 'Riz jollof', price: 800, category: 'rice', is_default: false, is_free: false, max_quantity: 2 },
      { id: '3', name: 'Pain', price: 200, category: 'bread', is_default: true, is_free: true, max_quantity: 2 },
      { id: '4', name: 'Salade', price: 300, category: 'vegetable', is_default: false, is_free: false, max_quantity: 1 },
      { id: '5', name: 'Sauce tomate', price: 0, category: 'sauce', is_default: true, is_free: true, max_quantity: 1 },
      { id: '6', name: 'Coca-Cola', price: 600, category: 'drink', is_default: false, is_free: false, max_quantity: 2 }
    ]);
  }, []);

  const getSuggestedAccompaniments = (productId: string, category?: string) => {
    // Logique intelligente pour suggérer des accompagnements
    const suggestions = accompaniments.filter(acc => {
      if (category === 'sauce' || category === 'meat') {
        return acc.category === 'rice' || acc.category === 'bread';
      }
      if (category === 'main') {
        return acc.category === 'vegetable' || acc.category === 'drink';
      }
      return acc.is_default;
    });

    return suggestions;
  };

  const getDefaultAccompaniments = (productId: string) => {
    return accompaniments.filter(acc => acc.is_default);
  };

  const calculateAccompanimentPrice = (accompanimentId: string, quantity: number) => {
    const acc = accompaniments.find(a => a.id === accompanimentId);
    if (!acc) return 0;
    
    if (acc.is_free) return 0;
    return acc.price * quantity;
  };

  const addOffer = (reason: string, value: number, type: OfferItem['type'], appliedBy: string) => {
    const newOffer: OfferItem = {
      id: Date.now().toString(),
      reason,
      value,
      type,
      applied_by: appliedBy,
      applied_at: new Date().toISOString()
    };

    setOffers(prev => [...prev, newOffer]);
    
    toast({
      title: "Offert appliqué",
      description: `${reason} - ${type === 'percentage' ? value + '%' : value + ' FCFA'}`,
    });

    return newOffer;
  };

  const removeOffer = (offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId));
    
    toast({
      title: "Offert retiré",
      description: "L'offert a été retiré de la commande",
    });
  };

  const calculateOfferDiscount = (subtotal: number) => {
    return offers.reduce((total, offer) => {
      if (offer.type === 'percentage') {
        return total + (subtotal * offer.value / 100);
      } else if (offer.type === 'amount') {
        return total + offer.value;
      }
      return total;
    }, 0);
  };

  const getFrequentlyOrderedTogether = (productId: string) => {
    // Cette fonction analyserait l'historique des commandes
    // Pour l'instant, on retourne des suggestions statiques
    const suggestions = [
      { id: '1', name: 'Riz blanc', frequency: 85 },
      { id: '6', name: 'Coca-Cola', frequency: 60 },
      { id: '4', name: 'Salade', frequency: 45 }
    ];
    
    return suggestions;
  };

  const createComboMenu = (items: string[], name: string, discountPercentage: number) => {
    // Logique pour créer un menu composé avec réduction
    const combo = {
      id: Date.now().toString(),
      name,
      items,
      discount: discountPercentage,
      created_at: new Date().toISOString()
    };

    toast({
      title: "Menu composé créé",
      description: `${name} avec ${discountPercentage}% de réduction`,
    });

    return combo;
  };

  const handleProductModification = (productId: string, modifications: {
    remove?: string[];
    add?: string[];
    special_instructions?: string;
  }) => {
    // Gérer les modifications de plats (allergies, préférences)
    const modification = {
      product_id: productId,
      remove: modifications.remove || [],
      add: modifications.add || [],
      special_instructions: modifications.special_instructions || '',
      timestamp: new Date().toISOString()
    };

    toast({
      title: "Modification enregistrée",
      description: "Les modifications du plat ont été prises en compte",
    });

    return modification;
  };

  return {
    accompaniments,
    offers,
    getSuggestedAccompaniments,
    getDefaultAccompaniments,
    calculateAccompanimentPrice,
    addOffer,
    removeOffer,
    calculateOfferDiscount,
    getFrequentlyOrderedTogether,
    createComboMenu,
    handleProductModification
  };
}