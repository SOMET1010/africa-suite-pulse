import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hotel, Search, CreditCard, FileText, Calendar } from 'lucide-react';

// Local types to avoid dependency issues
interface LocalRoomCharge {
  id: string;
  org_id: string;
  room_id: string;
  guest_id: string;
  folio_id: string;
  order_id: string;
  amount: number;
  description: string;
  charge_date: string;
  status: string;
  created_by: string;
  guest_signature?: string;
  created_at: string;
  updated_at: string;
}

interface RoomChargeManagerProps {
  outletId: string;
}

// Mock data for demonstration
const mockRoomCharges: LocalRoomCharge[] = [
  {
    id: "charge-1",
    org_id: "org-1",
    room_id: "room-201",
    guest_id: "guest-1",
    folio_id: "folio-1",
    order_id: "order-1",
    amount: 25000,
    description: "Restaurant - Petit-déjeuner en chambre",
    charge_date: "2024-01-15T08:30:00Z",
    status: "pending",
    created_by: "server-1",
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-01-15T08:30:00Z"
  },
  {
    id: "charge-2",
    org_id: "org-1",
    room_id: "room-305",
    guest_id: "guest-2",
    folio_id: "folio-2",
    order_id: "order-2",
    amount: 15000,
    description: "Bar - Minibar consommation",
    charge_date: "2024-01-15T20:15:00Z",
    status: "pending",
    created_by: "staff-1",
    created_at: "2024-01-15T20:15:00Z",
    updated_at: "2024-01-15T20:15:00Z"
  }
];

export function RoomChargeManager({ outletId }: RoomChargeManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomCharges, setRoomCharges] = useState(mockRoomCharges);
  const [isLoading] = useState(false);

  const handlePostToFolio = (chargeId: string) => {
    setRoomCharges(prev => prev.map(charge => 
      charge.id === chargeId 
        ? { ...charge, status: 'posted' }
        : charge
    ));
    console.log('Posting charge to folio:', chargeId);
  };

  const handleReverseCharge = (chargeId: string) => {
    setRoomCharges(prev => prev.map(charge => 
      charge.id === chargeId 
        ? { ...charge, status: 'reversed' }
        : charge
    ));
    console.log('Reversing charge:', chargeId);
  };

  const filteredCharges = roomCharges.filter(charge =>
    charge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charge.amount.toString().includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'posted': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'reversed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Room Charges</h2>
          <Badge variant="secondary">{filteredCharges.length}</Badge>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par description ou montant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Room Charges List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Chargement...</p>
          </div>
        ) : filteredCharges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune room charge en attente</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Toutes les charges ont été traitées.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCharges.map((charge) => (
            <Card key={charge.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hotel className="h-4 w-4" />
                    Chambre {charge.room_id.replace('room-', '')}
                  </CardTitle>
                  <Badge className={getStatusColor(charge.status)}>
                    {charge.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Client</Label>
                    <p className="font-medium">
                      Client Demo
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Montant</Label>
                    <p className="font-medium text-lg">
                      {charge.amount?.toLocaleString()} F
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(charge.charge_date).toLocaleDateString('fr-FR')} {new Date(charge.charge_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm bg-muted p-2 rounded mt-1">
                    {charge.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    Commande #{charge.order_id} - {charge.amount?.toLocaleString()} F
                  </span>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReverseCharge(charge.id)}
                    disabled={charge.status !== 'pending'}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handlePostToFolio(charge.id)}
                    disabled={charge.status !== 'pending'}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Poster à la note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}