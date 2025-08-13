import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  UserX, AlertTriangle, CreditCard, TrendingDown, Download, Phone, 
  Mail, Calendar, Euro, Search, Filter, Clock, Ban 
} from "lucide-react";
import { useEnhancedNoShows, useDailyKPIs, useReservationActions } from "../hooks/useEnhancedDailyReports";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EnhancedNoShowReportProps {
  selectedDate: string;
}

export function EnhancedNoShowReport({ selectedDate }: EnhancedNoShowReportProps) {
  const [filters, setFilters] = useState({
    source: '',
    penaltyStatus: '',
    search: '',
  });

  const { data: noShows, isLoading } = useEnhancedNoShows(selectedDate);
  const { data: kpis } = useDailyKPIs(selectedDate);
  const { applyNoShowPenalty } = useReservationActions();

  const filteredNoShows = noShows?.filter(noShow => 
    !filters.search || 
    noShow.guestName.toLowerCase().includes(filters.search.toLowerCase()) ||
    noShow.reference.toLowerCase().includes(filters.search.toLowerCase())
  ) || [];

  const stats = {
    totalNoShows: filteredNoShows.length,
    lostRevenue: filteredNoShows.reduce((sum, ns) => sum + ns.totalAmount, 0),
    totalDeposits: filteredNoShows.reduce((sum, ns) => sum + ns.depositPaid, 0),
    potentialPenalties: filteredNoShows.reduce((sum, ns) => sum + ns.penaltyAmount, 0),
    contacted: filteredNoShows.filter(ns => ns.contactAttempts > 0).length,
    blacklisted: filteredNoShows.filter(ns => ns.blacklisted).length,
  };

  const getSourceBadge = (source: string) => {
    const variants = {
      direct: 'default',
      booking: 'secondary',
      expedia: 'secondary',
      agence: 'outline'
    } as const;
    
    return <Badge variant={variants[source as keyof typeof variants] || 'outline'}>
      {source.charAt(0).toUpperCase() + source.slice(1)}
    </Badge>;
  };

  const getPenaltyStatusBadge = (penaltyApplied: boolean, penaltyAmount: number) => {
    if (penaltyApplied) return <Badge variant="default" className="bg-success">Appliquée</Badge>;
    if (penaltyAmount > 0) return <Badge variant="warning">À appliquer</Badge>;
    return <Badge variant="outline">Non applicable</Badge>;
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
              <div className="p-3 bg-destructive/10 rounded-lg">
                <UserX className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total No-Shows</p>
                <p className="text-2xl font-bold text-destructive">{stats.totalNoShows}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CA Perdu</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.lostRevenue.toLocaleString()} €
                </p>
                <p className="text-xs text-muted-foreground">
                  Moy: {stats.totalNoShows > 0 ? Math.round(stats.lostRevenue / stats.totalNoShows).toLocaleString() : 0} €
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Euro className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acomptes Conservés</p>
                <p className="text-2xl font-bold text-success">
                  {stats.totalDeposits.toLocaleString()} €
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.lostRevenue > 0 ? Math.round((stats.totalDeposits / stats.lostRevenue) * 100) : 0}% du CA perdu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-gold/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-accent-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pénalités Potentielles</p>
                <p className="text-2xl font-bold text-accent-gold">
                  {stats.potentialPenalties.toLocaleString()} €
                </p>
                <p className="text-xs text-muted-foreground">À appliquer selon politique</p>
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

            <Select value={filters.penaltyStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, penaltyStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Statut pénalité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="applied">Appliquée</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="none">Aucune</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setFilters({ source: '', penaltyStatus: '', search: '' })}>
              Réinitialiser
            </Button>

            <Button className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No-Shows Table */}
      <Card className="glass-card border-accent-gold/20">
        <CardHeader>
          <CardTitle>Liste des No-Shows</CardTitle>
          <CardDescription>
            {filteredNoShows.length} no-show(s) pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Type Chambre</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Arrivée Prévue</TableHead>
                  <TableHead>Montant Résa</TableHead>
                  <TableHead>Acompte</TableHead>
                  <TableHead>Pénalité</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNoShows.map((noShow) => (
                  <TableRow key={noShow.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{noShow.guestName}</p>
                        {noShow.blacklisted && (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="w-3 h-3" />
                            Blacklisté
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{noShow.reference}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{noShow.roomType}</Badge>
                    </TableCell>
                    <TableCell>
                      {getSourceBadge(noShow.source)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(noShow.expectedArrival).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-warning">
                        {noShow.totalAmount.toLocaleString()} €
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-success">
                        {noShow.depositPaid.toLocaleString()} €
                      </p>
                      {noShow.depositPaid > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Math.round((noShow.depositPaid / noShow.totalAmount) * 100)}% du total
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-accent-gold">
                          {noShow.penaltyAmount.toLocaleString()} €
                        </p>
                        {getPenaltyStatusBadge(noShow.penaltyApplied, noShow.penaltyAmount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {noShow.contactAttempts} tentative(s)
                        </p>
                        {noShow.lastContactTime && (
                          <p className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(noShow.lastContactTime).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">No-Show</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Phone className="w-3 h-3" />
                          Contacter
                        </Button>
                        
                        {!noShow.penaltyApplied && noShow.penaltyAmount > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="secondary" size="sm" className="gap-1">
                                <CreditCard className="w-3 h-3" />
                                Pénalité
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Appliquer Pénalité No-Show</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p><strong>Client:</strong> {noShow.guestName}</p>
                                  <p><strong>Référence:</strong> {noShow.reference}</p>
                                  <p><strong>Montant pénalité:</strong> {noShow.penaltyAmount.toLocaleString()} €</p>
                                </div>
                                <Textarea 
                                  placeholder="Motif de la pénalité..."
                                  className="min-h-20"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => applyNoShowPenalty.mutate({
                                      reservationId: noShow.reservationId,
                                      amount: noShow.penaltyAmount
                                    })}
                                    disabled={applyNoShowPenalty.isPending}
                                  >
                                    Appliquer
                                  </Button>
                                  <Button variant="outline">Annuler</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {!noShow.blacklisted && (
                          <Button variant="destructive" size="sm" className="gap-1">
                            <Ban className="w-3 h-3" />
                            Blacklister
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredNoShows.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun no-show trouvé pour cette date</p>
              <p className="text-sm">Excellente performance !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}