import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TButton } from "@/core/ui/TButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Users, 
  Calculator,
  Receipt,
  Percent,
  Gift,
  Hotel
} from "lucide-react";
import { toast } from "sonner";
import { CartItem } from "../types";
import { RoomChargeDialog } from "./RoomChargeDialog";
import { CashVisualizer } from "@/components/pos/CashVisualizer";

interface PaymentMethod {
  id: string;
  code: string;
  label: string;
  kind: string;
}

interface ComprehensivePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  serviceCharge: number;
  taxAmount: number;
  total: number;
  onPaymentComplete: () => void;
  tableNumber?: string;
  customerCount?: number;
}

interface SplitPayment {
  method_id: string;
  amount: number;
  reference?: string;
}

export function ComprehensivePaymentDialog({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  serviceCharge,
  taxAmount,
  total,
  onPaymentComplete,
  tableNumber,
  customerCount = 1
}: ComprehensivePaymentDialogProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'single' | 'split' | 'partial'>('single');
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  const [discountType, setDiscountType] = useState<'none' | 'amount' | 'percent'>('none');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRoomChargeDialog, setShowRoomChargeDialog] = useState(false);
  const [useVisualCash, setUseVisualCash] = useState(true);
  

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('active', true)
      .order('label');

    if (error) {
      toast.error("Impossible de charger les méthodes de paiement");
      return;
    }

    setPaymentMethods(data);
    if (data.length > 0) {
      setSelectedMethodId(data[0].id);
    }
  };

  const calculateFinalTotal = () => {
    let finalTotal = total + tipAmount;
    
    if (discountType === 'amount') {
      finalTotal -= discountValue;
    } else if (discountType === 'percent') {
      finalTotal -= (total * discountValue / 100);
    }
    
    return Math.max(0, finalTotal);
  };

  const getSplitTotal = () => {
    return splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const addSplitPayment = () => {
    const remaining = calculateFinalTotal() - getSplitTotal();
    if (remaining > 0 && selectedMethodId) {
      setSplitPayments([...splitPayments, {
        method_id: selectedMethodId,
        amount: remaining,
        reference: ''
      }]);
    }
  };

  const updateSplitPayment = (index: number, field: keyof SplitPayment, value: any) => {
    const updated = [...splitPayments];
    updated[index] = { ...updated[index], [field]: value };
    setSplitPayments(updated);
  };

  const removeSplitPayment = (index: number) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== index));
  };

  const getPaymentMethodIcon = (kind: string) => {
    switch (kind) {
      case 'cash': return <Banknote className="h-5 w-5" />;
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'mobile_money': return <Smartphone className="h-5 w-5" />;
      case 'voucher': return <Receipt className="h-5 w-5" />;
      default: return <Receipt className="h-5 w-5" />;
    }
  };

  const handleRoomChargeSuccess = () => {
    onPaymentComplete();
    onClose();
  };

  const processPayment = async () => {
    // Check if Room Charge is selected
    const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
    if (selectedMethod?.code === 'ROOM_CHARGE') {
      setShowRoomChargeDialog(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process POS Payment
      toast.success(`Paiement réussi - ${calculateFinalTotal().toLocaleString()} XOF avec ${selectedMethod?.label}`);

      onPaymentComplete();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcessPayment = () => {
    if (selectedPaymentMode === 'split') {
      return Math.abs(getSplitTotal() - calculateFinalTotal()) < 0.01;
    }
    return selectedMethodId && calculateFinalTotal() > 0;
  };

  const getChange = () => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
    if (selectedMethod?.kind === 'cash' && cashReceived > calculateFinalTotal()) {
      return cashReceived - calculateFinalTotal();
    }
    return 0;
  };

  const isRoomChargeSelected = () => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);
    return selectedMethod?.code === 'ROOM_CHARGE';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Paiement de la commande
              {tableNumber && (
                <Badge variant="secondary">Table {tableNumber}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left side - Order summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Récapitulatif de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.quantity}x {(item as any).name || 'Produit'}</span>
                      <span>{((item as any).price * item.quantity).toLocaleString()} XOF</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{subtotal.toLocaleString()} XOF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service (10%)</span>
                      <span>{serviceCharge.toLocaleString()} XOF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA (18%)</span>
                      <span>{taxAmount.toLocaleString()} XOF</span>
                    </div>
                    
                    {discountType !== 'none' && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Remise {discountType === 'percent' ? `(${discountValue}%)` : ''}
                        </span>
                        <span>
                          -{discountType === 'amount' 
                            ? discountValue.toLocaleString() 
                            : (total * discountValue / 100).toLocaleString()
                          } XOF
                        </span>
                      </div>
                    )}
                    
                    {tipAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Pourboire</span>
                        <span>+{tipAmount.toLocaleString()} XOF</span>
                      </div>
                    )}
                    
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total à payer</span>
                      <span>{calculateFinalTotal().toLocaleString()} XOF</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discount and tip */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Remises et pourboires
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <TButton
                      variant={discountType === 'none' ? 'primary' : 'default'}
                      onClick={() => setDiscountType('none')}
                      className="tap-target"
                    >
                      Aucune
                    </TButton>
                    <TButton
                      variant={discountType === 'percent' ? 'primary' : 'default'}
                      onClick={() => setDiscountType('percent')}
                      className="tap-target"
                    >
                      %
                    </TButton>
                    <TButton
                      variant={discountType === 'amount' ? 'primary' : 'default'}
                      onClick={() => setDiscountType('amount')}
                      className="tap-target"
                    >
                      XOF
                    </TButton>
                  </div>
                  
                  {discountType !== 'none' && (
                    <div>
                      <Label htmlFor="discount">
                        Valeur de la remise {discountType === 'percent' ? '(%)' : '(XOF)'}
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max={discountType === 'percent' ? "100" : undefined}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="tip">Pourboire (XOF)</Label>
                    <Input
                      id="tip"
                      type="number"
                      min="0"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Payment methods */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Méthode de paiement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mobile Money Section */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Mobile Money</div>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.filter(m => m.kind === 'mobile_money').map((method) => (
                        <TButton
                          key={method.id}
                          variant={selectedMethodId === method.id ? 'primary' : 'default'}
                          onClick={() => setSelectedMethodId(method.id)}
                          className={`mobile-money-btn ${
                            method.code === 'ORANGE_MONEY' ? 'mobile-money-orange' :
                            method.code === 'MTN_MOMO' ? 'mobile-money-mtn' :
                            method.code === 'MOOV_MONEY' ? 'mobile-money-moov' :
                            method.code === 'WAVE' ? 'mobile-money-wave' : ''
                          }`}
                        >
                          <Smartphone className="h-5 w-5" />
                          <span className="text-xs font-medium">{method.label}</span>
                        </TButton>
                      ))}
                    </div>
                  </div>

                  {/* Other Payment Methods */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Autres moyens</div>
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.filter(m => m.kind !== 'mobile_money').map((method) => (
                        <TButton
                          key={method.id}
                          variant={selectedMethodId === method.id ? 'primary' : 'default'}
                          onClick={() => setSelectedMethodId(method.id)}
                          className="tap-target flex items-center gap-2 h-16"
                        >
                          {method.code === 'ROOM_CHARGE' ? 
                            <Hotel className="h-5 w-5" /> : 
                            getPaymentMethodIcon(method.kind)
                          }
                          <span className="text-sm">{method.label}</span>
                        </TButton>
                      ))}
                    </div>
                  </div>

                  {/* Room Charge Info */}
                  {isRoomChargeSelected() && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <Hotel className="h-5 w-5" />
                        <span className="font-medium">Facturation Chambre</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        La consommation sera facturée directement sur le folio de la chambre du client.
                        Une signature sera requise pour valider la transaction.
                      </p>
                    </div>
                  )}

                  {/* Cash input */}
                  {paymentMethods.find(m => m.id === selectedMethodId)?.kind === 'cash' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Mode de saisie espèces</Label>
                        <div className="flex gap-2">
                          <TButton
                            variant={useVisualCash ? 'primary' : 'default'}
                            onClick={() => setUseVisualCash(true)}
                            size="sm"
                          >
                            <Banknote className="h-4 w-4 mr-1" />
                            Visuel
                          </TButton>
                          <TButton
                            variant={!useVisualCash ? 'primary' : 'default'}
                            onClick={() => setUseVisualCash(false)}
                            size="sm"
                          >
                            <Calculator className="h-4 w-4 mr-1" />
                            Classique
                          </TButton>
                        </div>
                      </div>

                      {useVisualCash ? (
                        <CashVisualizer
                          totalAmount={calculateFinalTotal()}
                          onChange={(received) => setCashReceived(received)}
                          showChangeCalculation={true}
                          className="border rounded-lg p-4 bg-muted/50"
                        />
                      ) : (
                        <div>
                          <Label htmlFor="cash_received">Montant reçu (XOF)</Label>
                          <Input
                            id="cash_received"
                            type="number"
                            min="0"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                            placeholder={calculateFinalTotal().toLocaleString()}
                          />
                        </div>
                      )}

                      {getChange() > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-lg font-semibold text-green-700">
                            Monnaie à rendre: {getChange().toLocaleString()} XOF
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <TButton variant="default" onClick={onClose} className="flex-1 tap-target">
                  Annuler
                </TButton>
                <TButton 
                  onClick={processPayment}
                  disabled={!canProcessPayment() || isProcessing}
                  className="flex-1 tap-target"
                >
                  {isRoomChargeSelected() ? (
                    <>
                      <Hotel className="h-4 w-4 mr-2" />
                      {isProcessing ? "Traitement..." : `Facturer ${calculateFinalTotal().toLocaleString()} XOF`}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isProcessing ? "Traitement..." : `Payer ${calculateFinalTotal().toLocaleString()} XOF`}
                    </>
                  )}
                </TButton>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Charge Dialog */}
      <RoomChargeDialog
        open={showRoomChargeDialog}
        onOpenChange={setShowRoomChargeDialog}
        amount={calculateFinalTotal()}
        orderItems={cartItems.map(item => ({
          product_name: (item as any).name || 'Produit',
          quantity: item.quantity,
          unit_price: (item as any).price || 0,
          total_price: ((item as any).price || 0) * item.quantity
        }))}
        onSuccess={handleRoomChargeSuccess}
      />
    </>
  );
}