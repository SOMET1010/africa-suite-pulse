import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { POSLayout } from '@/core/layout/POSLayout';
import { ArrowLeft, ShoppingCart, Plus, Minus, CreditCard, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePOSAuth } from "../auth/usePOSAuth";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  available: boolean;
}

const mockCategories: Category[] = [
  { id: "1", name: "Boissons", color: "bg-blue-500" },
  { id: "2", name: "Plats", color: "bg-orange-500" },
  { id: "3", name: "Desserts", color: "bg-pink-500" },
  { id: "4", name: "Entrées", color: "bg-green-500" },
];

const mockProducts: Product[] = [
  { id: "1", name: "Coca Cola", price: 1500, category_id: "1", available: true },
  { id: "2", name: "Eau minérale", price: 1000, category_id: "1", available: true },
  { id: "3", name: "Jus d'orange", price: 2000, category_id: "1", available: true },
  { id: "4", name: "Poulet braisé", price: 4500, category_id: "2", available: true },
  { id: "5", name: "Riz au gras", price: 3000, category_id: "2", available: true },
  { id: "6", name: "Attiéké poisson", price: 3500, category_id: "2", available: true },
  { id: "7", name: "Salade de fruits", price: 2500, category_id: "3", available: true },
  { id: "8", name: "Tarte aux fruits", price: 3000, category_id: "3", available: true },
];

export default function POSTerminalPage() {
  const navigate = useNavigate();
  const { session } = usePOSAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("1");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");


  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = product.category_id === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.available;
  });

  const addToOrder = (product: Product) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          category: mockCategories.find(c => c.id === product.category_id)?.name || "",
        }];
      }
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setOrderItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    // Implement checkout logic with proper validation
    logger.info("POS Checkout initiated", { itemCount: orderItems.length });
    
    if (orderItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucun article à commander",
        variant: "destructive"
      });
      return;
    }
    
    // Create order and navigate to payment
    const orderData = {
      items: orderItems,
      total: calculateTotal(),
      serverId: session?.user_id,
      timestamp: new Date().toISOString()
    };
    
    logger.audit('POS Order created', orderData);
    
    // Navigate to payment page with order data
    navigate('/pos/payment', { 
      state: { orderData }
    });
    
    toast({
      title: "Commande créée",
      description: `Total: ${calculateTotal().toLocaleString()} FCFA`,
    });
  };

  return (
    <POSLayout 
      title="Terminal de Vente"
      showStatusBar={true}
    >
      <div className="h-full flex flex-col">
        {/* Server info */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Serveur: {session?.display_name}
          </p>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Product Catalog */}
          <div className="col-span-8 flex flex-col">
            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 mb-4">
              {mockCategories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addToOrder(product)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <h3 className="font-medium">{product.name}</h3>
                        <Badge variant="secondary">
                          {product.price.toLocaleString()} FCFA
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-span-4 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Commande ({orderItems.length})
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Order Items */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {orderItems.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Aucun article dans la commande
                    </div>
                  ) : (
                    orderItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.price.toLocaleString()} FCFA x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator className="my-4" />

                {/* Total */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{calculateTotal().toLocaleString()} FCFA</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    className="w-full gap-2"
                    disabled={orderItems.length === 0}
                    onClick={handleCheckout}
                  >
                    <CreditCard className="w-4 h-4" />
                    Encaisser ({calculateTotal().toLocaleString()} FCFA)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={orderItems.length === 0}
                    onClick={clearOrder}
                  >
                    <Trash2 className="w-4 h-4" />
                    Vider la commande
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </POSLayout>
  );
}