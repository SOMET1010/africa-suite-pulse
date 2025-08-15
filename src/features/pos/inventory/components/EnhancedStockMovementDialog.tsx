import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Calendar, User, FileText, DollarSign, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedStockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockItems: any[];
  warehouses: any[];
  onRefresh: () => void;
  selectedItem?: any;
}

const movementCategories = {
  'sale': { label: 'Vente', icon: DollarSign, color: 'bg-green-500' },
  'loss': { label: 'Perte', icon: AlertCircle, color: 'bg-red-500' },
  'adjustment': { label: 'Ajustement', icon: Package, color: 'bg-blue-500' },
  'reception': { label: 'Réception', icon: Package, color: 'bg-purple-500' },
  'transfer': { label: 'Transfert', icon: Package, color: 'bg-orange-500' },
  'consumption': { label: 'Consommation', icon: Package, color: 'bg-gray-500' }
};

const lossReasons = [
  'Produit périmé',
  'Produit endommagé',
  'Vol/Disparition',
  'Erreur de manipulation',
  'Contrôle qualité',
  'Autre'
];

const adjustmentReasons = [
  'Inventaire physique',
  'Correction d\'erreur',
  'Mise à jour système',
  'Réconciliation',
  'Autre'
];

export function EnhancedStockMovementDialog({ 
  open, 
  onOpenChange, 
  stockItems, 
  warehouses, 
  onRefresh,
  selectedItem 
}: EnhancedStockMovementDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    stock_item_id: '',
    warehouse_id: '',
    movement_type: 'in' as 'in' | 'out' | 'adjustment',
    category: '',
    quantity: 0,
    unit_cost: 0,
    reason: '',
    custom_reason: '',
    reference_number: '',
    notes: '',
    batch_number: '',
    expiry_date: '',
    requires_approval: false
  });
  
  const [currentStock, setCurrentStock] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      // Generate reference number
      const now = new Date();
      const reference = `MOV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      setFormData(prev => ({
        ...prev,
        reference_number: reference,
        stock_item_id: selectedItem?.id || '',
        warehouse_id: warehouses[0]?.id || ''
      }));

      if (selectedItem) {
        setCurrentStock(selectedItem.current_stock || 0);
      }
    }
  }, [open, selectedItem, warehouses]);

  useEffect(() => {
    if (formData.stock_item_id) {
      const item = stockItems.find(i => i.id === formData.stock_item_id);
      if (item) {
        setCurrentStock(item.current_stock || 0);
        setFormData(prev => ({
          ...prev,
          unit_cost: item.unit_cost || 0
        }));
      }
    }
  }, [formData.stock_item_id, stockItems]);

  const getReasonOptions = () => {
    if (formData.category === 'loss') return lossReasons;
    if (formData.category === 'adjustment') return adjustmentReasons;
    return [];
  };

  const calculateNewStock = () => {
    if (formData.movement_type === 'in') return currentStock + formData.quantity;
    if (formData.movement_type === 'out') return currentStock - formData.quantity;
    return formData.quantity; // For adjustments, quantity is the new total
  };

  const handleSubmit = async () => {
    if (!formData.stock_item_id || !formData.warehouse_id || formData.quantity <= 0) {
      toast({
        title: "Données incomplètes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const newStock = calculateNewStock();
    if (newStock < 0) {
      toast({
        title: "Stock insuffisant",
        description: "Le mouvement résulterait en un stock négatif.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reason = formData.reason === 'Autre' ? formData.custom_reason : formData.reason;
      
      // Create stock movement
      const { error: movementError } = await supabase
        .from('pos_stock_movements')
        .insert([{
          org_id: (await supabase.auth.getUser()).data.user?.user_metadata?.org_id,
          stock_item_id: formData.stock_item_id,
          warehouse_id: formData.warehouse_id,
          movement_type: formData.movement_type,
          quantity: formData.quantity,
          unit_cost: formData.unit_cost,
          total_cost: formData.quantity * formData.unit_cost,
          reason,
          reference_number: formData.reference_number,
          notes: formData.notes,
          performed_at: new Date().toISOString(),
          performed_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (movementError) throw movementError;

      // Update stock item current stock
      const { error: updateError } = await supabase
        .from('pos_stock_items')
        .update({ 
          current_stock: newStock,
          last_cost: formData.unit_cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.stock_item_id);

      if (updateError) throw updateError;

      toast({
        title: "Mouvement enregistré",
        description: `Mouvement ${formData.reference_number} créé avec succès.`,
      });

      onRefresh();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating movement:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer le mouvement: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = movementCategories[formData.category as keyof typeof movementCategories];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Mouvement de Stock Détaillé
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Stock Info */}
          {formData.stock_item_id && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock actuel</p>
                    <p className="text-2xl font-bold">{currentStock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nouveau stock</p>
                    <p className={`text-2xl font-bold ${calculateNewStock() < 0 ? 'text-destructive' : 'text-green-600'}`}>
                      {calculateNewStock()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_item">Article *</Label>
              <Select value={formData.stock_item_id} onValueChange={(value) => setFormData(prev => ({ ...prev, stock_item_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un article" />
                </SelectTrigger>
                <SelectContent>
                  {stockItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Stock: {item.current_stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Entrepôt *</Label>
              <Select value={formData.warehouse_id} onValueChange={(value) => setFormData(prev => ({ ...prev, warehouse_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un entrepôt" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement_type">Type de mouvement *</Label>
              <Select value={formData.movement_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, movement_type: value, category: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Entrée</SelectItem>
                  <SelectItem value="out">Sortie</SelectItem>
                  <SelectItem value="adjustment">Ajustement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, reason: '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(movementCategories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category-specific fields */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <selectedCategory.icon className="w-5 h-5" />
                  {selectedCategory.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit_cost">Coût unitaire</Label>
                    <Input
                      id="unit_cost"
                      type="number"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  {getReasonOptions().length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="reason">Raison</Label>
                      <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une raison" />
                        </SelectTrigger>
                        <SelectContent>
                          {getReasonOptions().map(reason => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.reason === 'Autre' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_reason">Raison personnalisée</Label>
                      <Input
                        id="custom_reason"
                        value={formData.custom_reason}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_reason: e.target.value }))}
                        placeholder="Préciser la raison..."
                      />
                    </div>
                  )}
                </div>

                {formData.quantity > 0 && formData.unit_cost > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-lg font-semibold">
                      Coût total: {(formData.quantity * formData.unit_cost).toLocaleString()} FCFA
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Numéro de lot (optionnel)</Label>
              <Input
                id="batch"
                value={formData.batch_number}
                onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
                placeholder="LOT-2024-001"
              />
            </div>

            {formData.movement_type === 'in' && (
              <div className="space-y-2">
                <Label htmlFor="expiry">Date d'expiration (optionnel)</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Commentaires sur ce mouvement..."
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
            disabled={isSubmitting || !formData.stock_item_id || !formData.warehouse_id || formData.quantity <= 0}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Mouvement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}