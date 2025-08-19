import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, Users, Receipt, Plus, Minus, Trash2, Clock, 
  Coffee, Utensils, UtensilsCrossed, Wine, ChefHat, MapPin
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
  
  // États locaux
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Debug logs
  useEffect(() => {
    console.log('🔍 [RestaurantPOS] Products loaded:', products.length);
    console.log('🔍 [RestaurantPOS] Categories loaded:', categories.length);
    console.log('🔍 [RestaurantPOS] Tables loaded:', tables.length);
  }, [products, categories, tables]);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Produits filtrés par catégorie
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory);

  // Calculs du panier
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18; // TVA 18%
  const total = subtotal + tax;

  // Actions du panier
  const addToCart = (product: any) => {
    console.log('🛒 [RestaurantPOS] Adding to cart:', product.name);
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
      toast.success(`+1 ${product.name}`, { duration: 1500 });
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.base_price,
        quantity: 1,
        total: product.base_price,
        category: product.pos_categories?.name || 'Autre'
      };
      
      setCart(prev => [...prev, newItem]);
      toast.success(`${product.name} ajouté au panier`, { duration: 1500 });
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(c => c.id === id);
    setCart(prev => prev.filter(item => item.id !== id));
    toast.success(`${item?.name} supprimé`, { duration: 1000 });
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable(null);
    toast.success('Panier vidé', { duration: 1000 });
  };

  const processOrder = () => {
    if (cart.length === 0) {
      toast.error('Panier vide', { duration: 2000 });
      return;
    }
    
    if (!selectedTable) {
      toast.error('Sélectionnez une table', { duration: 2000 });
      return;
    }

    toast.success(`Commande envoyée - Table ${selectedTable.table_number}`, { duration: 2000 });
    clearCart();
  };

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
                  <div className="text-sm opacity-90">Zone: {selectedTable.zone || 'Principale'}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-sm opacity-75">TOTAL COMMANDE</div>
            <div className="text-3xl font-bold">{formatCurrency(total)}</div>
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

          {/* Catégories du Menu */}
          <div className="flex gap-3 overflow-x-auto pb-2">
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
                  <Card key={item.id} className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)} × {item.quantity}</p>
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
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-orange-300 hover:bg-orange-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeFromCart(item.id)}
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
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">TVA (18%):</span>
                    <span className="font-bold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between text-2xl font-bold text-orange-600">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Boutons d'action */}
          <div className="space-y-3 mt-6">
            <Button 
              onClick={processOrder}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-lg shadow-lg"
              disabled={cart.length === 0 || !selectedTable}
            >
              <Receipt className="h-6 w-6 mr-3" />
              VALIDER LA COMMANDE
            </Button>
            
            <Button 
              onClick={clearCart}
              variant="outline"
              className="w-full h-12 border-2 border-red-300 text-red-600 hover:bg-red-50 font-bold"
              disabled={cart.length === 0}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              VIDER LE PANIER
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};