import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MessageSquare, CheckCircle, AlertTriangle, Timer, Send } from "lucide-react";
import { useKitchenCoordination } from "../../hooks/useKitchenCoordination";

export function KitchenCoordinationPanel() {
  const {
    kitchenOrders,
    messages,
    isLoading,
    updateOrderStatus,
    sendMessageToServer,
    markItemReady,
    requestServerAction
  } = useKitchenCoordination();

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [estimatedTime, setEstimatedTime] = useState<number>(15);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'in_progress': return 'bg-info';
      case 'ready': return 'bg-success';
      case 'served': return 'bg-muted';
      default: return 'bg-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'ready': return 'Prêt';
      case 'served': return 'Servi';
      default: return status;
    }
  };

  const handleSendMessage = async (orderId: string) => {
    if (!newMessage.trim()) return;
    
    await sendMessageToServer(orderId, newMessage, false);
    setNewMessage("");
  };

  const handleUrgentMessage = async (orderId: string, message: string) => {
    await sendMessageToServer(orderId, message, true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Colonne des commandes */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Commandes en cours ({kitchenOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : kitchenOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune commande en cuisine
              </div>
            ) : (
              kitchenOrders.map(order => (
                <Card 
                  key={order.id} 
                  className={`cursor-pointer transition-all ${
                    selectedOrder === order.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedOrder(order.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Table {order.table_number}</Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Serveur: {order.server_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.estimated_time && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {order.estimated_time}min
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Articles de la commande */}
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{item.quantity}x {item.product_name || 'Article'}</span>
                            {item.special_instructions && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ {item.special_instructions}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              markItemReady(order.id, item.id);
                            }}
                            className="ml-2"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                        <p className="text-sm text-yellow-800">
                          📝 {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions rapides */}
                    <div className="flex gap-2 mt-4">
                      <Select
                        value={order.status}
                        onValueChange={(status) => updateOrderStatus(order.id, status as any, estimatedTime)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="ready">Prêt</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder="Temps (min)"
                        value={estimatedTime}
                        onChange={(e) => setEstimatedTime(Number(e.target.value))}
                        className="w-24"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUrgentMessage(order.id, "Besoin du serveur urgence")}
                      >
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Colonne de communication */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.from_kitchen 
                      ? 'bg-blue-50 border-l-4 border-blue-400' 
                      : 'bg-green-50 border-l-4 border-green-400'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <Badge variant={message.is_urgent ? "destructive" : "secondary"}>
                      {message.from_kitchen ? 'Cuisine' : 'Serveur'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                </div>
              ))}
            </div>

            {selectedOrder && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Envoyer un message au serveur..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-20"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSendMessage(selectedOrder)}
                    disabled={!newMessage.trim()}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                </div>

                {/* Messages rapides prédéfinis */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Messages rapides:</p>
                  <div className="grid gap-2">
                    {[
                      "Commande prête dans 5 minutes",
                      "Ingrédient manquant, proposition alternative",
                      "Retard de 10 minutes",
                      "Table libre pour nettoyage"
                    ].map((quickMessage, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(selectedOrder)}
                        className="text-left justify-start h-auto p-2"
                      >
                        {quickMessage}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleUrgentMessage(selectedOrder || '', "Tous les serveurs : rush en cuisine")}
            >
              🔥 Alerte Rush
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleUrgentMessage(selectedOrder || '', "Rupture de stock - voir alternatives")}
            >
              📦 Rupture Stock
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleUrgentMessage(selectedOrder || '', "Nettoyage urgent nécessaire")}
            >
              🧹 Nettoyage Urgent
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}