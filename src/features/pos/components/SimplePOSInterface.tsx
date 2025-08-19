import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, Users, Receipt, Plus, Minus, Trash2, Clock
} from 'lucide-react';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSProducts';
import { usePOSTables } from '../hooks/usePOSTables';
import { usePOSAuthContext } from '../auth/POSAuthProvider';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';

interface SimplePOSInterfaceProps {
  serverId: string;
  outletId: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export const SimplePOSInterface: React.FC<SimplePOSInterfaceProps> = ({ 
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

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Produits filtrés par catégorie
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.pos_categories?.id === selectedCategory);

  // Calculs du panier
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18; // TVA 18%
  const total = subtotal + tax;

  // Actions du panier
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.base_price,
        quantity: 1,
        total: product.base_price
      }]);
    }
    
    toast.success(`${product.name} ajouté`);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success('Article supprimé');
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable(null);
    toast.success('Panier vidé');
  };

  const processOrder = () => {
    if (cart.length === 0) {
      toast.error('Panier vide');
      return;
    }
    
    if (!selectedTable) {
      toast.error('Sélectionnez une table');
      return;
    }

    // Ici vous ajouteriez la logique pour sauvegarder la commande
    toast.success(`Commande envoyée pour Table ${selectedTable.table_number}`);
    clearCart();
  };

  if (productsLoading || categoriesLoading || tablesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Chargement du POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* En-tête simplifié */}
      <div className="h-16 bg-primary text-primary-foreground flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">POS Terminal</h1>
          {selectedTable && (
            <Badge variant="secondary" className="text-primary">
              Table {selectedTable.table_number}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm opacity-75">TOTAL</div>
            <div className="text-xl font-bold">{formatCurrency(total)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-mono">
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone Produits - Gauche */}
        <div className="w-2/3 p-4 space-y-4">
          {/* Filtres de catégories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Tous
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Grille de produits */}
          <div className="grid grid-cols-3 gap-3 overflow-y-auto">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 text-center">
                  <div className="mb-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <p className="text-primary font-bold">{formatCurrency(product.base_price)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Zone Commande & Actions - Droite */}
        <div className="w-1/3 border-l bg-card p-4 flex flex-col">
          {/* Sélection de table */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Tables Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {tables.map((table) => (
                  <Button
                    key={table.id}
                    variant={selectedTable?.id === table.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTable(table)}
                    className="h-10"
                  >
                    T{table.table_number}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panier */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Commande ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {cart.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Panier vide</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Articles du panier */}
                  <div className="space-y-2 flex-1 overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TVA (18%):</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2 mt-4">
            <Button 
              onClick={processOrder}
              className="w-full"
              disabled={cart.length === 0 || !selectedTable}
            >
              <Receipt className="h-4 w-4 mr-2" />
              Valider Commande
            </Button>
            
            <Button 
              onClick={clearCart}
              variant="outline"
              className="w-full"
              disabled={cart.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Vider Panier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};