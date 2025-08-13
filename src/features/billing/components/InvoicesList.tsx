import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Euro, User } from "lucide-react";
import { useInvoicesList } from "../hooks/useBilling";
import type { BillingStatus } from "../types/billing.types";

interface InvoicesListProps {
  searchTerm: string;
  statusFilter?: BillingStatus[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function InvoicesList({ searchTerm, statusFilter, selectedId, onSelect }: InvoicesListProps) {
  const filters = {
    ...(statusFilter && { status: statusFilter }),
    ...(searchTerm && { guest_name: searchTerm })
  };
  
  const { data, isLoading } = useInvoicesList(filters);

  const filteredInvoices = (data?.invoices || []).filter(invoice => 
    !searchTerm || 
    invoice.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-charcoal/5 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-2">
        {filteredInvoices.map((invoice) => (
          <Card
            key={invoice.id}
            className={`cursor-pointer transition-elegant hover:shadow-md ${
              selectedId === invoice.id
                ? 'ring-2 ring-brand-accent bg-brand-accent/5'
                : 'hover:bg-charcoal/5'
            }`}
            onClick={() => onSelect(invoice.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-luxury font-semibold text-charcoal">
                    {invoice.number}
                  </span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </div>
                
                {invoice.guest_name && (
                  <div className="flex items-center gap-2 text-sm text-charcoal/70">
                    <User className="h-3 w-3" />
                    <span className="font-premium">{invoice.guest_name}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-charcoal/70">
                    <Calendar className="h-3 w-3" />
                    <span className="font-premium">
                      {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Euro className="h-3 w-3" />
                    <span>{invoice.total_amount?.toLocaleString()} XOF</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 text-charcoal/50">
            <p className="font-premium">Aucune facture trouvée</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}