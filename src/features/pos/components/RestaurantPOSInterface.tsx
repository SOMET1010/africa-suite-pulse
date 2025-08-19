import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, Users, Receipt, Plus, Minus, Trash2, Clock, 
  Coffee, Utensils, UtensilsCrossed, Wine, ChefHat, MapPin,
  CreditCard, Banknote, Smartphone, Percent, History, 
  Split, ArrowRightLeft, Send, Calculator, DollarSign,
  Keyboard, Bell, Settings, LogOut, User, Home, Search
} from 'lucide-react';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSProducts';
import { usePOSTables } from '../hooks/usePOSTables';
import { usePOSAuthContext } from '../auth/POSAuthProvider';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';

interface RestaurantPOSInterfaceProps {
  serverId: string;
  outletId: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  category?: string;
  notes?: string;
  sentToKitchen?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  color: string;
}

interface DiscountType {
  id: string;
  name: string;
  type: 'percentage' | 'amount';
  value: number;
}

// Emojis pour les catégories
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('entrée') || name.includes('appetizer')) return '🥗';
  if (name.includes('plat') || name.includes('main')) return '🍽️';
  if (name.includes('boisson') || name.includes('drink')) return '🥤';
  if (name.includes('dessert')) return '🍰';
  if (name.includes('bière') || name.includes('beer')) return '🍺';
  return '🍴';
};

// Méthodes de paiement
const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Espèces', icon: Banknote, color: 'bg-green-600' },
  { id: 'card', name: 'Carte', icon: CreditCard, color: 'bg-blue-600' },
  { id: 'mobile', name: 'Mobile Money', icon: Smartphone, color: 'bg-purple-600' },
  { id: 'room', name: 'Room Charge', icon: Home, color: 'bg-orange-600' },
];

// Types de remises
const DISCOUNT_TYPES: DiscountType[] = [
  { id: 'staff', name: 'Personnel (-20%)', type: 'percentage', value: 20 },
  { id: 'student', name: 'Étudiant (-15%)', type: 'percentage', value: 15 },
  { id: 'happy_hour', name: 'Happy Hour (-25%)', type: 'percentage', value: 25 },
  { id: 'vip', name: 'VIP (-30%)', type: 'percentage', value: 30 },
  { id: 'custom', name: 'Personnalisée', type: 'amount', value: 0 },
];

