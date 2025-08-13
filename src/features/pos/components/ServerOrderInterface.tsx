import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Plus, Minus, Trash2, Calculator, CreditCard, X } from 'lucide-react';
import { useServerTables } from '../hooks/useTableAssignments';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSData';
import { usePOSAuth } from '../auth/usePOSAuth';
import { toast } from 'sonner';

interface ServerOrderInterfaceProps {
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

export const ServerOrderInterface: React.FC<ServerOrderInterfaceProps> = ({ 
  serverId, 
  outletId 
}) => {
  const { session } = usePOSAuth();
  const { data: serverTables = [], error: tablesError } = useServerTables(serverId, session?.org_id);
  const { data: categories = [], error: categoriesError } = usePOSCategories(outletId);
  const { data: products = [], error: productsError } = usePOSProducts(outletId);
  
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  // Gestion des erreurs
  useEffect(() => {
    if (tablesError) {
      toast.error("Erreur lors du chargement des tables assignées");
    }
    if (categoriesError) {
      toast.error("Erreur lors du chargement des catégories");
    }
    if (productsError) {
      toast.error("Erreur lors du chargement des produits");
    }
  }, [tablesError, categoriesError, productsError]);

  // Raccourcis clavier pour catégories F1-F12
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= 'F1' && e.key <= 'F12') {
        e.preventDefault();
        const index = parseInt(e.key.slice(1)) - 1;
        if (index === 0) {
          setSelectedCategory('all');
        } else if (categories[index - 1]) {
          setSelectedCategory(categories[index - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [categories]);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id === selectedCategory);

  const addToOrder = useCallback((product: any, quantity: number = 1) => {
    setCurrentOrder(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
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
          unitPrice: product.base_price,
          totalPrice: product.base_price * quantity
        }];
      }
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromOrder(itemId);
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

  const removeFromOrder = useCallback((itemId: string) => {
    setCurrentOrder(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clearOrder = useCallback(() => {
    setCurrentOrder([]);
  }, []);

  const orderTotal = currentOrder.reduce((sum, item) => sum + item.totalPrice, 0);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex flex-col bg-surface">
      {/* Header fixe style POS classique */}
      <div className="h-16 bg-primary text-primary-foreground px-6 flex items-center justify-between border-b-2 border-primary-dark">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">AfricaSuite POS</h1>
          {selectedTable && (
            <div className="flex items-center gap-2 bg-primary-dark/20 px-4 py-2 rounded">
              <span className="text-lg font-semibold">TABLE {selectedTable.table_number}</span>
              <Badge variant="outline" className="bg-background text-foreground">
                {selectedTable.capacity} pers.
              </Badge>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm opacity-90">Total</div>
            <div className="text-2xl font-bold">{orderTotal.toLocaleString()} FCFA</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Heure</div>
            <div className="text-lg font-mono">{getCurrentTime()}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Panneau tables gauche - plus compact */}
        <div className="w-64 bg-muted border-r">
          <div className="p-4 border-b bg-background">
            <h2 className="font-semibold text-lg">Mes Tables ({serverTables.length})</h2>
          </div>
          <div className="p-2 space-y-1 overflow-y-auto max-h-full">
            {serverTables.map((table) => (
              <Button
                key={table.table_id}
                variant={selectedTable?.table_id === table.table_id ? "default" : "ghost"}
                className={`w-full justify-between h-12 ${
                  selectedTable?.table_id === table.table_id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedTable(table)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">T{table.table_number}</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{
                      backgroundColor: table.status === 'occupied' ? '#ef4444' : 
                                     table.status === 'reserved' ? '#f59e0b' : '#10b981',
                      color: 'white',
                      borderColor: 'transparent'
                    }}
                  >
                    {table.status}
                  </Badge>
                </div>
                <span className="text-xs opacity-70">{table.capacity}p</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Zone principale */}
        <div className="flex-1 flex flex-col">
          {selectedTable ? (
            <>
              {/* Barre de catégories style POS classique */}
              <div className="h-20 bg-background border-b p-2">
                <div className="flex gap-2 h-full overflow-x-auto">
                  <Button
                    variant={selectedCategory === 'all' ? "default" : "outline"}
                    className={`min-w-24 h-full flex-col justify-center text-xs font-semibold ${
                      selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <span className="text-lg">F1</span>
                    <span>TOUT</span>
                  </Button>
                  {categories.slice(0, 11).map((category, index) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      className="min-w-24 h-full flex-col justify-center text-xs font-semibold"
                      style={{
                        backgroundColor: selectedCategory === category.id ? category.color : undefined,
                        color: selectedCategory === category.id ? 'white' : undefined,
                        borderColor: category.color
                      }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="text-lg">F{index + 2}</span>
                      <span className="text-center leading-tight">{category.name.toUpperCase()}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex">
                {/* Zone produits */}
                <div className="flex-1 p-4 bg-background">
                  <div className="grid grid-cols-4 gap-3 h-full overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <Button
                        key={product.id}
                        variant="outline"
                        className="h-24 flex-col justify-between p-3 hover:bg-accent text-foreground border-2"
                        onClick={() => addToOrder(product)}
                        onDoubleClick={() => addToOrder(product, 2)}
                      >
                        <span className="font-semibold text-sm text-center leading-tight">
                          {product.name}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {product.base_price.toLocaleString()}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Panel commande droite */}
                <div className="w-80 bg-muted border-l flex flex-col">
                  {/* En-tête commande */}
                  <div className="p-4 border-b bg-background">
                    <h3 className="font-bold text-lg">COMMANDE EN COURS</h3>
                    <p className="text-sm text-muted-foreground">Table {selectedTable.table_number}</p>
                  </div>

                  {/* Liste des items */}
                  <div className="flex-1 overflow-y-auto p-2">
                    {currentOrder.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucun article</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {currentOrder.map((item) => (
                          <Card key={item.id} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{item.product.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => removeFromOrder(item.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="min-w-8 text-center font-bold">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="font-bold">{item.totalPrice.toLocaleString()}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total et actions */}
                  <div className="border-t bg-background p-4 space-y-3">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>TOTAL:</span>
                      <span>{orderTotal.toLocaleString()} FCFA</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={clearOrder}
                        disabled={currentOrder.length === 0}
                        className="h-12"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        ANNULER
                      </Button>
                      <Button 
                        className="h-12 bg-success hover:bg-success/90 text-success-foreground"
                        disabled={currentOrder.length === 0}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        PAYER
                      </Button>
                    </div>
                    
                    <Button 
                      className="w-full h-12 bg-warning hover:bg-warning/90 text-warning-foreground"
                      disabled={currentOrder.length === 0}
                    >
                      ENVOYER EN CUISINE
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background">
              <div className="text-center text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Sélectionnez une table</h3>
                <p>Choisissez une table dans la liste pour commencer une commande</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};