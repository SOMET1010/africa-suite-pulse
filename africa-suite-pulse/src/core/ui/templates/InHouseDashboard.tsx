import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KPIWidget, StatusIndicator } from '../components/HotelierCard';
import { 
  Users, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Euro, 
  Star, 
  Gift, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Bed, 
  Utensils, 
  CreditCard,
  Bell,
  Heart,
  Baby,
  Cake,
  TrendingUp
} from 'lucide-react';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  vip: boolean;
  birthDate?: string;
  anniversary?: string;
  preferences: string[];
  alerts: string[];
}

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
}

interface InHouseReservation {
  id: string;
  confirmationNumber: string;
  guest: Guest;
  room: Room;
  dateArrival: string;
  dateDeparture: string;
  nights: number;
  adults: number;
  children: number;
  totalAmount: number;
  paidAmount: number;
  services: Array<{
    id: string;
    name: string;
    amount: number;
    date: string;
  }>;
  folio: {
    balance: number;
    lastTransaction: string;
  };
  specialRequests?: string[];
  loyalty?: {
    tier: string;
    points: number;
  };
}

interface InHouseDashboardProps {
  reservations: InHouseReservation[];
  onGuestSelect: (reservation: InHouseReservation) => void;
  onQuickAction: (action: string, reservationId: string) => void;
  onServiceAdd: (reservationId: string) => void;
  onCheckout: (reservationId: string) => void;
}

type FilterType = 'all' | 'vip' | 'birthday' | 'checkout-today' | 'unpaid-balance' | 'special-requests';

