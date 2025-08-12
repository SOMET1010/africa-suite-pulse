
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Pause, 
  Play, 
  Clock, 
  Users, 
  Search,
  MoreVertical,
  Copy,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface HeldOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_code: string;
  special_instructions?: string;
}

interface HeldOrder {
  id: string;
  order_number: string;
  table_number?: string;
  customer_count: number;
  total_amount: number;
  items: HeldOrderItem[];
  held_at: Date;
  hold_reason?: string;
  notes?: string;
}

interface OrderHoldManagerProps {
  currentOrder: {
    items: Array<{
      id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    tableNumber?: string;
    customerCount: number;
    total: number;
  } | null;
  onHoldOrder: () => void;
  onResumeOrder: (order: HeldOrder) => void;
  outletId: string;
}

export function OrderHoldManager({ 
  currentOrder, 
  onHoldOrder, 
  onResumeOrder, 
  outletId 
}: OrderHoldManagerProps) {
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<HeldOrder | null>(null);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchHeldOrders();
  }, [outletId]);

  const fetchHeldOrders = async () => {
    const { data, error } = await supabase
      .from('pos_orders')
      .select(`
        *,
        pos_order_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          special_instructions
        )
      `)
      .eq('status', 'hold')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching held orders:', error);
      return;
    }

    const orders: HeldOrder[] = data.map(order => ({
      id: order.id,
      order_number: order.order_number,
      table_number: order.table_id,
      customer_count: order.customer_count || 1,
      total_amount: order.total_amount,
      items: (order.pos_order_items || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        product_name: `Product ${item.product_id}`, // We'll need to join with products table later
        product_code: `CODE-${item.product_id}`,
        special_instructions: item.special_instructions
      })),
      held_at: new Date(order.created_at),
      hold_reason: order.kitchen_notes,
      notes: order.kitchen_notes || ''
    }));

    setHeldOrders(orders);
  };

  const holdCurrentOrder = async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune commande à mettre en attente",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create held order in database
      const { data: order, error: orderError } = await supabase
        .from('pos_orders')
        .insert({
          org_id: (await supabase.rpc("get_current_user_org_id")).data,
          order_number: `HOLD-${Date.now()}`,
          table_id: currentOrder.tableNumber,
          customer_count: currentOrder.customerCount,
          status: 'hold',
          order_type: 'dine_in',
          subtotal: currentOrder.total,
          total_amount: currentOrder.total,
          notes: holdReason,
          tax_amount: 0,
          discount_amount: 0
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = currentOrder.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        status: 'pending'
      }));

      const { error: itemsError } = await supabase
        .from('pos_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Commande mise en attente",
        description: `Commande ${order.order_number} sauvegardée`
      });

      setIsHoldDialogOpen(false);
      setHoldReason("");
      onHoldOrder();
      fetchHeldOrders();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre la commande en attente",
        variant: "destructive"
      });
    }
  };

  const resumeOrder = async (order: HeldOrder) => {
    try {
      // Update order status to draft to resume editing
      const { error } = await supabase
        .from('pos_orders')
        .update({ status: 'draft' })
        .eq('id', order.id);

      if (error) throw error;

      onResumeOrder(order);
      fetchHeldOrders();

      toast({
        title: "Commande reprise",
        description: `Commande ${order.order_number} remise en cours`
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de reprendre la commande",
        variant: "destructive"
      });
    }
  };

  const deleteHeldOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('pos_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setHeldOrders(heldOrders.filter(o => o.id !== orderId));
      
      toast({
        title: "Commande supprimée",
        description: "La commande en attente a été supprimée"
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la commande",
        variant: "destructive"
      });
    }
  };

  const duplicateOrder = (order: HeldOrder) => {
    const duplicatedOrder: HeldOrder = {
      ...order,
      id: `dup-${Date.now()}`,
      order_number: `DUP-${order.order_number}`,
      held_at: new Date()
    };
    
    onResumeOrder(duplicatedOrder);
    
    toast({
      title: "Commande dupliquée",
      description: "La commande a été dupliquée et mise en cours"
    });
  };

  const filteredOrders = heldOrders.filter(order =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.table_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatElapsedTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? `${minutes}min` : ''}`;
  };

  return (
    <div className="space-y-4">
      {/* Current Order Actions */}
      {currentOrder && currentOrder.items.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pause className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-base">Commande en cours</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHoldDialogOpen(true)}
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Mettre en attente
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span>{currentOrder.items.length} article{currentOrder.items.length !== 1 ? 's' : ''}</span>
              <span className="font-medium">{currentOrder.total.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Held Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Commandes en attente</h3>
            <Badge variant="secondary">{heldOrders.length}</Badge>
          </div>
          
          {heldOrders.length > 0 && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une commande..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Pause className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">Aucune commande en attente</h4>
              <p className="text-muted-foreground text-center">
                Les commandes mises en attente apparaîtront ici et pourront être reprises à tout moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-lg">
                        <Clock className="h-5 w-5" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.order_number}</span>
                          {order.table_number && (
                            <Badge variant="outline">Table {order.table_number}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {order.customer_count} pers.
                          </span>
                          <span>{order.items.length} articles</span>
                          <span>{formatElapsedTime(order.held_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {order.total_amount.toLocaleString()} FCFA
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => resumeOrder(order)}
                          className="gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Reprendre
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hold Order Dialog */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mettre la commande en attente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Raison (optionnel)</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Client parti téléphoner, attente d'autres invités..."
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsHoldDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={holdCurrentOrder}>
                Mettre en attente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Table:</span>
                  <span>{selectedOrder.table_number || 'Non assignée'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Couverts:</span>
                  <span>{selectedOrder.customer_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mise en attente:</span>
                  <span>{format(selectedOrder.held_at, 'HH:mm', { locale: fr })}</span>
                </div>
              </div>

              {selectedOrder.hold_reason && (
                <div>
                  <Label>Raison:</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.hold_reason}
                  </p>
                </div>
              )}

              <div>
                <Label>Articles ({selectedOrder.items.length}):</Label>
                <div className="space-y-1 mt-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span>{item.total_price.toLocaleString()} F</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{selectedOrder.total_amount.toLocaleString()} FCFA</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => duplicateOrder(selectedOrder)}
                  className="flex-1 gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Dupliquer
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteHeldOrder(selectedOrder.id);
                    setIsViewDialogOpen(false);
                  }}
                  className="flex-1 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </div>

              <Button
                onClick={() => {
                  resumeOrder(selectedOrder);
                  setIsViewDialogOpen(false);
                }}
                className="w-full gap-2"
              >
                <Play className="h-4 w-4" />
                Reprendre la commande
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
