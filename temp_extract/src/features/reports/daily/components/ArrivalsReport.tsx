import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Building, Users, Clock, Download, Phone, Mail } from "lucide-react";
import { useArrivals } from "../hooks/useDailyReports";
import { Skeleton } from "@/components/ui/skeleton";

interface ArrivalsReportProps {
  selectedDate: string;
}

export function ArrivalsReport({ selectedDate }: ArrivalsReportProps) {
  const { data: arrivals, isLoading } = useArrivals(selectedDate);

  const stats = {
    total: arrivals?.length || 0,
    confirmed: arrivals?.filter(a => a.status === 'confirmed').length || 0,
    checkedIn: arrivals?.filter(a => a.status === 'checked_in').length || 0,
    vip: arrivals?.filter(a => a.vipStatus).length || 0,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'confirmed': 'default',
      'checked_in': 'secondary',
      'cancelled': 'destructive',
      'no_show': 'destructive',
    };
    
    const labels: Record<string, string> = {
      'confirmed': 'Confirmé',
      'checked_in': 'Arrivé',
      'cancelled': 'Annulé',
      'no_show': 'No-Show',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card border-accent-gold/20">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="glass-card border-accent-gold/20">
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-luxury text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total arrivées</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Building className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-luxury text-success">{stats.checkedIn}</div>
            <p className="text-sm text-muted-foreground">Déjà arrivés</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div className="text-2xl font-luxury text-warning">{stats.confirmed}</div>
            <p className="text-sm text-muted-foreground">En attente</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="text-2xl font-luxury text-accent-gold">{stats.vip}</div>
            <p className="text-sm text-muted-foreground">Clients VIP</p>
          </CardContent>
        </Card>
      </div>

      {/* Arrivals List */}
      <Card className="glass-card border-accent-gold/20 shadow-luxury">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-luxury">Liste des arrivées</CardTitle>
              <CardDescription>
                Clients prévus pour arriver le {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {arrivals && arrivals.length > 0 ? (
            <div className="rounded-lg border border-accent-gold/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5">
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Chambre</TableHead>
                    <TableHead>Heure prévue</TableHead>
                    <TableHead>PAX</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arrivals.map((arrival) => (
                    <TableRow key={arrival.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {arrival.vipStatus && (
                            <Badge variant="secondary" className="text-xs bg-accent-gold/20 text-accent-gold border-accent-gold/30">
                              VIP
                            </Badge>
                          )}
                          {arrival.reference}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{arrival.guestName}</div>
                          {arrival.company && (
                            <div className="text-sm text-muted-foreground">{arrival.company}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{arrival.roomNumber || 'Non assigné'}</div>
                          <div className="text-sm text-muted-foreground">{arrival.roomType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {arrival.arrivalTime ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {arrival.arrivalTime}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non spécifiée</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {arrival.adults}A{arrival.children > 0 && ` + ${arrival.children}E`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {arrival.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(arrival.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {arrival.guestPhone && (
                            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                              <Phone className="w-4 h-4" />
                            </Button>
                          )}
                          {arrival.guestEmail && (
                            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune arrivée prévue pour cette date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}