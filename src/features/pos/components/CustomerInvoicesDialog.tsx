import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { posCustomersApi } from '@/services/pos-customers.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Printer } from 'lucide-react';
import type { Customer } from '../types/product.types';

interface CustomerInvoicesDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerInvoicesDialog({ customer, open, onOpenChange }: CustomerInvoicesDialogProps) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['customer-invoices', customer.id],
    queryFn: () => posCustomersApi.getCustomerInvoices(customer.id),
    enabled: open
  });

  const { data: payments } = useQuery({
    queryKey: ['customer-payments', customer.id],
    queryFn: () => posCustomersApi.getCustomerPayments(customer.id),
    enabled: open
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-destructive';
      case 'partial': return 'bg-warning';
      case 'paid': return 'bg-success';
      case 'cancelled': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Impayée';
      case 'partial': return 'Partielle';
      case 'paid': return 'Payée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const invoicesList = invoices?.data || [];
  const paymentsList = payments?.data || [];

  // Calculate totals
  const totalInvoices = invoicesList.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = paymentsList.reduce((sum, pay) => sum + pay.amount, 0);
  const totalRemaining = invoicesList.reduce((sum, inv) => sum + inv.remaining_amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historique - {customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {totalInvoices.toLocaleString()} XOF
                </div>
                <div className="text-sm text-muted-foreground">Total Facturé</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {totalPaid.toLocaleString()} XOF
                </div>
                <div className="text-sm text-muted-foreground">Total Payé</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">
                  {totalRemaining.toLocaleString()} XOF
                </div>
                <div className="text-sm text-muted-foreground">Reste à payer</div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Factures</h3>
            
            {isLoading ? (
              <div className="text-center py-4">Chargement des factures...</div>
            ) : invoicesList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Aucune facture trouvée
              </div>
            ) : (
              <div className="space-y-2">
                {invoicesList.map((invoice: any) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{invoice.invoice_number}</span>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusLabel(invoice.status)}
                            </Badge>
                            {invoice.table_number && (
                              <span className="text-sm text-muted-foreground">
                                Table {invoice.table_number}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                            {invoice.due_date && (
                              <span> • Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="font-medium">
                            {invoice.total_amount.toLocaleString()} XOF
                          </div>
                          {invoice.paid_amount > 0 && (
                            <div className="text-sm text-success">
                              Payé: {invoice.paid_amount.toLocaleString()} XOF
                            </div>
                          )}
                          {invoice.remaining_amount > 0 && (
                            <div className="text-sm text-warning">
                              Reste: {invoice.remaining_amount.toLocaleString()} XOF
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Payments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Règlements</h3>
            
            {paymentsList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Aucun règlement trouvé
              </div>
            ) : (
              <div className="space-y-2">
                {paymentsList.map((payment: any) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{payment.payment_reference}</span>
                            {payment.is_partial && (
                              <Badge variant="outline">Partiel</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(payment.payment_date).toLocaleDateString('fr-FR')} • {payment.payment_method}
                            {payment.pos_customer_invoices?.invoice_number && (
                              <span> • Facture: {payment.pos_customer_invoices.invoice_number}</span>
                            )}
                          </div>
                          {payment.notes && (
                            <div className="text-sm text-muted-foreground italic">
                              {payment.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-success">
                            {payment.amount.toLocaleString()} XOF
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}