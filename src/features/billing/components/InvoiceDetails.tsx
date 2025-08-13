// Détails facture simplifié pour Phase 1
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInvoice } from "../hooks/useBilling";

interface InvoiceDetailsProps {
  invoiceId: string;
}

export function InvoiceDetails({ invoiceId }: InvoiceDetailsProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);

  if (isLoading) return <Card><CardContent className="p-6">Chargement...</CardContent></Card>;
  if (!invoice) return <Card><CardContent className="p-6">Facture introuvable</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{invoice.number}</CardTitle>
        <Badge variant="secondary">{invoice.status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p><strong>Client:</strong> {invoice.guest_name}</p>
          <p><strong>Total:</strong> {(invoice.total_amount || 0).toLocaleString()} XOF</p>
        </div>
      </CardContent>
    </Card>
  );
}