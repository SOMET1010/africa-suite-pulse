import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  CreditCard, 
  Users, 
  X,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { ModernPaymentDialog } from './ModernPaymentDialog';
import type { CartItem } from '../types';

interface UnifiedBillDialogProps {
  isOpen: boolean;
  onClose: () => void;
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
  onPaymentComplete: () => void;
}

export function UnifiedBillDialog({
  isOpen,
  onClose,
  onSplitBill,
  currentOrder,
  cartItems,
  totals,
  onPaymentComplete
}: UnifiedBillDialogProps) {
  const [showPayment, setShowPayment] = useState(false);

  const handleProceedToPayment = () => {
    setShowPayment(true);
  };

  const handleClosePayment = () => {
    setShowPayment(false);
  };

  const handlePaymentComplete = () => {
    onPaymentComplete();
    setShowPayment(false);
    onClose();
  };

  const handleSplitBillClick = () => {
    onSplitBill();
    onClose();
  };

  if (showPayment) {
    return (
      <ModernPaymentDialog
        isOpen={true}
        onClose={handleClosePayment}
        order={currentOrder}
        cartItems={cartItems}
        totals={totals}
        onPaymentComplete={handlePaymentComplete}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Addition - Table {currentOrder?.table_number || 'N/A'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="text-center space-y-1">
            <div className="text-sm text-muted-foreground">
              Commande #{currentOrder?.order_number}
            </div>
            <Badge variant="outline" className="text-xs">
              {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <div className="p-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-mono">
                        {item.quantity}
                      </Badge>
                      <span className="text-sm font-medium truncate">
                        {item.product_name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.unit_price.toFixed(0)} F × {item.quantity}
                    </div>
                  </div>
                  <span className="font-semibold text-sm">
                    {item.total_price.toFixed(0)} F
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total:</span>
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
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total à payer:</span>
              <span className="text-primary">{totals.total.toFixed(0)} FCFA</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            {/* Primary Payment Button */}
            <Button
              onClick={handleProceedToPayment}
              size="lg"
              className="h-12"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Encaisser {totals.total.toFixed(0)} FCFA
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSplitBillClick}
                variant="outline"
                size="sm"
              >
                <Users className="h-3 w-3 mr-2" />
                Diviser
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <X className="h-3 w-3 mr-2" />
                Annuler
              </Button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="text-center text-xs text-muted-foreground">
            Cliquez sur "Encaisser" pour choisir le mode de paiement
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}