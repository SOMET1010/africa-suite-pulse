import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, CreditCard, ChefHat, Users, MapPin, Smartphone } from 'lucide-react';
import { useServerTables } from '../hooks/useTableAssignments';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSData';
import { usePOSAuth } from '../auth/usePOSAuth';
import { toast } from 'sonner';

interface AfricanPOSInterfaceProps {
  serverId: string;
  outletId: string;
}

interface OrderItem {
  id: string;
  product: any;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Produits africains pré-configurés avec codes rapides
const AFRICAN_PRODUCTS = [
  { code: '1', name: 'Attiéké Poisson', price: 1500, category: 'Plats' },
  { code: '2', name: 'Riz Sauce Graine', price: 2000, category: 'Plats' },
  { code: '3', name: 'Brochettes', price: 1000, category: 'Grillades' },
  { code: '4', name: 'Poisson Braisé', price: 2500, category: 'Grillades' },
  { code: '5', name: 'Bissap', price: 500, category: 'Boissons' },
  { code: '6', name: 'Coca Cola', price: 600, category: 'Boissons' },
  { code: '7', name: 'Bière Ivoire', price: 800, category: 'Bières' },
  { code: '8', name: 'Flag', price: 700, category: 'Bières' },
  { code: '9', name: 'Plantain Frit', price: 500, category: 'Accompagnements' },
  { code: '11', name: 'Café Robusta', price: 300, category: 'Boissons' },
  { code: '12', name: 'Thé Lipton', price: 250, category: 'Boissons' },
  { code: '21', name: 'Alloco', price: 1000, category: 'Plats' },
  { code: '22', name: 'Kedjenou', price: 3000, category: 'Plats' },
  { code: '31', name: 'Eau Minérale', price: 400, category: 'Boissons' },
  { code: '32', name: 'Jus Orange', price: 700, category: 'Boissons' },
];

export const AfricanPOSInterface: React.FC<AfricanPOSInterfaceProps> = ({ 
  serverId, 
  outletId 
}) => {
  const { session } = usePOSAuth();
  const { data: serverTables = [] } = useServerTables(serverId, session?.org_id);
  
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [productCode, setProductCode] = useState('');
  const [showTablePlan, setShowTablePlan] = useState(false);
  const [customerCount, setCustomerCount] = useState(1);

  // Interface en mode "stress" - Ultra simplifiée
  const [isStressMode, setIsStressMode] = useState(true);

  // Raccourcis clavier optimisés pour serveurs africains
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Éviter les raccourcis pendant la saisie
      if (e.target instanceof HTMLInputElement) return;

      // Codes numériques directs (1-99)
      if (!isNaN(Number(e.key)) && e.key !== '0' && e.key !== ' ') {
        setProductCode(prev => prev + e.key);
        return;
      }

      switch (e.key) {
        case 'Enter': // Ajouter produit par code
          e.preventDefault();
          addProductByCode();
          break;
        case 'Escape': // Effacer code
          e.preventDefault();
          setProductCode('');
          break;
        case 'F1': // Nouveau ticket
          e.preventDefault();
          clearOrder();
          break;
        case 'F2': // Paiement
          e.preventDefault();
          handlePayment();
          break;
        case 'F3': // Cuisine
          e.preventDefault();
          sendToKitchen();
          break;
        case 'F4': // Plan salle
          e.preventDefault();
          setShowTablePlan(!showTablePlan);
          break;
        case 'F5': // Mode stress
          e.preventDefault();
          setIsStressMode(!isStressMode);
          break;
        case '+': // Plus de clients
          e.preventDefault();
          setCustomerCount(prev => Math.min(prev + 1, 20));
          break;
        case '-': // Moins de clients
          e.preventDefault();
          setCustomerCount(prev => Math.max(prev - 1, 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [productCode, showTablePlan, isStressMode]);

  // Actions principales
  const addToOrder = useCallback((product: any, quantity: number = 1) => {
    setCurrentOrder(prev => {
      const existingItem = prev.find(item => item.product.code === product.code);
      if (existingItem) {
        return prev.map(item =>
          item.product.code === product.code
            ? {
                ...item,
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * item.unitPrice
              }
            : item
        );
      } else {
        return [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          product,
          quantity,
          unitPrice: product.price,
          totalPrice: product.price * quantity
        }];
      }
    });
    
    // Feedback sonore et visuel
    toast.success(`${product.name} ajouté`, { duration: 1000 });
  }, []);

  const addProductByCode = useCallback(() => {
    const product = AFRICAN_PRODUCTS.find(p => p.code === productCode.trim());
    if (product) {
      addToOrder(product);
      setProductCode('');
    } else {
      toast.error(`Code ${productCode} introuvable`);
      setProductCode('');
    }
  }, [productCode, addToOrder]);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    setCurrentOrder(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice
            }
          : item
      )
    );
  }, []);

  const clearOrder = useCallback(() => {
    setCurrentOrder([]);
    setProductCode('');
    toast.success("Nouveau ticket");
  }, []);

  const sendToKitchen = useCallback(() => {
    if (currentOrder.length === 0) {
      toast.error('Aucun article');
      return;
    }
    if (!selectedTable) {
      toast.error('Sélectionner table');
      return;
    }
    toast.success('→ Cuisine');
  }, [currentOrder, selectedTable]);

  const handlePayment = useCallback(() => {
    if (currentOrder.length === 0) {
      toast.error('Aucun article');
      return;
    }
    toast.success('💳 Paiement');
  }, [currentOrder]);

  const orderTotal = currentOrder.reduce((sum, item) => sum + item.totalPrice, 0);

  // Plan de salle visuel simplifié
  const TablePlan = () => (
    <div className="grid grid-cols-4 gap-4 p-6">
      {serverTables.slice(0, 16).map((table) => (
        <Card
          key={table.table_id}
          className={`cursor-pointer h-24 transition-all ${
            selectedTable?.table_id === table.table_id 
              ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
              : table.status === 'occupied' 
                ? 'bg-destructive/20 border-destructive' 
                : 'hover:bg-accent'
          }`}
          onClick={() => {
            setSelectedTable(table);
            setShowTablePlan(false);
          }}
        >
          <CardContent className="p-4 h-full flex flex-col justify-center items-center">
            <div className="text-xl font-bold">T{table.table_number}</div>
            <div className="text-sm flex items-center gap-1">
              <Users className="h-3 w-3" />
              {table.capacity}
            </div>
            <div className={`w-2 h-2 rounded-full mt-1 ${
              table.status === 'occupied' ? 'bg-destructive' : 
              table.status === 'reserved' ? 'bg-warning' : 'bg-success'
            }`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (showTablePlan) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="h-16 bg-primary text-primary-foreground flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">📍 PLAN DE SALLE</h1>
          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowTablePlan(false)}
              className="text-lg"
            >
              ← Retour (F4)
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TablePlan />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header ultra-compact - Style africain */}
      <div className="h-20 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground flex items-center justify-between px-6 border-b-4 border-accent">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold">🏪 CAFÉ DE COCODY</h1>
            <div className="text-sm opacity-90">Serveur POS Africain</div>
          </div>
          
          {selectedTable ? (
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3 flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <div>
                  <div className="font-bold">Table {selectedTable.table_number}</div>
                  <div className="text-sm flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    {customerCount} client{customerCount > 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              onClick={() => setShowTablePlan(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              size="lg"
            >
              <MapPin className="h-5 w-5 mr-2" />
              Sélectionner Table (F4)
            </Button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm opacity-75">TOTAL</div>
            <div className="text-3xl font-bold">{orderTotal.toLocaleString()} FCFA</div>
          </div>
          
          <Button
            variant={isStressMode ? "secondary" : "outline"}
            onClick={() => setIsStressMode(!isStressMode)}
            className="text-sm"
          >
            {isStressMode ? "🔥 STRESS" : "😌 NORMAL"} (F5)
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Zone saisie codes - Style ultra-rapide */}
        <div className="w-1/3 bg-card border-r-2 border-border">
          {/* Saisie code produit XXL */}
          <div className="p-6 border-b bg-accent/10">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold mb-2">CODE PRODUIT</h3>
              <Input
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Tapez le code..."
                className="text-center text-4xl h-20 font-mono font-bold"
                autoFocus
              />
              <div className="mt-3 text-sm text-muted-foreground">
                Tapez directement ou Enter pour ajouter
              </div>
            </div>
          </div>

          {/* Grille codes rapides populaires */}
          <div className="p-4">
            <h4 className="font-bold mb-3 text-center">⚡ CODES RAPIDES</h4>
            <div className="grid grid-cols-3 gap-2">
              {AFRICAN_PRODUCTS.slice(0, 12).map((product) => (
                <Button
                  key={product.code}
                  variant="outline"
                  onClick={() => addToOrder(product)}
                  className="h-16 flex flex-col text-xs p-2"
                >
                  <div className="font-bold text-lg">{product.code}</div>
                  <div className="truncate">{product.name}</div>
                  <div className="text-primary font-bold">{product.price.toLocaleString()}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="p-4 space-y-2 border-t">
            <Button 
              onClick={clearOrder} 
              variant="outline" 
              className="w-full h-12 text-lg"
            >
              🔄 Nouveau (F1)
            </Button>
            <Button 
              onClick={sendToKitchen} 
              disabled={!selectedTable || currentOrder.length === 0}
              className="w-full h-12 text-lg bg-success hover:bg-success/90"
            >
              <ChefHat className="h-5 w-5 mr-2" />
              Cuisine (F3)
            </Button>
          </div>
        </div>

        {/* Ticket de commande - Ultra-lisible */}
        <div className="flex-1 bg-background flex flex-col">
          {/* Header ticket */}
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">📝 COMMANDE</h3>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {currentOrder.length} article{currentOrder.length > 1 ? 's' : ''}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomerCount(prev => Math.max(prev - 1, 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-bold w-8 text-center">{customerCount}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomerCount(prev => Math.min(prev + 1, 20))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Liste articles */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentOrder.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-xl">Commande vide</p>
                <p>Tapez un code produit pour commencer</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentOrder.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {item.product.code} • {item.unitPrice.toLocaleString()} FCFA/unité
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-10 w-10 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-xl">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-10 w-10 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-lg">{item.totalPrice.toLocaleString()} FCFA</div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentOrder(prev => prev.filter(i => i.id !== item.id))}
                          className="h-10 w-10 p-0 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer total et paiement */}
          <div className="p-6 border-t bg-muted/10">
            <div className="flex justify-between items-center mb-4 py-3 border-t-2 border-dashed border-primary">
              <span className="text-2xl font-bold">TOTAL</span>
              <span className="text-4xl font-bold text-primary">{orderTotal.toLocaleString()} FCFA</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={handlePayment}
                disabled={currentOrder.length === 0}
                size="lg"
                className="h-16 text-lg bg-success hover:bg-success/90"
              >
                <CreditCard className="h-6 w-6 mr-2" />
                ESPÈCES (F2)
              </Button>
              
              <Button
                onClick={handlePayment}
                disabled={currentOrder.length === 0}
                size="lg"
                variant="outline"
                className="h-16 text-lg border-2"
              >
                <Smartphone className="h-6 w-6 mr-2" />
                MOBILE MONEY
              </Button>
              
              <Button
                onClick={handlePayment}
                disabled={currentOrder.length === 0}
                size="lg"
                variant="outline"
                className="h-16 text-lg border-2"
              >
                <CreditCard className="h-6 w-6 mr-2" />
                CARTE
              </Button>
            </div>

            {/* Aide raccourcis */}
            <div className="mt-4 text-center text-sm text-muted-foreground bg-muted/30 p-3 rounded">
              <div className="grid grid-cols-2 gap-2">
                <div>F1: Nouveau • F2: Payer • F3: Cuisine • F4: Plan salle</div>
                <div>+/-: Clients • Enter: Ajouter • Esc: Effacer • F5: Mode</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};