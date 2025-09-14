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
  philosophy?: string;
  flag?: string;
}

export function AfricanPOSTerminalEnhanced() {
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
          prep_time: menuItem.prep_time,
          philosophy: getPhilosophyByOrigin(menuItem.origin),
          flag: getFlagByOrigin(menuItem.origin)
        }];
      }
    });
    
    toast({
      title: "Article ajouté",
      description: `${menuItem.name} ajouté au panier`,
      duration: 2000
    });
  };

  // Obtenir la philosophie selon l'origine
  const getPhilosophyByOrigin = (origin: string): string => {
    const philosophyMap: { [key: string]: string } = {
      'Côte d\'Ivoire': 'Ubuntu',
      'Sénégal': 'Teranga',
      'Ghana': 'Sankofa',
      'Mali': 'Ubuntu',
      'Burkina Faso': 'Harambee',
      'Togo': 'Ubuntu',
      'Bénin': 'Teranga'
    };
    return philosophyMap[origin] || 'Ubuntu';
  };

  // Obtenir le drapeau selon l'origine
  const getFlagByOrigin = (origin: string): string => {
    const flagMap: { [key: string]: string } = {
      'Côte d\'Ivoire': '🇨🇮',
      'Sénégal': '🇸🇳',
      'Ghana': '🇬🇭',
      'Mali': '🇲🇱',
      'Burkina Faso': '🇧🇫',
      'Togo': '🇹🇬',
      'Bénin': '🇧🇯'
    };
    return flagMap[origin] || '🌍';
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

  const africanPatterns = {
    bogolan: 'radial-gradient(circle at 20% 20%, #8B4513 3px, transparent 3px), radial-gradient(circle at 80% 80%, #D2691E 2px, transparent 2px)',
    kente: 'repeating-linear-gradient(0deg, #FFD700 0px, #FFD700 8px, #8B4513 8px, #8B4513 16px, #D2691E 16px, #D2691E 24px, #228B22 24px, #228B22 32px)',
    mudcloth: 'radial-gradient(circle at 25% 25%, #8B4513 2px, transparent 2px), radial-gradient(circle at 75% 75%, #D2691E 1px, transparent 1px)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 25%, #DEB887 50%, #D2B48C 75%, #BC9A6A 100%)',
      position: 'relative'
    }}>
      {/* Motifs africains en arrière-plan */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: africanPatterns.bogolan,
        backgroundSize: '80px 80px, 60px 60px',
        backgroundPosition: '0 0, 40px 40px',
        opacity: 0.05,
        pointerEvents: 'none'
      }} />

      {/* Bordures Kente */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '8px',
        height: '100%',
        background: africanPatterns.kente,
        opacity: 0.4
      }} />
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '8px',
        height: '100%',
        background: africanPatterns.kente,
        opacity: 0.4
      }} />

      <div style={{ position: 'relative', zIndex: 10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Menu des plats avec design africain */}
        <div className="lg:col-span-2 space-y-6">
          <Card style={{
            border: '2px solid #FFD700',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
            overflow: 'hidden'
          }}>
            <CardHeader style={{
              background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
              color: 'white',
              position: 'relative'
            }}>
              {/* Motif décoratif dans l'en-tête */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: africanPatterns.mudcloth,
                backgroundSize: '40px 40px, 30px 30px',
                backgroundPosition: '0 0, 20px 20px',
                opacity: 0.2
              }} />
              
              <CardTitle style={{ position: 'relative', zIndex: 1 }} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-6 w-6" />
                  🌍 Menu Africain Authentique
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
                  {/* Filtres par catégorie avec style africain */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        style={{
                          background: selectedCategory === category 
                            ? 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)' 
                            : 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid #D2691E',
                          borderRadius: '12px',
                          color: selectedCategory === category ? 'white' : '#8B4513',
                          fontWeight: '600'
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  {/* Grille des plats avec design africain */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredMenu.map(item => (
                      <Card 
                        key={item.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '2px solid #D2691E',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        className="hover:shadow-lg"
                        onClick={() => addToCart(item)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 140, 0, 0.3)';
                          e.currentTarget.style.borderColor = '#FF8C00';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.borderColor = '#D2691E';
                        }}
                      >
                        {/* Bordure décorative */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)'
                        }} />

                        <CardContent className="p-4">
                          <div className="text-center space-y-3">
                            <div className="text-4xl">{item.image}</div>
                            <div>
                              <h3 className="font-semibold text-lg" style={{ color: '#8B4513' }}>
                                {getFlagByOrigin(item.origin)} {item.name}
                              </h3>
                              <p className="text-sm font-medium" style={{ color: '#FF8C00' }}>
                                {item.name_local}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#D2691E' }}>
                                {item.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.prep_time}min
                              </Badge>
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{ 
                                  background: 'rgba(255, 140, 0, 0.1)',
                                  color: '#8B4513'
                                }}
                              >
                                {item.origin}
                              </Badge>
                            </div>
                            
                            <div className="text-xl font-bold" style={{ color: '#FF8C00' }}>
                              {item.price.toLocaleString()} FCFA
                            </div>
                            
                            <div style={{
                              fontSize: '12px',
                              fontStyle: 'italic',
                              color: '#8B4513'
                            }}>
                              {getPhilosophyByOrigin(item.origin)}
                            </div>
                            
                            <Button 
                              size="sm" 
                              className="w-full"
                              style={{
                                background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: '600'
                              }}
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

        {/* Panier et commande avec design africain */}
        <div className="space-y-6">
          
          {/* Panier */}
          <Card style={{
            border: '2px solid #FFD700',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
            overflow: 'hidden'
          }}>
            <CardHeader style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
              color: 'white'
            }}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  🛒 Panier Ubuntu ({cart.length})
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
                  style={{
                    border: '2px solid #D2691E',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.9)'
                  }}
                  className="focus:border-orange-400"
                />
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#D2691E' }}>
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>🤝 Votre panier Ubuntu est vide</p>
                  <p className="text-sm">Ajoutez des plats africains !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: 'rgba(255, 140, 0, 0.05)',
                      border: '1px solid #D2B48C',
                      borderRadius: '12px'
                    }}>
                      <div className="flex-1">
                        <h4 className="font-medium" style={{ color: '#8B4513' }}>
                          {item.flag} {item.name}
                        </h4>
                        <p className="text-sm" style={{ color: '#D2691E' }}>
                          {item.price.toLocaleString()} FCFA × {item.quantity}
                        </p>
                        <p className="text-xs" style={{ color: '#8B4513', fontStyle: 'italic' }}>
                          {item.philosophy}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8 p-0"
                          style={{ 
                            background: '#DC143C',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium" style={{ color: '#8B4513' }}>
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8 p-0"
                          style={{ 
                            background: '#228B22',
                            color: 'white',
                            border: 'none'
                          }}
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
                      <span className="font-medium" style={{ color: '#8B4513' }}>
                        Temps de préparation :
                      </span>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        ~{estimatedPrepTime} min
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span style={{ color: '#8B4513' }}>Total :</span>
                      <span style={{ color: '#FF8C00' }}>
                        {cartTotal.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Méthodes de paiement africaines */}
          {cart.length > 0 && (
            <Card style={{
              border: '2px solid #FFD700',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)'
            }}>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#8B4513' }}>
                  💳 Paiement Africain
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { method: 'cash', name: 'Espèces', color: '#228B22', flag: '💰', desc: 'Paiement cash' },
                  { method: 'mobile_money', name: 'Orange Money', color: '#FF8C00', flag: '🇨🇮', desc: 'Mobile Money' },
                  { method: 'mobile_money', name: 'MTN Money', color: '#FFD700', flag: '🇬🇭', desc: 'Mobile Money' },
                  { method: 'card', name: 'Carte Bancaire', color: '#8B4513', flag: '💳', desc: 'Visa/Mastercard' }
                ].map((payment, index) => (
                  <Button
                    key={index}
                    onClick={() => processPayment(payment.method as any)}
                    disabled={isProcessingPayment}
                    className="w-full"
                    style={{
                      background: payment.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>{payment.flag}</span>
                    {payment.name}
                    <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.8 }}>
                      ({payment.desc})
                    </span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Proverbe africain */}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2px solid #FFD700',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(139, 69, 19, 0.1)'
          }}>
            <div style={{
              fontSize: '16px',
              fontStyle: 'italic',
              fontWeight: '600',
              color: '#8B4513',
              marginBottom: '8px'
            }}>
              🌍 "L'hospitalité est notre force"
            </div>
            <div style={{
              fontSize: '12px',
              color: '#D2691E'
            }}>
              Teranga - Sénégal • Africa Suite Pulse
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AfricanPOSTerminalEnhanced;

