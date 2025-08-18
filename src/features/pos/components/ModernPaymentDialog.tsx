import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Receipt, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Calculator,
  Loader2,
  Printer,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { logger } from '@/lib/logger';
import { CashVisualizer } from '@/components/pos/CashVisualizer';
import { usePOSPayment } from '../hooks/usePOSPayment';
import type { CartItem, POSOrder } from '../types';

interface ModernPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: POSOrder;
  cartItems: CartItem[];
  totals: {
    subtotal: number;
    taxAmount: number;
    serviceCharge: number;
    total: number;
  };
  onPaymentComplete: () => void;
}

export function ModernPaymentDialog({ 
  isOpen, 
  onClose, 
  order, 
  cartItems, 
  totals, 
  onPaymentComplete 
}: ModernPaymentDialogProps) {
  const [useVisualCash, setUseVisualCash] = useState(true);
  const [amountInput, setAmountInput] = useState('');

  const {
    paymentState,
    updatePaymentState,
    paymentMethods,
    loadingMethods,
    processPayment,
    validatePayment,
    getChangeAmount,
    printTicketManually,
    isProcessing,
    isPrinting
  } = usePOSPayment(order.org_id);

  // Set default payment method
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentState.selectedMethodId) {
      const cashMethod = paymentMethods.find(m => m.kind === 'cash');
      updatePaymentState({ 
        selectedMethodId: cashMethod?.id || paymentMethods[0].id 
      });
    }
  }, [paymentMethods, paymentState.selectedMethodId]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setAmountInput('');
      updatePaymentState({
        selectedMethodId: '',
        amountReceived: 0,
        reference: ''
      });
    }
  }, [isOpen]);

  const selectedMethod = paymentMethods.find(m => m.id === paymentState.selectedMethodId);
  const validation = validatePayment(totals.total);
  const changeAmount = getChangeAmount(totals.total);

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    const numericValue = parseFloat(value) || 0;
    updatePaymentState({ amountReceived: numericValue });
  };

  const handleVisualAmountChange = (amount: number) => {
    updatePaymentState({ amountReceived: amount });
    setAmountInput(amount.toString());
  };

  const handlePayment = async () => {
    if (!validation.isValid) return;

    try {
      await processPayment({
        orderId: order.id,
        orgId: order.org_id,
        items: cartItems,
        totals,
        methodId: paymentState.selectedMethodId,
        amountReceived: paymentState.amountReceived,
        reference: paymentState.reference
      });

      onPaymentComplete();
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const quickAmounts = [
    Math.ceil(totals.total / 1000) * 1000,
    Math.ceil(totals.total / 5000) * 5000,
    Math.ceil(totals.total / 10000) * 10000,
  ].filter((amount, index, arr) => arr.indexOf(amount) === index);

  const getMethodIcon = (kind: string) => {
    switch (kind) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'mobile_money': return <Smartphone className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  logger.debug('Payment Validation Debug', {
    selectedPaymentMode: 'single',
    selectedMethodId: paymentState.selectedMethodId,
    finalTotal: totals.total,
    cartItemsLength: cartItems.length
  });

  if (loadingMethods) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Chargement des moyens de paiement...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Encaissement - Commande {order.order_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Articles ({cartItems.length}):</span>
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
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total à payer:</span>
              <span>{totals.total.toFixed(0)} FCFA</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Moyen de paiement</Label>
            <Select 
              value={paymentState.selectedMethodId} 
              onValueChange={(value) => updatePaymentState({ selectedMethodId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un moyen de paiement" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(method.kind)}
                      <span>{method.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {method.kind}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cash Payment */}
          {selectedMethod?.kind === 'cash' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Mode de saisie</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseVisualCash(!useVisualCash)}
                >
                  {useVisualCash ? 'Mode classique' : 'Mode visuel'}
                </Button>
              </div>

              {useVisualCash ? (
                <CashVisualizer
                  totalAmount={totals.total}
                  onChange={handleVisualAmountChange}
                  showChangeCalculation={true}
                />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant reçu</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amountInput}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Montants rapides</Label>
                    <div className="flex gap-2 flex-wrap">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAmountChange(amount.toString())}
                        >
                          {amount.toLocaleString()} F
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAmountChange(totals.total.toString())}
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        Exact
                      </Button>
                    </div>
                  </div>

                  {/* Change Display */}
                  {paymentState.amountReceived > 0 && (
                    <div className="bg-muted p-3 rounded-lg">
                      {changeAmount > 0 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monnaie à rendre:</span>
                          <Badge variant="secondary" className="text-sm">
                            {changeAmount.toFixed(0)} FCFA
                          </Badge>
                        </div>
                      ) : paymentState.amountReceived < totals.total ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-destructive">Montant manquant:</span>
                          <Badge variant="destructive" className="text-sm">
                            {(totals.total - paymentState.amountReceived).toFixed(0)} FCFA
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-600">Montant exact</span>
                          <Badge variant="default" className="text-sm">
                            ✓ Parfait
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile Money Reference */}
          {selectedMethod?.kind === 'mobile_money' && (
            <div className="space-y-2">
              <Label htmlFor="reference">Référence de transaction *</Label>
              <Input
                id="reference"
                placeholder="Entrez la référence de transaction"
                value={paymentState.reference || ''}
                onChange={(e) => updatePaymentState({ reference: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Code reçu par SMS après la transaction mobile money
              </p>
            </div>
          )}

          {/* Card Payment Info */}
          {selectedMethod?.kind === 'card' && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Insérez ou présentez la carte bancaire au terminal
              </p>
            </div>
          )}

          {/* Print Status Display */}
          {paymentState.printStatus === 'failed' && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm text-orange-800">Impression automatique échouée</p>
                <p className="text-xs text-orange-600">Utilisez le bouton d'impression manuelle ci-dessous</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => printTicketManually(order.id)}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Printer className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {paymentState.printStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800">Ticket imprimé avec succès</p>
            </div>
          )}

          {/* Validation Error */}
          {!validation.isValid && (
            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
              <p className="text-sm text-destructive">{validation.error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!validation.isValid || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                `Payer ${totals.total.toFixed(0)} FCFA`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}