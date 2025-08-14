import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Calculator } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Composition {
  id?: string;
  component_product_id: string;
  quantity: number;
  unit: string;
  notes?: string;
  component_product?: {
    id: string;
    name: string;
    code?: string;
    unit_sale: string;
    price_ht?: number;
    tax_rate?: number;
  };
}

interface ProductCompositionDialogProps {
  open: boolean;
  onClose: () => void;
  product: any;
  availableProducts: any[];
}

export default function ProductCompositionDialog({
  open,
  onClose,
  product,
  availableProducts
}: ProductCompositionDialogProps) {
  const { toast } = useToast();
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [newComposition, setNewComposition] = useState<Composition>({
    component_product_id: '',
    quantity: 1,
    unit: 'unité',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product?.id) {
      loadCompositions();
    }
  }, [product?.id]);

  const loadCompositions = async () => {
    if (!product?.id) return;

    try {
      const { data, error } = await supabase
        .from('pos_product_compositions')
        .select(`
          *,
          component_product:pos_products!pos_product_compositions_component_product_id_fkey(
            id, name, code, unit_sale, price_ht, tax_rate
          )
        `)
        .eq('parent_product_id', product.id);

      if (error) throw error;

      setCompositions(data || []);
    } catch (error) {
      console.error('Error loading compositions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la composition",
        variant: "destructive",
      });
    }
  };

  const addComposition = async () => {
    if (!newComposition.component_product_id || newComposition.quantity <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit et une quantité valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pos_product_compositions')
        .insert({
          parent_product_id: product.id,
          component_product_id: newComposition.component_product_id,
          quantity: newComposition.quantity,
          unit: newComposition.unit,
          notes: newComposition.notes,
          org_id: product.org_id
        });

      if (error) throw error;

      toast({
        title: "Composant ajouté",
        description: "Le composant a été ajouté à la recette",
      });

      setNewComposition({
        component_product_id: '',
        quantity: 1,
        unit: 'unité',
        notes: ''
      });

      loadCompositions();
    } catch (error) {
      console.error('Error adding composition:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le composant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeComposition = async (compositionId: string) => {
    try {
      const { error } = await supabase
        .from('pos_product_compositions')
        .delete()
        .eq('id', compositionId);

      if (error) throw error;

      toast({
        title: "Composant supprimé",
        description: "Le composant a été retiré de la recette",
      });

      loadCompositions();
    } catch (error) {
      console.error('Error removing composition:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le composant",
        variant: "destructive",
      });
    }
  };

  const calculateTotalCost = () => {
    return compositions.reduce((total, comp) => {
      const componentProduct = comp.component_product;
      if (componentProduct?.price_ht) {
        return total + (comp.quantity * componentProduct.price_ht);
      }
      return total;
    }, 0);
  };

  const selectedProduct = availableProducts.find(p => p.id === newComposition.component_product_id);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Fiche Technique - {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new composition */}
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un composant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select
                    value={newComposition.component_product_id}
                    onValueChange={(value) => setNewComposition(prev => ({ ...prev, component_product_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} {product.code && `(${product.code})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={newComposition.quantity}
                    onChange={(e) => setNewComposition(prev => ({ 
                      ...prev, 
                      quantity: parseFloat(e.target.value) || 1 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Unité</Label>
                  <Input
                    value={newComposition.unit}
                    onChange={(e) => setNewComposition(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder={selectedProduct?.unit_usage || 'unité'}
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={addComposition}
                    disabled={isLoading || !newComposition.component_product_id}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {newComposition.component_product_id && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span>Coût estimé du composant:</span>
                    <span className="font-semibold">
                      {selectedProduct?.price_ht 
                        ? (newComposition.quantity * selectedProduct.price_ht).toFixed(2) + ' F'
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current composition */}
          <Card>
            <CardHeader>
              <CardTitle>Composition actuelle</CardTitle>
            </CardHeader>
            <CardContent>
              {compositions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun composant défini pour cet article
                </div>
              ) : (
                <div className="space-y-3">
                  {compositions.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-medium">{comp.component_product?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {comp.quantity} {comp.unit}
                              {comp.component_product?.code && ` • Code: ${comp.component_product.code}`}
                            </p>
                            {comp.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{comp.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {comp.component_product?.price_ht && (
                          <div className="text-right">
                            <p className="font-medium">
                              {(comp.quantity * comp.component_product.price_ht).toFixed(2)} F
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {comp.component_product.price_ht.toFixed(2)} F / {comp.component_product.unit_sale}
                            </p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeComposition(comp.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Total cost */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Coût total des composants:</span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {calculateTotalCost().toFixed(2)} F
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.price_ht && (
                            `Marge: ${((product.price_ht - calculateTotalCost()) / product.price_ht * 100).toFixed(1)}%`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}