import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { POSOrder, POSOrderItem, POSTable, POSOutlet, CartItem } from "../types";
import { useCreateFiscalEvent } from "./useFiscalJournal";

interface OrderState {
  currentOrder: POSOrder | null;
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
}

interface POSOrderStateProps {
  selectedOutlet: POSOutlet | null;
  selectedTable: POSTable | null;
}

export function usePOSOrderState({ selectedOutlet, selectedTable }: POSOrderStateProps) {
  const [orderState, setOrderState] = useState<OrderState>({
    currentOrder: null,
    cartItems: [],
    isLoading: false,
    error: null
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createFiscalEventMutation = useCreateFiscalEvent();

  // Récupérer la commande active pour la table
  const { data: existingOrder, isLoading: loadingOrder } = useQuery({
    queryKey: ["active-order", selectedTable?.id],
    queryFn: async () => {
      if (!selectedTable?.id || !selectedOutlet?.id) return null;
      
      const { data, error } = await supabase
        .from("pos_orders")
        .select(`
          *,
          pos_order_items(
            *,
            pos_products(*)
          )
        `)
        .eq("table_id", selectedTable.id)
        .in("status", ["draft", "sent", "preparing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedTable?.id && !!selectedOutlet?.id,
    refetchInterval: 30000, // Refresh every 30s
  });

  // Créer une nouvelle commande
  const createOrderMutation = useMutation({
    mutationFn: async (params: { customerCount: number }) => {
      if (!selectedOutlet || !selectedTable) {
        throw new Error("Outlet et table requis");
      }

      const { data, error } = await supabase
        .from("pos_orders")
        .insert({
          org_id: selectedOutlet.org_id,
          order_number: `POS-${Date.now()}`,
          table_id: selectedTable.id,
          customer_count: params.customerCount,
          order_type: selectedTable ? "dine_in" : "takeaway",
          status: "draft",
          subtotal: 0,
          tax_amount: 0,
          total_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as POSOrder;
    },
    onSuccess: (newOrder) => {
      setOrderState(prev => ({
        ...prev,
        currentOrder: newOrder,
        cartItems: []
      }));
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      
      // Créer un événement fiscal pour la nouvelle commande
      createFiscalEventMutation.mutate({
        eventType: 'SALE_LINE',
        referenceType: 'order',
        referenceId: newOrder.id,
        eventData: {
          order_number: newOrder.order_number,
          table_id: newOrder.table_id,
          customer_count: newOrder.customer_count,
          action: 'order_created'
        },
        posStationId: 'POS-01'
      });
      
      toast({
        title: "Nouvelle commande",
        description: `Commande ${newOrder.order_number} créée`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la commande",
        variant: "destructive",
      });
    }
  });

  // Ajouter un article à la commande
  const addItemMutation = useMutation({
    mutationFn: async (params: {
      productId: string;
      productName: string;
      productCode: string;
      quantity: number;
      unitPrice: number;
      specialInstructions?: string;
    }) => {
      const currentOrderId = orderState.currentOrder?.id;
      if (!currentOrderId) {
        throw new Error("Aucune commande active");
      }

      const { data, error } = await supabase
        .from("pos_order_items")
        .insert({
          order_id: currentOrderId,
          product_id: params.productId,
          product_name: params.productName,
          product_code: params.productCode,
          quantity: params.quantity,
          unit_price: params.unitPrice,
          total_price: params.quantity * params.unitPrice,
          special_instructions: params.specialInstructions,
          status: "pending",
        })
        .select(`
          *,
          pos_products(*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newItem) => {
      // Créer un événement fiscal pour l'ajout d'article
      createFiscalEventMutation.mutate({
        eventType: 'SALE_LINE',
        referenceType: 'order_item',
        referenceId: newItem.id,
        eventData: {
          product_id: newItem.product_id,
          quantity: newItem.quantity,
          unit_price: newItem.unit_price,
          total_price: newItem.total_price,
          action: 'item_added'
        },
        posStationId: 'POS-01'
      });
      
      // Rafraîchir les données depuis la DB
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      toast({
        title: "Article ajouté",
        description: `Article ajouté à la commande`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'article",
        variant: "destructive",
      });
    }
  });

  // Mettre à jour la quantité d'un article
  const updateItemMutation = useMutation({
    mutationFn: async (params: { itemId: string; quantity: number; unitPrice: number }) => {
      const { data, error } = await supabase
        .from("pos_order_items")
        .update({
          quantity: params.quantity,
          total_price: params.quantity * params.unitPrice,
        })
        .eq("id", params.itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      toast({
        title: "Quantité mise à jour",
        description: "L'article a été modifié",
      });
    }
  });

  // Supprimer un article
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("pos_order_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      toast({
        title: "Article supprimé",
        description: "L'article a été retiré de la commande",
      });
    }
  });

  // Envoyer en cuisine
  const sendToKitchenMutation = useMutation({
    mutationFn: async () => {
      const currentOrderId = orderState.currentOrder?.id;
      if (!currentOrderId) {
        throw new Error("Aucune commande à envoyer");
      }

      // Mettre à jour tous les items en attente
      const { error: itemsError } = await supabase
        .from("pos_order_items")
        .update({ status: "sent" })
        .eq("order_id", currentOrderId)
        .eq("status", "pending");

      if (itemsError) throw itemsError;

      // Mettre à jour le statut de la commande
      const { error: orderError } = await supabase
        .from("pos_orders")
        .update({ status: "sent" })
        .eq("id", currentOrderId);

      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-order"] });
      toast({
        title: "Commande envoyée",
        description: "La commande a été envoyée en cuisine",
      });
    }
  });

  // Synchroniser l'état local avec les données de la base
  useEffect(() => {
    console.log("🐛 [DEBUG] Sync effect triggered", { existingOrder, loadingOrder });
    
    if (existingOrder) {
      console.log("🐛 [DEBUG] Processing existing order", existingOrder);
      
      const cartItems: CartItem[] = existingOrder.pos_order_items?.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: item.product_name || `Produit ${item.product_id}`,
        product_code: item.product_code || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        status: item.status,
        created_at: item.created_at,
        special_instructions: item.special_instructions,
        product: item.pos_products || {},
        fireRound: 1
      })) || [];

      console.log("🐛 [DEBUG] Cart items processed", cartItems);

      setOrderState({
        currentOrder: {
          id: existingOrder.id,
          org_id: existingOrder.org_id,
          order_number: existingOrder.order_number,
          table_id: existingOrder.table_id,
          cashier_id: existingOrder.cashier_id,
          guest_id: existingOrder.guest_id,
          customer_count: existingOrder.customer_count,
          status: existingOrder.status as POSOrder['status'],
          order_type: existingOrder.order_type as POSOrder['order_type'],
          subtotal: existingOrder.subtotal,
          tax_amount: existingOrder.tax_amount,
          discount_amount: existingOrder.discount_amount,
          total_amount: existingOrder.total_amount,
          notes: null,
          kitchen_notes: existingOrder.kitchen_notes || null,
          special_requests: null,
          created_at: existingOrder.created_at,
          updated_at: existingOrder.updated_at
        },
        cartItems,
        isLoading: false,
        error: null
      });
    } else if (!loadingOrder) {
      console.log("🐛 [DEBUG] No existing order, clearing state");
      setOrderState({
        currentOrder: null,
        cartItems: [],
        isLoading: false,
        error: null
      });
    }
  }, [existingOrder, loadingOrder]);

  // Actions exposées
  const actions = {
    createOrder: async (customerCount: number) => {
      console.log("🐛 [DEBUG] createOrder called", { customerCount, selectedOutlet, selectedTable });
      return new Promise((resolve, reject) => {
        createOrderMutation.mutate({ customerCount }, {
          onSuccess: (data) => {
            console.log("🐛 [DEBUG] createOrder SUCCESS", data);
            resolve(data);
          },
          onError: (error) => {
            console.error("🐛 [DEBUG] createOrder ERROR", error);
            reject(error);
          }
        });
      });
    },
    addItem: (product: any, quantity: number = 1, specialInstructions?: string) => {
      console.log("🐛 [DEBUG] addItem called", { product, quantity, currentOrder: orderState.currentOrder });
      return new Promise((resolve, reject) => {
        addItemMutation.mutate({
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity,
          unitPrice: product.base_price,
          specialInstructions
        }, {
          onSuccess: (data) => {
            console.log("🐛 [DEBUG] addItem SUCCESS", data);
            resolve(data);
          },
          onError: (error) => {
            console.error("🐛 [DEBUG] addItem ERROR", error);
            reject(error);
          }
        });
      });
    },
    updateQuantity: (itemId: string, quantity: number, unitPrice: number) => {
      if (quantity <= 0) {
        removeItemMutation.mutate(itemId);
      } else {
        updateItemMutation.mutate({ itemId, quantity, unitPrice });
      }
    },
    removeItem: (itemId: string) => removeItemMutation.mutate(itemId),
    sendToKitchen: () => sendToKitchenMutation.mutate(),
    clearOrder: () => {
      setOrderState({
        currentOrder: null,
        cartItems: [],
        isLoading: false,
        error: null
      });
    }
  };

  return {
    ...orderState,
    isLoading: loadingOrder || orderState.isLoading,
    actions,
    mutations: {
      isCreating: createOrderMutation.isPending,
      isAdding: addItemMutation.isPending,
      isUpdating: updateItemMutation.isPending,
      isRemoving: removeItemMutation.isPending,
      isSending: sendToKitchenMutation.isPending,
    }
  };
}