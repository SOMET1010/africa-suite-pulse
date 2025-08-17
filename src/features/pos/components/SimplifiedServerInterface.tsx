import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Minus, Trash2, CreditCard, ChefHat, RotateCcw, Search, Table } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServerTables } from '../hooks/useTableAssignments';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSData';
import { usePOSAuth } from '../auth/usePOSAuth';
import { toast } from 'sonner';

interface SimplifiedServerInterfaceProps {
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

export const SimplifiedServerInterface: React.FC<SimplifiedServerInterfaceProps> = ({ 
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
  const [searchQuery, setSearchQuery] = useState('');
  const [productCode, setProductCode] = useState('');

  // Auto-sélection de la dernière table utilisée
  useEffect(() => {
    const lastTableId = localStorage.getItem('lastSelectedTable');
    if (lastTableId && serverTables.length > 0) {
      const lastTable = serverTables.find(t => t.table_id === lastTableId);
      if (lastTable) {
        setSelectedTable(lastTable);
      }
    }
  }, [serverTables]);

  // Sauvegarde de la table sélectionnée
  useEffect(() => {
    if (selectedTable) {
      localStorage.setItem('lastSelectedTable', selectedTable.table_id);
    }
  }, [selectedTable]);

  // Gestion des erreurs
  useEffect(() => {
    if (tablesError) toast.error("Erreur lors du chargement des tables");
    if (categoriesError) toast.error("Erreur lors du chargement des catégories");
    if (productsError) toast.error("Erreur lors du chargement des produits");
  }, [tablesError, categoriesError, productsError]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F1: Nouveau ticket
      if (e.key === 'F1') {
        e.preventDefault();
        clearOrder();
      }
      // F2: Paiement
      else if (e.key === 'F2') {
        e.preventDefault();
        handlePayment();
      }
      // F3: Envoyer en cuisine
      else if (e.key === 'F3') {
        e.preventDefault();
        sendToKitchen();
      }
      // Entrée: Ajouter produit par code
      else if (e.key === 'Enter' && productCode.trim()) {
        e.preventDefault();
        addProductByCode();
      }
      // Escape: Clear search/code
      else if (e.key === 'Escape') {
        e.preventDefault();
        setSearchQuery('');
        setProductCode('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [productCode]);

  // Filtrage des produits
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    toast.success("Nouveau ticket créé");
  }, []);

  const addProductByCode = useCallback(() => {
    const product = products.find(p => p.code === productCode.trim());
    if (product) {
      addToOrder(product);
      setProductCode('');
      toast.success(`${product.name} ajouté`);
    } else {
      toast.error('Produit non trouvé');
    }
  }, [productCode, products, addToOrder]);

  const sendToKitchen = useCallback(() => {
    if (currentOrder.length === 0) {
      toast.error('Aucun article à envoyer');
      return;
    }
    if (!selectedTable) {
      toast.error('Veuillez sélectionner une table');
      return;
    }
    toast.success('Commande envoyée en cuisine');
    // Logique d'envoi en cuisine ici
  }, [currentOrder, selectedTable]);

  const handlePayment = useCallback(() => {
    if (currentOrder.length === 0) {
      toast.error('Aucun article à payer');
      return;
    }
    if (!selectedTable) {
      toast.error('Veuillez sélectionner une table');
      return;
    }
    toast.success('Paiement initié');
    // Logique de paiement ici
  }, [currentOrder, selectedTable]);

  const orderTotal = currentOrder.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header compact */}
      <div className="h-16 bg-card border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">POS Serveur</h1>
          
          {/* Sélecteur de table */}
          <Select 
            value={selectedTable?.table_id || ""} 
            onValueChange={(tableId) => {
              const table = serverTables.find(t => t.table_id === tableId);
              setSelectedTable(table);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sélectionner table" />
            </SelectTrigger>
            <SelectContent>
              {serverTables.map((table) => (
                <SelectItem key={table.table_id} value={table.table_id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      table.status === 'occupied' ? 'bg-red-500' : 
                      table.status === 'reserved' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    Table {table.table_number}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTable && (
            <Badge variant="outline" className="ml-2">
              Table {selectedTable.table_number} • {selectedTable.capacity} pers.
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-lg font-bold">{orderTotal.toLocaleString()} FCFA</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Panneau produits (60%) */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Barre de recherche et catégories */}
          <div className="p-4 border-b bg-muted/10">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-40">
                <Input
                  placeholder="Code produit"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProductByCode()}
                />
              </div>
            </div>

            {/* Catégories simplifiées */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Tout
              </Button>
              {categories.slice(0, 8).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Grille produits simplifiée */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow h-24"
                  onClick={() => addToOrder(product)}
                >
                  <CardContent className="p-3 h-full flex flex-col justify-between">
                    <div className="text-sm font-medium leading-tight line-clamp-2">
                      {product.name}
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {product.base_price.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau ticket (40%) */}
        <div className="w-2/5 bg-card border-l flex flex-col">
          {/* Header ticket */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Ticket de commande</h3>
              <Badge variant="outline">{currentOrder.length} articles</Badge>
            </div>
          </div>

          {/* Liste des articles */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {currentOrder.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Table className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun article</p>
              </div>
            ) : (
              currentOrder.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{item.product.name}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromOrder(item.id)}
                      className="h-6 w-6 p-0 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-mono">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="font-bold">
                      {item.totalPrice.toLocaleString()} FCFA
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Footer avec actions */}
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between items-center py-2 border-t border-dashed">
              <span className="font-semibold">TOTAL</span>
              <span className="text-xl font-bold">{orderTotal.toLocaleString()} FCFA</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={clearOrder}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Nouveau (F1)
              </Button>
              <Button
                onClick={sendToKitchen}
                disabled={currentOrder.length === 0 || !selectedTable}
                className="flex items-center gap-2"
              >
                <ChefHat className="h-4 w-4" />
                Cuisine (F3)
              </Button>
            </div>

            <Button
              onClick={handlePayment}
              disabled={currentOrder.length === 0 || !selectedTable}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <CreditCard className="h-4 w-4" />
              PAYER (F2)
            </Button>

            {/* Raccourcis visibles */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <div>F1: Nouveau • F2: Payer • F3: Cuisine</div>
              <div>Enter: Ajouter par code • Esc: Effacer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};