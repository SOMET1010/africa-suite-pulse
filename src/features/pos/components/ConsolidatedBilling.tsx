import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, CreditCard, Printer, Send, Calculator, Hotel } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/unified-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { GuestFolio, FolioCharge, FolioPayment } from '../types';

interface ConsolidatedBillingProps {
  outletId?: string;
}

export function ConsolidatedBilling({ outletId }: ConsolidatedBillingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolios, setSelectedFolios] = useState<string[]>([]);
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  // Get folios ready for checkout
  const { data: folios = [], isLoading } = useQuery({
    queryKey: ['checkout-folios', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('guest_folios')
        .select(`
          *,
          guests(first_name, last_name, email, phone),
          rooms(number, type),
          reservations(reference, date_arrival, date_departure, status)
        `)
        .in('status', ['open'])
        .gt('balance', 0); // Only folios with outstanding balance

      if (searchTerm) {
        if (searchTerm.match(/^\d+$/)) {
          query = query.eq('rooms.number', searchTerm);
        } else {
          query = query.or(`guests.first_name.ilike.%${searchTerm}%,guests.last_name.ilike.%${searchTerm}%`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });

  // Get charges for selected folios
  const { data: consolidatedCharges = [] } = useQuery({
    queryKey: ['consolidated-charges', selectedFolios],
    queryFn: async () => {
      if (selectedFolios.length === 0) return [];

      const { data, error } = await supabase
        .from('folio_charges')
        .select(`
          *,
          guest_folios(
            folio_number,
            guests(first_name, last_name),
            rooms(number)
          )
        `)
        .in('folio_id', selectedFolios)
        .order('date_charged', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: selectedFolios.length > 0
  });

  // Generate consolidated invoice
  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (selectedFolios.length === 0) throw new Error('Aucun folio sélectionné');

      const totalAmount = consolidatedCharges.reduce((sum, charge) => sum + charge.amount, 0);
      const selectedFolioData = folios.filter(f => selectedFolios.includes(f.id));

      // Create consolidated invoice record
      const { data: invoice, error } = await supabase
        .from('consolidated_invoices')
        .insert({
          folio_ids: selectedFolios,
          total_amount: totalAmount,
          billing_address: billingAddress,
          payment_method: paymentMethod,
          notes: notes,
          invoice_data: {
            folios: selectedFolioData.map(f => ({
              folio_number: f.folio_number,
              guest_name: `${f.guests?.first_name} ${f.guests?.last_name}`,
              room_number: f.rooms?.number,
              balance: f.balance
            })),
            charges: consolidatedCharges
          },
          status: 'generated'
        })
        .select()
        .single();

      if (error) throw error;
      return invoice;
    },
    onSuccess: (invoice) => {
      toast.success(`Facture consolidée générée: ${invoice.invoice_number}`);
      setSelectedFolios([]);
      setBillingAddress('');
      setPaymentMethod('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['checkout-folios'] });
    },
    onError: (error) => {
      toast.error('Erreur lors de la génération de la facture');
      console.error(error);
    }
  });

  const toggleFolioSelection = (folioId: string) => {
    setSelectedFolios(prev => 
      prev.includes(folioId) 
        ? prev.filter(id => id !== folioId)
        : [...prev, folioId]
    );
  };

  const totalAmount = selectedFolios.reduce((sum, folioId) => {
    const folio = folios.find(f => f.id === folioId);
    return sum + (folio?.balance || 0);
  }, 0);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Facturation Consolidée</h2>
          {selectedFolios.length > 0 && (
            <Badge variant="secondary">{selectedFolios.length} folio(s) sélectionné(s)</Badge>
          )}
        </div>
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
        {/* Left Panel - Folios Selection */}
        <div className="space-y-4">
          <h3 className="font-medium">Folios à Facturer</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
            </div>
          ) : folios.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Aucun folio trouvé' : 'Aucun folio en attente de facturation'}
                </p>
              </CardContent>
            </Card>
          ) : (
            folios.map((folio) => (
              <Card 
                key={folio.id} 
                className={`cursor-pointer transition-colors ${
                  selectedFolios.includes(folio.id) ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleFolioSelection(folio.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hotel className="h-4 w-4" />
                      Chambre {folio.rooms?.number}
                    </CardTitle>
                    <Badge variant={folio.reservations?.status === 'present' ? 'default' : 'secondary'}>
                      {folio.reservations?.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">
                        {folio.guests?.first_name} {folio.guests?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {folio.folio_number}
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-medium">Solde à facturer:</span>
                      <span className="font-mono font-medium text-red-600">
                        {folio.balance?.toLocaleString()} XOF
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Panel - Consolidated Invoice Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Facture Consolidée</h3>
            {selectedFolios.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Aperçu
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => generateInvoiceMutation.mutate()}
                  disabled={generateInvoiceMutation.isPending || selectedFolios.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Générer Facture
                </Button>
              </div>
            )}
          </div>

          {selectedFolios.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Sélectionnez des folios</h3>
                <p className="text-muted-foreground">
                  Choisissez un ou plusieurs folios pour générer une facture consolidée.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Invoice Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Configuration Facture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="billing-address">Adresse de facturation</Label>
                    <Textarea
                      id="billing-address"
                      placeholder="Nom de l'entreprise&#10;Adresse complète&#10;Code postal, Ville"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-method">Mode de paiement</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un mode de paiement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="card">Carte bancaire</SelectItem>
                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="account">Compte client</SelectItem>
                        <SelectItem value="agency">Agence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notes ou instructions particulières..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Total Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total à facturer:</span>
                    <span className="text-xl font-bold font-mono text-red-600">
                      {totalAmount.toLocaleString()} XOF
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Charges Breakdown */}
              {consolidatedCharges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Détail des Charges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {consolidatedCharges.map((charge) => (
                        <div key={charge.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span>{getChargeTypeIcon(charge.charge_type)}</span>
                              <Badge size="sm" className={getChargeTypeColor(charge.charge_type)}>
                                {charge.charge_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Ch. {charge.guest_folios?.rooms?.number}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {charge.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-medium">
                              {charge.amount?.toLocaleString()} XOF
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}