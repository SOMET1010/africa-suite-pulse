import { useState, useEffect } from 'react';
import { RestaurantPOSLayout } from './RestaurantPOSLayout';
import { SmartSuggestions } from './SmartSuggestions';
import { KitchenDisplayNotifications } from './KitchenDisplayNotifications';
import { MobileServerInterface } from './MobileServerInterface';
import { useAdvancedKeyboardShortcuts } from '../hooks/useAdvancedKeyboardShortcuts';
import { useToast } from '@/hooks/use-toast';
import type { POSProduct } from '../types';

export function EnhancedRestaurantPOSLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { toast } = useToast();

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Configuration des raccourcis clavier avancés
  const { showKeyboardHelp } = useAdvancedKeyboardShortcuts({
    onQuickAdd: (plu: string) => {
      toast({
        title: "Ajout rapide",
        description: `PLU: ${plu}`,
        duration: 2000,
      });
    },
    onQuickFunction: (functionKey: string) => {
      switch (functionKey) {
        case 'F1':
          showKeyboardHelp();
          break;
        case 'F2':
          const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        case 'F8':
          // Envoyer en cuisine
          toast({
            title: "F8 - Envoi cuisine",
            description: "Commande envoyée en cuisine",
            duration: 2000,
          });
          break;
        case 'F11':
          toast({
            title: "F11 - Changer mode",
            description: "Changement de mode de service",
            duration: 2000,
          });
          break;
        case 'F12':
          toast({
            title: "F12 - Changer vendeur",
            description: "Changement de vendeur",
            duration: 2000,
          });
          break;
      }
    },
    onNumericEntry: (value: string) => {
      setSearchQuery(prev => prev + value);
    },
    onSearch: setSearchQuery,
    isSearchFocused
  });

  const handleAddSuggestion = (product: POSProduct) => {
    toast({
      title: "Article ajouté",
      description: `${product.name} ajouté à la commande`,
    });
  };

  const timeOfDay = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  })() as 'morning' | 'afternoon' | 'evening';

  // Interface mobile optimisée pour serveurs
  if (isMobileView) {
    return (
      <div className="min-h-screen">
        <MobileServerInterface
          items={[]}
          onAddItem={(productId) => console.log('Add item:', productId)}
          onUpdateQuantity={(productId, quantity) => console.log('Update quantity:', productId, quantity)}
          onSendToKitchen={() => console.log('Send to kitchen')}
          onCheckout={() => console.log('Checkout')}
          onAddNote={(note) => console.log('Add note:', note)}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Layout principal avec intégrations */}
      <RestaurantPOSLayout />
      
      {/* Suggestions intelligentes - Position fixe en bas à gauche */}
      <div className="fixed bottom-4 left-4 w-80 z-40">
        <SmartSuggestions
          currentItems={[]}
          selectedTable={undefined}
          customerCount={2}
          timeOfDay={timeOfDay}
          onAddSuggestion={handleAddSuggestion}
        />
      </div>

      {/* Notifications cuisine */}
      <KitchenDisplayNotifications
        isVisible={showNotifications}
        onToggle={() => setShowNotifications(!showNotifications)}
      />

      {/* Focus tracking pour recherche */}
      <div className="sr-only">
        <input
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={{ position: 'absolute', left: '-9999px' }}
        />
      </div>
    </div>
  );
}