import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, AlertTriangle, CheckCircle, CreditCard, Download } from "lucide-react";
import { useDepartures } from "../hooks/useDailyReports";
import { Skeleton } from "@/components/ui/skeleton";

interface DeparturesReportProps {
  selectedDate: string;
}

export function DeparturesReport({ selectedDate }: DeparturesReportProps) {
  const { data: departures, isLoading } = useDepartures(selectedDate);

  const stats = {
    total: departures?.length || 0,
    checkedOut: departures?.filter(d => d.status === 'checked_out').length || 0,
    pending: departures?.filter(d => d.status === 'checked_in').length || 0,
    totalRevenue: departures?.reduce((sum, d) => sum + d.totalAmount, 0) || 0,
    outstandingBalance: departures?.reduce((sum, d) => sum + d.balanceDue, 0) || 0,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'checked_out': 'secondary',
      'checked_in': 'default',
      'cancelled': 'destructive',
    };
    
    const labels: Record<string, string> = {
      'checked_out': 'Parti',
      'checked_in': 'En attente',
      'cancelled': 'Annulé',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getBalanceBadge = (balance: number) => {
    if (balance === 0) {
      return <Badge variant="secondary" className="gap-1"><CheckCircle className="w-3 h-3" />Soldé</Badge>;
    } else if (balance > 0) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Impayé</Badge>;
    } else {
      return <Badge variant="outline" className="gap-1">Crédit</Badge>;
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
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="text-2xl font-luxury text-primary">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total départs</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div className="text-2xl font-luxury text-success">{stats.checkedOut}</div>
            <p className="text-sm text-muted-foreground">Déjà partis</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="text-2xl font-luxury text-accent-gold">
              {stats.totalRevenue.toLocaleString('fr-FR')} XOF
            </div>
            <p className="text-sm text-muted-foreground">CA total</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-accent-gold/20 shadow-luxury">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className={`w-6 h-6 ${stats.outstandingBalance > 0 ? 'text-destructive' : 'text-success'}`} />
            </div>
            <div className={`text-2xl font-luxury ${stats.outstandingBalance > 0 ? 'text-destructive' : 'text-success'}`}>
              {stats.outstandingBalance.toLocaleString('fr-FR')} XOF
            </div>
            <p className="text-sm text-muted-foreground">Impayés</p>
          </CardContent>
        </Card>
      </div>

      {/* Departures List */}
      <Card className="glass-card border-accent-gold/20 shadow-luxury">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-luxury">Liste des départs</CardTitle>
              <CardDescription>
                Clients prévus pour partir le {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {departures && departures.length > 0 ? (
            <div className="rounded-lg border border-accent-gold/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5">
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Chambre</TableHead>
                    <TableHead>Séjour</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Payé</TableHead>
                    <TableHead>Solde</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departures.map((departure) => (
                    <TableRow key={departure.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        <div>
                          <div>{departure.reference}</div>
                          <div className="text-sm text-muted-foreground">{departure.folio}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{departure.guestName}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{departure.roomNumber}</div>
                          <div className="text-sm text-muted-foreground">{departure.roomType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{departure.nights} nuit{departure.nights > 1 ? 's' : ''}</div>
                          <div className="text-muted-foreground">
                            {departure.adults}A{departure.children > 0 && ` + ${departure.children}E`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {departure.totalAmount.toLocaleString('fr-FR')} XOF
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-success">
                          {departure.paidAmount.toLocaleString('fr-FR')} XOF
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${departure.balanceDue > 0 ? 'text-destructive' : departure.balanceDue < 0 ? 'text-primary' : 'text-success'}`}>
                            {departure.balanceDue.toLocaleString('fr-FR')} XOF
                          </span>
                          {getBalanceBadge(departure.balanceDue)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(departure.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Voir facture
                          </Button>
                          {departure.balanceDue > 0 && (
                            <Button variant="default" size="sm">
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun départ prévu pour cette date</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}