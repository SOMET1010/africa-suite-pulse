import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Package, Plus, Search, TrendingDown, TrendingUp, Warehouse, Edit, Trash2, History, ShoppingCart } from "lucide-react";
import { useInventoryData } from "../hooks/useInventoryData";
import { useToast } from "@/hooks/use-toast";
import { RestockManagementDialog } from "./components/RestockManagementDialog";
import { EnhancedStockMovementDialog } from "./components/EnhancedStockMovementDialog";
import { InventoryNotifications } from "./components/InventoryNotifications";
import { StockAnalytics } from "./components/StockAnalytics";

export function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [showEnhancedMovement, setShowEnhancedMovement] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedMovementItem, setSelectedMovementItem] = useState<any>(null);

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

  const { toast } = useToast();

  const filteredItems = stockItems.filter(item => {
    return (
      (searchTerm === "" || 
       item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.item_code.toLowerCase().includes(searchTerm.toLowerCase())) &&
       (categoryFilter === "all" || item.category === categoryFilter) &&
       (warehouseFilter === "all" || item.warehouse_id === warehouseFilter)
    );
  });

  const getStockStatus = (item: any) => {
    if (item.current_stock <= 0) {
      return { status: "Rupture", color: "destructive", icon: AlertTriangle };
    } else if (item.current_stock <= item.min_stock_level) {
      return { status: "Faible", color: "warning", icon: TrendingDown };
    } else {
      return { status: "Normal", color: "success", icon: TrendingUp };
    }
  };

  const categories = Array.from(new Set(stockItems.map(item => item.category)));

  const totalStockValue = stockItems.reduce((sum, item) => 
    sum + (item.current_stock * (item.unit_cost || 0)), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Gestion des Stocks
          </h1>
          <p className="text-muted-foreground">
            Gérez vos inventaires, mouvements de stock et entrepôts
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 transition-all">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Article
              </Button>
            </DialogTrigger>
            <DialogContent>
              <AddItemForm 
                warehouses={warehouses}
                onSubmit={(data: any) => {
                  addStockItem(data);
                  setShowAddItem(false);
                }}
                onClose={() => setShowAddItem(false)}
              />
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={() => setShowEnhancedMovement(true)}
          >
            <Package className="w-4 h-4 mr-2" />
            Mouvement Détaillé
          </Button>

          <Button 
            variant="outline" 
            className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
            onClick={() => setShowRestock(true)}
            disabled={lowStockItems.length === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Réapprovisionner
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{stockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Warehouse className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entrepôts</p>
                <p className="text-2xl font-bold">{warehouses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-destructive to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Faible</p>
                <p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur Stock</p>
                <p className="text-xl font-bold">
                  {totalStockValue.toLocaleString()} FCFA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Section */}
      <div className="mb-6">
        <InventoryNotifications onRestockClick={() => setShowRestock(true)} />
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="warehouses">Entrepôts</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                    <SelectItem value="all">Toutes les catégories</SelectItem>
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
                    <SelectItem value="all">Tous les entrepôts</SelectItem>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const StatusIcon = stockStatus.icon;
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
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
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedMovementItem(item);
                                setShowEnhancedMovement(true);
                              }}
                            >
                              <History className="w-3 h-3" />
                            </Button>
                          </div>
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
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Aucune alerte de stock</p>
                  <p className="text-muted-foreground">Tous vos articles sont correctement stockés</p>
                </div>
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

        <TabsContent value="analytics" className="space-y-4">
          <StockAnalytics />
        </TabsContent>
      </Tabs>
      
      {/* Enhanced Dialogs */}
      <EnhancedStockMovementDialog
        open={showEnhancedMovement}
        onOpenChange={setShowEnhancedMovement}
        stockItems={stockItems}
        warehouses={warehouses}
        onRefresh={() => window.location.reload()}
        selectedItem={selectedMovementItem}
      />
      
      <RestockManagementDialog
        open={showRestock}
        onOpenChange={setShowRestock}
        lowStockItems={lowStockItems}
        warehouses={warehouses}
        onRefresh={() => window.location.reload()}
      />
    </div>
  );
}

