import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, Shield, Clock, Hash, FileCheck } from "lucide-react";
import { useFiscalEvents, useDailyClosuresZ, useVerifyFiscalChain, useCreateClosureZ } from "../hooks/useFiscalJournal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function FiscalJournalViewer() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [verificationDate, setVerificationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const { data: fiscalEvents, isLoading: loadingEvents } = useFiscalEvents(selectedDate);
  const { data: closures, isLoading: loadingClosures } = useDailyClosuresZ();
  const verifyChainMutation = useVerifyFiscalChain();
  const createClosureMutation = useCreateClosureZ();

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'SALE_LINE': return 'bg-primary/10 text-primary border-primary/20';
      case 'PAYMENT': return 'bg-success/10 text-success border-success/20';
      case 'DISCOUNT': return 'bg-warning/10 text-warning border-warning/20';
      case 'REFUND': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'VOID': return 'bg-muted/10 text-muted-foreground border-muted/20';
      case 'Z_CLOSURE': return 'bg-info/10 text-info border-info/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const handleVerifyChain = () => {
    verifyChainMutation.mutate(verificationDate);
  };

  const handleCreateClosure = () => {
    createClosureMutation.mutate({
      posStationId: 'POS-01',
      cashierId: 'current-user', // À remplacer par l'ID du caissier actuel
      closureData: {
        closure_type: 'daily_z',
        created_by: 'system',
        verification_method: 'automatic'
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Journal Fiscal ISCA
          </CardTitle>
          <CardDescription>
            Événements immutables avec chaînage cryptographique SHA-256 et signatures numériques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="date-select">Date de consultation</Label>
              <Input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              variant="outline"
            >
              Aujourd'hui
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="verify-date">Vérifier l'intégrité</Label>
              <Input
                id="verify-date"
                type="date"
                value={verificationDate}
                onChange={(e) => setVerificationDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleVerifyChain}
              disabled={verifyChainMutation.isPending}
              variant="outline"
              className="self-end"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Vérifier
            </Button>
            <Button
              onClick={handleCreateClosure}
              disabled={createClosureMutation.isPending}
              className="self-end"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Clôture Z
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">Événements Fiscaux</TabsTrigger>
          <TabsTrigger value="closures">Clôtures Z</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Événements du {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
              </CardTitle>
              {fiscalEvents && (
                <CardDescription>
                  {fiscalEvents.length} événement(s) dans la chaîne fiscale
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loadingEvents ? (
                <div className="text-center py-8">Chargement des événements...</div>
              ) : fiscalEvents && fiscalEvents.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Séq.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Référence</TableHead>
                        <TableHead>Horodatage</TableHead>
                        <TableHead>Hash</TableHead>
                        <TableHead>Signature</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fiscalEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-mono">
                            {event.sequence_number}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEventTypeColor(event.event_type)}>
                              {event.event_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {event.reference_type}:{event.reference_id.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.event_timestamp), 'HH:mm:ss')}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {event.event_hash.slice(0, 12)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {event.signature_algorithm}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun événement fiscal pour cette date
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Clôtures Z Scellées
              </CardTitle>
              <CardDescription>
                Clôtures quotidiennes avec signature PKI et scellement cryptographique
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClosures ? (
                <div className="text-center py-8">Chargement des clôtures...</div>
              ) : closures && closures.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Ventes</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Scellé</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {closures.map((closure) => (
                        <TableRow key={closure.id}>
                          <TableCell>
                            {format(new Date(closure.closure_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell className="font-mono">
                            {closure.pos_station_id}
                          </TableCell>
                          <TableCell>
                            <div className="text-right">
                              <div className="font-medium">
                                {closure.total_sales_amount.toLocaleString('fr-FR', {
                                  style: 'currency',
                                  currency: 'XOF'
                                })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                TVA: {closure.total_tax_amount.toLocaleString('fr-FR', {
                                  style: 'currency',
                                  currency: 'XOF'
                                })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {closure.total_transactions_count}
                          </TableCell>
                          <TableCell>
                            <Badge className={getComplianceStatusColor(closure.compliance_status)}>
                              {closure.compliance_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {closure.is_sealed ? (
                              <Badge className="bg-success/10 text-success border-success/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Scellé
                              </Badge>
                            ) : (
                              <Badge className="bg-warning/10 text-warning border-warning/20">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Ouvert
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune clôture Z disponible
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}