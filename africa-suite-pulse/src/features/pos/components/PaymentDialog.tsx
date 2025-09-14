import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Banknote, Smartphone, Receipt, Calculator, Eye } from "lucide-react";
import { CashVisualizer } from "@/components/pos/CashVisualizer";
import type { CartItem, POSTable } from "../types";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    items: CartItem[];
    totals: {
      subtotal: number;
      serviceCharge: number;
      taxAmount: number;
      total: number;
    };
    table?: POSTable | null;
    customerCount: number;
  };
  onPaymentComplete: () => void;
}

export function PaymentDialog({ isOpen, onClose, order, onPaymentComplete }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [useVisualMode, setUseVisualMode] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { totals } = order;
  const currentReceivedAmount = useVisualMode ? receivedAmount : (parseFloat(amountReceived) || 0);
  const change = currentReceivedAmount - totals.total;

  const handlePayment = async () => {
    if (paymentMethod === 'cash' && currentReceivedAmount < totals.total) {
      toast({
        title: "Montant insuffisant",
        description: "Le montant reçu est inférieur au total de la commande",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Paiement réussi",
        description: `Commande payée avec succès (${getPaymentMethodText(paymentMethod)})`,
      });

      onPaymentComplete();
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Une erreur s'est produite lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmountReceived("");
    setReceivedAmount(0);
    setPaymentMethod('cash');
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte bancaire';
      case 'mobile': return 'Mobile Money';
      default: return method;
    }
  };

  const calculateQuickAmount = (amount: number) => {
    setAmountReceived(amount.toString());
  };

  const quickAmounts = [
    Math.ceil(totals.total / 1000) * 1000, // Round up to nearest 1000
    Math.ceil(totals.total / 5000) * 5000, // Round up to nearest 5000
    Math.ceil(totals.total / 10000) * 10000, // Round up to nearest 10000
  ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Remove duplicates

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Encaissement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Articles ({order.items.length}):</span>
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
            <div className="flex justify-between font-semibold">
              <span>Total à payer:</span>
              <span>{totals.total.toFixed(0)} FCFA</span>
            </div>
            {order.table && (
              <div className="text-sm text-muted-foreground">
                Table {order.table.number} • {order.customerCount} personne{order.customerCount > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Mode de paiement</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className="flex flex-col gap-1 h-auto p-3"
              >
                <Banknote className="h-5 w-5" />
                <span className="text-xs">Espèces</span>
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex flex-col gap-1 h-auto p-3"
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Carte</span>
              </Button>
              <Button
                variant={paymentMethod === 'mobile' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('mobile')}
                className="flex flex-col gap-1 h-auto p-3"
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-xs">Mobile Money</span>
              </Button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between">
                <Label>Mode de saisie</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseVisualMode(!useVisualMode)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-3 w-3" />
                  {useVisualMode ? 'Mode classique' : 'Mode visuel'}
                </Button>
              </div>

              {useVisualMode ? (
                /* Visual Cash Mode */
                <CashVisualizer
                  totalAmount={totals.total}
                  onChange={setReceivedAmount}
                  showChangeCalculation={true}
                />
              ) : (
                /* Classic Input Mode */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant reçu</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="text-lg"
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="space-y-2">
                    <Label>Montants rapides</Label>
                    <div className="flex gap-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => calculateQuickAmount(amount)}
                        >
                          {amount.toLocaleString()} F
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => calculateQuickAmount(totals.total)}
                      >
                        <Calculator className="h-3 w-3 mr-1" />
                        Exact
                      </Button>
                    </div>
                  </div>

                  {/* Change Calculation */}
                  {currentReceivedAmount > 0 && (
                    <div className="bg-muted p-3 rounded-lg">
                      {change >= 0 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monnaie à rendre:</span>
                          <Badge variant="secondary" className="text-sm">
                            {change.toFixed(0)} FCFA
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-destructive">Montant manquant:</span>
                          <Badge variant="destructive" className="text-sm">
                            {Math.abs(change).toFixed(0)} FCFA
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Electronic Payment Info */}
          {paymentMethod !== 'cash' && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                {paymentMethod === 'card' 
                  ? "Insérez ou présentez la carte bancaire"
                  : "Composez *126# ou utilisez votre application mobile"
                }
              </p>
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
              disabled={
                isProcessing || 
                (paymentMethod === 'cash' && currentReceivedAmount < totals.total)
              }
              className="flex-1"
            >
              {isProcessing ? (
                "Traitement..."
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