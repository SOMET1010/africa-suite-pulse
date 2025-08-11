import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TButton } from "@/core/ui/TButton";
import { Download, Edit, CreditCard, Mail, Printer, Calendar, User, FileText } from "lucide-react";
import { useOrgId } from "@/core/auth/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { PaymentDialog } from "../PaymentDialog";
import { InvoicePrint } from "./InvoicePrint";
import { useReactToPrint } from "react-to-print";

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
  guest_phone?: string;
  guest_address?: string;
  reservation_id?: string;
  room_number?: string;
  room_type?: string;
  check_in_date?: string;
  check_out_date?: string;
  nights_count?: number;
  adults_count?: number;
  children_count?: number;
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
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

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
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
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
          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Information */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-luxury font-semibold text-charcoal mb-3">Client</h3>
                <div className="space-y-2">
                  {invoice.guest_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-charcoal/50" />
                      <span className="font-premium text-sm">{invoice.guest_name}</span>
                    </div>
                  )}
                  {invoice.guest_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-charcoal/50" />
                      <span className="font-premium text-sm">{invoice.guest_email}</span>
                    </div>
                  )}
                  {invoice.guest_phone && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-charcoal/50">📞</span>
                      <span className="font-premium text-sm">{invoice.guest_phone}</span>
                    </div>
                  )}
                  {invoice.guest_address && (
                    <div className="flex items-start gap-2">
                      <span className="h-4 w-4 text-charcoal/50 mt-0.5">📍</span>
                      <span className="font-premium text-sm">{invoice.guest_address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stay Information */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-luxury font-semibold text-charcoal mb-3">Séjour</h3>
                <div className="space-y-2">
                  {invoice.room_number && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-charcoal/50">🏠</span>
                      <span className="font-premium text-sm">
                        Ch. {invoice.room_number} {invoice.room_type && `(${invoice.room_type})`}
                      </span>
                    </div>
                  )}
                  {invoice.check_in_date && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-charcoal/50">📅</span>
                      <span className="font-premium text-sm">
                        Arrivée: {new Date(invoice.check_in_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {invoice.check_out_date && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-charcoal/50">📅</span>
                      <span className="font-premium text-sm">
                        Départ: {new Date(invoice.check_out_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {invoice.nights_count && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-charcoal/50">🌙</span>
                      <span className="font-premium text-sm">
                        {invoice.nights_count} nuit{invoice.nights_count > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {(invoice.adults_count || invoice.children_count) && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-charcoal/50">👥</span>
                      <span className="font-premium text-sm">
                        {invoice.adults_count} adulte{invoice.adults_count > 1 ? 's' : ''}
                        {invoice.children_count > 0 && `, ${invoice.children_count} enfant${invoice.children_count > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  )}
                  {invoice.reservation_id && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-charcoal/50" />
                      <span className="font-premium text-sm">Rés: {invoice.reservation_id}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Invoice Information */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <h3 className="font-luxury font-semibold text-charcoal mb-3">Facture</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-charcoal/50" />
                    <span className="font-premium text-sm">
                      Émise: {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {invoice.due_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-charcoal/50" />
                      <span className="font-premium text-sm">
                        Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                  {invoice.reference && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-charcoal/50" />
                      <span className="font-premium text-sm">Réf: {invoice.reference}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        {invoice && <InvoicePrint ref={printRef} invoice={invoice} />}
      </div>
    </>
  );
}