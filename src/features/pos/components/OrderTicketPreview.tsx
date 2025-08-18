import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Eye, Copy } from "lucide-react";
import { usePOSTicketPrinting } from "../hooks/usePOSTicketPrinting";
import { FNETicketSection } from "./FNETicketSection";
import { toast } from "@/components/ui/unified-toast";

interface OrderTicketPreviewProps {
  orderId: string;
  orderNumber: string;
}

export const OrderTicketPreview = ({ orderId, orderNumber }: OrderTicketPreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [copies, setCopies] = useState(1);
  
  const { useTicketData, printTicket, isPrinting } = usePOSTicketPrinting();
  const { data: ticketData, isLoading } = useTicketData(orderId);

  const handlePrint = (numCopies: number = copies) => {
    printTicket({ orderId, copies: numCopies });
    setShowPreview(false);
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    toast({
      title: "Copié",
      description: "Numéro de commande copié",
      variant: "success",
    });
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Printer className="h-4 w-4 mr-2" />
        Chargement...
      </Button>
    );
  }

  if (!ticketData) {
    return null;
  }

  const { order, items, outlet, cashier } = ticketData;
  const subtotal = order.total_amount - order.tax_amount;
  const hasFNE = order.fne_invoice_id && order.fne_qr_code;

  return (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Aperçu Ticket
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Aperçu Ticket - {orderNumber}
            <Button
              variant="ghost"
              size="sm"
              onClick={copyOrderNumber}
              className="ml-auto"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Aperçu du ticket */}
          <Card className="ticket-preview" style={{ 
            fontFamily: 'monospace',
            fontSize: '12px',
            backgroundColor: '#f9f9f9'
          }}>
            <CardContent className="p-4">
              
              {/* En-tête */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {outlet.name}
                </div>
                {outlet.address && (
                  <div style={{ fontSize: '11px', marginBottom: '2px' }}>
                    {outlet.address}
                  </div>
                )}
                {outlet.phone && (
                  <div style={{ fontSize: '11px' }}>
                    Tél: {outlet.phone}
                  </div>
                )}
              </div>

              {/* Infos commande */}
              <div style={{ marginBottom: '10px', fontSize: '11px' }}>
                <div><strong>Commande:</strong> {order.order_number}</div>
                <div><strong>Date:</strong> {new Date(order.created_at).toLocaleString('fr-FR')}</div>
                {cashier && (
                  <div><strong>Caissier:</strong> {cashier.display_name}</div>
                )}
              </div>

              {/* Articles */}
              <div style={{ borderTop: '1px solid #000', paddingTop: '5px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '5px', fontSize: '10px' }}>
                  <span>Article</span>
                  <span>Qté</span>
                  <span>Prix</span>
                </div>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '10px' }}>
                    <span style={{ flex: 1, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.product_name}
                    </span>
                    <span style={{ width: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <span style={{ width: '60px', textAlign: 'right' }}>
                      {item.total_price.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>Sous-total:</span>
                  <span>{subtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span>TVA (18%):</span>
                  <span>{order.tax_amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  borderTop: '1px solid #000',
                  paddingTop: '3px',
                  marginTop: '5px'
                }}>
                  <span>TOTAL:</span>
                  <span>{order.total_amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Section FNE */}
              {hasFNE && (
                <FNETicketSection
                  fneInvoiceId={order.fne_invoice_id}
                  fneReferenceNumber={order.fne_reference_number}
                  fneQrCode={order.fne_qr_code}
                  fneValidatedAt={order.fne_validated_at}
                />
              )}

              {/* Pied de page */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: '15px', 
                fontSize: '9px',
                borderTop: '1px dashed #ccc',
                paddingTop: '10px'
              }}>
                <div>Merci de votre visite !</div>
                <div>Conservez ce ticket</div>
                {hasFNE && (
                  <div style={{ marginTop: '5px', fontWeight: 'bold' }}>
                    Facture certifiée DGI ✓
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contrôles d'impression */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="copies">Copies:</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                max="5"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                className="w-20"
              />
            </div>
            
            <Button
              onClick={() => handlePrint()}
              disabled={isPrinting}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isPrinting ? "Impression..." : `Imprimer ${copies > 1 ? `(${copies}x)` : ""}`}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {hasFNE ? (
              <>✅ Facture FNE validée - QR code DGI inclus</>
            ) : (
              <>⏳ Facture FNE en cours de traitement</>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};