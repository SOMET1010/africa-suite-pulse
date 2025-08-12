import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductCatalog } from "./ProductCatalog";
import { OrderSummary } from "./OrderSummary";
import { TableSelector } from "./TableSelector";
import { PaymentDialog } from "./PaymentDialog";
import { usePOSOutlets, useCurrentPOSSession, useCreatePOSOrder } from "../hooks/usePOSData";
import { ShoppingCart, CreditCard, Users, Clock } from "lucide-react";
import type { POSOutlet, POSTable, CartItem } from "../types";

export function POSTerminal() {
  const [selectedOutlet, setSelectedOutlet] = useState<POSOutlet | null>(null);
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerCount, setCustomerCount] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const { data: outlets = [] } = usePOSOutlets();
  const { data: currentSession } = useCurrentPOSSession(selectedOutlet?.id);
  const createOrder = useCreatePOSOrder();

  const handleAddToCart = (product: any, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity, total_price: (item.quantity + quantity) * item.unit_price }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        order_id: '',
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        quantity,
        unit_price: product.base_price,
        total_price: product.base_price * quantity,
        status: 'pending',
        created_at: new Date().toISOString(),
        product,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    
    setCartItems(cartItems.map(item =>
      item.product_id === productId
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxRate = 18; // Default tax rate
    const serviceChargeRate = 10; // Default service charge
    
    const serviceCharge = subtotal * (serviceChargeRate / 100);
    const taxAmount = (subtotal + serviceCharge) * (taxRate / 100);
    
    return {
      subtotal,
      serviceCharge,
      taxAmount,
      total: subtotal + serviceCharge + taxAmount,
    };
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsPaymentOpen(true);
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedTable(null);
    setCustomerCount(1);
  };

  if (!selectedOutlet) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Sélectionner un point de vente</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outlets.map((outlet) => (
              <Card
                key={outlet.id}
                className="p-6 cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setSelectedOutlet(outlet)}
              >
                <h3 className="text-lg font-semibold">{outlet.name}</h3>
                <p className="text-sm text-muted-foreground">{outlet.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {outlet.outlet_type}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Session fermée</h2>
            <p className="text-muted-foreground mb-6">
              Aucune session POS n'est ouverte pour {selectedOutlet.name}
            </p>
            <Button onClick={() => setSelectedOutlet(null)}>
              Changer de point de vente
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-12 h-screen">
        {/* Product Catalog - Left Side */}
        <div className="col-span-8 border-r">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold">{selectedOutlet.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    Session: {currentSession.session_number}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={customerCount}
                      onChange={(e) => setCustomerCount(parseInt(e.target.value) || 1)}
                      className="w-16 h-8"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOutlet(null)}
                  >
                    Changer de POS
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Selector */}
            <div className="p-4 border-b">
              <TableSelector
                outletId={selectedOutlet.id}
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
              />
            </div>

            {/* Product Catalog */}
            <div className="flex-1 p-4">
              <ProductCatalog
                outletId={selectedOutlet.id}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>

        {/* Order Summary - Right Side */}
        <div className="col-span-4">
          <div className="h-full flex flex-col">
            {/* Cart Header */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <h2 className="font-semibold">Commande</h2>
                </div>
                <Badge variant="secondary">
                  {cartItems.length} article{cartItems.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              {selectedTable && (
                <p className="text-sm text-muted-foreground mt-1">
                  Table {selectedTable.number}
                </p>
              )}
            </div>

            {/* Order Items */}
            <div className="flex-1 p-4">
              <OrderSummary
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveFromCart}
              />
            </div>

            {/* Order Totals & Actions */}
            <div className="p-4 border-t bg-muted/30">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Sous-total:</span>
                  <span>{totals.subtotal.toFixed(0)} FCFA</span>
                </div>
                {totals.serviceCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Service (10%):</span>
                    <span>{totals.serviceCharge.toFixed(0)} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>TVA (18%):</span>
                  <span>{totals.taxAmount.toFixed(0)} FCFA</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{totals.total.toFixed(0)} FCFA</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full"
                  size="lg"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Encaisser
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                  className="w-full"
                >
                  Vider le panier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        order={{
          items: cartItems,
          totals,
          table: selectedTable,
          customerCount,
        }}
        onPaymentComplete={clearCart}
      />
    </div>
  );
}