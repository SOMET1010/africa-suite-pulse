import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TButton } from "@/core/ui/TButton";
import { Download, Edit, CreditCard, Mail, Printer, Calendar, User, FileText } from "lucide-react";
import { useOrgId } from "@/core/auth/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { PaymentDialog } from "../PaymentDialog";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

interface InvoiceData {
  id: string;
  number: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  guest_name?: string;
  guest_email?: string;
  reference?: string;
  notes?: string;
  items: InvoiceItem[];
}

interface InvoiceDetailsProps {
  invoiceId: string;
}

export function InvoiceDetails({ invoiceId }: InvoiceDetailsProps) {
  const { orgId } = useOrgId();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  useEffect(() => {
    if (!invoiceId || !orgId) return;

    const loadInvoice = async () => {
      setLoading(true);
      try {
        // Load invoice with items
        const { data: invoiceData, error: invoiceError } = await (supabase as any)
          .from('invoices')
          .select(`
            *,
            invoice_items (*)
          `)
          .eq('id', invoiceId)
          .eq('org_id', orgId)
          .single();

        if (invoiceError) throw invoiceError;
        setInvoice(invoiceData);
      } catch (error) {
        console.error('Error loading invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId, orgId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue': return 'bg-danger/10 text-danger border-danger/20';
      case 'draft': return 'bg-charcoal/10 text-charcoal border-charcoal/20';
      case 'cancelled': return 'bg-charcoal/5 text-charcoal/50 border-charcoal/10';
      default: return 'bg-charcoal/10 text-charcoal border-charcoal/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'Échue';
      case 'draft': return 'Brouillon';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card shadow-luxury h-[calc(100vh-20rem)]">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-charcoal/10 rounded"></div>
            <div className="h-4 bg-charcoal/10 rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-charcoal/10 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card className="glass-card shadow-luxury h-[calc(100vh-20rem)] flex items-center justify-center">
        <div className="text-center text-charcoal/50">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-premium">Facture introuvable</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card shadow-luxury">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-luxury text-charcoal">
                Facture {invoice.number}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge className={getStatusColor(invoice.status)}>
                  {getStatusLabel(invoice.status)}
                </Badge>
                <span className="text-sm text-charcoal/70 font-premium">
                  Émise le {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-luxury font-semibold text-charcoal">Informations client</h3>
              {invoice.guest_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-charcoal/50" />
                  <span className="font-premium">{invoice.guest_name}</span>
                </div>
              )}
              {invoice.guest_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-charcoal/50" />
                  <span className="font-premium">{invoice.guest_email}</span>
                </div>
              )}
              {invoice.reference && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-charcoal/50" />
                  <span className="font-premium">Réf: {invoice.reference}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <h3 className="font-luxury font-semibold text-charcoal">Échéances</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-charcoal/50" />
                <span className="font-premium">
                  Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-luxury font-semibold text-charcoal mb-4">Articles facturés</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 text-sm font-premium text-charcoal/70 border-b pb-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-center">Quantité</div>
                <div className="col-span-2 text-right">Prix unitaire</div>
                <div className="col-span-1 text-center">TVA</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              {invoice.items?.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 text-sm py-2 border-b border-charcoal/10">
                  <div className="col-span-5 font-premium">{item.description}</div>
                  <div className="col-span-2 text-center font-luxury">{item.quantity}</div>
                  <div className="col-span-2 text-right font-luxury">{item.unit_price.toLocaleString()} XOF</div>
                  <div className="col-span-1 text-center font-premium">{item.tax_rate}%</div>
                  <div className="col-span-2 text-right font-luxury font-semibold">{item.total.toLocaleString()} XOF</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between font-premium">
                <span>Sous-total:</span>
                <span>{invoice.subtotal?.toLocaleString()} XOF</span>
              </div>
              <div className="flex justify-between font-premium">
                <span>TVA:</span>
                <span>{invoice.tax_amount?.toLocaleString()} XOF</span>
              </div>
              <Separator />
              <div className="flex justify-between font-luxury font-bold text-lg">
                <span>Total:</span>
                <span className="text-brand-accent">{invoice.total_amount?.toLocaleString()} XOF</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <div className="flex justify-end gap-3 pt-4">
              <TButton 
                variant="primary" 
                className="gap-2"
                onClick={() => setPaymentDialogOpen(true)}
              >
                <CreditCard className="h-4 w-4" />
                Encaisser
              </TButton>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-luxury font-semibold text-charcoal mb-2">Notes</h3>
                <p className="text-charcoal/70 font-premium">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        invoiceId={invoice.id}
        totalDue={invoice.total_amount}
        guestName={invoice.guest_name}
      />
    </>
  );
}