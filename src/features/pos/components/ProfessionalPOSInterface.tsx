import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, MapPin, ChefHat, Receipt, CreditCard, Smartphone, 
  Plus, Minus, Trash2, Calculator, Percent, Coffee,
  Home, Timer, Clock, Settings, History
} from 'lucide-react';
import { useServerTables } from '../hooks/useTableAssignments';
import { usePOSAuthContext } from '../auth/POSAuthProvider';
import { toast } from 'sonner';
import { useRestaurantPOSLogic } from '../hooks/useRestaurantPOSLogic';
import { RestaurantPaymentFlow } from './RestaurantPaymentFlow';
import { POSProductGrid } from './POSProductGrid';
import { POSOrderZone } from './POSOrderZone';
import { POSPaymentZone } from './POSPaymentZone';
import { POSFloorPlan } from './POSFloorPlan';

// Import des images de produits africains
import attiekeImage from '@/assets/attieke-poisson.jpg';
import rizSauceImage from '@/assets/riz-sauce-graine.jpg';
import brochettesImage from '@/assets/brochettes.jpg';
import allocoImage from '@/assets/alloco.jpg';
import kedjenuImage from '@/assets/kedjenou.jpg';
import bissapImage from '@/assets/bissap.jpg';

interface ProfessionalPOSInterfaceProps {
  serverId: string;
  outletId: string;
}

// Produits africains avec organisation par catégories
const AFRICAN_PRODUCTS = [
  { code: '1', name: 'Attiéké Poisson', price: 1500, category: 'Plats', image_url: attiekeImage, emoji: '🐟' },
  { code: '2', name: 'Riz Sauce Graine', price: 2000, category: 'Plats', image_url: rizSauceImage, emoji: '🍚' },
  { code: '3', name: 'Brochettes', price: 1000, category: 'Grillades', image_url: brochettesImage, emoji: '🍢' },
  { code: '4', name: 'Poisson Braisé', price: 2500, category: 'Grillades', image_url: '/placeholder.svg', emoji: '🔥' },
  { code: '5', name: 'Bissap', price: 500, category: 'Boissons', image_url: bissapImage, emoji: '🌺' },
  { code: '6', name: 'Coca Cola', price: 600, category: 'Boissons', image_url: '/placeholder.svg', emoji: '🥤' },
  { code: '7', name: 'Bière Ivoire', price: 800, category: 'Bières', image_url: '/placeholder.svg', emoji: '🍺' },
  { code: '8', name: 'Flag', price: 700, category: 'Bières', image_url: '/placeholder.svg', emoji: '🍻' },
  { code: '9', name: 'Plantain Frit', price: 500, category: 'Accompagnements', image_url: '/placeholder.svg', emoji: '🍌' },
  { code: '11', name: 'Café Robusta', price: 300, category: 'Boissons', image_url: '/placeholder.svg', emoji: '☕' },
  { code: '12', name: 'Thé Lipton', price: 250, category: 'Boissons', image_url: '/placeholder.svg', emoji: '🍵' },
  { code: '21', name: 'Alloco', price: 1000, category: 'Plats', image_url: allocoImage, emoji: '🍠' },
  { code: '22', name: 'Kedjenou', price: 3000, category: 'Plats', image_url: kedjenuImage, emoji: '🍲' },
  { code: '31', name: 'Eau Minérale', price: 400, category: 'Boissons', image_url: '/placeholder.svg', emoji: '💧' },
  { code: '32', name: 'Jus Orange', price: 700, category: 'Boissons', image_url: '/placeholder.svg', emoji: '🍊' },
];

