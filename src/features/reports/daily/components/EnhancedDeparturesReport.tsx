import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Users, CreditCard, Clock, Download, AlertTriangle, CheckCircle, 
  Receipt, Euro, Search, Filter, Calendar, Building 
} from "lucide-react";
import { useEnhancedDepartures, useDailyKPIs, useReservationActions } from "../hooks/useEnhancedDailyReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface EnhancedDeparturesReportProps {
  selectedDate: string;
}

export function EnhancedDeparturesReport({ selectedDate }: EnhancedDeparturesReportProps) {
  const [filters, setFilters] = useState({
    paymentStatus: '',
    paymentMethod: '',
    search: '',
  });

  const { data: departures, isLoading } = useEnhancedDepartures(selectedDate, filters);
  const { data: kpis } = useDailyKPIs(selectedDate);
  const { checkOut } = useReservationActions();

  const filteredDepartures = departures?.filter(departure => 
    !filters.search || 
    departure.guestName.toLowerCase().includes(filters.search.toLowerCase()) ||
    departure.reference.toLowerCase().includes(filters.search.toLowerCase()) ||
    departure.roomNumber.toLowerCase().includes(filters.search.toLowerCase())
  ) || [];

  const stats = {
    total: filteredDepartures.length,
    settled: filteredDepartures.filter(d => d.balanceDue <= 0).length,
    pending: filteredDepartures.filter(d => d.balanceDue > 0 && d.status === 'checked_in').length,
    checkedOut: filteredDepartures.filter(d => d.status === 'checked_out').length,
    late: filteredDepartures.filter(d => d.lateDeparture).length,
    totalRevenue: filteredDepartures.reduce((sum, d) => sum + d.totalAmount, 0),
    totalPending: filteredDepartures.reduce((sum, d) => sum + d.balanceDue, 0),
  };

  const getPaymentStatusBadge = (balanceDue: number, status: string) => {
    if (balanceDue <= 0) return <Badge variant="default" className="bg-success">Réglé</Badge>;
    if (status === 'checked_out') return <Badge variant="secondary">Soldé</Badge>;
    return <Badge variant="destructive">En attente</Badge>;
  };

  const getCheckoutStatusBadge = (status: string, lateDeparture: boolean) => {
    if (status === 'checked_out') {
      return lateDeparture ? 
        <Badge variant="secondary">Check-out tardif</Badge> : 
        <Badge variant="default" className="bg-success">Check-out OK</Badge>;
    }
    return <Badge variant="warning">En cours</Badge>;
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
                <p className="text-sm text-muted-foreground">Total Départs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-out OK</p>
                <p className="text-2xl font-bold text-success">{stats.checkedOut}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress 
                    value={stats.total > 0 ? (stats.checkedOut / stats.total) * 100 : 0} 
                    className="flex-1 h-2" 
                  />
                  <span className="text-xs text-muted-foreground">
                    {stats.total > 0 ? Math.round((stats.checkedOut / stats.total) * 100) : 0}%
                  </span>
                </div>
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
                <p className="text-sm text-muted-foreground">En attente paiement</p>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPending.toLocaleString()} € à encaisser
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-gold/10 rounded-lg">
                <Euro className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CA Total</p>
                <p className="text-2xl font-bold text-accent-gold">
                  {stats.totalRevenue.toLocaleString()} €
                </p>
                <p className="text-xs text-muted-foreground">
                  Moy: {stats.total > 0 ? Math.round(stats.totalRevenue / stats.total).toLocaleString() : 0} €
                </p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Statut paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="paid">Réglés</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Mode paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les modes</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte bancaire</SelectItem>
                <SelectItem value="transfer">Virement</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setFilters({ paymentStatus: '', paymentMethod: '', search: '' })}>
              Réinitialiser
            </Button>

            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Departures Table */}
      <Card className="glass-card border-accent-gold/20">
        <CardHeader>
          <CardTitle>Liste des Départs</CardTitle>
          <CardDescription>
            {filteredDepartures.length} départ(s) pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
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
                  <TableHead>Check-out</TableHead>
                  <TableHead>Nuits</TableHead>
                  <TableHead>Pax</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Payé</TableHead>
                  <TableHead>Solde</TableHead>
                  <TableHead>Statut Paiement</TableHead>
                  <TableHead>Statut Check-out</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartures.map((departure) => (
                  <TableRow key={departure.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{departure.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          Folio: {departure.folio}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{departure.reference}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="outline">{departure.roomNumber}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{departure.roomType}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {departure.checkoutTime ? 
                          new Date(departure.checkoutTime).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 
                          '12:00'
                        }
                      </div>
                      {departure.lateDeparture && (
                        <Badge variant="secondary" className="mt-1">Tardif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {departure.nights}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {departure.adults}
                        {departure.children > 0 && (
                          <span className="text-muted-foreground">+{departure.children}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{departure.totalAmount.toLocaleString()} €</p>
                      {departure.services.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{departure.services.length} service(s)
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-success font-medium">
                        {departure.paidAmount.toLocaleString()} €
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className={`font-medium ${departure.balanceDue > 0 ? 'text-warning' : 'text-success'}`}>
                        {departure.balanceDue.toLocaleString()} €
                      </p>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(departure.balanceDue, departure.status)}
                    </TableCell>
                    <TableCell>
                      {getCheckoutStatusBadge(departure.status, departure.lateDeparture)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {departure.status === 'checked_in' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => checkOut.mutate(departure.reservationId)}
                            disabled={checkOut.isPending}
                          >
                            Check-out
                          </Button>
                        )}
                        {!departure.invoicePrinted && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Receipt className="w-3 h-3" />
                            Facture
                          </Button>
                        )}
                        {departure.balanceDue > 0 && (
                          <Button variant="secondary" size="sm" className="gap-1">
                            <CreditCard className="w-3 h-3" />
                            Encaisser
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDepartures.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun départ trouvé pour cette date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}