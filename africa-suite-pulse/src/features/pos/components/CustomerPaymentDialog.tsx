import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { posCustomersApi } from '@/services/pos-customers.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle2, CreditCard } from 'lucide-react';

interface CustomerPaymentDialogProps {
  customer: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CustomerPaymentDialog({ customer, open, onOpenChange, onSuccess }: CustomerPaymentDialogProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('especes');
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [notes, setNotes] = useState('');

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['customer-invoices', customer.id],
    queryFn: () => posCustomersApi.getCustomerInvoices(customer.id),
    enabled: open
  });

  const paymentMutation = useMutation({
    mutationFn: posCustomersApi.createCustomerPayment,
    onSuccess: () => {
      toast.success('Règlement enregistré avec succès');
      onSuccess();
      resetForm();
    },
    onError: () => {
      toast.error('Erreur lors de l\'enregistrement du règlement');
    }
  });

  const resetForm = () => {
    setSelectedInvoices([]);
    setPaymentAmount('');
    setPaymentMethod('especes');
    setIsPartialPayment(false);
    setNotes('');
  };

  const unpaidInvoices = invoices?.data?.filter(inv => inv.status !== 'paid') || [];
  
  const selectedInvoicesData = unpaidInvoices.filter(inv => selectedInvoices.includes(inv.id));
  const totalSelectedAmount = selectedInvoicesData.reduce((sum, inv) => sum + inv.remaining_amount, 0);

  const handleInvoiceSelection = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  };

  const handleSubmitPayment = () => {
    const amount = Number(paymentAmount);
    
    if (amount <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    if (!isPartialPayment && selectedInvoices.length === 0) {
      toast.error('Veuillez sélectionner au moins une facture');
      return;
    }

    // For partial payments, we create a payment without specific invoice
    const paymentData = {
      org_id: customer.org_id,
      customer_account_id: customer.id,
      invoice_id: isPartialPayment ? undefined : selectedInvoices[0], // For simplicity, link to first selected invoice
      payment_date: new Date().toISOString().split('T')[0],
      amount,
      payment_method: paymentMethod,
      notes,
      is_partial: isPartialPayment
    };

    paymentMutation.mutate(paymentData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive';
      case 'partial': return 'bg-warning';
      case 'paid': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Règlement - {customer.name}
            <Badge variant="outline">
              Solde: {customer.current_balance.toLocaleString()} XOF
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="partial-payment"
                checked={isPartialPayment}
                onCheckedChange={(checked) => setIsPartialPayment(!!checked)}
              />
              <Label htmlFor="partial-payment">Règlement partiel</Label>
            </div>
          </div>

          {/* Invoice Selection */}
          {!isPartialPayment && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sélectionner les factures à régler</h3>
              
              {isLoading ? (
                <div className="text-center py-4">Chargement des factures...</div>
              ) : unpaidInvoices.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune facture impayée
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {unpaidInvoices.map((invoice: any) => (
                    <Card key={invoice.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={(checked) => 
                              handleInvoiceSelection(invoice.id, !!checked)
                            }
                          />
                          <div>
                            <div className="font-medium">{invoice.invoice_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(invoice.invoice_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">
                            {invoice.remaining_amount.toLocaleString()} XOF
                          </div>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {selectedInvoices.length > 0 && (
                <div className="p-3 bg-accent rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total sélectionné:</span>
                    <span className="font-bold text-lg">
                      {totalSelectedAmount.toLocaleString()} XOF
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Saisie du règlement</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={isPartialPayment ? "Montant du règlement" : totalSelectedAmount.toString()}
                />
              </div>
              
              <div>
                <Label htmlFor="payment-method">Mode de règlement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="carte">Carte Bancaire</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur le règlement..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitPayment}
              disabled={paymentMutation.isPending || Number(paymentAmount) <= 0}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmer le règlement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}