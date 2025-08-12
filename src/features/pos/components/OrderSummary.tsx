import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import type { CartItem } from "../types";

interface OrderSummaryProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function OrderSummary({ items, onUpdateQuantity, onRemoveItem }: OrderSummaryProps) {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Panier vide</p>
          <p className="text-sm text-muted-foreground">
            Sélectionnez des produits pour commencer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-muted/50 rounded-lg p-3 space-y-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.product_name}</h4>
              <p className="text-xs text-muted-foreground">
                {item.unit_price.toFixed(0)} FCFA × {item.quantity}
              </p>
              {item.special_instructions && (
                <p className="text-xs text-orange-600 mt-1">
                  Note: {item.special_instructions}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">
                {item.total_price.toFixed(0)} FCFA
              </p>
              <Badge
                variant={
                  item.status === 'pending' 
                    ? 'secondary' 
                    : item.status === 'preparing'
                    ? 'default'
                    : 'outline'
                }
                className="text-xs"
              >
                {item.status === 'pending' && 'En attente'}
                {item.status === 'preparing' && 'En préparation'}
                {item.status === 'ready' && 'Prêt'}
                {item.status === 'served' && 'Servi'}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemoveItem(item.product_id)}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}