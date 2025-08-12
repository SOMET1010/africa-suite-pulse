import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { 
  Minus, 
  Plus, 
  ChefHat, 
  MessageSquare, 
  Clock,
  Flame,
  Snowflake
} from "lucide-react";
import type { POSProduct } from "../types";

interface ModifierOption {
  id: string;
  name: string;
  price?: number;
  selected?: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiple: boolean;
  options: ModifierOption[];
}

interface ProductModifierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: POSProduct | null;
  onAddToCart: (product: POSProduct, quantity: number, modifiers: any, notes: string) => void;
}

export function ProductModifierDialog({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart 
}: ProductModifierDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, ModifierOption[]>>({});
  const [specialNotes, setSpecialNotes] = useState("");

  if (!product) return null;

  // Mock modifier groups - in real app, these would come from the product data
  const modifierGroups: ModifierGroup[] = [
    {
      id: "cooking",
      name: "Cuisson",
      required: false,
      multiple: false,
      options: [
        { id: "rare", name: "Saignant", price: 0 },
        { id: "medium", name: "À point", price: 0 },
        { id: "well", name: "Bien cuit", price: 0 }
      ]
    },
    {
      id: "sauce",
      name: "Sauce",
      required: false,
      multiple: true,
      options: [
        { id: "ketchup", name: "Ketchup", price: 0 },
        { id: "mayo", name: "Mayonnaise", price: 0 },
        { id: "mustard", name: "Moutarde", price: 500 },
        { id: "bbq", name: "Sauce BBQ", price: 750 }
      ]
    },
    {
      id: "extras",
      name: "Suppléments",
      required: false,
      multiple: true,
      options: [
        { id: "cheese", name: "Fromage", price: 1000 },
        { id: "bacon", name: "Bacon", price: 1500 },
        { id: "avocado", name: "Avocat", price: 1200 },
        { id: "egg", name: "Œuf", price: 800 }
      ]
    }
  ];

  const handleModifierChange = (groupId: string, option: ModifierOption) => {
    const group = modifierGroups.find(g => g.id === groupId);
    if (!group) return;

    setSelectedModifiers(prev => {
      const currentSelection = prev[groupId] || [];
      
      if (group.multiple) {
        // Multiple selection allowed
        const isSelected = currentSelection.find(o => o.id === option.id);
        if (isSelected) {
          return {
            ...prev,
            [groupId]: currentSelection.filter(o => o.id !== option.id)
          };
        } else {
          return {
            ...prev,
            [groupId]: [...currentSelection, option]
          };
        }
      } else {
        // Single selection only
        return {
          ...prev,
          [groupId]: [option]
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let basePrice = product.base_price * quantity;
    let modifierPrice = 0;

    Object.values(selectedModifiers).forEach(options => {
      options.forEach(option => {
        modifierPrice += (option.price || 0) * quantity;
      });
    });

    return basePrice + modifierPrice;
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedModifiers, specialNotes);
    
    // Reset form
    setQuantity(1);
    setSelectedModifiers({});
    setSpecialNotes("");
    onClose();
  };

  const getTemperatureIcon = (optionId: string) => {
    if (optionId === "rare") return <Flame className="h-3 w-3 text-red-500" />;
    if (optionId === "medium") return <ChefHat className="h-3 w-3 text-orange-500" />;
    if (optionId === "well") return <Snowflake className="h-3 w-3 text-blue-500" />;
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">Personnaliser votre commande</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{product.name}</h4>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{product.base_price.toLocaleString()} FCFA</Badge>
                  {product.preparation_time && (
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {product.preparation_time} min
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <Label>Quantité</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Modifier Groups */}
          {modifierGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  {group.name}
                  {group.required && <Badge variant="destructive" className="text-xs">Requis</Badge>}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {group.multiple ? "Sélection multiple" : "Sélection unique"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {group.options.map((option) => {
                  const isSelected = selectedModifiers[group.id]?.find(o => o.id === option.id);
                  
                  return (
                    <Button
                      key={option.id}
                      variant={isSelected ? "default" : "outline"}
                      className="h-auto p-3 justify-between"
                      onClick={() => handleModifierChange(group.id, option)}
                    >
                      <div className="flex items-center gap-2">
                        {group.id === "cooking" && getTemperatureIcon(option.id)}
                        <span className="text-sm">{option.name}</span>
                      </div>
                      {option.price && option.price > 0 && (
                        <span className="text-xs font-medium">
                          +{option.price.toLocaleString()} F
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          <Separator />

          {/* Special Notes */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Instructions spéciales
            </Label>
            <Textarea
              placeholder="Allergies, préférences, instructions de cuisson..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Total and Actions */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">{calculateTotalPrice().toLocaleString()} FCFA</span>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleAddToCart} className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}