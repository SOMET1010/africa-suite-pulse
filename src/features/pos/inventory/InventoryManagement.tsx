import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Package, Plus, Search, TrendingDown, TrendingUp, Warehouse } from "lucide-react";
import { useInventoryData } from "../hooks/useInventoryData";

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>("");

  const {
    stockItems,
    warehouses,
    movements,
    lowStockItems,
    isLoading,
    addStockItem,
    addStockMovement,
    createWarehouse
  } = useInventoryData();

  const filteredItems = stockItems.filter(item => {
    return (
      (searchTerm === "" || 
       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.item_code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "" || item.category === categoryFilter) &&
      (warehouseFilter === "" || item.warehouse_id === warehouseFilter)
    );
  });

  const getStockStatus = (item: any) => {
    if (item.current_stock <= 0) {
      return { status: "out", color: "destructive", icon: AlertTriangle };
    } else if (item.current_stock <= item.min_stock_level) {
      return { status: "low", color: "warning", icon: TrendingDown };
    } else {
      return { status: "ok", color: "success", icon: TrendingUp };
    }
  };

  const categories = Array.from(new Set(stockItems.map(item => item.category)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">
            Gérez vos inventaires, mouvements de stock et entrepôts
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un Article</DialogTitle>
              </DialogHeader>
              <AddItemForm 
                warehouses={warehouses}
                onSubmit={addStockItem}
                onClose={() => setShowAddItem(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showMovement} onOpenChange={setShowMovement}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Mouvement de Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Enregistrer un Mouvement</DialogTitle>
              </DialogHeader>
              <MovementForm 
                stockItems={stockItems}
                onSubmit={addStockMovement}
                onClose={() => setShowMovement(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{stockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Entrepôts</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Faible</p>
                <p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Valeur Stock</p>
                <p className="text-2xl font-bold">
                  {stockItems.reduce((sum, item) => sum + (item.current_stock * (item.unit_cost || 0)), 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="warehouses">Entrepôts</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Articles en Stock</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {categories.map((category, index) => (
                      <SelectItem key={`${category}-${index}`} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Entrepôt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les entrepôts</SelectItem>
                    {warehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Stock Actuel</TableHead>
                    <TableHead>Stock Min</TableHead>
                    <TableHead>Coût Unitaire</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const StatusIcon = stockStatus.icon;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.item_code}</TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.current_stock} {item.unit}</TableCell>
                        <TableCell>{item.min_stock_level} {item.unit}</TableCell>
                        <TableCell>{item.unit_cost?.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          {((item.current_stock * (item.unit_cost || 0))).toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.color as any}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Mouvements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.slice(0, 10).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {new Date(movement.performed_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{movement.item_name}</TableCell>
                      <TableCell>
                        <Badge variant={movement.movement_type === 'in' ? 'success' : 'secondary'}>
                          {movement.movement_type === 'in' ? 'Entrée' : 
                           movement.movement_type === 'out' ? 'Sortie' : 'Ajustement'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movement.movement_type === 'out' ? '-' : '+'}{movement.quantity}
                      </TableCell>
                      <TableCell>{movement.reference_number}</TableCell>
                      <TableCell>{movement.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-4">
          <WarehouseManagement 
            warehouses={warehouses}
            onCreateWarehouse={createWarehouse}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Alertes de Stock Faible
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune alerte de stock faible
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Stock Actuel</TableHead>
                      <TableHead>Stock Minimum</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.current_stock} {item.unit}</TableCell>
                        <TableCell>{item.min_stock_level} {item.unit}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">Stock Faible</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Commander
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Placeholder components that would be implemented
function AddItemForm({ warehouses, onSubmit, onClose }: any) {
  return <div>Form to add new inventory item...</div>;
}

function MovementForm({ stockItems, onSubmit, onClose }: any) {
  return <div>Form to record stock movement...</div>;
}

function WarehouseManagement({ warehouses, onCreateWarehouse }: any) {
  return <div>Warehouse management component...</div>;
}