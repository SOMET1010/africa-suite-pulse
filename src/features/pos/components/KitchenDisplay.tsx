import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, ChefHat, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface KitchenOrder {
  id: string;
  order_number: string;
  table_number?: string;
  status: 'sent' | 'preparing' | 'ready' | 'served';
  created_at: string;
  customer_count?: number;
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'room_service';
  special_requests?: string;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    status: 'pending' | 'preparing' | 'ready' | 'served';
    special_instructions?: string;
    preparation_time?: number;
  }[];
}

export function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    setupRealtimeSubscription();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('pos_orders')
      .select(`
        *,
        pos_order_items (
          id,
          product_name,
          quantity,
          status,
          special_instructions
        ),
        pos_tables (
          table_number
        )
      `)
      .in('status', ['sent', 'preparing', 'ready'])
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
      return;
    }

    setOrders(data as any);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pos_orders' },
        () => fetchOrders()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pos_order_items' },
        () => fetchOrders()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('pos_orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    const { error } = await supabase
      .from('pos_order_items')
      .update({ status })
      .eq('id', itemId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'dine_in': return '🍽️';
      case 'takeaway': return '🥡';
      case 'delivery': return '🚚';
      case 'room_service': return '🏨';
      default: return '📋';
    }
  };

  const filterOrders = (status?: string) => {
    if (!status || status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const getTimeElapsed = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes}min`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Cuisine</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {orders.length} commande(s) active(s)
            </Badge>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes ({orders.length})</TabsTrigger>
            <TabsTrigger value="sent">
              Nouvelles ({filterOrders('sent').length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              En préparation ({filterOrders('preparing').length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Prêtes ({filterOrders('ready').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterOrders(selectedTab === 'all' ? undefined : selectedTab).map((order) => (
                <Card key={order.id} className="border-l-4" style={{borderLeftColor: getStatusColor(order.status).replace('bg-', '#')}}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{getOrderTypeIcon(order.order_type)}</span>
                        {order.order_number}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-white", getStatusColor(order.status))}>
                          {order.status === 'sent' && 'Nouvelle'}
                          {order.status === 'preparing' && 'En cours'}
                          {order.status === 'ready' && 'Prête'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {order.table_number && (
                          <span>Table {order.table_number}</span>
                        )}
                        {order.customer_count && (
                          <span>{order.customer_count} pers.</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeElapsed(order.created_at)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.quantity}x</span>
                              <span>{item.product_name}</span>
                            </div>
                            {item.special_instructions && (
                              <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {item.special_instructions}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={item.status === 'ready' ? 'default' : 'outline'}
                            onClick={() => updateItemStatus(
                              item.id, 
                              item.status === 'ready' ? 'pending' : 'ready'
                            )}
                          >
                            {item.status === 'ready' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              'Prêt'
                            )}
                          </Button>
                        </div>
                      ))}

                      {order.special_requests && (
                        <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-sm text-orange-800">
                            <strong>Demandes spéciales:</strong> {order.special_requests}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {order.status === 'sent' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1"
                          >
                            Commencer
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="flex-1"
                          >
                            Prêt
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            variant="outline"
                            className="flex-1"
                          >
                            Servie
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filterOrders(selectedTab === 'all' ? undefined : selectedTab).length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Aucune commande {selectedTab !== 'all' && selectedTab}
            </h3>
            <p className="text-muted-foreground">
              Les nouvelles commandes apparaîtront ici automatiquement
            </p>
          </div>
        )}
      </div>
    </div>
  );
}