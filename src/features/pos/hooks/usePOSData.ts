import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { POSOutlet, POSCategory, POSProduct, POSOrder, POSTable, POSSession, CartItem } from "../types";

export const usePOSOutlets = () => {
  return useQuery({
    queryKey: ["pos-outlets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_outlets")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as unknown as POSOutlet[];
    },
  });
};

export const usePOSCategories = (outletId?: string) => {
  return useQuery({
    queryKey: ["pos-categories", outletId],
    queryFn: async () => {
      if (!outletId) return [];
      
      const { data, error } = await supabase
        .from("pos_categories")
        .select("*")
        .eq("outlet_id", outletId)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return data as POSCategory[];
    },
    enabled: !!outletId,
  });
};

export const usePOSProducts = (outletId?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ["pos-products", outletId, categoryId],
    queryFn: async () => {
      if (!outletId) return [];
      
      let query = supabase
        .from("pos_products")
        .select("*")
        .eq("outlet_id", outletId)
        .eq("is_active", true);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data as unknown as POSProduct[];
    },
    enabled: !!outletId,
  });
};

export const usePOSTables = (outletId?: string) => {
  return useQuery({
    queryKey: ["pos-tables", outletId],
    queryFn: async () => {
      if (!outletId) return [];
      
      const { data, error } = await supabase
        .from("pos_tables")
        .select("*")
        .eq("outlet_id", outletId)
        .order("number");

      if (error) throw error;
      return data.map(table => ({
        ...table,
        number: table.table_number
      })) as unknown as POSTable[];
    },
    enabled: !!outletId,
  });
};

export const useCurrentPOSSession = (outletId?: string) => {
  return useQuery({
    queryKey: ["current-pos-session", outletId],
    queryFn: async () => {
      if (!outletId) return null;
      
      const { data, error } = await supabase
        .from("pos_sessions")
        .select("*")
        .eq("outlet_id", outletId)
        .eq("status", "open")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? {
        ...data,
        opened_at: data.started_at
      } as unknown as POSSession : null;
    },
    enabled: !!outletId,
  });
};

export const useCreatePOSOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      outletId, 
      tableId, 
      orderType = 'dine_in',
      customerCount = 1 
    }: {
      outletId: string;
      tableId?: string;
      orderType?: string;
      customerCount?: number;
    }) => {
      const { data, error } = await supabase
        .from("pos_orders")
        .insert({
          org_id: (await supabase.rpc("get_current_user_org_id")).data,
          order_number: `POS-${Date.now()}`,
          table_id: tableId,
          order_type: orderType,
          customer_count: customerCount,
          status: 'draft',
          subtotal: 0,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as POSOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      toast({
        title: "Commande créée",
        description: "Nouvelle commande initialisée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la commande",
        variant: "destructive",
      });
    },
  });
};

export const useAddToCart = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      productId,
      quantity = 1,
      specialInstructions,
    }: {
      orderId: string;
      productId: string;
      quantity?: number;
      specialInstructions?: string;
    }) => {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from("pos_products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      // Add item to order
      const { data, error } = await supabase
        .from("pos_order_items")
        .insert({
          order_id: orderId,
          product_id: productId,
          product_name: product.name,
          product_code: product.code,
          quantity,
          unit_price: product.base_price,
          total_price: product.base_price * quantity,
          special_instructions: specialInstructions,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Note: Update order totals would need a custom RPC function

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-orders"] });
      queryClient.invalidateQueries({ queryKey: ["pos-order-items"] });
      toast({
        title: "Article ajouté",
        description: "L'article a été ajouté à la commande",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'article",
        variant: "destructive",
      });
    },
  });
};

export const useOpenPOSSession = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      outletId,
      openingCash,
    }: {
      outletId: string;
      openingCash: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      const orgIdResponse = await supabase.rpc("get_current_user_org_id");
      const orgId = orgIdResponse.data;

      const { data, error } = await supabase
        .from("pos_sessions")
        .insert({
          org_id: orgId,
          outlet_id: outletId,
          session_number: `SES-${Date.now()}`, // Added missing session_number
          opening_cash: openingCash,
          cashier_id: user.id,
          status: 'open',
          total_sales: 0,
          total_transactions: 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        opened_at: data.started_at
      } as unknown as POSSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-pos-session"] });
      toast({
        title: "Session ouverte",
        description: "Session POS ouverte avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ouvrir la session",
        variant: "destructive",
      });
    },
  });
};