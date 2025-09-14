import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Utensils,
  Coffee,
  Wine,
  Cake,
  Timer,
  DollarSign,
  Printer,
  Split,
  Trash2,
  Star,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  allergens?: string[];
  preparationTime?: number;
  available: boolean;
  isPopular?: boolean;
}

interface OrderItem {
  product: Product;
  quantity: number;
  modifiers?: Array<{
    name: string;
    price: number;
  }>;
  notes?: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  currentGuests: number;
}

interface POSOrderFlowProps {
  table: Table;
  products: Product[];
  onOrderComplete: (order: { items: OrderItem[]; table: Table; total: number }) => void;
  onCancel: () => void;
  existingOrder?: OrderItem[];
}

const CATEGORIES = [
  { id: 'all', name: 'Tout', icon: Utensils },
  { id: 'starters', name: 'Entrées', icon: Utensils },
  { id: 'mains', name: 'Plats', icon: Utensils },
  { id: 'desserts', name: 'Desserts', icon: Cake },
  { id: 'drinks', name: 'Boissons', icon: Coffee },
  { id: 'wines', name: 'Vins', icon: Wine }
];

export function POSOrderFlow({
  table,
  products,
  onOrderComplete,
  onCancel,
  existingOrder = []
}: POSOrderFlowProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>(existingOrder);
  const [showCart, setShowCart] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!product.available) return false;
      
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return product.name.toLowerCase().includes(query) ||
               product.description?.toLowerCase().includes(query);
      }
      
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Calculate totals
  const orderTotal = useMemo(() => {
    return orderItems.reduce((total, item) => {
      const itemTotal = item.product.price * item.quantity;
      const modifiersTotal = (item.modifiers || []).reduce((sum, mod) => sum + mod.price, 0) * item.quantity;
      return total + itemTotal + modifiersTotal;
    }, 0);
  }, [orderItems]);

  const orderItemsCount = useMemo(() => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  }, [orderItems]);

  const addToOrder = (product: Product) => {
    setOrderItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(prev => {
      const existingItem = prev.find(item => item.product.id === productId);
      
      if (!existingItem) return prev;
      
      if (existingItem.quantity === 1) {
        return prev.filter(item => item.product.id !== productId);
      }
      
      return prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const handleOrderComplete = () => {
    onOrderComplete({
      items: orderItems,
      table,
      total: orderTotal
    });
  };

  return (
    <div className="flex h-screen max-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Table {table.number}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {table.currentGuests}/{table.capacity} couverts
                </p>
              </div>
              
              <Badge variant="info" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {table.currentGuests} client{table.currentGuests > 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
              
              <Button 
                onClick={() => setShowCart(!showCart)}
                variant={showCart ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Commande ({orderItemsCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-12 text-base"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(category => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2 whitespace-nowrap tap-target"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => addToOrder(product)}
                quantity={orderItems.find(item => item.product.id === product.id)?.quantity || 0}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Aucun produit trouvé
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Order Cart Sidebar */}
      {showCart && (
        <div className="w-80 border-l bg-background flex flex-col">
          <OrderCart
            items={orderItems}
            total={orderTotal}
            onUpdateQuantity={(productId, quantity) => {
              if (quantity === 0) {
                removeFromOrder(productId);
              } else {
                setOrderItems(prev => 
                  prev.map(item => 
                    item.product.id === productId 
                      ? { ...item, quantity }
                      : item
                  )
                );
              }
            }}
            onClear={clearOrder}
            onComplete={handleOrderComplete}
          />
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
  quantity
}: {
  product: Product;
  onAdd: () => void;
  quantity: number;
}) {
  return (
    <Card className="transition-smooth hover:shadow-elevate cursor-pointer group">
      <div className="p-3 space-y-2">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Utensils className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          
          {product.isPopular && (
            <div className="absolute top-2 left-2">
              <Badge variant="accent" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </div>
          )}

          {quantity > 0 && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="text-xs">
                {quantity}
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h4 className="font-medium text-sm text-foreground line-clamp-2">
            {product.name}
          </h4>
          
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground">
              {product.price.toFixed(2)} €
            </span>
            
            {product.preparationTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="w-3 h-3" />
                {product.preparationTime}min
              </div>
            )}
          </div>
        </div>

        {/* Add Button */}
        <Button 
          onClick={onAdd}
          className="w-full tap-target"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
      </div>
    </Card>
  );
}

function OrderCart({
  items,
  total,
  onUpdateQuantity,
  onClear,
  onComplete
}: {
  items: OrderItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClear: () => void;
  onComplete: () => void;
}) {
  return (
    <>
      {/* Cart Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Commande</h3>
          
          {items.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClear}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">
              Commande vide
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.product.id} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.product.price.toFixed(2)} € x {item.quantity}
                      </p>
                    </div>
                    
                    <span className="font-bold text-sm text-foreground">
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <span className="font-medium text-sm w-8 text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Cart Footer */}
      {items.length > 0 && (
        <div className="p-4 border-t space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium">{total.toFixed(2)} €</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">TVA (20%)</span>
              <span className="font-medium">{(total * 0.2).toFixed(2)} €</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{(total * 1.2).toFixed(2)} €</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={onComplete} className="w-full tap-target">
              <CreditCard className="w-4 h-4 mr-2" />
              Envoyer en cuisine
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-1" />
                Imprimer
              </Button>
              
              <Button variant="outline" size="sm">
                <Split className="w-4 h-4 mr-1" />
                Diviser
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}