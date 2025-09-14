import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  CreditCard, 
  Calendar, 
  MapPin,
  Receipt,
  DollarSign,
  ArrowLeft
} from "lucide-react";

// Local types to avoid dependency issues
interface LocalGuestFolio {
  id: string;
  org_id: string;
  reservation_id: string;
  guest_id: string;
  room_id: string;
  folio_number: string;
  status: string;
  balance: number;
  charges_total: number;
  payments_total: number;
  created_at: string;
  updated_at: string;
}

interface LocalFolioCharge {
  id: string;
  folio_id: string;
  charge_type: string;
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
  tax_amount?: number;
  date_charged: string;
  reference_id?: string;
  created_by: string;
  created_at: string;
}

interface LocalFolioPayment {
  id: string;
  folio_id: string;
  payment_type: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  transaction_id?: string;
  payment_date: string;
  processed_by: string;
  notes?: string;
  created_at: string;
}

interface GuestFolioViewerProps {
  guestId: string;
  reservationId: string;
  onBack: () => void;
}

// Mock data for demonstration
const mockFolio: LocalGuestFolio = {
  id: "folio-1",
  org_id: "org-1",
  reservation_id: "res-1",
  guest_id: "guest-1",
  room_id: "room-1",
  folio_number: "F-2024-001",
  status: "open",
  balance: 75000,
  charges_total: 125000,
  payments_total: 50000,
  created_at: "2024-01-15T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z"
};

const mockCharges: LocalFolioCharge[] = [
  {
    id: "charge-1",
    folio_id: "folio-1",
    charge_type: "room",
    description: "Hébergement - Chambre 201",
    amount: 50000,
    quantity: 2,
    unit_price: 25000,
    tax_amount: 9000,
    date_charged: "2024-01-15",
    reference_id: "res-1",
    created_by: "staff-1",
    created_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "charge-2",
    folio_id: "folio-1",
    charge_type: "restaurant",
    description: "Restaurant - Petit-déjeuner",
    amount: 15000,
    quantity: 2,
    unit_price: 7500,
    tax_amount: 2700,
    date_charged: "2024-01-15",
    reference_id: "order-1",
    created_by: "staff-2",
    created_at: "2024-01-15T08:00:00Z"
  }
];

const mockPayments: LocalFolioPayment[] = [
  {
    id: "payment-1",
    folio_id: "folio-1",
    payment_type: "cash",
    amount: 30000,
    payment_method: "Espèces",
    payment_date: "2024-01-15",
    processed_by: "staff-1",
    created_at: "2024-01-15T14:00:00Z"
  },
  {
    id: "payment-2",
    folio_id: "folio-1",
    payment_type: "card",
    amount: 20000,
    payment_method: "Carte Visa",
    transaction_id: "TXN-123456",
    payment_date: "2024-01-15",
    processed_by: "staff-1",
    created_at: "2024-01-15T16:00:00Z"
  }
];

export function GuestFolioViewer({ guestId, reservationId, onBack }: GuestFolioViewerProps) {
  const [folio] = useState<LocalGuestFolio>(mockFolio);
  const [charges] = useState<LocalFolioCharge[]>(mockCharges);
  const [payments] = useState<LocalFolioPayment[]>(mockPayments);

  const getChargeTypeColor = (type: string) => {
    switch (type) {
      case 'room': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'bar': return 'bg-purple-100 text-purple-800';
      case 'spa': return 'bg-pink-100 text-pink-800';
      case 'tax': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChargeTypeIcon = (type: string) => {
    switch (type) {
      case 'room': return '🏨';
      case 'restaurant': return '🍽️';
      case 'bar': return '🍸';
      case 'spa': return '🧘';
      case 'tax': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Folio Client</h2>
            <p className="text-muted-foreground text-sm">
              {folio.folio_number} • Chambre
            </p>
          </div>
        </div>
      </div>

      {/* Guest Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">Client Demo</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chambre</p>
              <p className="font-medium">201</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Charges</p>
              <p className="text-2xl font-bold text-red-600">
                {folio.charges_total.toLocaleString()} F
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Paiements</p>
              <p className="text-2xl font-bold text-green-600">
                {folio.payments_total.toLocaleString()} F
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Solde</p>
              <p className={`text-2xl font-bold ${
                folio.balance > 0 ? 'text-red-600' : 
                folio.balance < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                {folio.balance.toLocaleString()} F
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charges and Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Charges ({charges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {charges.map((charge) => (
                  <div key={charge.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getChargeTypeIcon(charge.charge_type)}</span>
                        <Badge className={getChargeTypeColor(charge.charge_type)}>
                          {charge.charge_type}
                        </Badge>
                      </div>
                      <p className="font-semibold text-red-600">
                        +{charge.amount.toLocaleString()} F
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {charge.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(charge.date_charged).toLocaleDateString('fr-FR')}
                      {charge.quantity > 1 && (
                        <span>• {charge.quantity} x {charge.unit_price.toLocaleString()} F</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Paiements ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline">
                        {payment.payment_method}
                      </Badge>
                      <p className="font-semibold text-green-600">
                        -{payment.amount.toLocaleString()} F
                      </p>
                    </div>
                    {payment.reference_number && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Réf: {payment.reference_number}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}