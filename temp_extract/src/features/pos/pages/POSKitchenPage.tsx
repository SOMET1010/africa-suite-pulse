import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MainAppLayout } from "@/core/layout/MainAppLayout";
import { ArrowLeft, Clock, ChefHat, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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

export default function POSKitchenPage() {
  const navigate = useNavigate();
  
  // Utiliser des données mockées pour l'instant (les tables POS n'existent pas encore)
  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ['pos-kitchen-orders'],
    queryFn: async () => {
      // Retourner des données mockées
      return [
        {
          id: "1",
          orderNumber: "POS-000001",
          tableNumber: "Table 5",
          server: "Marie",
          priority: "normal",
          status: "in_progress",
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
          estimatedTime: 15,
          items: [
            { id: "1", name: "Poulet braisé", quantity: 2, status: "preparing", specialInstructions: "" },
            { id: "2", name: "Riz au gras", quantity: 1, status: "ready", specialInstructions: "Sans piment" },
          ]
        },
        {
          id: "2",
          orderNumber: "POS-000002",
          tableNumber: "Table 3",
          server: "Jean",
          priority: "urgent",
          status: "ready",
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
          estimatedTime: 20,
          items: [
            { id: "3", name: "Attiéké poisson", quantity: 1, status: "ready", specialInstructions: "Bien épicé" },
          ]
        }
      ] as KitchenOrder[];
    },
    refetchInterval: 30000
  });
   
  const [localOrders, setLocalOrders] = useState<KitchenOrder[]>([]);
  
  // Utiliser allOrders au lieu de orders pour éviter les conflits de type
  const orders = allOrders;

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

  const updateOrderStatus = async (orderId: string, newStatus: KitchenOrder["status"]) => {
    try {
      // Simulation - en réalité cela mettrait à jour Supabase
      logger.info('Updating order status', { orderId, newStatus });
      // TODO: Implement actual order status update
    } catch (error) {
      logger.error('Failed to update order status', error);
    }
  };

  const updateItemStatus = (orderId: string, itemId: string, newStatus: string) => {
    try {
      logger.info('Updating item status', { orderId, itemId, newStatus });
      // TODO: Implement actual item status update
    } catch (error) {
      logger.error('Failed to update item status', error);
    }
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
              {isLoading ? 'Chargement...' : `${orders.filter(o => o.status !== "served").length} commandes actives`}
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
        {!isLoading && orders.filter(o => o.status !== "served").length === 0 && (
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