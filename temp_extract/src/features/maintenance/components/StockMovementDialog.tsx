import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Package, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { useCreateSparePartMovement } from "../hooks/useSpareParts";
import { toast } from "sonner";

interface StockMovementDialogProps {
  sparePart: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockMovementDialog({ sparePart, open, onOpenChange }: StockMovementDialogProps) {
  const [movementType, setMovementType] = useState<"in" | "out" | "adjustment">("in");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [unitCost, setUnitCost] = useState("");
  
  const createMovementMutation = useCreateSparePartMovement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sparePart || !quantity || !reason) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await createMovementMutation.mutateAsync({
        spare_part_id: sparePart.id,
        movement_type: movementType,
        quantity: movementType === "adjustment" ? parseInt(quantity) : parseInt(quantity),
        reason,
        notes: notes || undefined,
        unit_cost: unitCost ? parseFloat(unitCost) : undefined
      });

      toast.success("Mouvement de stock enregistré avec succès");
      
      // Reset form
      setQuantity("");
      setReason("");
      setNotes("");
      setUnitCost("");
      
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du mouvement");
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "out":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "adjustment":
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getReasonOptions = (type: string) => {
    switch (type) {
      case "in":
        return [
          { value: "purchase", label: "Achat" },
          { value: "return", label: "Retour" },
          { value: "transfer", label: "Transfert entrant" },
          { value: "other", label: "Autre" }
        ];
      case "out":
        return [
          { value: "maintenance", label: "Maintenance" },
          { value: "repair", label: "Réparation" },
          { value: "replacement", label: "Remplacement" },
          { value: "damage", label: "Pièce endommagée" },
          { value: "transfer", label: "Transfert sortant" },
          { value: "other", label: "Autre" }
        ];
      case "adjustment":
        return [
          { value: "inventory", label: "Inventaire" },
          { value: "correction", label: "Correction d'erreur" },
          { value: "loss", label: "Perte" },
          { value: "damage", label: "Dégâts" },
          { value: "other", label: "Autre" }
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Mouvement de stock
          </DialogTitle>
        </DialogHeader>

        {sparePart && (
          <div className="mb-4 p-3 bg-muted/50 rounded">
            <p className="font-medium">{sparePart.name}</p>
            <p className="text-sm text-muted-foreground">
              Stock actuel: {sparePart.current_stock} {sparePart.unit}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="movementType">Type de mouvement</Label>
            <Select value={movementType} onValueChange={(value: any) => setMovementType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Entrée
                  </div>
                </SelectItem>
                <SelectItem value="out">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Sortie
                  </div>
                </SelectItem>
                <SelectItem value="adjustment">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    Ajustement
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">
              {movementType === "adjustment" ? "Nouveau stock" : "Quantité"}
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={movementType === "adjustment" ? "Quantité finale" : "Quantité"}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Raison</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                {getReasonOptions(movementType).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {movementType === "in" && (
            <div>
              <Label htmlFor="unitCost">Coût unitaire (optionnel)</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createMovementMutation.isPending} className="flex-1">
              {createMovementMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              ) : (
                getMovementIcon(movementType)
              )}
              <span className="ml-2">Enregistrer</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}