import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Clock,
  MapPin
} from "lucide-react";
// Local cart item type for room service
interface LocalCartItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CartTotals {
  subtotal: number;
  deliveryFee: number;
  serviceCharge: number;
  tax: number;
  total: number;
}

// Mock reservation type for room service
interface ReservationForBilling {
  id: string;
  room_number: string;
  guest_name: string;
  adults: number;
  children: number;
}

interface RoomServiceCartProps {
  items: LocalCartItem[];
  totals: CartTotals;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveFromCart: (itemId: string) => void;
  reservation: ReservationForBilling;
}

export function RoomServiceCart({ 
  items, 
  totals, 
  onUpdateQuantity, 
  onRemoveFromCart,
  reservation
}: RoomServiceCartProps) {
  
  if (items.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Panier vide</h3>
            <p className="text-sm text-muted-foreground">
              Sélectionnez des articles du menu pour commencer
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Commande
        </CardTitle>
        
        {/* Room Info */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4" />
            Chambre {reservation.room_number}
          </div>
          <p className="text-xs text-muted-foreground">
            {reservation.guest_name} • {reservation.adults + reservation.children} pers.
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Cart Items */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-lg border p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm leading-tight">
                    {item.product_name}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromCart(item.id)}
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Notes placeholder */}
                {false && (
                  <p className="text-xs text-muted-foreground mb-2 italic">
                    "Notes placeholder"
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="h-7 w-7 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {item.total_price.toLocaleString()} F
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.unit_price.toLocaleString()} F/unité
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="mt-4 pt-4 border-t">
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{totals.subtotal.toLocaleString()} F</span>
            </div>
            
            {totals.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Frais livraison
                </span>
                <span>{totals.deliveryFee.toLocaleString()} F</span>
              </div>
            )}
            
            {totals.serviceCharge > 0 && (
              <div className="flex justify-between text-sm">
                <span>Service</span>
                <span>{totals.serviceCharge.toLocaleString()} F</span>
              </div>
            )}
            
            {totals.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>TVA</span>
                <span>{totals.tax.toLocaleString()} F</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg">{totals.total.toLocaleString()} F</span>
            </div>
          </div>
          
          {/* Summary Badge */}
          <div className="mt-3">
            <Badge variant="secondary" className="w-full justify-center py-2">
              {items.length} article{items.length !== 1 ? 's' : ''} • {totals.total.toLocaleString()} F
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}