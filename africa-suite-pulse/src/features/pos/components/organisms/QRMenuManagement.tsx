import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, Printer, Eye, CheckCircle, X, Phone, Clock } from "lucide-react";
import { useQRCodeMenu } from "../../hooks/useQRCodeMenu";

interface QRMenuManagementProps {
  tables: Array<{id: string, number: string}>;
  outletId: string;
}

export function QRMenuManagement({ tables, outletId }: QRMenuManagementProps) {
  const {
    qrConfigs,
    clientOrders,
    isGenerating,
    generateQRCodeForTable,
    generateQRForAllTables,
    printQRCode,
    validateClientOrder,
    rejectClientOrder,
    getQRCodeForTable,
    getPendingClientOrders
  } = useQRCodeMenu();

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const pendingOrders = getPendingClientOrders();

  const handleGenerateAll = () => {
    generateQRForAllTables(tables, outletId);
  };

  const handlePreviewMenu = (tableId: string) => {
    const config = getQRCodeForTable(tableId);
    if (config) {
      setPreviewUrl(config.menu_url);
    }
  };

  const formatOrderTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getOrderValue = (order: any) => {
    return order.total_amount.toLocaleString('fr-FR') + ' FCFA';
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions globales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Gestion QR Codes & Commandes Clients
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerateAll} disabled={isGenerating}>
                {isGenerating ? 'Génération...' : 'Générer tous les QR'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{qrConfigs.length}</div>
              <div className="text-sm text-muted-foreground">QR Codes actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{pendingOrders.length}</div>
              <div className="text-sm text-muted-foreground">Commandes en attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {clientOrders.filter(o => o.status === 'validated').length}
              </div>
              <div className="text-sm text-muted-foreground">Commandes validées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{tables.length}</div>
              <div className="text-sm text-muted-foreground">Tables totales</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestion des QR Codes par table */}
        <Card>
          <CardHeader>
            <CardTitle>QR Codes par Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {tables.map(table => {
                const qrConfig = getQRCodeForTable(table.id);
                return (
                  <div key={table.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">Table {table.number}</div>
                      {qrConfig ? (
                        <Badge variant="success">QR Actif</Badge>
                      ) : (
                        <Badge variant="secondary">Aucun QR</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {qrConfig ? (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>QR Code - Table {table.number}</DialogTitle>
                              </DialogHeader>
                              <div className="text-center space-y-4">
                                <img 
                                  src={qrConfig.qr_code_data} 
                                  alt="QR Code" 
                                  className="mx-auto border rounded-lg"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Les clients peuvent scanner ce code pour accéder au menu
                                </p>
                                <Button 
                                  onClick={() => handlePreviewMenu(table.id)}
                                  variant="outline"
                                >
                                  Prévisualiser le menu
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => printQRCode(table.id)}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => generateQRCodeForTable(table.id, table.number, outletId)}
                          disabled={isGenerating}
                        >
                          Générer QR
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Commandes clients en attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Commandes Clients en Attente
              {pendingOrders.length > 0 && (
                <Badge variant="warning">{pendingOrders.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune commande client en attente
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map(order => (
                  <Card key={order.id} className="border-l-4 border-l-warning">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              Table {tables.find(t => t.id === order.table_id)?.number}
                            </Badge>
                            <Badge variant="warning">En attente</Badge>
                          </div>
                          {order.customer_name && (
                            <p className="font-medium">{order.customer_name}</p>
                          )}
                          {order.customer_phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.customer_phone}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {getOrderValue(order)}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatOrderTime(order.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Articles commandés */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start p-2 bg-muted/50 rounded">
                            <div className="flex-1">
                              <div className="font-medium">
                                {item.quantity}x {item.product_name}
                              </div>
                              {item.accompaniments && item.accompaniments.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Avec: {item.accompaniments.join(', ')}
                                </div>
                              )}
                              {item.special_instructions && (
                                <div className="text-xs text-orange-600 mt-1">
                                  📝 {item.special_instructions}
                                </div>
                              )}
                            </div>
                            <div className="text-right text-sm font-medium">
                              {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => validateClientOrder(order.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Valider & Envoyer
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectClientOrder(order.id, "Commande rejetée par le serveur")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prévisualisation du menu (Dialog) */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl("")}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Prévisualisation du Menu Digital</DialogTitle>
            </DialogHeader>
            <iframe 
              src={previewUrl} 
              className="w-full h-full border rounded-lg"
              title="Prévisualisation du menu"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}