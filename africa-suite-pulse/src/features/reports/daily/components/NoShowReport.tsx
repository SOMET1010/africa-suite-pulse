import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserX, AlertTriangle, CreditCard, TrendingDown, Download } from "lucide-react";
import { useNoShows } from "../hooks/useDailyReports";
import { Skeleton } from "@/components/ui/skeleton";

interface NoShowReportProps {
  selectedDate: string;
}

export function NoShowReport({ selectedDate }: NoShowReportProps) {
  const { data: noShows, isLoading } = useNoShows(selectedDate);

  const stats = {
    totalNoShows: noShows?.length || 0,
    lostRevenue: noShows?.reduce((sum, ns) => sum + ns.totalAmount, 0) || 0,
    totalDeposits: noShows?.reduce((sum, ns) => sum + ns.depositPaid, 0) || 0,
    potentialPenalties: noShows?.reduce((sum, ns) => sum + ns.penaltyAmount, 0) || 0,
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
              <UserX className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-2xl font-luxury text-destructive">{stats.totalNoShows}</div>
            <p className="text-sm text-muted-foreground">No-Shows</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div className="text-2xl font-luxury text-destructive">
              {stats.lostRevenue.toLocaleString('fr-FR')} XOF
            </div>
            <p className="text-sm text-muted-foreground">CA perdu</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-luxury text-success">
              {stats.totalDeposits.toLocaleString('fr-FR')} XOF
            </div>
            <p className="text-sm text-muted-foreground">Arrhes encaissées</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div className="text-2xl font-luxury text-warning">
              {stats.potentialPenalties.toLocaleString('fr-FR')} XOF
            </div>
            <p className="text-sm text-muted-foreground">Pénalités dues</p>
          </CardContent>
        </Card>
      </div>

      {/* No-Shows List */}
      <Card className="glass-card border-accent-gold/20 shadow-luxury">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-luxury">Liste des No-Shows</CardTitle>
              <CardDescription>
                Réservations non honorées pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {noShows && noShows.length > 0 ? (
            <div className="rounded-lg border border-accent-gold/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5">
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type chambre</TableHead>
                    <TableHead>Arrivée prévue</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Acompte</TableHead>
                    <TableHead>Pénalité</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noShows.map((noShow) => (
                    <TableRow key={noShow.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        <div>
                          <div>{noShow.reference}</div>
                          {noShow.cancellationCode && (
                            <div className="text-sm text-muted-foreground">
                              Code: {noShow.cancellationCode}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{noShow.guestName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{noShow.roomType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(noShow.expectedArrival).toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getSourceBadge(noShow.source)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-destructive">
                          {noShow.totalAmount.toLocaleString('fr-FR')} XOF
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${noShow.depositPaid > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                          {noShow.depositPaid.toLocaleString('fr-FR')} XOF
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-medium ${noShow.penaltyAmount > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {noShow.penaltyAmount.toLocaleString('fr-FR')} XOF
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Voir détails
                          </Button>
                          <Button variant="destructive" size="sm">
                            Appliquer pénalité
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun No-Show pour cette date</p>
              <p className="text-sm mt-2">C'est une excellente nouvelle ! 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      {noShows && noShows.length > 0 && (
        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardHeader>
            <CardTitle className="font-luxury">Actions recommandées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning">Suivi des No-Shows</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contactez les clients pour comprendre les raisons du No-Show et appliquez les pénalités selon vos conditions générales.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">Gestion des acomptes</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Les acomptes peuvent être conservés selon votre politique d'annulation. Vérifiez les conditions de chaque réservation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}