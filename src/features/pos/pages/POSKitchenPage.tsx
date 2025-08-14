import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { ArrowLeft, Clock, ChefHat, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  server: string;
  items: KitchenItem[];
  priority: "normal" | "urgent";
  status: "pending" | "in_progress" | "ready" | "served";
  createdAt: string;
  estimatedTime: number; // minutes
}

interface KitchenItem {
  id: string;
  name: string;
  quantity: number;
  specialInstructions?: string;
  status: "pending" | "preparing" | "ready";
}

const mockOrders: KitchenOrder[] = [
  {
    id: "1",
    orderNumber: "POS-000001",
    tableNumber: "Table 5",
    server: "Marie",
    priority: "normal",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
    estimatedTime: 15,
    items: [
      { id: "1", name: "Poulet braisé", quantity: 2, status: "pending" },
      { id: "2", name: "Riz au gras", quantity: 1, status: "pending" },
      { id: "3", name: "Salade", quantity: 1, specialInstructions: "Sans oignon", status: "pending" },
    ]
  },
  {
    id: "2",
    orderNumber: "POS-000002",
    tableNumber: "Table 12",
    server: "Jean",
    priority: "urgent",
    status: "in_progress",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(), // 12 min ago
    estimatedTime: 20,
    items: [
      { id: "4", name: "Attiéké poisson", quantity: 3, status: "preparing" },
      { id: "5", name: "Alloco", quantity: 2, status: "ready" },
    ]
  },
  {
    id: "3",
    orderNumber: "POS-000003",
    tableNumber: "Table 3",
    server: "Paul",
    priority: "normal",
    status: "ready",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), // 25 min ago
    estimatedTime: 25,
    items: [
      { id: "6", name: "Thiéboudienne", quantity: 1, status: "ready" },
      { id: "7", name: "Bissap", quantity: 2, status: "ready" },
    ]
  },
];

export default function POSKitchenPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<KitchenOrder[]>(mockOrders);

  const getTimeElapsed = (createdAt: string) => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return elapsed;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "in_progress": return "bg-blue-500";
      case "ready": return "bg-green-500";
      case "served": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "urgent" ? "border-red-500 bg-red-50" : "";
  };

  const updateOrderStatus = (orderId: string, newStatus: KitchenOrder["status"]) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const updateItemStatus = (orderId: string, itemId: string, newStatus: KitchenItem["status"]) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? {
              ...order,
              items: order.items.map(item =>
                item.id === itemId ? { ...item, status: newStatus } : item
              )
            }
          : order
      )
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "in_progress": return "En cours";
      case "ready": return "Prêt";
      case "served": return "Servi";
      default: return status;
    }
  };

  const getItemStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "preparing": return "En préparation";
      case "ready": return "Prêt";
      default: return status;
    }
  };

  return (
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/pos")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ChefHat className="w-6 h-6" />
                Affichage Cuisine
              </h1>
              <p className="text-muted-foreground">
                Gestion des commandes en temps réel
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              {orders.filter(o => o.status !== "served").length} commandes actives
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders
            .filter(order => order.status !== "served")
            .sort((a, b) => {
              // Priority: urgent first, then by creation time
              if (a.priority === "urgent" && b.priority !== "urgent") return -1;
              if (a.priority !== "urgent" && b.priority === "urgent") return 1;
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            })
            .map(order => {
              const elapsed = getTimeElapsed(order.createdAt);
              const isOverdue = elapsed > order.estimatedTime;

              return (
                <Card 
                  key={order.id} 
                  className={`${getPriorityColor(order.priority)} ${isOverdue ? 'border-red-500' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <div className="flex items-center gap-2">
                        {order.priority === "urgent" && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{order.tableNumber} • Serveur: {order.server}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                          {elapsed}min {isOverdue && "(retard)"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.quantity}x</span>
                              <span>{item.name}</span>
                            </div>
                            {item.specialInstructions && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {getItemStatusLabel(item.status)}
                            </Badge>
                            {item.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemStatus(order.id, item.id, "preparing")}
                              >
                                Démarrer
                              </Button>
                            )}
                            {item.status === "preparing" && (
                              <Button
                                size="sm"
                                onClick={() => updateItemStatus(order.id, item.id, "ready")}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {order.status === "pending" && (
                        <Button
                          className="flex-1"
                          onClick={() => updateOrderStatus(order.id, "in_progress")}
                        >
                          Commencer
                        </Button>
                      )}
                      
                      {order.status === "in_progress" && 
                       order.items.every(item => item.status === "ready") && (
                        <Button
                          className="flex-1"
                          onClick={() => updateOrderStatus(order.id, "ready")}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marquer comme prêt
                        </Button>
                      )}
                      
                      {order.status === "ready" && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => updateOrderStatus(order.id, "served")}
                        >
                          Marquer comme servi
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Empty State */}
        {orders.filter(o => o.status !== "served").length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune commande en cours</h3>
              <p className="text-muted-foreground">
                Les nouvelles commandes apparaîtront ici automatiquement
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainAppLayout>
  );
}