export const RestaurantPOSInterface: React.FC<RestaurantPOSInterfaceProps> = ({ 
  serverId, 
  outletId 
}) => {
  const { session } = usePOSAuthContext();
  const { formatCurrency } = useCurrency();
  
  // Hooks pour récupérer les données réelles
  const { data: products = [], isLoading: productsLoading } = usePOSProducts(outletId);
  const { data: categories = [], isLoading: categoriesLoading } = usePOSCategories(outletId);
  const { data: tables = [], isLoading: tablesLoading } = usePOSTables(outletId);
  
  // États principaux
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // États des modales
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  
  // États des remises et paiements
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountType | null>(null);
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Génération du numéro de commande
  useEffect(() => {
    if (cart.length > 0 && !orderNumber) {
      const now = new Date();
      const orderNum = `R${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setOrderNumber(orderNum);
    } else if (cart.length === 0) {
      setOrderNumber('');
    }
  }, [cart.length, orderNumber]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case 'F1': // Nouveau ticket
          e.preventDefault();
          clearCart();
          break;
        case 'F2': // Paiement
          e.preventDefault();
          if (cart.length > 0) setShowPaymentDialog(true);
          break;
        case 'F3': // Cuisine
          e.preventDefault();
          sendToKitchen();
          break;
        case 'F4': // Remise
          e.preventDefault();
          if (cart.length > 0) setShowDiscountDialog(true);
          break;
        case 'F5': // Split bill
          e.preventDefault();
          if (cart.length > 0) setShowSplitDialog(true);
          break;
        case 'F6': // Historique
          e.preventDefault();
          setShowHistoryDialog(true);
          break;
        case 'Escape':
          // Fermer toutes les modales
          setShowPaymentDialog(false);
          setShowDiscountDialog(false);
          setShowSplitDialog(false);
          setShowTransferDialog(false);
          setShowHistoryDialog(false);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart.length]);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtrage des produits
  const filteredProducts = React.useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? products 
      : products.filter(p => p.category_id === selectedCategory);
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Calculs du panier avec remises
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = appliedDiscount 
    ? appliedDiscount.type === 'percentage' 
      ? (subtotal * appliedDiscount.value) / 100
      : appliedDiscount.value
    : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * 0.18; // TVA 18%
  const total = subtotalAfterDiscount + tax;
  const change = amountPaid > total ? amountPaid - total : 0;

  // Actions du panier
  const addToCart = useCallback((product: any, notes?: string) => {
    console.log('🛒 [RestaurantPOS] Adding to cart:', product.name);
    
    const existingItem = cart.find(item => item.id === product.id && item.notes === notes);
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id && item.notes === notes
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
      toast.success(`+1 ${product.name}`, { duration: 1500 });
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`, // ID unique pour différentes variantes
        name: product.name,
        price: product.base_price,
        quantity: 1,
        total: product.base_price,
        category: product.pos_categories?.name || 'Autre',
        notes: notes || '',
        sentToKitchen: false
      };
      
      setCart(prev => [...prev, newItem]);
      toast.success(`${product.name} ajouté`, { duration: 1500 });
    }
  }, [cart]);

  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const item = cart.find(c => c.id === id);
    setCart(prev => prev.filter(item => item.id !== id));
    toast.success(`${item?.name} supprimé`, { duration: 1000 });
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedTable(null);
    setAppliedDiscount(null);
    setCustomDiscount(0);
    setOrderNumber('');
    setAmountPaid(0);
    toast.success('Nouveau ticket créé', { duration: 1000 });
  }, []);

  const sendToKitchen = useCallback(() => {
    if (cart.length === 0) {
      toast.error('Panier vide', { duration: 2000 });
      return;
    }
    
    if (!selectedTable) {
      toast.error('Sélectionnez une table', { duration: 2000 });
      return;
    }

    const unsent = cart.filter(item => !item.sentToKitchen);
    if (unsent.length === 0) {
      toast.error('Tous les articles sont déjà envoyés en cuisine', { duration: 2000 });
      return;
    }

    setCart(prev => prev.map(item => ({ ...item, sentToKitchen: true })));
    toast.success(`${unsent.length} articles envoyés en cuisine - Table ${selectedTable.table_number}`, { 
      duration: 3000 
    });
  }, [cart, selectedTable]);

  const processPayment = useCallback(() => {
    if (cart.length === 0) {
      toast.error('Panier vide', { duration: 2000 });
      return;
    }
    
    if (!selectedTable) {
      toast.error('Sélectionnez une table', { duration: 2000 });
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Sélectionnez un mode de paiement', { duration: 2000 });
      return;
    }

    if (amountPaid < total) {
      toast.error('Montant insuffisant', { duration: 2000 });
      return;
    }

    // Simulation du paiement
    toast.success(`Paiement de ${formatCurrency(total)} effectué - Table ${selectedTable.table_number}`, { 
      duration: 3000 
    });
    
    setShowPaymentDialog(false);
    clearCart();
  }, [cart, selectedTable, selectedPaymentMethod, amountPaid, total, formatCurrency, clearCart]);

  const applyDiscount = useCallback((discount: DiscountType) => {
    if (discount.id === 'custom') {
      setAppliedDiscount({ ...discount, value: customDiscount });
    } else {
      setAppliedDiscount(discount);
    }
    setShowDiscountDialog(false);
    toast.success(`Remise ${discount.name} appliquée`, { duration: 2000 });
  }, [customDiscount]);

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null);
    setCustomDiscount(0);
    toast.success('Remise supprimée', { duration: 1000 });
  }, []);

  if (productsLoading || categoriesLoading || tablesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Préparation du restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-orange-50 to-red-50">
      {/* En-tête Restaurant */}
      <div className="h-20 bg-gradient-to-r from-orange-600 to-red-600 text-white flex items-center justify-between px-8 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">RESTAURANT AFRICAN</h1>
              <p className="text-sm opacity-90">Système de commande tactile</p>
            </div>
          </div>
          
          {selectedTable && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <div>
                  <div className="font-bold text-lg">Table {selectedTable.table_number}</div>
                  <div className="text-sm opacity-90">
                    {orderNumber && `Commande: ${orderNumber}`} • Zone: {selectedTable.zone || 'Principale'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center gap-8">
          {/* Indicateurs de remise */}
          {appliedDiscount && (
            <div className="text-right">
              <div className="text-sm opacity-75">REMISE APPLIQUÉE</div>
              <div className="text-lg font-bold text-yellow-200">
                -{formatCurrency(discountAmount)}
              </div>
            </div>
          )}
          
          <div className="text-right">
            <div className="text-sm opacity-75">TOTAL COMMANDE</div>
            <div className="text-3xl font-bold">{formatCurrency(total)}</div>
            {appliedDiscount && (
              <div className="text-xs opacity-75 line-through">{formatCurrency(subtotal + (subtotal * 0.18))}</div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm opacity-75">HEURE</div>
            <div className="text-xl font-mono">
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone Menu Restaurant - Gauche */}
        <div className="w-2/3 p-6 space-y-6">
          {/* Sélection de Table */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-800">Sélection de Table</h2>
              </div>
              <div className="grid grid-cols-6 gap-3">
                {tables.map((table) => (
                  <Button
                    key={table.id}
                    variant={selectedTable?.id === table.id ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedTable(table)}
                    className={`h-16 text-lg font-bold transition-all ${
                      selectedTable?.id === table.id 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg' 
                        : 'border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                    }`}
                  >
                    <div className="text-center">
                      <div>T{table.table_number}</div>
                      <div className="text-xs opacity-75">{table.capacity || 4} pers</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Barre de recherche */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un plat ou code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg border-2 border-orange-200 focus:border-orange-400"
              />
            </div>
          </div>

          {/* Catégories du Menu */}
          <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="lg"
              onClick={() => setSelectedCategory('all')}
              className={`h-14 px-6 font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'border-2 border-orange-200 hover:border-orange-400 bg-white'
              }`}
            >
              <Utensils className="h-5 w-5 mr-2" />
              TOUT LE MENU
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="lg"
                onClick={() => setSelectedCategory(category.id)}
                className={`h-14 px-6 font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'border-2 border-orange-200 hover:border-orange-400 bg-white'
                }`}
              >
                <span className="mr-2 text-xl">{getCategoryIcon(category.name)}</span>
                {category.name.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Plats du Menu */}
          <div className="grid grid-cols-3 gap-4 overflow-y-auto">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-xl transition-all duration-200 bg-white border-2 border-transparent hover:border-orange-300 hover:scale-105"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">{getCategoryIcon(product.pos_categories?.name || '')}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-orange-600 font-bold text-xl">{formatCurrency(product.base_price)}</p>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Zone Commande - Droite */}
        <div className="w-1/3 bg-white/90 backdrop-blur-sm border-l-4 border-orange-400 p-6 flex flex-col shadow-xl">
          {/* Titre Panier */}
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="h-7 w-7 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Commande</h2>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-bold text-lg px-3 py-1">
              {cart.length}
            </Badge>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Aucun plat sélectionné</p>
                <p className="text-sm">Touchez un plat pour l'ajouter</p>
              </div>
            </div>
          ) : (
            <>
              {/* Articles du panier */}
              <div className="space-y-3 flex-1 overflow-y-auto mb-6">
                    {cart.map((item) => (
                      <Card key={item.id} className={`border-l-4 transition-all ${
                        item.sentToKitchen 
                          ? 'bg-green-50 border-green-400' 
                          : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-400'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                                {item.sentToKitchen && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    <ChefHat className="h-3 w-3 mr-1" />
                                    Cuisine
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{formatCurrency(item.price)} × {item.quantity}</p>
                              {item.notes && (
                                <p className="text-xs text-blue-600 mt-1">Note: {item.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-orange-600">{formatCurrency(item.total)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-orange-300 hover:bg-orange-100"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.sentToKitchen}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-orange-300 hover:bg-orange-100"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.sentToKitchen}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removeFromCart(item.id)}
                              disabled={item.sentToKitchen}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
              </div>

              {/* Résumé de la commande */}
              <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Sous-total:</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-lg text-red-600">
                      <span className="font-medium">Remise ({appliedDiscount.name}):</span>
                      <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">TVA (18%):</span>
                    <span className="font-bold">{formatCurrency(tax)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-2xl font-bold text-orange-600">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Boutons d'action principaux */}
          <div className="space-y-3 mt-6">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setShowPaymentDialog(true)}
                className="h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold"
                disabled={cart.length === 0 || !selectedTable}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                PAIEMENT
              </Button>
              
              <Button 
                onClick={sendToKitchen}
                className="h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold"
                disabled={cart.length === 0 || !selectedTable || cart.every(item => item.sentToKitchen)}
              >
                <ChefHat className="h-5 w-5 mr-2" />
                CUISINE
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => setShowDiscountDialog(true)}
                variant="outline"
                className="h-12 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 font-bold"
                disabled={cart.length === 0}
              >
                <Percent className="h-4 w-4 mr-1" />
                REMISE
              </Button>
              
              <Button 
                onClick={() => setShowSplitDialog(true)}
                variant="outline"
                className="h-12 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-bold"
                disabled={cart.length === 0}
              >
                <Split className="h-4 w-4 mr-1" />
                DIVISER
              </Button>
              
              <Button 
                onClick={() => setShowHistoryDialog(true)}
                variant="outline"
                className="h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold"
              >
                <History className="h-4 w-4 mr-1" />
                HIST.
              </Button>
            </div>
            
            <Button 
              onClick={clearCart}
              variant="outline"
              className="w-full h-12 border-2 border-red-300 text-red-600 hover:bg-red-50 font-bold"
              disabled={cart.length === 0}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              NOUVEAU TICKET (F1)
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs de paiement et autres fonctionnalités */}
      
      {/* Dialog Paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Paiement - {formatCurrency(total)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Résumé de la commande */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedDiscount && (
                    <div className="flex justify-between text-red-600">
                      <span>Remise:</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Méthodes de paiement */}
            <div>
              <h3 className="font-bold mb-3">Mode de paiement:</h3>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <Button
                    key={method.id}
                    variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                    className={`h-16 ${method.color} ${selectedPaymentMethod === method.id ? 'text-white' : ''}`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <method.icon className="h-6 w-6 mr-2" />
                    {method.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Montant payé */}
            <div>
              <label className="font-bold mb-2 block">Montant reçu:</label>
              <Input
                type="number"
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder={`Minimum: ${formatCurrency(total)}`}
                className="text-lg h-12"
              />
              {change > 0 && (
                <p className="text-green-600 font-bold mt-2">
                  Monnaie à rendre: {formatCurrency(change)}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={processPayment}
              className="bg-green-600 hover:bg-green-700"
              disabled={!selectedPaymentMethod || amountPaid < total}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Remises */}
      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Appliquer une remise
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {DISCOUNT_TYPES.map((discount) => (
              <Button
                key={discount.id}
                variant="outline"
                className="w-full h-12 justify-start"
                onClick={() => discount.id === 'custom' ? null : applyDiscount(discount)}
              >
                <Percent className="h-4 w-4 mr-2" />
                {discount.name}
                {discount.id !== 'custom' && (
                  <span className="ml-auto font-bold">
                    {discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
                  </span>
                )}
              </Button>
            ))}
            
            {/* Remise personnalisée */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Montant en FCFA"
                value={customDiscount || ''}
                onChange={(e) => setCustomDiscount(Number(e.target.value))}
                className="flex-1"
              />
              <Button
                onClick={() => applyDiscount(DISCOUNT_TYPES.find(d => d.id === 'custom')!)}
                disabled={!customDiscount || customDiscount <= 0}
              >
                Appliquer
              </Button>
            </div>
            
            {appliedDiscount && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={removeDiscount}
              >
                Supprimer la remise actuelle
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer avec raccourcis */}
      <div className="h-12 bg-gray-800 text-white flex items-center justify-center gap-8 text-sm">
        <span><kbd className="bg-gray-700 px-2 py-1 rounded">F1</kbd> Nouveau</span>
        <span><kbd className="bg-gray-700 px-2 py-1 rounded">F2</kbd> Paiement</span>
        <span><kbd className="bg-gray-700 px-2 py-1 rounded">F3</kbd> Cuisine</span>
        <span><kbd className="bg-gray-700 px-2 py-1 rounded">F4</kbd> Remise</span>
        <span><kbd className="bg-gray-700 px-2 py-1 rounded">F5</kbd> Diviser</span>
        <span><kbd className="bg-gray-700 px-2 py-1 rounded">F6</kbd> Historique</span>
      </div>
    </div>
  );
};