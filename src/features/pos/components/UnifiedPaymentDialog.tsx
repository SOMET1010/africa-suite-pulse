import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Smartphone, Banknote, Building, Loader2 } from "lucide-react";
import { usePaymentFlowManager, PaymentMethod } from '../hooks/usePaymentFlowManager';
import { toast } from 'sonner';

interface UnifiedPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  outletId: string;
  onPaymentComplete: () => void;
}

export function UnifiedPaymentDialog({
  isOpen,
  onClose,
  orderId,
  outletId,
  onPaymentComplete
}: UnifiedPaymentDialogProps) {
  const {
    flowState,
    currentInvoice,
    currentPayment,
    generateInvoice,
    processPayment,
    resetFlow,
    validatePayment,
    isProcessing,
    currentStep,
    error
  } = usePaymentFlowManager(outletId);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [showStepDetails, setShowStepDetails] = useState(true);

  // Generate invoice when dialog opens
  useEffect(() => {
    if (isOpen && orderId && currentStep === 'order') {
      generateInvoice(orderId);
    }
  }, [isOpen, orderId, currentStep, generateInvoice]);

  // Reset when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetFlow();
      setReceivedAmount('');
      setSelectedMethod('cash');
    }
  }, [isOpen, resetFlow]);

  const handlePayment = async () => {
    if (!currentInvoice) return;

    const received = selectedMethod === 'cash' ? parseFloat(receivedAmount) : undefined;
    
    if (!validatePayment(selectedMethod, received)) {
      toast.error('Montant reçu insuffisant');
      return;
    }

    try {
      await processPayment(currentInvoice.id, selectedMethod, received);
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 1500);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const getStepStatus = (step: string) => {
    const steps = ['order', 'invoice', 'payment', 'fiscal', 'completed'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const paymentMethods = [
    { id: 'cash', label: 'Espèces', icon: Banknote, description: 'Paiement en liquide' },
    { id: 'card', label: 'Carte', icon: CreditCard, description: 'CB/Visa/Mastercard' },
    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone, description: 'Orange Money, MTN, etc.' },
    { id: 'room_charge', label: 'Chambre', icon: Building, description: 'Facturer sur chambre' }
  ];

  const changeAmount = selectedMethod === 'cash' && receivedAmount && currentInvoice
    ? Math.max(0, parseFloat(receivedAmount) - currentInvoice.totalAmount)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Processus de Paiement
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            {[
              { key: 'invoice', label: 'Facture' },
              { key: 'payment', label: 'Paiement' },
              { key: 'fiscal', label: 'Fiscal' },
              { key: 'completed', label: 'Terminé' }
            ].map((step, index) => {
              const status = getStepStatus(step.key);
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${status === 'completed' ? 'bg-green-500 text-white' : 
                      status === 'current' ? 'bg-primary text-primary-foreground' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    {status === 'completed' ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 ${status === 'current' ? 'font-medium' : ''}`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      getStepStatus(['invoice', 'payment', 'fiscal', 'completed'][index + 1]) !== 'pending' 
                        ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-4">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Invoice Details */}
          {currentInvoice && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">Facture {currentInvoice.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(currentInvoice.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant={currentInvoice.status === 'paid' ? 'success' : 'secondary'}>
                    {currentInvoice.status === 'paid' ? 'Payée' : 'En attente'}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{currentInvoice.subtotalAmount.toFixed(0)} F</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>{currentInvoice.taxAmount.toFixed(0)} F</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{currentInvoice.totalAmount.toFixed(0)} F</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Method Selection */}
          {currentStep === 'invoice' && currentInvoice && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-medium mb-4">Méthode de paiement</h3>
                
                <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="font-medium cursor-pointer">
                            {method.label}
                          </Label>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>

                {selectedMethod === 'cash' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor="receivedAmount">Montant reçu</Label>
                      <Input
                        id="receivedAmount"
                        type="number"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        placeholder={`${currentInvoice.totalAmount}`}
                        className="mt-1"
                      />
                    </div>
                    
                    {changeAmount > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Monnaie à rendre:</span>
                          <span className="text-lg font-bold text-green-600">
                            {changeAmount.toFixed(0)} F
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Success */}
          {currentStep === 'completed' && currentPayment && (
            <Card className="border-green-500">
              <CardContent className="pt-4">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <div>
                    <h3 className="font-bold text-lg">Paiement Réussi!</h3>
                    <p className="text-muted-foreground">
                      Méthode: {paymentMethods.find(m => m.id === currentPayment.method)?.label}
                    </p>
                    <p className="text-lg font-medium">
                      {currentPayment.amount.toFixed(0)} F
                    </p>
                    {currentPayment.changeAmount && currentPayment.changeAmount > 0 && (
                      <p className="text-green-600">
                        Monnaie: {currentPayment.changeAmount.toFixed(0)} F
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {currentStep === 'completed' ? 'Fermer' : 'Annuler'}
          </Button>
          
          {currentStep === 'invoice' && currentInvoice && (
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing || !validatePayment(selectedMethod, selectedMethod === 'cash' ? parseFloat(receivedAmount) : undefined)}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Traitement...
                </>
              ) : (
                'Confirmer le Paiement'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}