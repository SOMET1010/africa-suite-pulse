import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hotel, Search, CreditCard, FileText, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/unified-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RoomCharge, POSOrder } from '../types';

interface RoomChargeManagerProps {
  outletId: string;
}

export function RoomChargeManager({ outletId }: RoomChargeManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch active room charges
  const { data: roomCharges = [], isLoading } = useQuery({
    queryKey: ['room-charges', outletId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_charges')
        .select(`
          *,
          rooms(number),
          guests(first_name, last_name),
          pos_orders(order_number, total_amount)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });

  // Post room charge to folio
  const postToFolioMutation = useMutation({
    mutationFn: async (chargeId: string) => {
      const { error } = await supabase
        .from('room_charges')
        .update({ status: 'posted' })
        .eq('id', chargeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-charges'] });
      toast.success('Charge postée à la note client');
    },
    onError: () => {
      toast.error('Erreur lors du postage');
    }
  });

  // Reverse room charge
  const reverseChargeMutation = useMutation({
    mutationFn: async (chargeId: string) => {
      const { error } = await supabase
        .from('room_charges')
        .update({ status: 'reversed' })
        .eq('id', chargeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-charges'] });
      toast.success('Charge annulée');
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation');
    }
  });

  const filteredCharges = roomCharges.filter(charge =>
    charge.rooms?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    charge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${charge.guests?.first_name} ${charge.guests?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Rechercher par chambre, client ou description..."
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
                    Chambre {charge.rooms?.number}
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
                      {charge.guests?.first_name} {charge.guests?.last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Montant</Label>
                    <p className="font-medium text-lg">
                      {charge.amount?.toLocaleString()} XOF
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(charge.charge_date), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm bg-muted p-2 rounded mt-1">
                    {charge.description}
                  </p>
                </div>

                {charge.pos_orders && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-muted-foreground">Commande</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">
                        {charge.pos_orders.order_number} - {charge.pos_orders.total_amount?.toLocaleString()} XOF
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reverseChargeMutation.mutate(charge.id)}
                    disabled={reverseChargeMutation.isPending}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => postToFolioMutation.mutate(charge.id)}
                    disabled={postToFolioMutation.isPending}
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