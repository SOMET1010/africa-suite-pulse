import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  UserCheck, Building, Users, Clock, Download, Phone, Mail, MapPin, 
  CreditCard, AlertTriangle, CheckCircle, Star, Filter, Search 
} from "lucide-react";
import { useEnhancedArrivals, useDailyKPIs, useReservationActions } from "../hooks/useEnhancedDailyReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EnhancedArrivalsReportProps {
  selectedDate: string;
}

export function EnhancedArrivalsReport({ selectedDate }: EnhancedArrivalsReportProps) {
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    roomType: '',
    vipOnly: false,
    search: '',
  });

  const { data: arrivals, isLoading } = useEnhancedArrivals(selectedDate, filters);
  const { data: kpis } = useDailyKPIs(selectedDate);
  const { assignRoom, checkIn } = useReservationActions();

  const filteredArrivals = arrivals?.filter(arrival => 
    !filters.search || 
    arrival.guestName.toLowerCase().includes(filters.search.toLowerCase()) ||
    arrival.reference.toLowerCase().includes(filters.search.toLowerCase())
  ) || [];

  const stats = {
    total: filteredArrivals.length,
    assigned: filteredArrivals.filter(a => a.assignmentStatus === 'assigned').length,
    unassigned: filteredArrivals.filter(a => a.assignmentStatus === 'unassigned').length,
    vip: filteredArrivals.filter(a => a.vipStatus).length,
    guaranteed: filteredArrivals.filter(a => a.guaranteeType !== 'none').length,
    revenue: filteredArrivals.reduce((sum, a) => sum + a.totalAmount, 0),
  };

  const getStatusBadge = (status: string, assignmentStatus: string) => {
    if (status === 'checked_in') return <Badge variant="default" className="bg-success">Arrivé</Badge>;
    if (assignmentStatus === 'unassigned') return <Badge variant="destructive">Non assigné</Badge>;
    if (status === 'confirmed') return <Badge variant="secondary">Confirmé</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const getChannelBadge = (channel: string) => {
    const variants = {
      direct: 'default',
      ota: 'secondary',
      agency: 'outline',
      walk_in: 'destructive'
    } as const;
    
    return <Badge variant={variants[channel as keyof typeof variants] || 'outline'}>
      {channel.toUpperCase()}
    </Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Arrivées</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <MapPin className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assignées</p>
                <p className="text-2xl font-bold text-success">{stats.assigned}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0}% du total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Non Assignées</p>
                <p className="text-2xl font-bold text-warning">{stats.unassigned}</p>
                <p className="text-xs text-muted-foreground">À traiter en priorité</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-gold/10 rounded-lg">
                <Star className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients VIP</p>
                <p className="text-2xl font-bold text-accent-gold">{stats.vip}</p>
                <p className="text-xs text-muted-foreground">Attention spéciale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-accent-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="checked_in">Arrivé</SelectItem>
                <SelectItem value="option">En option</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les canaux</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="booking">Booking.com</SelectItem>
                <SelectItem value="expedia">Expedia</SelectItem>
                <SelectItem value="agence">Agence</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.roomType} onValueChange={(value) => setFilters(prev => ({ ...prev, roomType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type chambre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="STD">Standard</SelectItem>
                <SelectItem value="SUP">Supérieure</SelectItem>
                <SelectItem value="JUN">Junior Suite</SelectItem>
                <SelectItem value="SUI">Suite</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setFilters({ status: '', source: '', roomType: '', vipOnly: false, search: '' })}>
              Réinitialiser
            </Button>

            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Arrivals Table */}
      <Card className="glass-card border-accent-gold/20">
        <CardHeader>
          <CardTitle>Liste des Arrivées</CardTitle>
          <CardDescription>
            {filteredArrivals.length} arrivée(s) pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Pax</TableHead>
                  <TableHead>Garantie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArrivals.map((arrival) => (
                  <TableRow key={arrival.id} className={arrival.vipStatus ? "bg-accent-gold/5" : ""}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{arrival.guestName}</span>
                          {arrival.vipStatus && <Star className="w-4 h-4 text-accent-gold" />}
                        </div>
                        {arrival.company && (
                          <p className="text-sm text-muted-foreground">{arrival.company}</p>
                        )}
                        <div className="flex gap-2">
                          {arrival.guestPhone && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Phone className="w-3 h-3" />
                            </Button>
                          )}
                          {arrival.guestEmail && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Mail className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{arrival.reference}</code>
                    </TableCell>
                    <TableCell>
                      {arrival.roomNumber ? (
                        <Badge variant="outline">{arrival.roomNumber}</Badge>
                      ) : (
                        <Badge variant="destructive">Non assigné</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{arrival.roomType}</Badge>
                    </TableCell>
                    <TableCell>
                      {getChannelBadge(arrival.channelType)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {arrival.arrivalTime || '14:00'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {arrival.adults}
                        {arrival.children > 0 && (
                          <span className="text-muted-foreground">+{arrival.children}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {arrival.guaranteeType !== 'none' ? (
                        <Badge variant="default" className="gap-1">
                          <CreditCard className="w-3 h-3" />
                          {arrival.guaranteeType === 'deposit' ? 'Acompte' : 'CB'}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Aucune</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{arrival.totalAmount.toLocaleString()} €</p>
                        {arrival.depositPaid > 0 && (
                          <p className="text-sm text-success">
                            -{arrival.depositPaid.toLocaleString()} € payé
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(arrival.status, arrival.assignmentStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {arrival.assignmentStatus === 'unassigned' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Open room assignment modal
                            }}
                          >
                            Assigner
                          </Button>
                        )}
                        {arrival.status === 'confirmed' && arrival.roomNumber && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => checkIn.mutate(arrival.reservationId)}
                            disabled={checkIn.isPending}
                          >
                            Check-in
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredArrivals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune arrivée trouvée pour cette date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}