function AddItemForm({ warehouses, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    name: "",
    item_code: "",
    category: "",
    unit: "pcs",
    warehouse_id: "",
    current_stock: 0,
    min_stock_level: 10,
    max_stock_level: 100,
    unit_cost: 0,
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Ajouter un Article</DialogTitle>
        <DialogDescription>
          Créez un nouvel article dans votre inventaire
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom de l'article</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="item_code">Code article</Label>
          <Input
            id="item_code"
            value={formData.item_code}
            onChange={(e) => setFormData({...formData, item_code: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="unit">Unité</Label>
          <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pcs">Pièces</SelectItem>
              <SelectItem value="kg">Kilogrammes</SelectItem>
              <SelectItem value="l">Litres</SelectItem>
              <SelectItem value="m">Mètres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="warehouse">Entrepôt</Label>
        <Select value={formData.warehouse_id} onValueChange={(value) => setFormData({...formData, warehouse_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un entrepôt" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((warehouse: any) => (
              <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="current_stock">Stock actuel</Label>
          <Input
            id="current_stock"
            type="number"
            value={formData.current_stock}
            onChange={(e) => setFormData({...formData, current_stock: Number(e.target.value)})}
          />
        </div>
        <div>
          <Label htmlFor="min_stock_level">Stock minimum</Label>
          <Input
            id="min_stock_level"
            type="number"
            value={formData.min_stock_level}
            onChange={(e) => setFormData({...formData, min_stock_level: Number(e.target.value)})}
          />
        </div>
        <div>
          <Label htmlFor="unit_cost">Coût unitaire</Label>
          <Input
            id="unit_cost"
            type="number"
            value={formData.unit_cost}
            onChange={(e) => setFormData({...formData, unit_cost: Number(e.target.value)})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          Ajouter
        </Button>
      </DialogFooter>
    </form>
  );
}

function MovementForm({ stockItems, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({
    stock_item_id: "",
    movement_type: "in",
    quantity: 0,
    reference_number: "",
    unit_cost: 0,
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Enregistrer un Mouvement</DialogTitle>
        <DialogDescription>
          Enregistrez une entrée ou sortie de stock
        </DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="stock_item">Article</Label>
        <Select value={formData.stock_item_id} onValueChange={(value) => setFormData({...formData, stock_item_id: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un article" />
          </SelectTrigger>
          <SelectContent>
            {stockItems.map((item: any) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="movement_type">Type de mouvement</Label>
          <Select value={formData.movement_type} onValueChange={(value) => setFormData({...formData, movement_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Entrée</SelectItem>
              <SelectItem value="out">Sortie</SelectItem>
              <SelectItem value="adjustment">Ajustement</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity">Quantité</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reference_number">Référence</Label>
          <Input
            id="reference_number"
            value={formData.reference_number}
            onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="unit_cost">Coût unitaire</Label>
          <Input
            id="unit_cost"
            type="number"
            value={formData.unit_cost}
            onChange={(e) => setFormData({...formData, unit_cost: Number(e.target.value)})}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  );
}

function WarehouseManagement({ warehouses, onCreateWarehouse }: any) {
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    manager_name: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateWarehouse.mutate(formData);
    setShowCreate(false);
    setFormData({ name: "", location: "", description: "", manager_name: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Entrepôts</h3>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Entrepôt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Créer un Entrepôt</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouvel entrepôt à votre système
                </DialogDescription>
              </DialogHeader>

              <div>
                <Label htmlFor="warehouse_name">Nom de l'entrepôt</Label>
                <Input
                  id="warehouse_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="manager_name">Responsable</Label>
                <Input
                  id="manager_name"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({...formData, manager_name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          {warehouses.length === 0 ? (
            <div className="text-center py-12">
              <Warehouse className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Aucun entrepôt</p>
              <p className="text-muted-foreground">Créez votre premier entrepôt pour commencer</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {warehouses.map((warehouse: any) => (
                <Card key={warehouse.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{warehouse.name}</h4>
                        <p className="text-sm text-muted-foreground">{warehouse.location}</p>
                        {warehouse.description && (
                          <p className="text-sm mt-2">{warehouse.description}</p>
                        )}
                        {warehouse.manager_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Responsable: {warehouse.manager_name}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {warehouse.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
