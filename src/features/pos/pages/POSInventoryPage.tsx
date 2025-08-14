import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { 
  ArrowLeft, 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInventoryData } from "../hooks/useInventoryData";

export default function POSInventoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  
  const {
    warehouses = [],
    stockItems = [],
    movements = [],
    lowStockItems = [],
    isLoading
  } = useInventoryData();

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesWarehouse = selectedWarehouse === "all" || 
      item.warehouse_id === selectedWarehouse;
    
    return matchesSearch && matchesWarehouse;
  });

  const getStockStatus = (item: any) => {
    if (item.current_stock <= 0) return { label: "Rupture", color: "bg-red-500" };
    if (item.current_stock <= (item.min_quantity || 0)) return { label: "Stock faible", color: "bg-orange-500" };
    return { label: "En stock", color: "bg-green-500" };
  };

  const calculateTotalValue = () => {
    return filteredItems.reduce((total, item) => 
      total + (item.current_stock * (item.last_cost || 0)), 0
    );
  };

  if (isLoading) {
    return (
      <MainAppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Chargement de l'inventaire...</p>
          </div>
        </div>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/pos")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />
                Gestion d'Inventaire
              </h1>
              <p className="text-muted-foreground">
                Suivi des stocks et mouvements
              </p>
            </div>
          </div>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un article
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Articles en stock</p>
                  <p className="text-2xl font-bold">{stockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock faible</p>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valeur totale</p>
                  <p className="text-2xl font-bold">
                    {calculateTotalValue().toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entrepôts</p>
                  <p className="text-2xl font-bold">{warehouses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Tous les entrepôts</option>
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>

        <Tabs defaultValue="stock" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stock">Articles en stock</TabsTrigger>
            <TabsTrigger value="low-stock">Stock faible</TabsTrigger>
            <TabsTrigger value="movements">Mouvements</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-4">
            <div className="grid gap-4">
              {filteredItems.map(item => {
                const status = getStockStatus(item);
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                SKU: {item.sku} • Catégorie: {item.category}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Stock actuel</p>
                            <p className="text-lg font-bold">
                              {item.current_stock} {item.unit}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valeur</p>
                            <p className="text-lg font-bold">
                              {((item.current_stock * (item.last_cost || 0))).toLocaleString()} FCFA
                            </p>
                          </div>
                          
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Stock min:</span>
                          <span className="ml-1 font-medium">{item.minimum_stock}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coût unitaire:</span>
                          <span className="ml-1 font-medium">
                            {(item.last_cost || 0).toLocaleString()} FCFA
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entrepôt:</span>
                          <span className="ml-1 font-medium">
                            {warehouses.find(w => w.id === item.warehouse_id)?.name || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dernière maj:</span>
                          <span className="ml-1 font-medium">
                            {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4">
            <div className="grid gap-4">
              {lowStockItems.map(item => {
                const status = getStockStatus(item);
                return (
                  <Card key={item.id} className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              SKU: {item.sku}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Stock actuel</p>
                            <p className="text-lg font-bold text-orange-600">
                              {item.current_stock} {item.unit}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Stock minimum</p>
                            <p className="text-lg font-bold">
                              {item.minimum_stock} {item.unit}
                            </p>
                          </div>
                          
                          <Button size="sm" className="gap-2">
                            <Plus className="w-3 h-3" />
                            Réapprovisionner
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-4">
            <div className="grid gap-4">
              {movements.slice(0, 20).map(movement => (
                <Card key={movement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{movement.item_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {movement.movement_type === 'in' ? 'Entrée' : 
                           movement.movement_type === 'out' ? 'Sortie' : 'Ajustement'}
                          {movement.reason && ` • ${movement.reason}`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        <Badge variant={
                          movement.movement_type === 'in' ? 'default' : 
                          movement.movement_type === 'out' ? 'destructive' : 'secondary'
                        }>
                          {movement.movement_type === 'in' ? 'Entrée' : 
                           movement.movement_type === 'out' ? 'Sortie' : 'Ajustement'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainAppLayout>
  );
}