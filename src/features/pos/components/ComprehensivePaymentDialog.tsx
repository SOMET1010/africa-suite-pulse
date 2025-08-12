import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Gift
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "../types";

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
  const { toast } = useToast();

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
      toast({
        title: "Erreur",
        description: "Impossible de charger les méthodes de paiement",
        variant: "destructive"
      });
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
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      default: return <Receipt className="h-5 w-5" />;
    }
  };

  const processPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create the order first
      const { data: orderData, error: orderError } = await supabase
        .from('pos_orders')
        .insert({
          org_id: (await supabase.rpc('get_current_user_org_id')).data,
          order_number: `ORD-${Date.now()}`,
          table_id: tableNumber ? undefined : null,
          customer_count: customerCount,
          status: 'paid',
          order_type: tableNumber ? 'dine_in' : 'takeaway',
          subtotal: subtotal,
          tax_amount: taxAmount,
          discount_amount: discountType === 'amount' ? discountValue : (discountType === 'percent' ? (total * discountValue / 100) : 0),
          total_amount: calculateFinalTotal(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        status: 'pending'
      }));

      const { error: itemsError } = await supabase
        .from('pos_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Process payments
      const payments = selectedPaymentMode === 'split' 
        ? splitPayments 
        : [{
            method_id: selectedMethodId,
            amount: calculateFinalTotal(),
            reference: selectedMethodId === 'cash' ? `Reçu: ${cashReceived}€` : ''
          }];

      for (const payment of payments) {
        const { error: paymentError } = await supabase
          .from('payment_transactions')
          .insert({
            org_id: (await supabase.rpc('get_current_user_org_id')).data,
            invoice_id: '',
            amount: payment.amount,
            method_id: payment.method_id,
            reference: payment.reference,
            status: 'completed'
          });

        if (paymentError) throw paymentError;
      }

      toast({
        title: "Paiement réussi",
        description: `Commande ${orderData.order_number} payée avec succès`,
      });

      onPaymentComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur s'est produite lors du paiement",
        variant: "destructive"
      });
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

  return (
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
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.product_name}</span>
                    <span>{item.total_price.toFixed(2)}€</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service (10%)</span>
                    <span>{serviceCharge.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (18%)</span>
                    <span>{taxAmount.toFixed(2)}€</span>
                  </div>
                  
                  {discountType !== 'none' && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Remise {discountType === 'percent' ? `(${discountValue}%)` : ''}
                      </span>
                      <span>
                        -{discountType === 'amount' 
                          ? discountValue.toFixed(2) 
                          : (total * discountValue / 100).toFixed(2)
                        }€
                      </span>
                    </div>
                  )}
                  
                  {tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Pourboire</span>
                      <span>+{tipAmount.toFixed(2)}€</span>
                    </div>
                  )}
                  
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total à payer</span>
                    <span>{calculateFinalTotal().toFixed(2)}€</span>
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
                  <Button
                    variant={discountType === 'none' ? 'default' : 'outline'}
                    onClick={() => setDiscountType('none')}
                  >
                    Aucune
                  </Button>
                  <Button
                    variant={discountType === 'percent' ? 'default' : 'outline'}
                    onClick={() => setDiscountType('percent')}
                  >
                    %
                  </Button>
                  <Button
                    variant={discountType === 'amount' ? 'default' : 'outline'}
                    onClick={() => setDiscountType('amount')}
                  >
                    €
                  </Button>
                </div>
                
                {discountType !== 'none' && (
                  <div>
                    <Label htmlFor="discount">
                      Valeur de la remise {discountType === 'percent' ? '(%)' : '(€)'}
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
                  <Label htmlFor="tip">Pourboire (€)</Label>
                  <Input
                    id="tip"
                    type="number"
                    min="0"
                    step="0.1"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Payment methods */}
          <div className="space-y-4">
            <Tabs value={selectedPaymentMode} onValueChange={(value: any) => setSelectedPaymentMode(value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="single">Simple</TabsTrigger>
                <TabsTrigger value="split">Partagé</TabsTrigger>
                <TabsTrigger value="partial">Partiel</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Méthode de paiement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <Button
                          key={method.id}
                          variant={selectedMethodId === method.id ? 'default' : 'outline'}
                          onClick={() => setSelectedMethodId(method.id)}
                          className="flex items-center gap-2 h-16"
                        >
                          {getPaymentMethodIcon(method.kind)}
                          <span className="text-sm">{method.label}</span>
                        </Button>
                      ))}
                    </div>

                    {paymentMethods.find(m => m.id === selectedMethodId)?.kind === 'cash' && (
                      <div>
                        <Label htmlFor="cash_received">Montant reçu (€)</Label>
                        <Input
                          id="cash_received"
                          type="number"
                          min="0"
                          step="0.01"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                          placeholder={calculateFinalTotal().toFixed(2)}
                        />
                        {getChange() > 0 && (
                          <p className="text-lg font-semibold text-green-600 mt-2">
                            Monnaie à rendre: {getChange().toFixed(2)}€
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="split" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Paiement partagé</span>
                      <Button onClick={addSplitPayment} size="sm">
                        <Users className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {splitPayments.map((payment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Select 
                          value={payment.method_id} 
                          onValueChange={(value) => updateSplitPayment(index, 'method_id', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payment.amount}
                          onChange={(e) => updateSplitPayment(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeSplitPayment(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}

                    <div className="flex justify-between text-sm">
                      <span>Total des paiements:</span>
                      <span>{getSplitTotal().toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Restant à payer:</span>
                      <span>{(calculateFinalTotal() - getSplitTotal()).toFixed(2)}€</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="partial">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-center text-muted-foreground">
                      Fonctionnalité de paiement partiel à venir
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={processPayment}
                disabled={!canProcessPayment() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Traitement..." : `Payer ${calculateFinalTotal().toFixed(2)}€`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}