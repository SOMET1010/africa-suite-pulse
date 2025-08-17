/**
 * Modern POS Interface - Phase 1: Architecture Foundation
 * Unified interface with adaptive modes
 */

import { useState } from "react";
import { usePOSStore } from '../../store/usePOSStore';
import { usePOSActions } from '../../hooks/usePOSActions';
import { ModeSelector } from '../atoms/ModeSelector';
import { ProductCard } from '../atoms/ProductCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  Settings, 
  Grid, 
  Keyboard,
  Send,
  Receipt,
  Split,
  ArrowLeftRight 
} from "lucide-react";

// Mock products for demo
const DEMO_PRODUCTS = [
  { id: '1', name: 'Attiéké Poisson', price: 2000, category: 'plats', code: 'AP01', image_url: '/src/assets/attieke-poisson.jpg' },
  { id: '2', name: 'Riz Sauce Graine', price: 1800, category: 'plats', code: 'RSG02', image_url: '/src/assets/riz-sauce-graine.jpg' },
  { id: '3', name: 'Brochettes', price: 1500, category: 'grillades', code: 'BR03', image_url: '/src/assets/brochettes.jpg' },
  { id: '4', name: 'Alloco', price: 800, category: 'accompagnements', code: 'AL04', image_url: '/src/assets/alloco.jpg' },
  { id: '5', name: 'Kedjenou', price: 2500, category: 'plats', code: 'KD05', image_url: '/src/assets/kedjenou.jpg' },
  { id: '6', name: 'Bissap', price: 500, category: 'boissons', code: 'BS06', image_url: '/src/assets/bissap.jpg' },
];

export function ModernPOSInterface() {
  const store = usePOSStore();
  const actions = usePOSActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [codeInput, setCodeInput] = useState('');

  // Filter products based on search
  const filteredProducts = DEMO_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totals = store.calculateTotals();

  const handleCodeEntry = (code: string) => {
    const product = DEMO_PRODUCTS.find(p => p.code === code.toUpperCase());
    if (product) {
      actions.handleAddToCart(product);
      setCodeInput('');
    }
  };

  // Mode selection if not set
  if (!store.selectedMode) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choisissez votre mode POS</h1>
          <p className="text-muted-foreground">
            Sélectionnez le mode adapté à votre rôle et situation
          </p>
        </div>
        
        <ModeSelector
          selectedMode={store.selectedMode}
          onModeSelect={actions.handleModeSwitch}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">POS {store.selectedMode}</h1>
              <Badge variant="outline">{store.selectedOutlet?.name || 'Outlet'}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => store.toggleVisualKeyboard()}
              >
                {store.showVisualKeyboard ? <Keyboard className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Code Entry */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {store.selectedMode === 'serveur-rush' && (
              <div className="w-48">
                <Input
                  placeholder="Code article..."
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCodeEntry(codeInput);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {store.showVisualKeyboard ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredProducts.map((product) => {
                const quantity = store.cartItems.find(item => item.product_id === product.id)?.quantity || 0;
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantity}
                    size={store.selectedMode === 'serveur-rush' ? 'sm' : 'md'}
                    onAdd={actions.handleAddToCart}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Keyboard className="h-16 w-16 mx-auto mb-4" />
              <p>Mode saisie code activé</p>
              <p className="text-sm">Utilisez le champ code ci-dessus</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart */}
      <div className="w-96 border-l flex flex-col">
        {/* Cart Header */}
        <div className="border-b p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="font-semibold">Commande</h2>
            {store.selectedTable && (
              <Badge variant="outline">Table {store.selectedTable.number}</Badge>
            )}
          </div>
          {store.cartItems.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {store.cartItems.length} article(s) - {store.customerCount} personne(s)
            </p>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {store.cartItems.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
              <p>Panier vide</p>
              <p className="text-sm">Ajoutez des articles</p>
            </div>
          ) : (
            <div className="space-y-3">
              {store.cartItems.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <Badge 
                      variant={item.status === 'pending' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => store.updateQuantity(item.id, item.quantity - 1)}
                        className="h-6 w-6 p-0"
                      >
                        -
                      </Button>
                      <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => store.updateQuantity(item.id, item.quantity + 1)}
                        className="h-6 w-6 p-0"
                      >
                        +
                      </Button>
                    </div>
                    
                    <span className="font-medium text-sm">
                      {item.total.toLocaleString()} F
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {store.cartItems.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{totals.subtotal.toLocaleString()} F</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Remise:</span>
                  <span>-{totals.discount.toLocaleString()} F</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Service (10%):</span>
                <span>{totals.serviceCharge.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (18%):</span>
                <span>{totals.tax.toLocaleString()} F</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>{totals.total.toLocaleString()} F</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={actions.handleSendToKitchen}
                disabled={!store.cartItems.some(item => item.status === 'pending')}
              >
                <Send className="h-4 w-4 mr-1" />
                Cuisine
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={actions.handleSplitBill}
              >
                <Split className="h-4 w-4 mr-1" />
                Séparer
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={actions.handleTransferTable}
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                Transférer
              </Button>
              
              <Button
                size="sm"
                onClick={actions.handleCheckout}
                className="bg-green-600 hover:bg-green-700"
              >
                <Receipt className="h-4 w-4 mr-1" />
                Encaisser
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}