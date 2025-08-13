import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServerTables } from '../hooks/useTableAssignments';
import { usePOSProducts, usePOSCategories } from '../hooks/usePOSData';
import { Clock, Users, ChefHat, Plus } from 'lucide-react';

interface ServerOrderInterfaceProps {
  serverId: string;
  outletId: string;
}

export const ServerOrderInterface: React.FC<ServerOrderInterfaceProps> = ({ 
  serverId, 
  outletId 
}) => {
  const { data: serverTables = [] } = useServerTables(serverId);
  const { data: categories = [] } = usePOSCategories(outletId);
  const { data: products = [] } = usePOSProducts(outletId);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'occupied': return 'bg-destructive text-destructive-foreground';
      case 'reserved': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Interface Serveur</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {serverTables.length} tables
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Mes Tables */}
        <div className="w-80 border-r bg-muted/30 p-4">
          <h2 className="font-semibold mb-4">Mes Tables</h2>
          <div className="space-y-3">
            {serverTables.map((table) => (
              <Card 
                key={table.table_id}
                className={`cursor-pointer transition-all ${
                  selectedTable?.table_id === table.table_id 
                    ? 'ring-2 ring-primary' 
                    : ''
                }`}
                onClick={() => setSelectedTable(table)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">
                      Table {table.table_number}
                    </span>
                    <Badge className={getTableStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{table.capacity} places</span>
                    {table.zone && (
                      <>
                        <span>•</span>
                        <span>{table.zone}</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interface de commande */}
        <div className="flex-1 flex flex-col">
          {selectedTable ? (
            <Tabs defaultValue="order" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="order">Commande</TabsTrigger>
                <TabsTrigger value="status">Statut</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="order" className="flex-1 flex">
                {/* Catégories */}
                <div className="w-64 border-r p-4">
                  <h3 className="font-semibold mb-4">Catégories</h3>
                  <div className="space-y-2">
                    <Button 
                      variant={selectedCategory === '' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('')}
                    >
                      Toutes
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                        style={{ backgroundColor: selectedCategory === category.id ? category.color : undefined }}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Produits */}
                <div className="flex-1 p-4">
                  <h3 className="font-semibold mb-4">
                    Produits {selectedCategory && `- ${categories.find(c => c.id === selectedCategory)?.name}`}
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col h-full">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-full h-32 object-cover rounded mb-3"
                              />
                            )}
                            <h4 className="font-semibold mb-2">{product.name}</h4>
                            {product.description && (
                              <p className="text-sm text-muted-foreground mb-3 flex-1">
                                {product.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="font-bold">
                                {product.base_price.toLocaleString()} FCFA
                              </span>
                              <Button size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Panier de commande */}
                <div className="w-80 border-l bg-muted/30 p-4">
                  <h3 className="font-semibold mb-4">
                    Table {selectedTable.table_number}
                  </h3>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Commande en cours</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Aucun article ajouté
                        </p>
                      </CardContent>
                    </Card>

                    <Button className="w-full" disabled>
                      <ChefHat className="h-4 w-4 mr-2" />
                      Envoyer en cuisine
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="status" className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Statut Table {selectedTable.table_number}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>État actuel:</span>
                        <Badge className={getTableStatusColor(selectedTable.status)}>
                          {selectedTable.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Capacité:</span>
                        <span>{selectedTable.capacity} personnes</span>
                      </div>
                      {selectedTable.zone && (
                        <div className="flex items-center justify-between">
                          <span>Zone:</span>
                          <span>{selectedTable.zone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique Table {selectedTable.table_number}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Aucun historique disponible pour cette table.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez une table pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};