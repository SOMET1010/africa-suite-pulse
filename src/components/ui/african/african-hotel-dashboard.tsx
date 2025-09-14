import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/unified-toast";
import { 
  Hotel, 
  Users, 
  Calendar, 
  DollarSign, 
  CheckIn, 
  CheckOut, 
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { africanHotelAPI, type AfricanRoom, type AfricanReservation } from '@/services/african-hotel.api';

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  todayArrivals: number;
  todayDepartures: number;
  totalRevenue: number;
}

export function AfricanHotelDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rooms, setRooms] = useState<AfricanRoom[]>([]);
  const [reservations, setReservations] = useState<AfricanReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'reservations' | 'new-reservation'>('overview');
  
  // Formulaire de nouvelle réservation
  const [newReservation, setNewReservation] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    guest_type: 'individual' as const,
    room_id: '',
    date_arrival: '',
    date_departure: '',
    adults: 1,
    children: 0,
    rate_total: 0,
    status: 'pending' as const,
    payment_status: 'pending' as const,
    notes: ''
  });

  const [availableRooms, setAvailableRooms] = useState<AfricanRoom[]>([]);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, roomsData, reservationsData] = await Promise.all([
        africanHotelAPI.getDashboardStats(),
        africanHotelAPI.getRooms(),
        africanHotelAPI.getReservations(20)
      ]);

      setStats(statsData);
      setRooms(roomsData);
      setReservations(reservationsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Vérifier la disponibilité des chambres
  const checkAvailability = async () => {
    if (!newReservation.date_arrival || !newReservation.date_departure) {
      return;
    }

    try {
      const available = await africanHotelAPI.getAvailableRooms(
        newReservation.date_arrival,
        newReservation.date_departure
      );
      setAvailableRooms(available);
      
      if (available.length === 0) {
        toast({
          title: "Aucune chambre disponible",
          description: "Aucune chambre n'est disponible pour ces dates",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier la disponibilité",
        variant: "destructive"
      });
    }
  };

  // Calculer le tarif
  const calculateRate = async () => {
    if (!newReservation.room_id || !newReservation.date_arrival || !newReservation.date_departure) {
      return;
    }

    try {
      const rateData = await africanHotelAPI.calculateRate(
        newReservation.room_id,
        newReservation.date_arrival,
        newReservation.date_departure
      );
      
      setNewReservation(prev => ({
        ...prev,
        rate_total: rateData.totalRate
      }));
    } catch (error) {
      console.error('Error calculating rate:', error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer le tarif",
        variant: "destructive"
      });
    }
  };

  // Créer une nouvelle réservation
  const createReservation = async () => {
    try {
      setIsCreatingReservation(true);
      
      const reservation = await africanHotelAPI.createReservation(newReservation);
      
      toast({
        title: "Réservation créée",
        description: `Réservation ${reservation.id} créée avec succès`,
      });

      // Réinitialiser le formulaire
      setNewReservation({
        guest_name: '',
        guest_phone: '',
        guest_email: '',
        guest_type: 'individual',
        room_id: '',
        date_arrival: '',
        date_departure: '',
        adults: 1,
        children: 0,
        rate_total: 0,
        status: 'pending',
        payment_status: 'pending',
        notes: ''
      });

      // Recharger les données
      loadDashboardData();
      setActiveTab('reservations');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer la réservation",
        variant: "destructive"
      });
    } finally {
      setIsCreatingReservation(false);
    }
  };

  // Mettre à jour le statut d'une réservation
  const updateReservationStatus = async (reservationId: string, status: AfricanReservation['status']) => {
    try {
      await africanHotelAPI.updateReservationStatus(reservationId, status);
      
      toast({
        title: "Statut mis à jour",
        description: `Réservation ${reservationId} mise à jour`,
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  // Vérifier les dates quand elles changent
  useEffect(() => {
    if (newReservation.date_arrival && newReservation.date_departure) {
      checkAvailability();
    }
  }, [newReservation.date_arrival, newReservation.date_departure]);

  // Calculer le tarif quand la chambre change
  useEffect(() => {
    if (newReservation.room_id) {
      calculateRate();
    }
  }, [newReservation.room_id, newReservation.date_arrival, newReservation.date_departure]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-lg">Chargement du dashboard hôtelier...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* En-tête avec navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">🏨 Dashboard Hôtelier Africain</h1>
          <p className="text-amber-700">Gestion complète de votre établissement</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Vue d'ensemble
          </Button>
          <Button
            variant={activeTab === 'rooms' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rooms')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Chambres
          </Button>
          <Button
            variant={activeTab === 'reservations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reservations')}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Réservations
          </Button>
          <Button
            variant={activeTab === 'new-reservation' ? 'default' : 'outline'}
            onClick={() => setActiveTab('new-reservation')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Réservation
          </Button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Total Chambres</CardTitle>
              <Hotel className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{stats.totalRooms}</div>
              <p className="text-xs text-amber-600">Capacité totale</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Chambres Disponibles</CardTitle>
              <CheckIn className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.availableRooms}</div>
              <p className="text-xs text-green-600">Prêtes à l'accueil</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Taux d'Occupation</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.occupancyRate.toFixed(1)}%</div>
              <p className="text-xs text-blue-600">{stats.occupiedRooms} chambres occupées</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Revenus Total</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.totalRevenue.toLocaleString()} FCFA</div>
              <p className="text-xs text-purple-600">Toutes réservations</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Arrivées Aujourd'hui</CardTitle>
              <CheckIn className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.todayArrivals}</div>
              <p className="text-xs text-orange-600">Clients attendus</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Départs Aujourd'hui</CardTitle>
              <CheckOut className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.todayDepartures}</div>
              <p className="text-xs text-red-600">Check-out prévus</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gestion des chambres */}
      {activeTab === 'rooms' && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">🏨 Gestion des Chambres</CardTitle>
            <CardDescription>État et disponibilité des chambres</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card key={room.id} className="border-amber-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Chambre {room.number}</CardTitle>
                      <Badge 
                        variant={room.status === 'available' ? 'default' : 'secondary'}
                        className={room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {room.status === 'available' ? 'Disponible' : 'Occupée'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {room.type.charAt(0).toUpperCase() + room.type.slice(1)} - Étage {room.floor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Capacité:</strong> {room.capacity} personnes</p>
                      <p className="text-sm"><strong>Tarif:</strong> {room.base_rate.toLocaleString()} FCFA/nuit</p>
                      <p className="text-sm"><strong>Équipements:</strong> {room.features.slice(0, 3).join(', ')}</p>
                      <p className="text-sm text-gray-600">{room.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des réservations */}
      {activeTab === 'reservations' && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">📋 Réservations Récentes</CardTitle>
            <CardDescription>Gestion des réservations clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id} className="border-amber-200">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{reservation.guest_name}</h3>
                        <p className="text-sm text-gray-600">
                          Chambre {reservation.room_number} ({reservation.room_type})
                        </p>
                        <p className="text-sm">
                          {reservation.date_arrival} → {reservation.date_departure} ({reservation.nights} nuits)
                        </p>
                        <p className="text-sm">
                          {reservation.adults} adulte(s) {reservation.children > 0 && `+ ${reservation.children} enfant(s)`}
                        </p>
                        <p className="text-sm font-medium">
                          Total: {reservation.rate_total.toLocaleString()} FCFA
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Badge 
                          variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}
                          className={
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {reservation.status === 'confirmed' ? 'Confirmée' :
                           reservation.status === 'pending' ? 'En attente' :
                           reservation.status === 'cancelled' ? 'Annulée' :
                           reservation.status}
                        </Badge>
                        
                        <div className="flex gap-1">
                          {reservation.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirmer
                            </Button>
                          )}
                          {reservation.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'checked_in')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Check-in
                            </Button>
                          )}
                          {reservation.status === 'checked_in' && (
                            <Button
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'checked_out')}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Check-out
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nouvelle réservation */}
      {activeTab === 'new-reservation' && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">➕ Nouvelle Réservation</CardTitle>
            <CardDescription>Créer une nouvelle réservation client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest_name">Nom du client *</Label>
                <Input
                  id="guest_name"
                  value={newReservation.guest_name}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, guest_name: e.target.value }))}
                  placeholder="Nom complet du client"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guest_phone">Téléphone</Label>
                <Input
                  id="guest_phone"
                  value={newReservation.guest_phone}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, guest_phone: e.target.value }))}
                  placeholder="+221 77 123 45 67"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_email">Email</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={newReservation.guest_email}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, guest_email: e.target.value }))}
                  placeholder="client@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest_type">Type de client</Label>
                <Select
                  value={newReservation.guest_type}
                  onValueChange={(value: any) => setNewReservation(prev => ({ ...prev, guest_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individuel</SelectItem>
                    <SelectItem value="corporate">Entreprise</SelectItem>
                    <SelectItem value="group">Groupe</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_arrival">Date d'arrivée *</Label>
                <Input
                  id="date_arrival"
                  type="date"
                  value={newReservation.date_arrival}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, date_arrival: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_departure">Date de départ *</Label>
                <Input
                  id="date_departure"
                  type="date"
                  value={newReservation.date_departure}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, date_departure: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults">Nombre d'adultes</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={newReservation.adults}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Nombre d'enfants</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={newReservation.children}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Sélection de chambre */}
            {availableRooms.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="room_id">Chambre disponible</Label>
                <Select
                  value={newReservation.room_id}
                  onValueChange={(value) => setNewReservation(prev => ({ ...prev, room_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une chambre" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Chambre {room.number} - {room.type} ({room.base_rate.toLocaleString()} FCFA/nuit)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tarif calculé */}
            {newReservation.rate_total > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-green-700">Tarif total calculé</p>
                    <p className="text-2xl font-bold text-green-900">
                      {newReservation.rate_total.toLocaleString()} FCFA
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input
                id="notes"
                value={newReservation.notes}
                onChange={(e) => setNewReservation(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Demandes spéciales, préférences..."
              />
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <Button
                onClick={createReservation}
                disabled={!newReservation.guest_name || !newReservation.date_arrival || !newReservation.date_departure || !newReservation.room_id || isCreatingReservation}
                className="bg-green-600 hover:bg-green-700"
              >
                {isCreatingReservation ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la Réservation
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={checkAvailability}
                disabled={!newReservation.date_arrival || !newReservation.date_departure}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Vérifier Disponibilité
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

