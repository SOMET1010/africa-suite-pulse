import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, 
  Receipt, 
  Building, 
  Calendar,
  DollarSign,
  FileText,
  ArrowLeft,
  Printer
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

interface ConsolidatedBillingProps {
  organizationId: string;
  organizationName: string;
  selectedFolios: string[];
  onBack: () => void;
}

// Mock data for demonstration
const mockFolios: LocalGuestFolio[] = [
  {
    id: "folio-1",
    org_id: "org-1",
    reservation_id: "res-1",
    guest_id: "guest-1",
    room_id: "room-201",
    folio_number: "F-2024-001",
    status: "open",
    balance: 125000,
    charges_total: 175000,
    payments_total: 50000,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  }
];

const mockCharges: LocalFolioCharge[] = [
  {
    id: "charge-1",
    folio_id: "folio-1",
    charge_type: "room",
    description: "Hébergement - Chambre 201",
    amount: 100000,
    quantity: 4,
    unit_price: 25000,
    tax_amount: 18000,
    date_charged: "2024-01-15",
    reference_id: "res-1",
    created_by: "staff-1",
    created_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "charge-2",
    folio_id: "folio-1",
    charge_type: "restaurant",
    description: "Restaurant - Repas d'affaires",
    amount: 45000,
    quantity: 6,
    unit_price: 7500,
    tax_amount: 8100,
    date_charged: "2024-01-15",
    reference_id: "order-1",
    created_by: "staff-2",
    created_at: "2024-01-15T12:00:00Z"
  }
];

export function ConsolidatedBilling({ 
  organizationId, 
  organizationName, 
  selectedFolios, 
  onBack 
}: ConsolidatedBillingProps) {
  const [folios] = useState<LocalGuestFolio[]>(mockFolios);
  const [charges] = useState<LocalFolioCharge[]>(mockCharges);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [billingAddress, setBillingAddress] = useState("");
  const [notes, setNotes] = useState("");

  const calculateTotals = () => {
    const selectedChargesList = charges.filter(c => selectedCharges.includes(c.id));
    const subtotal = selectedChargesList.reduce((sum, charge) => sum + charge.amount, 0);
    const tax = selectedChargesList.reduce((sum, charge) => sum + (charge.tax_amount || 0), 0);
    return {
      subtotal: subtotal - tax,
      tax,
      total: subtotal
    };
  };

  const totals = calculateTotals();

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate invoice generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Generating consolidated invoice:', {
        organization: organizationName,
        folios: selectedFolios,
        charges: selectedCharges,
        totals,
        billing_address: billingAddress,
        notes
      });
      
      // Reset form after generation
      setSelectedCharges([]);
      setBillingAddress("");
      setNotes("");
      
    } catch (error) {
      console.error('Error generating invoice:', error);
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Facturation Consolidée
            </h2>
            <p className="text-muted-foreground text-sm">
              {organizationName}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button 
            onClick={handleGenerateInvoice}
            disabled={isGenerating || selectedCharges.length === 0}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? "Génération..." : "Générer Facture"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Folio Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Folios Sélectionnés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {folios.filter(f => selectedFolios.includes(f.id)).map(folio => (
                  <div key={folio.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{folio.folio_number}</p>
                        <p className="text-sm text-muted-foreground">Chambre 201</p>
                      </div>
                      <Badge variant="outline">{folio.status}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        {folio.balance.toLocaleString()} F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Billing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails Facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="billing-address">Adresse de facturation</Label>
                <textarea
                  id="billing-address"
                  placeholder="Nom de l'entreprise&#10;Adresse complète&#10;Code postal, Ville"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  placeholder="Notes ou instructions particulières..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Charges Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sélection des Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {charges.map((charge) => (
                    <div key={charge.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedCharges.includes(charge.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCharges(prev => [...prev, charge.id]);
                          } else {
                            setSelectedCharges(prev => prev.filter(id => id !== charge.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getChargeTypeIcon(charge.charge_type)}</span>
                          <Badge className={getChargeTypeColor(charge.charge_type)}>
                            {charge.charge_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {charge.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            {charge.quantity} x {charge.unit_price.toLocaleString()} F
                          </span>
                          <span className="font-semibold">
                            {charge.amount.toLocaleString()} F
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right: Invoice Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Résumé Facture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Sous-total HT:</span>
                  <span>{totals.subtotal.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA:</span>
                  <span>{totals.tax.toLocaleString()} F</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total TTC:</span>
                  <span className="text-primary">{totals.total.toLocaleString()} F</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    {selectedCharges.length} charge(s) sélectionnée(s)
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFolios.length} folio(s)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}