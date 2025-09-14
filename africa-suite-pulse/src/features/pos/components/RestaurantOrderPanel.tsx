import { ModernTicketPanel } from "./ModernTicketPanel";
import { useToast } from "@/hooks/use-toast";
import type { POSTable, CartItem } from "../types";

interface RestaurantOrderPanelProps {
  items: CartItem[];
  selectedTable: POSTable | null;
  customerCount: number;
  totals: {
    subtotal: number;
    serviceCharge: number;
    taxAmount: number;
    total: number;
    discount: number;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onAddToCart: (product: any, quantity?: number) => void;
  onSendToKitchen: () => void;
  onCheckout: () => void;
  onSplitBill: () => void;
  onTransferTable: () => void;
}

export function RestaurantOrderPanel({
  items,
  selectedTable,
  customerCount,
  totals,
  onUpdateQuantity,
  onRemoveFromCart,
  onAddToCart,
  onSendToKitchen,
  onCheckout,
  onSplitBill,
  onTransferTable
}: RestaurantOrderPanelProps) {
  const { toast } = useToast();

  const handleDuplicateItem = (productId: string) => {
    const item = items.find(i => i.product_id === productId);
    if (item) onAddToCart(item.product, 1);
  };

  const handleTransferItem = (productId: string) => {
    toast({
      title: "Transfert d'article",
      description: "Sélectionnez la destination via F4",
    });
  };

  const handleCancelItem = (productId: string) => {
    onRemoveFromCart(productId);
  };

  return (
    <div className="h-full glass-card rounded-2xl shadow-elevate overflow-hidden">
      <ModernTicketPanel
        items={items}
        selectedTable={selectedTable}
        customerCount={customerCount}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveFromCart}
        onDuplicateItem={handleDuplicateItem}
        onTransferItem={handleTransferItem}
        onCancelItem={handleCancelItem}
        onSendToKitchen={onSendToKitchen}
        onCheckout={onCheckout}
        onSplitBill={onSplitBill}
        onTransferTable={onTransferTable}
        totals={totals}
      />
    </div>
  );
}