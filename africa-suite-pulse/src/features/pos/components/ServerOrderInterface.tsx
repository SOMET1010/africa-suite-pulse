import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Plus, Minus, Trash2, Calculator, CreditCard, X, BarChart3, Settings, FileText, History, UserCheck, Home } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider 
} from '@/components/ui/sidebar';
import { useServerTables } from '../hooks/useTableAssignments';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSData';
import { usePOSAuthContext } from '../auth/POSAuthProvider';
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
  const { session } = usePOSAuthContext();
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

  const sidebarItems = [
    { title: "Accueil", icon: Home, id: "home" },
    { title: "Rapports", icon: BarChart3, id: "reports" },
    { title: "Historique", icon: History, id: "history" },
    { title: "Commandes", icon: FileText, id: "orders" },
    { title: "Personnel", icon: UserCheck, id: "staff" },
    { title: "Paramètres", icon: Settings, id: "settings" },
  ];

  const [activeSidebarItem, setActiveSidebarItem] = useState("home");

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen flex w-full bg-gradient-to-br from-surface via-background to-surface/50 animate-fade-in">
        {/* Sidebar moderne avec logo et animations */}
        <Sidebar className="w-20 bg-gradient-to-b from-primary to-primary/90 border-r-4 border-primary-glow shadow-luxury">
          <SidebarContent className="pt-4">
            {/* Logo/Brand */}
            <div className="mb-6 px-2">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-accent to-accent-light rounded-lg flex items-center justify-center shadow-glow">
                <span className="text-lg font-bold text-white">AS</span>
              </div>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel className="sr-only">Fonctionnalités POS</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        isActive={activeSidebarItem === item.id}
                        onClick={() => setActiveSidebarItem(item.id)}
                        className={`w-full h-16 flex flex-col items-center justify-center gap-1 text-xs rounded-xl mx-2 transition-all duration-300 group ${
                          activeSidebarItem === item.id 
                            ? 'bg-white/20 shadow-elegant text-white transform scale-105' 
                            : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-105'
                        }`}
                        tooltip={item.title}
                      >
                        <item.icon className={`h-6 w-6 transition-transform duration-300 ${
                          activeSidebarItem === item.id ? 'scale-110' : 'group-hover:scale-110'
                        }`} />
                        <span className="text-[9px] font-medium text-center leading-tight">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Header moderne avec gradients et animations */}
          <div className="h-20 bg-gradient-to-r from-primary via-primary-dark to-primary text-primary-foreground px-8 flex items-center justify-between border-b-4 border-primary-glow shadow-luxury relative overflow-hidden">
            {/* Effet de brillance animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            
            <div className="flex items-center gap-8 relative z-10">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-accent-light bg-clip-text text-transparent">
                  AfricaSuite POS
                </h1>
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              </div>
              
              {selectedTable && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 shadow-glow animate-scale-in">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-xl font-bold">TABLE {selectedTable.table_number}</span>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {selectedTable.capacity} pers.
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-8 relative z-10">
              <div className="text-right bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
                <div className="text-sm opacity-90 font-medium">Total Commande</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                  {orderTotal.toLocaleString()} FCFA
                </div>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                <div className="text-sm opacity-90 font-medium">Heure</div>
                <div className="text-xl font-mono font-bold">{getCurrentTime()}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Panneau tables avec design moderne */}
            <div className="w-72 bg-gradient-to-b from-background to-muted/30 border-r-2 border-primary/10 shadow-elegant">
              <div className="p-6 border-b-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <h2 className="font-bold text-xl text-primary flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Mes Tables ({serverTables.length})
                </h2>
              </div>
              <div className="p-3 space-y-2 overflow-y-auto max-h-full">
                {serverTables.map((table) => (
                  <Card 
                    key={table.table_id} 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-elevate hover:scale-[1.02] ${
                      selectedTable?.table_id === table.table_id 
                        ? 'bg-gradient-to-r from-primary to-primary-dark text-primary-foreground shadow-luxury border-2 border-primary-glow' 
                        : 'hover:bg-gradient-to-r hover:from-accent/10 hover:to-primary/10 border border-primary/20'
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${
                            table.status === 'occupied' ? 'bg-red-500' : 
                            table.status === 'reserved' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></div>
                          <span className="font-bold text-lg">TABLE {table.table_number}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium transition-colors duration-300 ${
                              selectedTable?.table_id === table.table_id 
                                ? 'bg-white/20 text-white border-white/30' 
                                : ''
                            }`}
                            style={{
                              backgroundColor: selectedTable?.table_id !== table.table_id ? (
                                table.status === 'occupied' ? '#ef4444' : 
                                table.status === 'reserved' ? '#f59e0b' : '#10b981'
                              ) : undefined,
                              color: selectedTable?.table_id !== table.table_id ? 'white' : undefined,
                              borderColor: selectedTable?.table_id !== table.table_id ? 'transparent' : undefined
                            }}
                          >
                            {table.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium opacity-80">{table.capacity} pers.</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Zone principale */}
            <div className="flex-1 flex flex-col">
              {selectedTable ? (
                <>
                  {/* Barre de catégories moderne avec animations */}
                  <div className="h-24 bg-gradient-to-r from-background via-muted/20 to-background border-b-2 border-primary/20 p-3 shadow-soft">
                    <div className="flex gap-3 h-full overflow-x-auto scrollbar-thin">
                      <Button
                        variant={selectedCategory === 'all' ? "default" : "outline"}
                        className={`min-w-28 h-full flex-col justify-center text-xs font-bold rounded-xl transition-all duration-300 hover:scale-105 ${
                          selectedCategory === 'all' 
                            ? 'bg-gradient-to-b from-primary to-primary-dark text-primary-foreground shadow-luxury border-2 border-primary-glow' 
                            : 'hover:bg-gradient-to-b hover:from-accent/10 hover:to-primary/10 border-2 border-primary/30 hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedCategory('all')}
                      >
                        <span className="text-xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">F1</span>
                        <span className="mt-1">TOUT</span>
                      </Button>
                      {categories.slice(0, 11).map((category, index) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "outline"}
                          className={`min-w-28 h-full flex-col justify-center text-xs font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-elevate ${
                            selectedCategory === category.id ? 'shadow-luxury border-2' : 'border-2 hover:border-opacity-70'
                          }`}
                          style={{
                            backgroundColor: selectedCategory === category.id 
                              ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)` 
                              : undefined,
                            color: selectedCategory === category.id ? 'white' : undefined,
                            borderColor: category.color || 'hsl(var(--primary))',
                            background: selectedCategory === category.id 
                              ? `linear-gradient(135deg, ${category.color}, ${category.color}dd)` 
                              : undefined
                          }}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <span className="text-xl font-bold">F{index + 2}</span>
                          <span className="text-center leading-tight mt-1">{category.name.toUpperCase()}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex">
                    {/* Zone produits avec design attractif */}
                    <div className="flex-1 p-6 bg-gradient-to-br from-background to-muted/20">
                      <div className="grid grid-cols-4 gap-4 h-full overflow-y-auto scrollbar-thin">
                        {filteredProducts.map((product) => (
                          <Card
                            key={product.id}
                            className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-luxury hover:bg-gradient-to-br hover:from-accent/5 hover:to-primary/5 group border-2 border-primary/20 hover:border-primary/50 animate-fade-in"
                            onClick={() => addToOrder(product)}
                            onDoubleClick={() => addToOrder(product, 2)}
                          >
                            <CardContent className="h-28 flex flex-col justify-between p-4 relative overflow-hidden">
                              {/* Effet de brillance au survol */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"></div>
                              
                              <span className="font-bold text-sm text-center leading-tight text-foreground relative z-10 group-hover:text-primary transition-colors duration-300">
                                {product.name}
                              </span>
                              
                              <div className="text-center relative z-10">
                                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent group-hover:from-accent group-hover:to-accent-light transition-all duration-300">
                                  {product.base_price.toLocaleString()}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">FCFA</span>
                              </div>
                              
                              {/* Indicateur de stock */}
                              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Panel commande moderne et attractif */}
                    <div className="w-80 bg-gradient-to-b from-background to-muted/30 border-l-4 border-primary/20 flex flex-col shadow-luxury">
                      {/* En-tête commande avec gradient */}
                      <div className="p-6 border-b-2 border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse"></div>
                        <h3 className="font-bold text-xl text-primary relative z-10">COMMANDE EN COURS</h3>
                        <p className="text-sm text-muted-foreground font-medium relative z-10 flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                          Table {selectedTable.table_number}
                        </p>
                      </div>

                      {/* Liste des items avec animations */}
                      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                        {currentOrder.length === 0 ? (
                          <div className="text-center text-muted-foreground py-12 animate-fade-in">
                            <div className="bg-gradient-to-br from-muted to-muted/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                              <Calculator className="h-8 w-8 opacity-50" />
                            </div>
                            <p className="font-medium">Aucun article ajouté</p>
                            <p className="text-xs opacity-70 mt-1">Sélectionnez des produits</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {currentOrder.map((item, index) => (
                              <Card 
                                key={item.id} 
                                className="transition-all duration-300 hover:shadow-elevate border border-primary/20 animate-scale-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <CardContent className="p-4 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/2 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                  
                                  <div className="flex items-center justify-between mb-3 relative z-10">
                                    <span className="font-bold text-sm leading-tight text-primary">{item.product.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:scale-110 transition-all duration-200 rounded-full"
                                      onClick={() => removeFromOrder(item.id)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="min-w-8 text-center font-bold text-lg bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-110"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-lg bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                                        {item.totalPrice.toLocaleString()}
                                      </span>
                                      <span className="text-xs text-muted-foreground ml-1">FCFA</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Total et actions avec design premium */}
                      <div className="border-t-2 border-primary/20 bg-gradient-to-r from-background to-muted/30 p-6 space-y-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
                        
                        <div className="flex justify-between items-center relative z-10">
                          <span className="text-xl font-bold text-primary">TOTAL:</span>
                          <div className="text-right">
                            <span className="text-3xl font-bold bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                              {orderTotal.toLocaleString()}
                            </span>
                            <span className="text-lg font-medium text-muted-foreground ml-2">FCFA</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 relative z-10">
                          <Button 
                            variant="outline" 
                            onClick={clearOrder}
                            disabled={currentOrder.length === 0}
                            className="h-14 font-bold border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                          >
                            <Trash2 className="h-5 w-5 mr-2" />
                            ANNULER
                          </Button>
                          <Button 
                            className="h-14 font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-luxury transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            disabled={currentOrder.length === 0}
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            PAYER
                          </Button>
                        </div>
                        
                        <Button 
                          className="w-full h-14 font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-luxury transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 relative z-10"
                          disabled={currentOrder.length === 0}
                        >
                          <Clock className="h-5 w-5 mr-2" />
                          ENVOYER EN CUISINE
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-background">
                  <div className="text-center text-muted-foreground animate-fade-in">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-luxury">
                      <Users className="h-16 w-16 text-primary/60 animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      Sélectionnez une table
                    </h3>
                    <p className="text-lg opacity-80">Choisissez une table dans la liste pour commencer une commande</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};