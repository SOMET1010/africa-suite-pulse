import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Package, AlertTriangle, Calculator, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RestockManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lowStockItems: any[];
  warehouses: any[];
  onRefresh: () => void;
}

interface RestockItem {
  stock_item_id: string;
  name: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost: number;
  supplier_name?: string;
  suggested_quantity: number;
  order_quantity: number;
  estimated_cost: number;
  selected: boolean;
}

export function RestockManagementDialog({ 
  open, 
  onOpenChange, 
  lowStockItems, 
  warehouses, 
  onRefresh 
}: RestockManagementDialogProps) {
  const { toast } = useToast();
  const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
  const [supplier, setSupplier] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && lowStockItems.length > 0) {
      const items = lowStockItems.map(item => {
        const suggestedQuantity = Math.max(
          item.max_stock_level - item.current_stock,
          item.min_stock_level * 2
        );
        
        return {
          stock_item_id: item.id,
          name: item.name,
          current_stock: item.current_stock,
          min_stock_level: item.min_stock_level,
          max_stock_level: item.max_stock_level,
          unit_cost: item.unit_cost || 0,
          supplier_name: item.supplier_name,
          suggested_quantity: suggestedQuantity,
          order_quantity: suggestedQuantity,
          estimated_cost: suggestedQuantity * (item.unit_cost || 0),
          selected: true
        };
      });
      setRestockItems(items);
      
      // Generate order reference
      const now = new Date();
      setOrderReference(`CMD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`);
    }
  }, [open, lowStockItems]);

  const updateItemQuantity = (index: number, quantity: number) => {
    setRestockItems(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            order_quantity: quantity,
            estimated_cost: quantity * item.unit_cost
          }
        : item
    ));
  };

  const toggleItemSelection = (index: number) => {
    setRestockItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const totalCost = restockItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.estimated_cost, 0);

  const selectedCount = restockItems.filter(item => item.selected).length;

  const handleSubmit = async () => {
    if (selectedCount === 0) {
      toast({
        title: "Aucun article sélectionné",
        description: "Veuillez sélectionner au moins un article à commander.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create stock movements for the expected restock
      for (const item of restockItems.filter(i => i.selected)) {
        // Create stock movement for the expected restock
        await supabase
          .from('pos_stock_movements')
          .insert([{
            org_id: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id,
            stock_item_id: item.stock_item_id,
            warehouse_id: warehouses[0]?.id,
            movement_type: 'in',
            quantity: item.order_quantity,
            unit_cost: item.unit_cost,
            total_cost: item.estimated_cost,
            reference_number: orderReference,
            reason: 'Réapprovisionnement automatique',
            notes: `Commande générée automatiquement - ${supplier || 'Fournisseur par défaut'}`,
            performed_at: new Date().toISOString(),
            performed_by: (await supabase.auth.getUser()).data.user?.id
          }]);
      }

      toast({
        title: "Commande créée",
        description: `Commande ${orderReference} créée avec succès pour ${selectedCount} article(s).`,
      });

      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating restock order:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer la commande: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Gestion du Réapprovisionnement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Articles en rupture</p>
                    <p className="text-xl font-bold">{lowStockItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Articles sélectionnés</p>
                    <p className="text-xl font-bold">{selectedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coût total estimé</p>
                    <p className="text-xl font-bold">{totalCost.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input
                id="supplier"
                placeholder="Nom du fournisseur"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Référence commande</Label>
              <Input
                id="reference"
                value={orderReference}
                onChange={(e) => setOrderReference(e.target.value)}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>Stock Actuel</TableHead>
                  <TableHead>Min/Max</TableHead>
                  <TableHead>Qté Suggérée</TableHead>
                  <TableHead>Qté à Commander</TableHead>
                  <TableHead>Prix Unitaire</TableHead>
                  <TableHead>Coût Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {restockItems.map((item, index) => (
                  <TableRow key={item.stock_item_id} className={!item.selected ? 'opacity-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleItemSelection(index)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.supplier_name && (
                          <p className="text-xs text-muted-foreground">{item.supplier_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="text-xs">
                        {item.current_stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Min: {item.min_stock_level}</span>
                        <br />
                        <span className="text-muted-foreground">Max: {item.max_stock_level}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.suggested_quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.order_quantity}
                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                        className="w-20"
                        disabled={!item.selected}
                      />
                    </TableCell>
                    <TableCell>{item.unit_cost.toLocaleString()} FCFA</TableCell>
                    <TableCell className="font-medium">
                      {item.estimated_cost.toLocaleString()} FCFA
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Notes sur la commande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || selectedCount === 0}
            className="gap-2"
          >
            <Truck className="w-4 h-4" />
            {isSubmitting ? 'Création...' : `Créer Commande (${totalCost.toLocaleString()} FCFA)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}