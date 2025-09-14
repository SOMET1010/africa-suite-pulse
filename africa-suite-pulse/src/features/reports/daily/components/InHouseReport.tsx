import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Users, CreditCard, AlertTriangle, Download } from "lucide-react";
import { useInHouse } from "../hooks/useDailyReports";
import { Skeleton } from "@/components/ui/skeleton";

interface InHouseReportProps {
  selectedDate: string;
}

export function InHouseReport({ selectedDate }: InHouseReportProps) {
  const { data: inHouse, isLoading } = useInHouse(selectedDate);

  const stats = {
    totalGuests: inHouse?.length || 0,
    totalRevenue: inHouse?.reduce((sum, g) => sum + g.balance, 0) || 0,
    totalPax: inHouse?.reduce((sum, g) => sum + g.adults + g.children, 0) || 0,
    outstandingBalance: inHouse?.filter(g => g.balance > 0).length || 0,
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      'Direct': 'bg-primary/20 text-primary border-primary/30',
      'Booking.com': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
      'Expedia': 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
      'Agoda': 'bg-red-500/20 text-red-600 border-red-500/30',
    };

    return (
      <Badge variant="outline" className={colors[source] || 'bg-muted/20 text-muted-foreground border-muted/30'}>
        {source}
      </Badge>
    );
  };

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) {
      return <Badge variant="secondary">Soldé</Badge>;
    } else if (balance > 0) {
      return <Badge variant="destructive">À encaisser</Badge>;
    } else {
      return <Badge variant="outline">Crédit</Badge>;
    }
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
              <Building className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-luxury text-primary">{stats.totalGuests}</div>
            <p className="text-sm text-muted-foreground">Clients présents</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="text-2xl font-luxury text-accent-gold">{stats.totalPax}</div>
            <p className="text-sm text-muted-foreground">Personnes présentes</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-luxury text-success">
              {stats.totalRevenue.toLocaleString('fr-FR')} XOF
            </div>
            <p className="text-sm text-muted-foreground">CA en cours</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className={`w-6 h-6 ${stats.outstandingBalance > 0 ? 'text-warning' : 'text-success'}`} />
            </div>
            <div className={`text-2xl font-luxury ${stats.outstandingBalance > 0 ? 'text-warning' : 'text-success'}`}>
              {stats.outstandingBalance}
            </div>
            <p className="text-sm text-muted-foreground">Comptes ouverts</p>
          </CardContent>
        </Card>
      </div>

      {/* In-House List */}
      <Card className="glass-card border-accent-gold/20 shadow-luxury">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-luxury">Clients présents</CardTitle>
              <CardDescription>
                Clients en séjour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inHouse && inHouse.length > 0 ? (
            <div className="rounded-lg border border-accent-gold/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5">
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Chambre</TableHead>
                    <TableHead>Séjour</TableHead>
                    <TableHead>PAX</TableHead>
                    <TableHead>Folio</TableHead>
                    <TableHead>Solde</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inHouse.map((guest) => (
                    <TableRow key={guest.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        {guest.reference}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{guest.guestName}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{guest.roomNumber}</div>
                          <div className="text-sm text-muted-foreground">{guest.roomType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{guest.nights} nuit{guest.nights > 1 ? 's' : ''}</div>
                          <div className="text-muted-foreground">
                            {new Date(guest.arrivalDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - {new Date(guest.departureDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {guest.adults}A{guest.children > 0 && ` + ${guest.children}E`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-primary">{guest.folio}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${guest.balance > 0 ? 'text-warning' : guest.balance < 0 ? 'text-primary' : 'text-success'}`}>
                            {guest.balance.toLocaleString('fr-FR')} XOF
                          </span>
                          {getBalanceBadge(guest.balance)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(guest.source)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Voir folio
                          </Button>
                          {guest.balance > 0 && (
                            <Button variant="default" size="sm">
                              Paiement
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun client présent pour cette date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}