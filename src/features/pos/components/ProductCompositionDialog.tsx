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
  gross_quantity: number;
  net_quantity?: number;
  waste_coefficient: number;
  preparation_time: number;
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
    gross_quantity: 1,
    net_quantity: undefined,
    waste_coefficient: 1.0,
    preparation_time: 0,
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
          gross_quantity: newComposition.gross_quantity,
          waste_coefficient: newComposition.waste_coefficient,
          preparation_time: newComposition.preparation_time,
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
        gross_quantity: 1,
        net_quantity: undefined,
        waste_coefficient: 1.0,
        preparation_time: 0,
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

  const calculateAdvancedCosts = () => {
    const grossCost = compositions.reduce((total, comp) => {
      const componentProduct = comp.component_product;
      if (componentProduct?.price_ht) {
        return total + ((comp.gross_quantity || comp.quantity) * componentProduct.price_ht);
      }
      return total;
    }, 0);

    const netCost = compositions.reduce((total, comp) => {
      const componentProduct = comp.component_product;
      if (componentProduct?.price_ht) {
        const netQty = comp.net_quantity || comp.quantity;
        return total + (netQty * componentProduct.price_ht);
      }
      return total;
    }, 0);

    const totalPrepTime = compositions.reduce((total, comp) => {
      return total + (comp.preparation_time || 0);
    }, 0);

    return { grossCost, netCost, totalPrepTime };
  };

  const transformToTechnicalSheet = async () => {
    if (!product?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pos_products')
        .update({ 
          is_composed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Article transformé",
        description: "L'article a été transformé en fiche technique",
      });
    } catch (error) {
      console.error('Error transforming product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de transformer l'article",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = availableProducts.find(p => p.id === newComposition.component_product_id);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {product.is_composed ? 'Fiche Technique' : 'Composition'} - {product.name}
            {product.is_composed && (
              <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                Activée
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add new composition */}
          <Card>
            <CardHeader>
              <CardTitle>Ajouter un composant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-2 md:col-span-2">
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
                  <Label>Qté Brute</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={newComposition.gross_quantity}
                    onChange={(e) => {
                      const grossQty = parseFloat(e.target.value) || 0;
                      setNewComposition(prev => ({ 
                        ...prev, 
                        gross_quantity: grossQty,
                        quantity: grossQty,
                        net_quantity: grossQty / prev.waste_coefficient
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Coefficient</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    value={newComposition.waste_coefficient}
                    onChange={(e) => {
                      const coefficient = parseFloat(e.target.value) || 1;
                      setNewComposition(prev => ({ 
                        ...prev, 
                        waste_coefficient: coefficient,
                        net_quantity: prev.gross_quantity / coefficient
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Temps (min)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newComposition.preparation_time}
                    onChange={(e) => setNewComposition(prev => ({ 
                      ...prev, 
                      preparation_time: parseInt(e.target.value) || 0 
                    }))}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Unité</Label>
                  <Input
                    value={newComposition.unit}
                    onChange={(e) => setNewComposition(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder={selectedProduct?.unit_usage || 'unité'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={newComposition.notes || ''}
                    onChange={(e) => setNewComposition(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes sur l'ingrédient..."
                  />
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
                             <div className="text-sm text-muted-foreground space-y-1">
                               <p>
                                 Brut: {comp.gross_quantity || comp.quantity} {comp.unit}
                                 {comp.net_quantity && ` • Net: ${comp.net_quantity.toFixed(3)} ${comp.unit}`}
                               </p>
                               <p className="flex items-center gap-2">
                                 <span>Coeff: {comp.waste_coefficient || 1.0}</span>
                                 {comp.preparation_time > 0 && (
                                   <span>• Temps: {comp.preparation_time}min</span>
                                 )}
                               </p>
                               {comp.component_product?.code && (
                                 <p>Code: {comp.component_product.code}</p>
                               )}
                             </div>
                             {comp.notes && (
                               <p className="text-xs text-muted-foreground mt-1 italic">{comp.notes}</p>
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

                  {/* Advanced cost analysis */}
                   <div className="border-t pt-4 space-y-3">
                     {(() => {
                       const { grossCost, netCost, totalPrepTime } = calculateAdvancedCosts();
                       return (
                         <>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                             <div className="text-center p-3 bg-muted/50 rounded">
                               <p className="text-muted-foreground">Coût Brut (avec déchets)</p>
                               <p className="font-bold text-lg">{grossCost.toFixed(2)} F</p>
                             </div>
                             <div className="text-center p-3 bg-success/10 rounded">
                               <p className="text-muted-foreground">Coût Net (sans déchets)</p>
                               <p className="font-bold text-lg text-green-600">{netCost.toFixed(2)} F</p>
                             </div>
                             <div className="text-center p-3 bg-primary/10 rounded">
                               <p className="text-muted-foreground">Temps total</p>
                               <p className="font-bold text-lg text-primary">{totalPrepTime} min</p>
                             </div>
                           </div>
                           
                           <div className="flex justify-between items-center">
                             <span className="font-semibold">Prix de revient recommandé:</span>
                             <div className="text-right">
                               <p className="text-lg font-bold text-primary">
                                 {grossCost.toFixed(2)} F
                               </p>
                               {product.price_ht && (
                                 <div className="text-xs text-muted-foreground space-y-1">
                                   <p>Marge brute: {((product.price_ht - grossCost) / product.price_ht * 100).toFixed(1)}%</p>
                                   <p>Économie déchets: {(grossCost - netCost).toFixed(2)} F</p>
                                 </div>
                               )}
                             </div>
                           </div>
                         </>
                       );
                     })()}
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div>
              {!product.is_composed && compositions.length > 0 && (
                <Button 
                  onClick={transformToTechnicalSheet}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-primary to-primary-variant"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Transformer en Fiche Technique
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}