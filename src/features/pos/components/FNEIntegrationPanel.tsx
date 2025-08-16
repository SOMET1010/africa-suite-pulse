import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, AlertTriangle, CheckCircle, Clock, QrCode } from "lucide-react";
import { useFNEIntegration } from "../hooks/useFNEIntegration";
import { FNEStatusBadge } from "./FNEStatusBadge";
import { FNEQRCode } from "./FNEQRCode";

export const FNEIntegrationPanel = () => {
  const orgId = "7e389008-3dd1-4f54-816d-4f1daff1f435"; // TODO: Récupérer l'org_id du contexte
  
  const {
    fneOrders,
    pendingInvoices,
    apiLogs,
    stats,
    isLoading,
    processPending,
    isProcessing,
  } = useFNEIntegration(orgId);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("fr-FR");
  };

  return (
    <div className="space-y-6">
      {/* En-tête et statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Factures</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_invoices}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Succès</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successful_invoices} validées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_invoices}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => processPending()}
              disabled={isProcessing}
              className="mt-2"
            >
              {isProcessing ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Traiter
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps Réponse</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.average_response_time)}ms</div>
            <p className="text-xs text-muted-foreground">
              Moyenne API DGI
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Factures FNE</TabsTrigger>
          <TabsTrigger value="pending">Queue Offline</TabsTrigger>
          <TabsTrigger value="logs">Logs API</TabsTrigger>
        </TabsList>

        {/* Factures FNE */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Factures FNE</CardTitle>
              <CardDescription>
                Statut des factures transmises à la DGI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>ID FNE</TableHead>
                      <TableHead>Référence DGI</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Soumise</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fneOrders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          <FNEStatusBadge status={order.fne_status} />
                        </TableCell>
                        <TableCell>
                          {order.fne_invoice_id ? (
                            <code className="text-xs bg-muted px-1 rounded">
                              {order.fne_invoice_id}
                            </code>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {order.fne_reference_number ? (
                            <code className="text-xs bg-muted px-1 rounded">
                              {order.fne_reference_number}
                            </code>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          {order.total_amount?.toLocaleString("fr-FR")} FCFA
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(order.fne_submitted_at)}
                        </TableCell>
                        <TableCell>
                          {order.fne_qr_code && order.fne_invoice_id && order.fne_reference_number && (
                            <FNEQRCode
                              qrCode={order.fne_qr_code}
                              invoiceId={order.fne_invoice_id}
                              referenceNumber={order.fne_reference_number}
                              orderNumber={order.order_number}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue Offline */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Queue Offline</CardTitle>
              <CardDescription>
                Factures en attente de traitement (échecs et retry)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commande</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Tentatives</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Prochain Retry</TableHead>
                      <TableHead>Erreur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvoices?.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.order_id}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={invoice.status === 'pending' ? 'secondary' : 
                                   invoice.status === 'processing' ? 'default' : 'destructive'}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.retry_count} / {invoice.max_retries}
                        </TableCell>
                        <TableCell>
                          <Badge variant={invoice.priority > 1 ? 'destructive' : 'secondary'}>
                            {invoice.priority === 1 ? 'Normal' : 
                             invoice.priority === 2 ? 'Élevée' : 'Urgente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(invoice.next_retry_at)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-red-600">
                          {invoice.last_error_message || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs API */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs API DGI</CardTitle>
              <CardDescription>
                Historique des échanges avec l'API DGI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Heure</TableHead>
                      <TableHead>Opération</TableHead>
                      <TableHead>Commande</TableHead>
                      <TableHead>Succès</TableHead>
                      <TableHead>Temps</TableHead>
                      <TableHead>ID FNE</TableHead>
                      <TableHead>Erreur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">
                          {formatDateTime(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.operation_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.order_id || "N/A"}
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {log.response_time_ms ? `${log.response_time_ms}ms` : "N/A"}
                        </TableCell>
                        <TableCell>
                          {log.fne_invoice_id ? (
                            <code className="text-xs bg-muted px-1 rounded">
                              {log.fne_invoice_id}
                            </code>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-red-600">
                          {log.error_message || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};