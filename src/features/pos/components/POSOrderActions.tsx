import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Receipt, Send, Trash2, Calculator } from "lucide-react";
import { OrderTicketPreview } from "./OrderTicketPreview";
import type { POSOrder } from "../types";

interface POSOrderActionsProps {
  currentOrder: POSOrder | null;
  cartItems: any[];
  onSendToKitchen: () => void;
  onClearOrder: () => void;
  isSending: boolean;
}

export const POSOrderActions = ({
  currentOrder,
  cartItems,
  onSendToKitchen,
  onClearOrder,
  isSending,
}: POSOrderActionsProps) => {
  const hasItems = cartItems.length > 0;
  const isCompleted = currentOrder?.status === 'paid';

  return (
    <div className="space-y-4">
      <Separator />
      
      <div className="grid grid-cols-2 gap-3">
        
        {/* Bouton Envoyer en cuisine / Finaliser */}
        <Button
          onClick={onSendToKitchen}
          disabled={!hasItems || isSending}
          className="flex-1"
          size="lg"
        >
          {isSending ? (
            "Envoi..."
          ) : isCompleted ? (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Recalculer
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Finaliser commande
            </>
          )}
        </Button>

        {/* Bouton Vider */}
        <Button
          onClick={onClearOrder}
          disabled={!hasItems}
          variant="outline"
          size="lg"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Vider
        </Button>
      </div>

      {/* Actions pour commande finalisée */}
      {isCompleted && currentOrder && (
        <div className="space-y-2">
          <OrderTicketPreview 
            orderId={currentOrder.id}
            orderNumber={currentOrder.order_number}
          />
          
          <div className="text-xs text-center text-muted-foreground">
            ✅ Commande finalisée • FNE traité • Prêt à imprimer
          </div>
        </div>
      )}
    </div>
  );
};