export function InHouseDashboard({
  reservations,
  onGuestSelect,
  onQuickAction,
  onServiceAdd,
  onCheckout
}: InHouseDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'room' | 'departure' | 'name' | 'balance'>('room');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reservations.length;
    const vips = reservations.filter(r => r.guest.vip).length;
    const checkoutToday = reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.dateDeparture.split('T')[0] === today;
    }).length;
    const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount, 0);
    const outstandingBalance = reservations.reduce((sum, r) => sum + Math.max(0, r.folio.balance), 0);
    const averageStay = reservations.reduce((sum, r) => sum + r.nights, 0) / total || 0;

    return {
      total,
      vips,
      checkoutToday,
      totalRevenue,
      outstandingBalance,
      averageStay
    };
  }, [reservations]);

  // Filter and sort reservations
  const filteredReservations = useMemo(() => {
    let filtered = reservations;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(reservation => 
        reservation.guest.firstName.toLowerCase().includes(query) ||
        reservation.guest.lastName.toLowerCase().includes(query) ||
        reservation.room.number.includes(query) ||
        reservation.confirmationNumber.toLowerCase().includes(query)
      );
    }

    // Apply filters
    switch (filter) {
      case 'vip':
        filtered = filtered.filter(r => r.guest.vip);
        break;
      case 'birthday':
        const today = new Date().toISOString().split('T')[0].substring(5); // MM-DD
        filtered = filtered.filter(r => 
          r.guest.birthDate?.substring(5) === today ||
          r.guest.anniversary?.substring(5) === today
        );
        break;
      case 'checkout-today':
        const todayFull = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(r => r.dateDeparture.split('T')[0] === todayFull);
        break;
      case 'unpaid-balance':
        filtered = filtered.filter(r => r.folio.balance > 0);
        break;
      case 'special-requests':
        filtered = filtered.filter(r => r.specialRequests && r.specialRequests.length > 0);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'room':
          return a.room.number.localeCompare(b.room.number, undefined, { numeric: true });
        case 'departure':
          return new Date(a.dateDeparture).getTime() - new Date(b.dateDeparture).getTime();
        case 'name':
          return `${a.guest.lastName} ${a.guest.firstName}`.localeCompare(`${b.guest.lastName} ${b.guest.firstName}`);
        case 'balance':
          return b.folio.balance - a.folio.balance;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reservations, searchQuery, filter, sortBy]);

  const getTodaySpecialEvents = () => {
    const today = new Date().toISOString().split('T')[0].substring(5);
    return reservations.filter(r => 
      r.guest.birthDate?.substring(5) === today ||
      r.guest.anniversary?.substring(5) === today
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Clients Présents</h2>
            <p className="text-muted-foreground">
              Vue temps réel de tous les clients en séjour
            </p>
          </div>
          
          <Badge variant="info" className="text-sm px-3 py-1">
            <Users className="w-3 h-3 mr-1" />
            {stats.total} client{stats.total > 1 ? 's' : ''} présent{stats.total > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <KPIWidget
            title="Clients VIP"
            value={stats.vips}
            icon={Star}
            variant="info"
          />
          
          <KPIWidget
            title="Départs Jour"
            value={stats.checkoutToday}
            icon={Calendar}
            variant="warning"
          />
          
          <KPIWidget
            title="CA Total"
            value={stats.totalRevenue.toFixed(0)}
            unit="€"
            icon={Euro}
            variant="success"
          />
          
          <KPIWidget
            title="Soldes Impayés"
            value={stats.outstandingBalance.toFixed(0)}
            unit="€"
            icon={CreditCard}
            variant={stats.outstandingBalance > 0 ? "danger" : "default"}
          />
          
          <KPIWidget
            title="Séjour Moyen"
            value={stats.averageStay.toFixed(1)}
            unit="nuits"
            icon={Bed}
            variant="info"
          />
          
          <KPIWidget
            title="Événements"
            value={getTodaySpecialEvents().length}
            icon={Gift}
            variant="info"
          />
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher client, chambre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clients</SelectItem>
              <SelectItem value="vip">Clients VIP</SelectItem>
              <SelectItem value="birthday">Anniversaires</SelectItem>
              <SelectItem value="checkout-today">Départs aujourd'hui</SelectItem>
              <SelectItem value="unpaid-balance">Soldes impayés</SelectItem>
              <SelectItem value="special-requests">Demandes spéciales</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="room">Numéro de chambre</SelectItem>
              <SelectItem value="departure">Date de départ</SelectItem>
              <SelectItem value="name">Nom du client</SelectItem>
              <SelectItem value="balance">Solde folio</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            {filteredReservations.length} résultat{filteredReservations.length > 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Special Events Alert */}
      {getTodaySpecialEvents().length > 0 && (
        <Card className="p-4 border-accent bg-soft-accent">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-medium text-foreground">Événements Spéciaux Aujourd'hui</h3>
              <p className="text-sm text-muted-foreground">
                {getTodaySpecialEvents().map(r => 
                  `${r.guest.firstName} ${r.guest.lastName} (Ch. ${r.room.number})`
                ).join(', ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Guests List */}
      <div className="grid gap-4">
        {filteredReservations.map(reservation => (
          <InHouseGuestCard
            key={reservation.id}
            reservation={reservation}
            onSelect={() => onGuestSelect(reservation)}
            onQuickAction={(action) => onQuickAction(action, reservation.id)}
            onServiceAdd={() => onServiceAdd(reservation.id)}
            onCheckout={() => onCheckout(reservation.id)}
          />
        ))}

        {filteredReservations.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Aucun client ne correspond aux critères sélectionnés
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function InHouseGuestCard({
  reservation,
  onSelect,
  onQuickAction,
  onServiceAdd,
  onCheckout
}: {
  reservation: InHouseReservation;
  onSelect: () => void;
  onQuickAction: (action: string) => void;
  onServiceAdd: () => void;
  onCheckout: () => void;
}) {
  const { guest, room, folio } = reservation;
  const guestInitials = `${guest.firstName[0]}${guest.lastName[0]}`;
  
  const isCheckoutToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return reservation.dateDeparture.split('T')[0] === today;
  };

  const isBirthdayToday = () => {
    const today = new Date().toISOString().split('T')[0].substring(5);
    return guest.birthDate?.substring(5) === today || guest.anniversary?.substring(5) === today;
  };

  const hasAlerts = () => {
    return guest.alerts.length > 0 || 
           folio.balance > 0 || 
           (reservation.specialRequests && reservation.specialRequests.length > 0);
  };

  return (
    <Card 
      className={cn(
        "transition-smooth hover:shadow-elevate cursor-pointer",
        hasAlerts() && "border-warning",
        guest.vip && "border-accent"
      )}
      onClick={onSelect}
    >
      <div className="p-4 space-y-4">
        {/* Guest Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback 
                className={cn(
                  "font-medium",
                  guest.vip ? "bg-soft-accent text-accent" : "bg-soft-primary text-primary"
                )}
              >
                {guestInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {guest.firstName} {guest.lastName}
                </h3>
                
                {guest.vip && (
                  <Star className="w-4 h-4 text-accent fill-current" />
                )}
                
                {isBirthdayToday() && (
                  <Cake className="w-4 h-4 text-pink-500" />
                )}
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>#{reservation.confirmationNumber}</span>
                <span>•</span>
                <span>{guest.nationality}</span>
                
                {reservation.loyalty && (
                  <>
                    <span>•</span>
                    <Badge variant="muted" className="text-xs">
                      {reservation.loyalty.tier} ({reservation.loyalty.points} pts)
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasAlerts() && (
              <AlertTriangle className="w-4 h-4 text-warning" />
            )}
            
            {isCheckoutToday() && (
              <Badge variant="warning" className="text-xs">
                Départ Aujourd'hui
              </Badge>
            )}
          </div>
        </div>

        {/* Room & Stay Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bed className="w-3 h-3" />
              <span className="text-xs">Chambre</span>
            </div>
            <div className="font-medium">
              {room.number} - {room.type}
            </div>
            <div className="text-muted-foreground text-xs">
              Étage {room.floor}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Séjour</span>
            </div>
            <div className="font-medium">
              {reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}
            </div>
            <div className="text-muted-foreground text-xs">
              Jusqu'au {new Date(reservation.dateDeparture).toLocaleDateString('fr-FR')}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="text-xs">Occupants</span>
            </div>
            <div className="font-medium">
              {reservation.adults + reservation.children} pers.
            </div>
            <div className="text-muted-foreground text-xs">
              {reservation.adults} adulte{reservation.adults > 1 ? 's' : ''}
              {reservation.children > 0 && `, ${reservation.children} enfant${reservation.children > 1 ? 's' : ''}`}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Euro className="w-3 h-3" />
              <span className="text-xs">Folio</span>
            </div>
            <div className={cn(
              "font-medium",
              folio.balance > 0 ? "text-warning" : "text-foreground"
            )}>
              {folio.balance.toFixed(2)} €
            </div>
            <div className="text-muted-foreground text-xs">
              Total: {reservation.totalAmount.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Contact & Preferences */}
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {guest.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {guest.phone}
            </div>
          </div>

          {guest.preferences.length > 0 && (
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {guest.preferences.slice(0, 3).map(pref => (
                  <Badge key={pref} variant="muted" className="text-xs">
                    {pref}
                  </Badge>
                ))}
                {guest.preferences.length > 3 && (
                  <Badge variant="muted" className="text-xs">
                    +{guest.preferences.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {reservation.specialRequests && reservation.specialRequests.length > 0 && (
            <div className="flex items-center gap-2">
              <Bell className="w-3 h-3 text-warning" />
              <div className="flex flex-wrap gap-1">
                {reservation.specialRequests.map(request => (
                  <Badge key={request} variant="warning" className="text-xs">
                    {request}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Services */}
        {reservation.services.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Utensils className="w-3 h-3" />
              Services récents
            </div>
            <div className="space-y-1">
              {reservation.services.slice(-2).map(service => (
                <div key={service.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{service.name}</span>
                  <span className="font-medium">{service.amount.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onServiceAdd();
              }}
            >
              <Utensils className="w-3 h-3 mr-1" />
              Service
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction('bill');
              }}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Facturer
            </Button>
          </div>

          {isCheckoutToday() && (
            <Button 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCheckout();
              }}
              className="bg-success hover:bg-success/90"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Check-out
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}