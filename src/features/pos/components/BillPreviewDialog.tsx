import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Receipt, CreditCard, Users, ArrowRight } from 'lucide-react';
import type { CartItem } from '../types';

interface BillPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment: () => void;
  onSplitBill: () => void;
  currentOrder: any;
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    serviceCharge: number;
    taxAmount: number;
    total: number;
    discount: number;
  };
}

export function BillPreviewDialog({
  isOpen,
  onClose,
  onProceedToPayment,
  onSplitBill,
  currentOrder,
  cartItems,
  totals
}: BillPreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Addition - Table {currentOrder?.table_number || 'N/A'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Details */}
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Commande #{currentOrder?.order_number}
            </div>
            
            {/* Items List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span>{item.quantity}x {item.product_name}</span>
                  </div>
                  <span className="font-medium">
                    {item.total_price.toFixed(0)} F
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total ({cartItems.length} articles):</span>
                <span>{totals.subtotal.toFixed(0)} FCFA</span>
              </div>
              
              {totals.serviceCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Service:</span>
                  <span>{totals.serviceCharge.toFixed(0)} FCFA</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>TVA:</span>
                <span>{totals.taxAmount.toFixed(0)} FCFA</span>
              </div>
              
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Remise:</span>
                  <span>-{totals.discount.toFixed(0)} FCFA</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold text-lg">
                <span>Total à payer:</span>
                <span>{totals.total.toFixed(0)} FCFA</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onProceedToPayment}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Procéder au paiement
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button
              onClick={onSplitBill}
              variant="outline"
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Diviser l'addition
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}