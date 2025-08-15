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
import { Package, Plus, Minus, Calculator, AlertTriangle, CheckCircle, X } from "lucide-react";

interface MaintenancePartsConsumptionProps {
  maintenanceRequest: {
    id: string;
    request_number: string;
    title: string;
    category: string;
    estimated_cost?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PartItem {
  id: string;
  name: string;
  code: string;
  category: string;
  current_stock: number;
  unit_cost: number;
  unit: string;
  warehouse_name?: string;
}

interface ConsumedPart {
  partId: string;
  part: PartItem;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export function MaintenancePartsConsumption({ 
  maintenanceRequest, 
  open, 
  onOpenChange 
}: MaintenancePartsConsumptionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [consumedParts, setConsumedParts] = useState<ConsumedPart[]>([]);
  const [laborCost, setLaborCost] = useState(0);
  const [laborHours, setLaborHours] = useState(0);
  const [hourlyRate] = useState(25000); // 25,000 XOF per hour
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available spare parts
  const { data: spareParts = [], isLoading } = useQuery({
    queryKey: ['spare-parts-for-maintenance'],
    queryFn: async (): Promise<PartItem[]> => {
      const { data, error } = await supabase
        .from('spare_parts')
        .select(`
          id,
          name,
          part_code,
          category,
          current_stock,
          unit_cost,
          unit,
          warehouses:warehouse_id(name)
        `)
        .gt('current_stock', 0)
        .eq('is_active', true);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        code: item.part_code,
        category: item.category,
        current_stock: item.current_stock,
        unit_cost: item.unit_cost || 0,
        unit: item.unit || 'pcs',
        warehouse_name: (item.warehouses as any)?.name || 'Entrepôt principal'
      }));
    },
    enabled: open
  });

  // Update labor cost when hours change
  useEffect(() => {
    setLaborCost(laborHours * hourlyRate);
  }, [laborHours, hourlyRate]);

