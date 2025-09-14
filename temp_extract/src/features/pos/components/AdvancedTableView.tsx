import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Clock, DollarSign, MapPin, Plus, Edit3, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface TableWithOrder {
  id: string;
  table_number: string;
  capacity: number;
  zone: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'out_of_order';
  position_x?: number;
  position_y?: number;
  current_order?: {
    id: string;
    order_number: string;
    customer_count: number;
    total_amount: number;
    created_at: string;
    status: string;
  };
  reservation?: {
    id: string;
    guest_name: string;
    reserved_at: string;
    party_size: number;
    notes?: string;
  };
}

interface NewReservation {
  table_id: string;
  guest_name: string;
  guest_phone: string;
  party_size: number;
  reserved_at: string;
  notes?: string;
}

export function AdvancedTableView({ outletId }: { outletId: string }) {
  const [tables, setTables] = useState<TableWithOrder[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [zones, setZones] = useState<string[]>([]);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableWithOrder | null>(null);
  const [newReservation, setNewReservation] = useState<NewReservation>({
    table_id: '',
    guest_name: '',
    guest_phone: '',
    party_size: 1,
    reserved_at: '',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTables();
    setupRealtimeSubscription();
  }, [outletId]);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('pos_tables')
      .select(`
        *,
        pos_orders!inner (
          id,
          order_number,
          customer_count,
          total_amount,
          created_at,
          status
        )
      `)
      .eq('outlet_id', outletId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    // Get unique zones
    const uniqueZones = [...new Set(data.map(table => table.zone).filter(Boolean))];
    setZones(uniqueZones);

    setTables(data as any);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('table-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pos_tables' },
        () => fetchTables()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pos_orders' },
        () => fetchTables()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const updateTableStatus = async (tableId: string, status: string) => {
    const { error } = await supabase
      .from('pos_tables')
      .update({ status })
      .eq('id', tableId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la table",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: "Statut de la table mis à jour"
      });
    }
  };

  const createReservation = async () => {
    // For now, we'll just update the table status to reserved
    // In a real app, you'd have a reservations table
    const { error } = await supabase
      .from('pos_tables')
      .update({ 
        status: 'reserved',
        // You might store reservation info in a metadata field
      })
      .eq('id', newReservation.table_id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Succès",
        description: "Réservation créée avec succès"
      });
      setIsReservationOpen(false);
      setNewReservation({
        table_id: '',
        guest_name: '',
        guest_phone: '',
        party_size: 1,
        reserved_at: '',
        notes: ''
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500 hover:bg-green-600';
      case 'occupied': return 'bg-red-500 hover:bg-red-600';
      case 'reserved': return 'bg-blue-500 hover:bg-blue-600';
      case 'cleaning': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'out_of_order': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Libre';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
      case 'cleaning': return 'Nettoyage';
      case 'out_of_order': return 'Hors service';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElapsedTime = (dateString: string) => {
    const now = new Date();
    const start = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? `${minutes}min` : ''}`;
  };

  const filteredTables = selectedZone === 'all' 
    ? tables 
    : tables.filter(table => table.zone === selectedZone);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Plan de salle</h2>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isReservationOpen} onOpenChange={setIsReservationOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle réservation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une réservation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="table">Table</Label>
                <Select 
                  value={newReservation.table_id} 
                  onValueChange={(value) => setNewReservation(prev => ({...prev, table_id: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une table" />
                  </SelectTrigger>
                  <SelectContent>
                    {tables
                      .filter(table => table.status === 'available')
                      .map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          Table {table.table_number} ({table.capacity} places)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="guest_name">Nom du client</Label>
                  <Input
                    id="guest_name"
                    value={newReservation.guest_name}
                    onChange={(e) => setNewReservation(prev => ({...prev, guest_name: e.target.value}))}
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <Label htmlFor="guest_phone">Téléphone</Label>
                  <Input
                    id="guest_phone"
                    value={newReservation.guest_phone}
                    onChange={(e) => setNewReservation(prev => ({...prev, guest_phone: e.target.value}))}
                    placeholder="Numéro de téléphone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="party_size">Nombre de personnes</Label>
                  <Input
                    id="party_size"
                    type="number"
                    min="1"
                    value={newReservation.party_size}
                    onChange={(e) => setNewReservation(prev => ({...prev, party_size: parseInt(e.target.value)}))}
                  />
                </div>
                <div>
                  <Label htmlFor="reserved_at">Heure de réservation</Label>
                  <Input
                    id="reserved_at"
                    type="datetime-local"
                    value={newReservation.reserved_at}
                    onChange={(e) => setNewReservation(prev => ({...prev, reserved_at: e.target.value}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={newReservation.notes}
                  onChange={(e) => setNewReservation(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Notes sur la réservation"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReservationOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={createReservation}>
                  Créer la réservation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTables.map((table) => (
          <Card 
            key={table.id} 
            className={cn(
              "transition-all duration-200 cursor-pointer border-2",
              table.status === 'available' && "border-green-200 hover:border-green-400",
              table.status === 'occupied' && "border-red-200 hover:border-red-400",
              table.status === 'reserved' && "border-blue-200 hover:border-blue-400",
              table.status === 'cleaning' && "border-yellow-200 hover:border-yellow-400",
              table.status === 'out_of_order' && "border-gray-200 hover:border-gray-400"
            )}
            onClick={() => setSelectedTable(table)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Table {table.table_number}
                </CardTitle>
                <Badge className={cn("text-white", getStatusColor(table.status))}>
                  {getStatusText(table.status)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{table.capacity} places</span>
                </div>
                <span>{table.zone}</span>
              </div>
            </CardHeader>

            <CardContent>
              {table.status === 'occupied' && table.current_order && (
                <div className="space-y-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-800">
                      {table.current_order.order_number}
                    </span>
                    <span className="text-red-600 font-medium">
                      {table.current_order.total_amount.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700">
                      {table.current_order.customer_count} client(s)
                    </span>
                    <div className="flex items-center gap-1 text-red-600">
                      <Clock className="h-3 w-3" />
                      <span>{getElapsedTime(table.current_order.created_at)}</span>
                    </div>
                  </div>
                </div>
              )}

              {table.status === 'reserved' && table.reservation && (
                <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-800">
                      {table.reservation.guest_name}
                    </span>
                    <span className="text-blue-600">
                      {table.reservation.party_size} pers.
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    {formatTime(table.reservation.reserved_at)}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {table.status === 'available' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, 'occupied');
                      }}
                      className="flex-1"
                    >
                      Occuper
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewReservation(prev => ({...prev, table_id: table.id}));
                        setIsReservationOpen(true);
                      }}
                      className="flex-1"
                    >
                      Réserver
                    </Button>
                  </>
                )}

                {table.status === 'occupied' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, 'cleaning');
                      }}
                      className="flex-1"
                    >
                      Libérer
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {table.status === 'cleaning' && (
                  <Button 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTableStatus(table.id, 'available');
                    }}
                    className="w-full"
                  >
                    Prête
                  </Button>
                )}

                {table.status === 'reserved' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, 'occupied');
                      }}
                      className="flex-1"
                    >
                      Arrivée
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTableStatus(table.id, 'available');
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
        {[
          { status: 'available', label: 'Libres', color: 'text-green-600' },
          { status: 'occupied', label: 'Occupées', color: 'text-red-600' },
          { status: 'reserved', label: 'Réservées', color: 'text-blue-600' },
          { status: 'cleaning', label: 'Nettoyage', color: 'text-yellow-600' },
          { status: 'out_of_order', label: 'Hors service', color: 'text-gray-600' }
        ].map(({ status, label, color }) => {
          const count = tables.filter(table => table.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-4 text-center">
                <div className={cn("text-2xl font-bold", color)}>{count}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}