export const ProfessionalPOSInterface: React.FC<ProfessionalPOSInterfaceProps> = ({ 
  serverId, 
  outletId 
}) => {
  const { session } = usePOSAuthContext();
  const { data: serverTables = [] } = useServerTables(serverId, session?.org_id);
  
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [customerCount, setCustomerCount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [productCode, setProductCode] = useState('');
  const [showFloorPlan, setShowFloorPlan] = useState(false);
  const [showFloorPlanFullScreen, setShowFloorPlanFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Utilisation de la logique restaurant existante
  const {
    orderState,
    isBillPreviewOpen,
    isPaymentOpen,
    isSplitBillOpen,
    isTableTransferOpen,
    handleNewOrder,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleSendToKitchen,
    handleCheckout,
    handleProceedToPayment,
    handleApplyDiscount,
    calculateTotals,
    clearOrderOnly
  } = useRestaurantPOSLogic({
    selectedOutlet: { 
      id: outletId,
      org_id: session?.org_id || '',
      code: 'AFRICAN',
      name: 'POS Africain',
      outlet_type: 'restaurant',
      is_active: true,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    selectedTable,
    customerCount
  });

  const { cartItems, currentOrder } = orderState;
  const totals = calculateTotals();

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Actions principales
  const addToOrder = useCallback(async (product: any, quantity: number = 1) => {
    if (!currentOrder && selectedTable) {
      handleNewOrder();
    }
    
    const posProduct = {
      id: product.code,          // Map code to id
      name: product.name,
      base_price: product.price, // Map price to base_price
      category: product.category,
      image_url: product.image_url
    };
    
    handleAddToCart(posProduct, quantity);
    toast.success(`${product.name} ajouté`, { duration: 1000 });
  }, [currentOrder, selectedTable, handleNewOrder, handleAddToCart]);

  const addProductByCode = useCallback(() => {
    const product = AFRICAN_PRODUCTS.find(p => p.code === productCode.trim());
    if (product) {
      addToOrder(product);
      setProductCode('');
    } else {
      toast.error(`Code ${productCode} introuvable`);
      setProductCode('');
    }
  }, [productCode, addToOrder]);

  const clearOrder = useCallback(() => {
    clearOrderOnly();
    setProductCode('');
    setSelectedTable(null);
    toast.success("Nouveau ticket");
  }, [clearOrderOnly]);

  const sendToKitchen = useCallback(() => {
    if (cartItems.length === 0) {
      toast.error('Aucun article');
      return;
    }
    if (!selectedTable) {
      toast.error('Sélectionner table');
      return;
    }
    handleSendToKitchen();
  }, [cartItems, selectedTable, handleSendToKitchen]);

  const showBillPreview = useCallback(() => {
    if (cartItems.length === 0) {
      toast.error('Aucun article pour l\'addition');
      return;
    }
    if (!selectedTable) {
      toast.error('Sélectionner une table');
      return;
    }
    handleCheckout();
  }, [cartItems, selectedTable, handleCheckout]);

  // Statut des tables avec couleurs
  const getTableStatus = (table: any) => {
    if (table.status === 'occupied') return { color: 'bg-destructive', text: 'Occupée' };
    if (table.status === 'reserved') return { color: 'bg-warning', text: 'Réservée' };
    if (table.status === 'addition_requested') return { color: 'bg-yellow-500', text: 'Addition' };
    if (table.status === 'payment_pending') return { color: 'bg-blue-500', text: 'Paiement' };
    return { color: 'bg-success', text: 'Libre' };
  };

  // Plan de salle miniature
  const FloorPlanMini = () => (
    <div className="grid grid-cols-4 gap-2 p-4">
      {serverTables.slice(0, 8).map((table) => {
        const status = getTableStatus(table);
        return (
          <button
            key={table.table_id}
            className={`h-12 rounded-lg text-xs font-bold text-white transition-all ${
              status.color
            } ${selectedTable?.table_id === table.table_id ? 'ring-2 ring-white' : ''}`}
            onClick={() => setSelectedTable(table)}
          >
            T{table.table_number}
          </button>
        );
      })}
    </div>
  );

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'F1': // Nouveau ticket
          e.preventDefault();
          clearOrder();
          break;
        case 'F2': // Addition
          e.preventDefault();
          showBillPreview();
          break;
        case 'F3': // Cuisine
          e.preventDefault();
          sendToKitchen();
          break;
        case 'F4': // Plan salle
          e.preventDefault();
          if (showFloorPlanFullScreen) {
            setShowFloorPlanFullScreen(false);
          } else {
            setShowFloorPlan(!showFloorPlan);
          }
          break;
        case 'Escape':
          if (showFloorPlanFullScreen) {
            e.preventDefault();
            setShowFloorPlanFullScreen(false);
          }
          break;
        case 'Enter':
          e.preventDefault();
          addProductByCode();
          break;
        default:
          if (!isNaN(Number(e.key)) && e.key !== '0') {
            setProductCode(prev => prev + e.key);
          }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [productCode, showFloorPlan]);

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Overlay fullscreen pour plan de salle */}
      {showFloorPlanFullScreen && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full flex flex-col">
            <div className="h-16 bg-card border-b flex items-center justify-between px-6">
              <h2 className="text-xl font-bold">Plan de Salle - Vue Complète</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">Appuyez sur Échap ou F4 pour fermer</div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowFloorPlanFullScreen(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
            <div className="flex-1 p-6">
              <POSFloorPlan
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
                isFullScreen={true}
                onToggleFullScreen={() => setShowFloorPlanFullScreen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Header professionnel */}
      <div className="h-16 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground flex items-center justify-between px-6 shadow-lg">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold">CAFÉ DE COCODY</h1>
            <div className="text-sm opacity-90">Terminal POS Restaurant</div>
          </div>
          
          {selectedTable && (
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <div>
                  <div className="font-semibold">Table {selectedTable.table_number}</div>
                  <div className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {customerCount} couverts
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm opacity-75">TOTAL</div>
            <div className="text-2xl font-bold">{totals.total.toLocaleString()} FCFA</div>
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-75">HEURE</div>
            <div className="text-lg font-mono">
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone 1: Produits (gauche) */}
        <div className="w-2/5 bg-card border-r flex flex-col">
          <POSProductGrid
            products={AFRICAN_PRODUCTS}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onProductSelect={addToOrder}
            productCode={productCode}
            onProductCodeChange={setProductCode}
            onProductCodeSubmit={addProductByCode}
          />
        </div>

        {/* Zone 2: Commande (centre) */}
        <div className="w-2/5 bg-background flex flex-col">
          <POSOrderZone
            cartItems={cartItems}
            selectedTable={selectedTable}
            customerCount={customerCount}
            totals={totals}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onSendToKitchen={sendToKitchen}
            onShowBillPreview={showBillPreview}
            onCustomerCountChange={setCustomerCount}
          />
        </div>

        {/* Zone 3: Paiement & Actions (droite) */}
        <div className="w-1/5 bg-card border-l flex flex-col">
          <POSPaymentZone
            totals={totals}
            cartItems={cartItems}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            onClearOrder={clearOrder}
            onApplyDiscount={handleApplyDiscount}
            onShowBillPreview={showBillPreview}
            onSendToKitchen={sendToKitchen}
            showFloorPlan={showFloorPlan}
            onToggleFloorPlan={() => setShowFloorPlan(!showFloorPlan)}
            showFloorPlanFullScreen={showFloorPlanFullScreen}
            onToggleFloorPlanFullScreen={() => setShowFloorPlanFullScreen(true)}
          />
        </div>
      </div>

      {/* Dialogs de paiement */}
      <RestaurantPaymentFlow
        isBillPreviewOpen={isBillPreviewOpen}
        isPaymentOpen={isPaymentOpen}
        isSplitBillOpen={isSplitBillOpen}
        isTableTransferOpen={isTableTransferOpen}
        currentOrder={currentOrder}
        cartItems={cartItems}
        totals={totals}
        selectedTable={selectedTable}
        selectedOutlet={{
          id: outletId,
          org_id: session?.org_id || '',
          code: 'AFRICAN',
          name: 'POS Africain',
          outlet_type: 'restaurant',
          is_active: true,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }}
        onCloseBillPreview={() => {}}
        onClosePayment={() => {}}
        onCloseSplitBill={() => {}}
        onCloseTableTransfer={() => {}}
        onProceedToPayment={handleProceedToPayment}
        onPaymentComplete={() => {
          clearOrder();
          toast.success('Paiement effectué - Nouvelle commande');
        }}
      />
    </div>
  );
};