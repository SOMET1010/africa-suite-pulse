import { useEffect, useState } from "react";
import { listInvoiceTransactions, type PaymentTransaction } from "@/features/payments/payments.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PaymentHistoryWidgetProps {
  invoiceId: string;
  totalPaid: number;
  transactionCount: number;
}

export function PaymentHistoryWidget({ invoiceId, totalPaid, transactionCount }: PaymentHistoryWidgetProps) {
  const [transactions, setTransactions] = useState<(PaymentTransaction & { payment_methods: any })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;
    
    setLoading(true);
    listInvoiceTransactions(invoiceId)
      .then((data) => setTransactions(data as any))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (transactionCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Historique des paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucun paiement enregistré</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Historique des paiements
          <Badge variant="secondary">
            {totalPaid.toLocaleString()} payé
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {transaction.status === 'captured' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="font-medium">
                    {Number(transaction.amount).toLocaleString()}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {transaction.payment_methods?.label || 'Inconnu'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(transaction.created_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                  {transaction.reference && (
                    <span className="ml-2">• Réf: {transaction.reference}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}