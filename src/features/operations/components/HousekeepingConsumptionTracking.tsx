import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Droplets, Plus, Minus, Calculator, CheckCircle, X, Bed, Bath } from "lucide-react";

interface HousekeepingConsumptionTrackingProps {
  housekeepingTask: {
    id: string;
    room_number: string;
    task_type: string;
    estimated_duration: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CleaningProduct {
  id: string;
  name: string;
  code: string;
  category: string;
  current_stock: number;
  unit_cost: number;
  unit: string;
  concentration?: number;
}

interface ConsumedProduct {
  productId: string;
  product: CleaningProduct;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface ConsumptionTemplate {
  id: string;
  name: string;
  task_type: string;
  products: {
    product_id: string;
    quantity: number;
  }[];
}

const defaultTemplates: ConsumptionTemplate[] = [
  {
    id: 'standard_cleaning',
    name: 'Nettoyage standard',
    task_type: 'cleaning',
    products: [
      { product_id: 'multi_surface_cleaner', quantity: 0.1 },
      { product_id: 'glass_cleaner', quantity: 0.05 },
      { product_id: 'toilet_paper', quantity: 2 },
      { product_id: 'towels', quantity: 3 }
    ]
  },
  {
    id: 'deep_cleaning',
    name: 'Nettoyage approfondi',
    task_type: 'deep_cleaning',
    products: [
      { product_id: 'multi_surface_cleaner', quantity: 0.2 },
      { product_id: 'disinfectant', quantity: 0.15 },
      { product_id: 'glass_cleaner', quantity: 0.1 },
      { product_id: 'toilet_paper', quantity: 4 },
      { product_id: 'towels', quantity: 6 }
    ]
  },
  {
    id: 'maintenance_cleaning',
    name: 'Nettoyage maintenance',
    task_type: 'maintenance',
    products: [
      { product_id: 'multi_surface_cleaner', quantity: 0.05 },
      { product_id: 'toilet_paper', quantity: 1 },
      { product_id: 'towels', quantity: 2 }
    ]
  }
];

export function HousekeepingConsumptionTracking({ 
  housekeepingTask, 
  open, 
  onOpenChange 
}: HousekeepingConsumptionTrackingProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ConsumptionTemplate | null>(null);
  const [consumedProducts, setConsumedProducts] = useState<ConsumedProduct[]>([]);
  const [actualDuration, setActualDuration] = useState(housekeepingTask.estimated_duration);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cleaning products from POS inventory
  const { data: cleaningProducts = [], isLoading } = useQuery({
    queryKey: ['cleaning-products'],
    queryFn: async (): Promise<CleaningProduct[]> => {
      const { data, error } = await supabase
        .from('pos_products')
        .select(`
          id,
          name,
          code,
          category_id,
          current_stock,
          cost_price,
          unit_sale
        `)
        .gt('current_stock', 0)
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        code: item.code || '',
        category: 'Nettoyage',
        current_stock: item.current_stock || 0,
        unit_cost: item.cost_price || 0,
        unit: item.unit_sale || 'pcs'
      }));
    },
    enabled: open
  });

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplate && cleaningProducts.length > 0) {
      const templateProducts: ConsumedProduct[] = [];
      
      selectedTemplate.products.forEach(templateProduct => {
        // Try to find matching product (mock matching for demo)
        const matchingProduct = cleaningProducts.find(p => 
          p.category.toLowerCase().includes('nettoyage') ||
          p.name.toLowerCase().includes('nettoyant') ||
          p.name.toLowerCase().includes('papier') ||
          p.name.toLowerCase().includes('serviette')
        );
        
        if (matchingProduct) {
          templateProducts.push({
            productId: matchingProduct.id,
            product: matchingProduct,
            quantity: templateProduct.quantity,
            unitCost: matchingProduct.unit_cost,
            totalCost: templateProduct.quantity * matchingProduct.unit_cost
          });
        }
      });
      
      setConsumedProducts(templateProducts);
    }
  }, [selectedTemplate, cleaningProducts]);

  const filteredProducts = cleaningProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordConsumption = useMutation({
    mutationFn: async (data: {
      taskId: string;
      consumedProducts: ConsumedProduct[];
      actualDuration: number;
      totalCost: number;
    }) => {
      // Create stock movements for consumed products
      const stockMovements = data.consumedProducts.map(product => ({
        stock_item_id: product.productId,
        movement_type: 'consumption',
        quantity: product.quantity,
        unit_cost: product.unitCost,
        reason: 'housekeeping_consumption',
        reference: `HOUSE-${data.taskId}`,
        notes: `Consommé pour le nettoyage de la chambre ${housekeepingTask.room_number}`
      }));

      // Insert stock movements
      // Mock stock movement creation for demo
      console.log('Stock movements would be created:', stockMovements);

      if (movementError) throw movementError;

      // Update housekeeping task
      const consumptionData = {
        products_used: data.consumedProducts.map(p => ({
          product_id: p.productId,
          product_name: p.product.name,
          quantity: p.quantity,
          unit_cost: p.unitCost,
          total_cost: p.totalCost
        })),
        consumption_cost: data.totalCost,
        actual_duration: data.actualDuration
      };

      const { data: updatedTask, error: updateError } = await supabase
        .from('housekeeping_tasks')
        .update({
          status: 'completed',
          actual_duration: data.actualDuration,
          completed_at: new Date().toISOString(),
          consumption_data: consumptionData
        })
        .eq('id', data.taskId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['pos-stock-items'] });
      queryClient.invalidateQueries({ queryKey: ['pos-stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['operations-kpis'] });
      
      toast({
        title: "Tâche terminée",
        description: "Les consommations ont été enregistrées et décomptées du stock",
      });

      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer les consommations: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addProductToConsumption = (product: CleaningProduct) => {
    const existingIndex = consumedProducts.findIndex(cp => cp.productId === product.id);
    
    if (existingIndex >= 0) {
      const updated = [...consumedProducts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalCost = updated[existingIndex].quantity * updated[existingIndex].unitCost;
      setConsumedProducts(updated);
    } else {
      const newConsumedProduct: ConsumedProduct = {
        productId: product.id,
        product,
        quantity: 1,
        unitCost: product.unit_cost,
        totalCost: product.unit_cost
      };
      setConsumedProducts([...consumedProducts, newConsumedProduct]);
    }
  };

  const updateProductQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setConsumedProducts(consumedProducts.filter(cp => cp.productId !== productId));
      return;
    }

    const updated = consumedProducts.map(cp => {
      if (cp.productId === productId) {
        return {
          ...cp,
          quantity: Math.min(newQuantity, cp.product.current_stock),
          totalCost: Math.min(newQuantity, cp.product.current_stock) * cp.unitCost
        };
      }
      return cp;
    });
    setConsumedProducts(updated);
  };

  const removeProductFromConsumption = (productId: string) => {
    setConsumedProducts(consumedProducts.filter(cp => cp.productId !== productId));
  };

  const totalCost = consumedProducts.reduce((sum, product) => sum + product.totalCost, 0);
  const costPerHour = actualDuration > 0 ? totalCost / actualDuration : 0;

  const handleSubmit = () => {
    if (consumedProducts.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins un produit consommé",
        variant: "destructive",
      });
      return;
    }

    recordConsumption.mutate({
      taskId: housekeepingTask.id,
      consumedProducts,
      actualDuration,
      totalCost
    });
  };

  const getTaskIcon = (taskType: string) => {
    switch (taskType.toLowerCase()) {
      case 'cleaning':
        return <Bed className="h-4 w-4" />;
      case 'deep_cleaning':
        return <Bath className="h-4 w-4" />;
      default:
        return <Droplets className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Consommation produits - Chambre {housekeepingTask.room_number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Templates & Products */}
          <div className="space-y-4">
            {/* Templates */}
            <div>
              <Label className="text-sm font-medium">Modèles de consommation</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {defaultTemplates
                  .filter(template => template.task_type === housekeepingTask.task_type || template.task_type === 'cleaning')
                  .map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-colors hover:bg-soft-primary ${
                        selectedTemplate?.id === template.id ? 'bg-soft-primary border-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          {getTaskIcon(template.task_type)}
                          <span className="text-sm font-medium">{template.name}</span>
                          <Badge variant="outline" className="ml-auto">
                            {template.products.length} produits
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Available Products */}
            <div>
              <Label className="text-sm font-medium">Produits disponibles</Label>
              <Input
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Chargement des produits...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Aucun produit trouvé</p>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:bg-soft-primary transition-colors">
                    <CardContent className="p-3" onClick={() => addProductToConsumption(product)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.code} • {product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{product.unit_cost.toLocaleString()} XOF</p>
                          <p className="text-xs text-muted-foreground">Stock: {product.current_stock} {product.unit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Consumed Products & Calculation */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Produits consommés</Label>
            
            {/* Duration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Durée d'exécution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="duration">Durée réelle (min)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="5"
                      step="5"
                      value={actualDuration}
                      onChange={(e) => setActualDuration(parseInt(e.target.value) || housekeepingTask.estimated_duration)}
                    />
                  </div>
                  <div>
                    <Label>Estimé</Label>
                    <Input value={`${housekeepingTask.estimated_duration} min`} readOnly className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consumed Products List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {consumedProducts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Droplets className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucun produit sélectionné</p>
                  </CardContent>
                </Card>
              ) : (
                consumedProducts.map((consumedProduct) => (
                  <Card key={consumedProduct.productId}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{consumedProduct.product.name}</h4>
                          <p className="text-xs text-muted-foreground">{consumedProduct.product.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateProductQuantity(consumedProduct.productId, consumedProduct.quantity - 0.1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            max={consumedProduct.product.current_stock}
                            value={consumedProduct.quantity}
                            onChange={(e) => updateProductQuantity(consumedProduct.productId, parseFloat(e.target.value) || 0.1)}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateProductQuantity(consumedProduct.productId, consumedProduct.quantity + 0.1)}
                            disabled={consumedProduct.quantity >= consumedProduct.product.current_stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductFromConsumption(consumedProduct.productId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {consumedProduct.unitCost.toLocaleString()} XOF × {consumedProduct.quantity}
                        </span>
                        <span className="text-sm font-medium">
                          {consumedProduct.totalCost.toLocaleString()} XOF
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Cost Summary */}
            <Card className="bg-soft-primary border-primary/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Coût total:</span>
                  <span className="font-medium">{totalCost.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Coût par heure:</span>
                  <span>{costPerHour.toLocaleString()} XOF/h</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xs">
                  <span>Coût par chambre:</span>
                  <span className="font-medium">{totalCost.toLocaleString()} XOF</span>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={recordConsumption.isPending}
              className="w-full"
            >
              {recordConsumption.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  Enregistrement...
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Terminer la tâche
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
