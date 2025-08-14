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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="glass-card rounded-3xl p-10 max-w-sm shadow-elevate">
          <ShoppingCart className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-3 font-luxury">
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
    <div className="space-y-5">
      {items.map((item, index) => (
        <Card key={item.id} className="overflow-hidden glass-card border-0 shadow-elevate rounded-2xl transition-elegant hover:scale-[1.02]">
          <div className="p-5">
            {/* Product Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-base leading-tight font-luxury">{item.product_name}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm text-muted-foreground font-medium">
                    {item.unit_price.toLocaleString()} F/unité
                  </span>
                  {item.product.preparation_time && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{item.product.preparation_time}min</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => onRemoveItem(item.product_id)}
                className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive shrink-0 rounded-xl transition-elegant hover:scale-110"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Special Instructions */}
            {item.special_instructions && (
              <div className="mb-4 p-3 glass-card rounded-xl">
                <span className="text-sm text-muted-foreground">
                  Note: {item.special_instructions}
                </span>
              </div>
            )}

            {/* Enhanced Quantity Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 glass-card rounded-xl p-1">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                    className="h-10 w-10 p-0 hover:bg-background/80 rounded-lg transition-elegant tap-target"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-12 text-center text-lg font-bold font-luxury">
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                    className="h-10 w-10 p-0 hover:bg-background/80 rounded-lg transition-elegant tap-target"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Badge variant="outline" className="text-sm bg-gradient-to-r from-primary/5 to-accent/5 glass-card">
                  {item.status === 'pending' ? 'En attente' : item.status}
                </Badge>
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-primary font-luxury">
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