import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TButton } from "@/core/ui/TButton";
import { BottomActionBar } from "@/core/layout/BottomActionBar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductCatalog } from "./ProductCatalog";
import { OrderSummary } from "./OrderSummary";
import { TableSelector } from "./TableSelector";
import { ComprehensivePaymentDialog } from "./ComprehensivePaymentDialog";
import { ModernOutletSelector } from "./ModernOutletSelector";
import { usePOSOutlets, useCurrentPOSSession, useCreatePOSOrder, useOpenPOSSession } from "../hooks/usePOSData";
import { ShoppingCart, CreditCard, Users, Store, Settings, Clock, Calendar } from "lucide-react";
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
  const openSession = useOpenPOSSession();

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
    return <ModernOutletSelector outlets={outlets} onSelectOutlet={setSelectedOutlet} />;
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
            <div className="space-y-3">
              <TButton 
                onClick={() => openSession.mutate({ outletId: selectedOutlet.id, openingCash: 0 })}
                disabled={openSession.isPending}
                className="w-full"
              >
                {openSession.isPending ? "Ouverture..." : "Ouvrir une session"}
              </TButton>
              <TButton variant="default" onClick={() => setSelectedOutlet(null)} className="w-full">
                Changer de point de vente
              </TButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const totals = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Modern POS Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">{selectedOutlet.name}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date().toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date().toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      Session: {currentSession.session_number}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={customerCount}
                  onChange={(e) => setCustomerCount(parseInt(e.target.value) || 1)}
                  className="w-16 h-8 border-0 bg-transparent"
                />
                <span className="text-sm text-muted-foreground">pers.</span>
              </div>
              
              {selectedTable && (
                <Badge variant="secondary" className="px-3 py-1">
                  Table {selectedTable.number}
                </Badge>
              )}
              
              <TButton
                variant="default"
                size="sm"
                onClick={() => setSelectedOutlet(null)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Changer
              </TButton>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 min-h-[calc(100vh-5rem)]">
        {/* Product Catalog - Left Side */}
        <div className="col-span-8 border-r bg-background/60">
          <div className="h-full flex flex-col">
            {/* Table Selector */}
            <div className="p-6 border-b bg-card/50">
              <TableSelector
                outletId={selectedOutlet.id}
                selectedTable={selectedTable}
                onSelectTable={setSelectedTable}
              />
            </div>

            {/* Product Catalog */}
            <div className="flex-1 p-6">
              <ProductCatalog
                outletId={selectedOutlet.id}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>

        {/* Order Summary - Right Side */}
        <div className="col-span-4 bg-card/80 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            {/* Cart Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Commande en cours</h2>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {cartItems.length} {cartItems.length !== 1 ? 'articles' : 'article'}
                </Badge>
              </div>
            </div>

            {/* Order Items */}
            <div className="flex-1 p-6 overflow-auto">
              <OrderSummary
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveFromCart}
              />
            </div>

            {/* Order Totals & Actions */}
            <div className="p-6 border-t bg-gradient-to-r from-card to-muted/20">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{totals.subtotal.toLocaleString()} FCFA</span>
                </div>
                {totals.serviceCharge > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service (10%)</span>
                    <span>{totals.serviceCharge.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>TVA (18%)</span>
                  <span>{totals.taxAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {totals.total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <TButton
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Encaisser {totals.total.toLocaleString()} FCFA
                </TButton>
                <TButton
                  variant="default"
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                  className="w-full"
                >
                  Vider le panier
                </TButton>
              </div>
              
              {/* Bottom Action Bar pour POS */}
              <BottomActionBar>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Session: {currentSession.session_number}</span>
                  <span>•</span>
                  <span>{cartItems.length} articles</span>
                  <span>•</span>
                  <span>{totals.total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex items-center gap-2">
                  <TButton onClick={handleCheckout} disabled={cartItems.length === 0}>
                    Encaisser
                  </TButton>
                  <TButton variant="default" onClick={() => console.log("Remise")}>
                    Remise
                  </TButton>
                  <TButton variant="ghost" onClick={() => console.log("Annuler commande")}>
                    Annuler
                  </TButton>
                  <TButton variant="ghost" onClick={() => console.log("Imprimer")}>
                    Imprimer
                  </TButton>
                </div>
              </BottomActionBar>
            </div>
          </div>
        </div>
      </div>

      <ComprehensivePaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cartItems}
        subtotal={totals.subtotal}
        serviceCharge={totals.serviceCharge}
        taxAmount={totals.taxAmount}
        total={totals.total}
        onPaymentComplete={clearCart}
        tableNumber={selectedTable?.table_number}
        customerCount={customerCount}
      />
    </div>
  );
}