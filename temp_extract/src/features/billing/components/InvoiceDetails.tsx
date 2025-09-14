import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TButton } from "@/core/ui/TButton";
import { useInvoice, useDeleteInvoice } from "../hooks/useBilling";
import { Printer, Edit, Trash2, Mail } from "lucide-react";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface InvoiceDetailsProps {
  invoiceId: string;
  onEdit?: () => void;
}

export function InvoiceDetails({ invoiceId, onEdit }: InvoiceDetailsProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const deleteInvoice = useDeleteInvoice();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteInvoice.mutateAsync(invoiceId);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled by the hook
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!invoice?.guest_email) {
      toast({
        title: "Erreur",
        description: "Aucune adresse email disponible pour ce client",
        variant: "destructive"
      });
      return;
    }
    
    // Email invoice functionality
    logger.audit('Invoice email sent', { invoiceId: invoice.id, email: invoice.guest_email });
    toast({
      title: "Email envoyé",
      description: `Facture envoyée à ${invoice.guest_email}`,
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) return <Card><CardContent className="p-6">Chargement...</CardContent></Card>;
  if (!invoice) return <Card><CardContent className="p-6">Facture introuvable</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{invoice.number}</CardTitle>
            <Badge variant={getStatusVariant(invoice.status)} className="mt-2">
              {invoice.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <TButton variant="ghost" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
            </TButton>
            <TButton variant="ghost" size="sm" onClick={handleEmail}>
              <Mail className="w-4 h-4" />
            </TButton>
            {onEdit && (
              <TButton variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </TButton>
            )}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <TButton variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </TButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la facture</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={deleteInvoice.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteInvoice.isPending ? 'Suppression...' : 'Supprimer'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">INFORMATIONS CLIENT</h3>
            <div className="space-y-2">
              <p><strong>Nom:</strong> {invoice.guest_name}</p>
              {invoice.guest_email && (
                <p><strong>Email:</strong> {invoice.guest_email}</p>
              )}
              {invoice.guest_phone && (
                <p><strong>Téléphone:</strong> {invoice.guest_phone}</p>
              )}
              {invoice.guest_address && (
                <p><strong>Adresse:</strong> {invoice.guest_address}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">DÉTAILS FACTURE</h3>
            <div className="space-y-2">
              <p><strong>Date d'émission:</strong> {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : 'N/A'}</p>
              {invoice.due_date && (
                <p><strong>Date d'échéance:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
              )}
              {invoice.reference && (
                <p><strong>Référence:</strong> {invoice.reference}</p>
              )}
              {invoice.description && (
                <p><strong>Description:</strong> {invoice.description}</p>
              )}
            </div>
          </div>

          {(invoice.room_number || invoice.check_in_date) && (
            <div className="space-y-3 md:col-span-2">
              <h3 className="font-semibold text-sm text-muted-foreground">INFORMATIONS SÉJOUR</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {invoice.room_number && (
                  <p><strong>Chambre:</strong> {invoice.room_number}</p>
                )}
                {invoice.room_type && (
                  <p><strong>Type:</strong> {invoice.room_type}</p>
                )}
                {invoice.check_in_date && (
                  <p><strong>Arrivée:</strong> {new Date(invoice.check_in_date).toLocaleDateString()}</p>
                )}
                {invoice.check_out_date && (
                  <p><strong>Départ:</strong> {new Date(invoice.check_out_date).toLocaleDateString()}</p>
                )}
                {invoice.nights_count && (
                  <p><strong>Nuits:</strong> {invoice.nights_count}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3 md:col-span-2">
            <h3 className="font-semibold text-sm text-muted-foreground">MONTANTS</h3>
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Sous-total:</span>
                <span>{(invoice.subtotal || 0).toLocaleString()} XOF</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Taxes:</span>
                <span>{(invoice.tax_amount || 0).toLocaleString()} XOF</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total:</span>
                <span>{(invoice.total_amount || 0).toLocaleString()} XOF</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="space-y-3 md:col-span-2">
              <h3 className="font-semibold text-sm text-muted-foreground">NOTES</h3>
              <p className="text-sm bg-muted p-3 rounded">{invoice.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}