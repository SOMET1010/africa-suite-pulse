import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingCart, Clock } from "lucide-react";
import type { CartItem } from "../types";

interface OrderSummaryProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function OrderSummary({ items, onUpdateQuantity, onRemoveItem }: OrderSummaryProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/30 rounded-2xl p-8 max-w-sm">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Panier vide
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sélectionnez des produits dans le catalogue pour commencer votre commande
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <Card key={item.id} className="overflow-hidden bg-card/60 backdrop-blur-sm border-0 shadow-sm">
          <div className="p-4">
            {/* Product Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sm leading-tight">{item.product_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {item.unit_price.toLocaleString()} FCFA/unité
                  </span>
                  {item.product.preparation_time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{item.product.preparation_time}min</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.product_id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Special Instructions */}
            {item.special_instructions && (
              <div className="mb-3 p-2 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground">
                  Note: {item.special_instructions}
                </span>
              </div>
            )}

            {/* Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                    className="h-8 w-8 p-0 hover:bg-background"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                    className="h-8 w-8 p-0 hover:bg-background"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Badge variant="outline" className="text-xs bg-background">
                  {item.status === 'pending' ? 'En attente' : item.status}
                </Badge>
              </div>

              <div className="text-right">
                <span className="text-base font-bold text-primary">
                  {item.total_price.toLocaleString()} F
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}