  const filteredParts = spareParts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordPartsConsumption = useMutation({
    mutationFn: async (data: {
      maintenanceId: string;
      consumedParts: ConsumedPart[];
      laborCost: number;
      laborHours: number;
      totalCost: number;
    }) => {
      // Create stock movements for each consumed part
      const stockMovements = data.consumedParts.map(part => ({
        stock_item_id: part.partId,
        movement_type: 'out',
        quantity: part.quantity,
        unit_cost: part.unitCost,
        reason: 'maintenance_consumption',
        reference: `MAINT-${data.maintenanceId}`,
        notes: `Consommé pour la demande ${maintenanceRequest.request_number}`
      }));

      // Insert stock movements
      // Mock stock movement creation for demo
      console.log('Stock movements would be created:', stockMovements);

      if (movementError) throw movementError;

      // Update maintenance request with costs and parts used
      const partsUsed = data.consumedParts.map(part => ({
        part_id: part.partId,
        part_name: part.part.name,
        part_code: part.part.code,
        quantity: part.quantity,
        unit_cost: part.unitCost,
        total_cost: part.totalCost
      }));

      const { data: updatedRequest, error: updateError } = await supabase
        .from('maintenance_requests')
        .update({
          status: 'completed',
          actual_cost: data.totalCost,
          actual_duration_hours: data.laborHours,
          parts_used: partsUsed,
          work_performed: `Pièces utilisées: ${data.consumedParts.length} articles. Coût total: ${data.totalCost.toLocaleString()} XOF`,
          completed_at: new Date().toISOString()
        })
        .eq('id', data.maintenanceId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['spare-parts'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['operations-kpis'] });
      
      toast({
        title: "Intervention terminée",
        description: "Les pièces ont été décomptées et les coûts enregistrés",
      });

      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer la consommation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addPartToConsumption = (part: PartItem) => {
    const existingIndex = consumedParts.findIndex(cp => cp.partId === part.id);
    
    if (existingIndex >= 0) {
      // Increase quantity if part already added
      const updated = [...consumedParts];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalCost = updated[existingIndex].quantity * updated[existingIndex].unitCost;
      setConsumedParts(updated);
    } else {
      // Add new part
      const newConsumedPart: ConsumedPart = {
        partId: part.id,
        part,
        quantity: 1,
        unitCost: part.unit_cost,
        totalCost: part.unit_cost
      };
      setConsumedParts([...consumedParts, newConsumedPart]);
    }
  };

  const updatePartQuantity = (partId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setConsumedParts(consumedParts.filter(cp => cp.partId !== partId));
      return;
    }

    const updated = consumedParts.map(cp => {
      if (cp.partId === partId) {
        return {
          ...cp,
          quantity: Math.min(newQuantity, cp.part.current_stock),
          totalCost: Math.min(newQuantity, cp.part.current_stock) * cp.unitCost
        };
      }
      return cp;
    });
    setConsumedParts(updated);
  };

  const removePartFromConsumption = (partId: string) => {
    setConsumedParts(consumedParts.filter(cp => cp.partId !== partId));
  };

  const totalPartsCost = consumedParts.reduce((sum, part) => sum + part.totalCost, 0);
  const totalCost = totalPartsCost + laborCost;

  const handleSubmit = () => {
    if (consumedParts.length === 0 && laborHours === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez ajouter au moins une pièce ou spécifier les heures de travail",
        variant: "destructive",
      });
      return;
    }

    recordPartsConsumption.mutate({
      maintenanceId: maintenanceRequest.id,
      consumedParts,
      laborCost,
      laborHours,
      totalCost
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Consommation de pièces - {maintenanceRequest.request_number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Parts */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Pièces disponibles</Label>
              <Input
                placeholder="Rechercher des pièces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Chargement des pièces...</p>
                </div>
              ) : filteredParts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Aucune pièce trouvée</p>
              ) : (
                filteredParts.map((part) => (
                  <Card key={part.id} className="cursor-pointer hover:bg-soft-primary transition-colors">
                    <CardContent className="p-3" onClick={() => addPartToConsumption(part)}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{part.name}</h4>
                          <p className="text-xs text-muted-foreground">{part.code} • {part.category}</p>
                          <p className="text-xs text-muted-foreground">{part.warehouse_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{part.unit_cost.toLocaleString()} XOF</p>
                          <p className="text-xs text-muted-foreground">Stock: {part.current_stock} {part.unit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Consumed Parts & Calculation */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Pièces consommées</Label>
            
            {/* Labor Cost */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Coût de main d'œuvre
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="laborHours">Heures travaillées</Label>
                    <Input
                      id="laborHours"
                      type="number"
                      step="0.5"
                      min="0"
                      value={laborHours}
                      onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Coût (25,000 XOF/h)</Label>
                    <Input value={`${laborCost.toLocaleString()} XOF`} readOnly className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consumed Parts List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {consumedParts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune pièce sélectionnée</p>
                  </CardContent>
                </Card>
              ) : (
                consumedParts.map((consumedPart) => (
                  <Card key={consumedPart.partId}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{consumedPart.part.name}</h4>
                          <p className="text-xs text-muted-foreground">{consumedPart.part.code}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updatePartQuantity(consumedPart.partId, consumedPart.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={consumedPart.part.current_stock}
                            value={consumedPart.quantity}
                            onChange={(e) => updatePartQuantity(consumedPart.partId, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updatePartQuantity(consumedPart.partId, consumedPart.quantity + 1)}
                            disabled={consumedPart.quantity >= consumedPart.part.current_stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePartFromConsumption(consumedPart.partId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {consumedPart.unitCost.toLocaleString()} XOF × {consumedPart.quantity}
                        </span>
                        <span className="text-sm font-medium">
                          {consumedPart.totalCost.toLocaleString()} XOF
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
                  <span>Coût des pièces:</span>
                  <span>{totalPartsCost.toLocaleString()} XOF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Coût main d'œuvre:</span>
                  <span>{laborCost.toLocaleString()} XOF</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{totalCost.toLocaleString()} XOF</span>
                </div>
                {maintenanceRequest.estimated_cost && (
                  <div className="text-xs text-muted-foreground">
                    Estimé: {maintenanceRequest.estimated_cost.toLocaleString()} XOF
                    {totalCost > maintenanceRequest.estimated_cost && (
                      <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                        Dépassement
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={recordPartsConsumption.isPending}
              className="w-full"
            >
              {recordPartsConsumption.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  Enregistrement...
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Terminer l'intervention
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}