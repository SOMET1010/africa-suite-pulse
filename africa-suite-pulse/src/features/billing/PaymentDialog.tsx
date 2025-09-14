import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getInvoicePaymentSummary } from "@/features/payments/payments.api";
import BillingPaymentSheet from "./BillingPaymentSheet";
import { PaymentHistoryWidget } from "./PaymentHistoryWidget";
import { logger } from "@/services/logger.service";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  totalDue: number;
  guestName?: string;
}

export function PaymentDialog({ open, onOpenChange, invoiceId, totalDue, guestName }: PaymentDialogProps) {
  const [paymentSummary, setPaymentSummary] = useState({ totalPaid: 0, transactionCount: 0 });

  const loadPaymentSummary = async () => {
    if (!invoiceId) return;
    try {
      const summary = await getInvoicePaymentSummary(invoiceId);
      setPaymentSummary(summary);
    } catch (error) {
      logger.error('Error loading payment summary', { error, invoiceId });
    }
  };

  useEffect(() => {
    if (open && invoiceId) {
      loadPaymentSummary();
    }
  }, [open, invoiceId]);

  const remainingBalance = totalDue - paymentSummary.totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Encaissement {guestName && `- ${guestName}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Payment summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total dû:</span>
                <div className="font-medium">{totalDue.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Déjà payé:</span>
                <div className="font-medium">{paymentSummary.totalPaid.toLocaleString()}</div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Reste à payer:</span>
                <div className={`font-medium ${remainingBalance <= 0 ? 'text-green-600' : 'text-foreground'}`}>
                  {remainingBalance.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment history */}
          <PaymentHistoryWidget 
            invoiceId={invoiceId}
            totalPaid={paymentSummary.totalPaid}
            transactionCount={paymentSummary.transactionCount}
          />

          {/* New payment form */}
          {remainingBalance > 0 && (
            <BillingPaymentSheet
              invoiceId={invoiceId}
              totalDue={remainingBalance}
              onPaid={() => {
                loadPaymentSummary();
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}