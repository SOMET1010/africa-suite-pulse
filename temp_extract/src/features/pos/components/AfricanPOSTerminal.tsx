import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  Smartphone,
  Receipt,
  ChefHat,
  Clock,
  RefreshCw
} from "lucide-react";
import { toast } from "@/components/ui/unified-toast";
import { africanPOSAPI, type AfricanMenuItem, type AfricanOrder } from "@/services/african-pos.api";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  prep_time: number;
}

export function AfricanPOSTerminal() {
  const [menu, setMenu] = useState<AfricanMenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<AfricanOrder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [tableNumber, setTableNumber] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Charger le menu au démarrage
  useEffect(() => {
    loadMenu();
    loadRecentOrders();
  }, []);

  const loadMenu = async () => {
    try {
      setIsLoadingMenu(true);
      const menuData = await africanPOSAPI.getMenu();
      setMenu(menuData);
    } catch (error) {
      console.error('Error loading menu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le menu",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const ordersData = await africanPOSAPI.getOrders(10);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Calculer le total du panier
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculer le temps de préparation estimé
  const estimatedPrepTime = cart.length > 0 
    ? Math.max(...cart.map(item => item.prep_time))
    : 0;

  // Catégories disponibles
  const categories = ["Tous", ...new Set(menu.map(item => item.category))];

  // Filtrer le menu par catégorie
  const filteredMenu = selectedCategory === "Tous" 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  // Ajouter un article au panier
  const addToCart = (menuItem: AfricanMenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          prep_time: menuItem.prep_time
        }];
      }
    });
    
    toast({
      title: "Article ajouté",
      description: `${menuItem.name} ajouté au panier`,
      duration: 2000
    });
  };

  // Modifier la quantité d'un article
  const updateQuantity = (id: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  // Supprimer un article du panier
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    setTableNumber("");
  };

  // Traiter le paiement
  const processPayment = async (paymentMethod: 'cash' | 'card' | 'mobile_money') => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de payer",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Créer la commande via l'API
      const orderData = {
        items: cart.map(item => ({
          id: `item-${Date.now()}-${Math.random()}`,
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          prep_time: item.prep_time
        })),
        total: cartTotal,
        payment_method: paymentMethod,
        status: 'pending' as const,
        table_number: tableNumber ? parseInt(tableNumber) : undefined
      };

      const newOrder = await africanPOSAPI.createOrder(orderData);

      // Ajouter à la liste des commandes locales
      setOrders(prev => [newOrder, ...prev]);

      // Vider le panier
      clearCart();

      toast({
        title: "Commande validée !",
        description: `Commande ${newOrder.id} envoyée en cuisine`,
        duration: 4000
      });

      // Simuler l'envoi en cuisine après 3 secondes
      setTimeout(async () => {
        try {
          await africanPOSAPI.updateOrderStatus(newOrder.id, 'preparing');
          setOrders(prev => prev.map(order =>
            order.id === newOrder.id
              ? { ...order, status: 'preparing' }
              : order
          ));
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      }, 3000);

    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de traiter le paiement",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-orange-50 to-amber-50 min-h-screen">
      
      {/* Menu des plats */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="h-6 w-6" />
                Menu Africain Authentique
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMenu}
                disabled={isLoadingMenu}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingMenu ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            
            {isLoadingMenu ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                <p>Chargement du menu...</p>
              </div>
            ) : (
              <>
                {/* Filtres par catégorie */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Grille des plats */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMenu.map(item => (
                    <Card 
                      key={item.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-orange-100 hover:border-orange-300"
                      onClick={() => addToCart(item)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center space-y-3">
                          <div className="text-4xl">{item.image}</div>
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-sm text-orange-600 font-medium">{item.name_local}</p>
                            <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {item.prep_time}min
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {item.origin}
                            </Badge>
                          </div>
                          
                          <div className="text-xl font-bold text-orange-600">
                            {item.price.toLocaleString()} FCFA
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="w-full bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Panier et commande */}
      <div className="space-y-6">
        
        {/* Panier */}
        <Card className="border-orange-200">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Panier ({cart.length})
              </div>
              {cart.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearCart}
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            
            {/* Numéro de table */}
            <div className="mb-4">
              <Input
                placeholder="Numéro de table (optionnel)"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                type="number"
                className="border-orange-200 focus:border-orange-400"
              />
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Panier vide</p>
                <p className="text-sm">Sélectionnez des plats pour commencer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.price.toLocaleString()} FCFA × {item.quantity}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Temps de préparation :</span>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      ~{estimatedPrepTime} min
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total :</span>
                    <span className="text-orange-600">
                      {cartTotal.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Méthodes de paiement */}
        {cart.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg">Paiement</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button
                onClick={() => processPayment('cash')}
                disabled={isProcessingPayment}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Banknote className="h-4 w-4 mr-2" />
                Espèces
              </Button>
              
              <Button
                onClick={() => processPayment('card')}
                disabled={isProcessingPayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Carte bancaire
              </Button>
              
              <Button
                onClick={() => processPayment('mobile_money')}
                disabled={isProcessingPayment}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Money
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Commandes récentes */}
        {orders.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg">Commandes récentes</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{order.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                          {order.table_number && ` - Table ${order.table_number}`}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'preparing' ? 'default' :
                          order.status === 'ready' ? 'destructive' : 'outline'
                        }
                        className="text-xs"
                      >
                        {order.status === 'pending' && 'En attente'}
                        {order.status === 'preparing' && 'En préparation'}
                        {order.status === 'ready' && 'Prêt'}
                        {order.status === 'served' && 'Servi'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {order.total.toLocaleString()} FCFA
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

