import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, User, CreditCard, Receipt, Calendar, FileText, Printer } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { GuestFolio, FolioCharge, FolioPayment } from '../types';

interface GuestFolioViewerProps {
  guestId?: string;
  roomNumber?: string;
}

export function GuestFolioViewer({ guestId, roomNumber }: GuestFolioViewerProps) {
  const [searchTerm, setSearchTerm] = useState(roomNumber || '');
  const [selectedFolio, setSelectedFolio] = useState<string | null>(null);

  // Search for guest folios
  const { data: folios = [], isLoading: foliosLoading } = useQuery({
    queryKey: ['guest-folios', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      let query = supabase
        .from('guest_folios')
        .select(`
          *,
          guests(first_name, last_name, email, phone),
          rooms(number, type),
          reservations(reference, date_arrival, date_departure)
        `);

      // Search by room number or guest name
      if (searchTerm.match(/^\d+$/)) {
        // Numeric search - assume room number
        query = query.eq('rooms.number', searchTerm);
      } else {
        // Text search - guest name
        query = query.or(`guests.first_name.ilike.%${searchTerm}%,guests.last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!searchTerm
  });

  // Get folio details (charges and payments)
  const { data: folioDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['folio-details', selectedFolio],
    queryFn: async () => {
      if (!selectedFolio) return null;

      const [chargesResult, paymentsResult] = await Promise.all([
        supabase
          .from('folio_charges')
          .select('*')
          .eq('folio_id', selectedFolio)
          .order('date_charged', { ascending: false }),
        supabase
          .from('folio_payments')
          .select('*')
          .eq('folio_id', selectedFolio)
          .order('payment_date', { ascending: false })
      ]);

      if (chargesResult.error) throw chargesResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      return {
        charges: chargesResult.data as FolioCharge[],
        payments: paymentsResult.data as FolioPayment[]
      };
    },
    enabled: !!selectedFolio
  });

  const selectedFolioData = folios.find(f => f.id === selectedFolio);

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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Notes Client (Folios)</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par numéro de chambre ou nom du client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Guest Folios List */}
        <div className="space-y-4">
          <h3 className="font-medium">Folios Actifs</h3>
          
          {foliosLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Recherche...</p>
            </div>
          ) : folios.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Aucun folio trouvé' : 'Saisissez un numéro de chambre ou nom de client'}
                </p>
              </CardContent>
            </Card>
          ) : (
            folios.map((folio) => (
              <Card 
                key={folio.id} 
                className={`cursor-pointer transition-colors ${
                  selectedFolio === folio.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedFolio(folio.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Chambre {folio.rooms?.number}
                    </CardTitle>
                    <Badge variant={folio.status === 'open' ? 'default' : 'secondary'}>
                      {folio.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {folio.guests?.first_name} {folio.guests?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {folio.reservations?.date_arrival && folio.reservations?.date_departure && (
                          `${format(new Date(folio.reservations.date_arrival), 'dd/MM', { locale: fr })} - ${format(new Date(folio.reservations.date_departure), 'dd/MM', { locale: fr })}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-medium">Solde:</span>
                      <span className={`font-mono font-medium ${
                        folio.balance > 0 ? 'text-red-600' : folio.balance < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {folio.balance?.toLocaleString()} XOF
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Panel - Folio Details */}
        <div className="space-y-4">
          {selectedFolioData ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Détail du Folio</h3>
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              </div>

              {/* Guest Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informations Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Nom</Label>
                      <p className="font-medium">
                        {selectedFolioData.guests?.first_name} {selectedFolioData.guests?.last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Chambre</Label>
                      <p className="font-medium">{selectedFolioData.rooms?.number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p>{selectedFolioData.guests?.email || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Téléphone</Label>
                      <p>{selectedFolioData.guests?.phone || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Balance Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Charges</p>
                      <p className="font-mono font-medium text-red-600">
                        {selectedFolioData.charges_total?.toLocaleString()} XOF
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paiements</p>
                      <p className="font-mono font-medium text-green-600">
                        {selectedFolioData.payments_total?.toLocaleString()} XOF
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Solde</p>
                      <p className={`font-mono font-medium text-lg ${
                        selectedFolioData.balance > 0 ? 'text-red-600' : 
                        selectedFolioData.balance < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {selectedFolioData.balance?.toLocaleString()} XOF
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charges and Payments */}
              {detailsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Chargement des détails...</p>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mouvements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Charges */}
                    {folioDetails?.charges && folioDetails.charges.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          Charges
                        </h4>
                        <div className="space-y-2">
                          {folioDetails.charges.map((charge) => (
                            <div key={charge.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span>{getChargeTypeIcon(charge.charge_type)}</span>
                                  <Badge size="sm" className={getChargeTypeColor(charge.charge_type)}>
                                    {charge.charge_type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {charge.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(charge.date_charged), 'dd MMM yyyy HH:mm', { locale: fr })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-medium text-red-600">
                                  +{charge.amount?.toLocaleString()} XOF
                                </p>
                                {charge.quantity > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    {charge.quantity} x {charge.unit_price?.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {folioDetails?.charges && folioDetails.charges.length > 0 && 
                     folioDetails?.payments && folioDetails.payments.length > 0 && (
                      <Separator />
                    )}

                    {/* Payments */}
                    {folioDetails?.payments && folioDetails.payments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Paiements
                        </h4>
                        <div className="space-y-2">
                          {folioDetails.payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" size="sm">
                                    {payment.payment_method}
                                  </Badge>
                                </div>
                                {payment.reference_number && (
                                  <p className="text-sm text-muted-foreground">
                                    Réf: {payment.reference_number}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(payment.payment_date), 'dd MMM yyyy HH:mm', { locale: fr })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-medium text-green-600">
                                  -{payment.amount?.toLocaleString()} XOF
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!folioDetails?.charges || folioDetails.charges.length === 0) &&
                     (!folioDetails?.payments || folioDetails.payments.length === 0) && (
                      <div className="text-center py-4">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Aucun mouvement sur ce folio</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sélectionnez un folio</h3>
                <p className="text-muted-foreground">
                  Choisissez un folio dans la liste pour voir les détails des charges et paiements.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}