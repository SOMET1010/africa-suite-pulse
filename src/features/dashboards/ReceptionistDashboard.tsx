import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TButton } from '@/components/ui/TButton';
import { Link } from 'react-router-dom';
import { 
  Hotel, UserCheck, UserX, FileText, Users, Clock, 
  BedDouble, Calendar, Phone, MapPin, AlertCircle, Languages
} from 'lucide-react';
import { QuickActions } from '@/core/navigation/RoleBasedNavigation';
import { useLanguageAssistant } from '@/hooks/useLanguageAssistant';
import { LanguageAssistant } from '@/components/language-assistant/LanguageAssistant';

// Mock data - En production, utiliser des hooks/API
const receptionistData = {
  kpis: {
    occupiedRooms: 42,
    totalRooms: 85,
    arrivalsToday: 12,
    departuresToday: 9,
    stayovers: 33,
    availableRooms: 43,
  },
  upcomingArrivals: [
    { id: 1, guestName: "Kouassi Amenan", roomNumber: "305", checkInTime: "14:00", vip: true, notes: "Allergique aux arachides" },
    { id: 2, guestName: "Bamba Seydou", roomNumber: "201", checkInTime: "15:30", vip: false, notes: "" },
    { id: 3, guestName: "Ouattara Marie", roomNumber: "112", checkInTime: "16:00", vip: false, notes: "Voyage d'affaires" },
  ],
  upcomingDepartures: [
    { id: 1, guestName: "Johnson Paul", roomNumber: "408", checkOutTime: "11:00", balanceDue: 0 },
    { id: 2, guestName: "Diabaté Fatou", roomNumber: "203", checkOutTime: "12:00", balanceDue: 25000 },
  ],
  alerts: [
    { id: 1, type: "warning", message: "3 chambres en maintenance", priority: "medium" },
    { id: 2, type: "info", message: "VIP arriving at 14:00 - Room 305", priority: "high" },
    { id: 3, type: "error", message: "Problème système facturation", priority: "high" },
  ],
  roomStatus: {
    clean: 65,
    dirty: 15,
    outOfOrder: 3,
    maintenance: 2,
  }
};

export function ReceptionistDashboard() {
  const { isOpen, openAssistant, closeAssistant } = useLanguageAssistant();
  const { kpis, upcomingArrivals, upcomingDepartures, alerts, roomStatus } = receptionistData;
  const occupancyRate = Math.round((kpis.occupiedRooms / kpis.totalRooms) * 100);

  const quickActions = [
    { id: "checkin", label: "Check-in", variant: "primary" as const, href: "/arrivals", icon: <UserCheck size={18} /> },
    { id: "checkout", label: "Check-out", variant: "accent" as const, href: "/departures", icon: <UserX size={18} /> },
    { id: "rack", label: "Rack", variant: "ghost" as const, href: "/reservations/rack", icon: <Hotel size={18} /> },
    { id: "language", label: "Assistance Linguistique", variant: "ghost" as const, icon: <Languages size={18} />, onClick: () => openAssistant() },
    { id: "reservation", label: "Nouvelle Résa", variant: "ghost" as const, href: "/reservations/new/quick", icon: <FileText size={18} /> },
  ];

  return (
    <>
    <UnifiedLayout
      hotelDate="2025-08-13"
      shiftLabel="Jour"
      orgName="AfricaSuite PMS - Réception"
      showBottomBar={true}
      actions={quickActions.map(action => ({
        ...action,
        onClick: () => {} // Will be handled by href
      }))}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Tableau de Bord - Réception</h1>
          <p className="text-muted-foreground">Vue d'ensemble temps réel de l'activité hôtelière</p>
        </div>

        {/* Quick Actions */}
        <QuickActions userRole="receptionist" className="mb-6" />

        {/* KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-soft-success text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Taux d'Occupation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{occupancyRate}%</div>
              <div className="text-xs text-muted-foreground">{kpis.occupiedRooms}/{kpis.totalRooms} chambres</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-info text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Arrivées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{kpis.arrivalsToday}</div>
              <div className="text-xs text-muted-foreground">aujourd'hui</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-warning text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Départs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{kpis.departuresToday}</div>
              <div className="text-xs text-muted-foreground">aujourd'hui</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-primary text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpis.availableRooms}</div>
              <div className="text-xs text-muted-foreground">chambres libres</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Arrivées du Jour */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-info" />
                Arrivées du Jour
              </CardTitle>
              <Badge variant="info">{upcomingArrivals.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingArrivals.map((arrival) => (
                <div key={arrival.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{arrival.guestName}</span>
                      {arrival.vip && <Badge variant="warning" className="text-xs">VIP</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BedDouble size={14} />
                        Ch. {arrival.roomNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {arrival.checkInTime}
                      </span>
                    </div>
                    {arrival.notes && (
                      <div className="text-xs text-warning mt-1">Note: {arrival.notes}</div>
                    )}
                  </div>
                  <TButton size="md" variant="primary">
                    <Link to={`/arrivals?guest=${arrival.id}`}>Check-in</Link>
                  </TButton>
                </div>
              ))}
              <TButton variant="ghost" className="w-full">
                <Link to="/arrivals">Voir toutes les arrivées</Link>
              </TButton>
            </CardContent>
          </Card>

          {/* Départs du Jour */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-warning" />
                Départs du Jour
              </CardTitle>
              <Badge variant="warning">{upcomingDepartures.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDepartures.map((departure) => (
                <div key={departure.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{departure.guestName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <BedDouble size={14} />
                        Ch. {departure.roomNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {departure.checkOutTime}
                      </span>
                    </div>
                    {departure.balanceDue > 0 && (
                      <div className="text-sm text-danger mt-1">
                        Solde dû: {departure.balanceDue.toLocaleString()} XOF
                      </div>
                    )}
                  </div>
                  <TButton size="md" variant="accent">
                    <Link to={`/departures?guest=${departure.id}`}>Check-out</Link>
                  </TButton>
                </div>
              ))}
              <TButton variant="ghost" className="w-full">
                <Link to="/departures">Voir tous les départs</Link>
              </TButton>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Statut des Chambres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                Statut des Chambres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full room-dot-clean"></div>
                    Propres
                  </span>
                  <span className="font-medium">{roomStatus.clean}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full room-dot-dirty"></div>
                    Sales
                  </span>
                  <span className="font-medium">{roomStatus.dirty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full room-dot-maintenance"></div>
                    Maintenance
                  </span>
                  <span className="font-medium">{roomStatus.maintenance}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full room-dot-out_of_order"></div>
                    Hors Service
                  </span>
                  <span className="font-medium">{roomStatus.outOfOrder}</span>
                </div>
              </div>
              <TButton variant="ghost" className="w-full mt-4">
                <Link to="/housekeeping">Gestion Gouvernante</Link>
              </TButton>
            </CardContent>
          </Card>

          {/* Alertes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Alertes & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'border-danger bg-soft-danger' :
                    alert.type === 'warning' ? 'border-warning bg-soft-warning' :
                    'border-info bg-soft-info'
                  }`}
                >
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Priorité: {alert.priority === 'high' ? 'Haute' : alert.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        </div>
      </UnifiedLayout>
      
      <LanguageAssistant 
        open={isOpen}
        onClose={closeAssistant}
      />
    </>
  );
}