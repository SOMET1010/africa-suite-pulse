import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast-unified";
import { useToast } from "@/hooks/use-toast";
import type { POSOutlet, POSCategory, POSProduct, POSOrder, POSTable, POSSession, CartItem } from "../types";

export const usePOSOutlets = () => {
  return useQuery({
    queryKey: ["pos-outlets-fixed"], // Changed key to force cache invalidation
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_outlets")
        .select("id, org_id, code, name, description, outlet_type, is_active, settings, created_at, updated_at")
        .eq("is_active", true)
        .order("name")
        .range(0, 99);

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
        .select("id, name, description, code, outlet_id, sort_order, is_active, color, icon, created_at, updated_at")
        .eq("outlet_id", outletId)
        .eq("is_active", true)
        .order("sort_order")
        .range(0, 99);

      if (error) throw error;
      return data as unknown as POSCategory[];
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
        .select(`
          id, name, code, category_id, outlet_id, base_price, is_active, description,
          price_level_1, price_level_2, price_level_3, min_price, max_price, 
          happy_hour_price, promotion_eligible, is_stock_managed, current_stock
        `)
        .eq("outlet_id", outletId)
        .eq("is_active", true);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query.order("name").range(0, 199);

      if (error) throw error;
      return data as unknown as POSProduct[];
    },
    enabled: !!outletId,
  });
};

export const usePOSTables = (outletId?: string, orgId?: string) => {
  return useQuery({
    queryKey: ["pos-tables", outletId, orgId],
    queryFn: async () => {
      console.log("🗃️ usePOSTables query:", { outletId, orgId });
      
      // First try with outlet_id if provided
      if (outletId) {
        const { data: outletData, error: outletError } = await supabase
          .from("pos_tables")
          .select("id, table_number, zone, capacity, status, outlet_id, org_id")
          .eq("outlet_id", outletId)
          .order("table_number")
          .range(0, 99);

        console.log("🗃️ Tables by outlet_id:", { outletId, count: outletData?.length, data: outletData });
        
        if (!outletError && outletData && outletData.length > 0) {
          return outletData.map(table => ({
            ...table,
            number: table.table_number
          })) as unknown as POSTable[];
        }
      }
      
      // Fallback: try with org_id only
      if (orgId) {
        console.log("🔄 Fallback: querying tables by org_id only:", orgId);
        const { data: orgData, error: orgError } = await supabase
          .from("pos_tables")
          .select("id, table_number, zone, capacity, status, outlet_id, org_id")
          .eq("org_id", orgId)
          .order("table_number")
          .range(0, 99);

        console.log("🗃️ Tables by org_id:", { orgId, count: orgData?.length, data: orgData });

        if (orgError) throw orgError;
        return orgData?.map(table => ({
          ...table,
          number: table.table_number
        })) as unknown as POSTable[] || [];
      }
      
      return [];
    },
    enabled: !!(outletId || orgId),
  });
};

export const useCurrentPOSSession = (outletId?: string) => {
  return useQuery({
    queryKey: ["current-pos-session", outletId],
    queryFn: async () => {
      if (!outletId) return null;
      
      const { data, error } = await supabase
        .from("pos_sessions")
        .select("id, session_number, outlet_id, opening_cash, status, started_at, cashier_id")
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
        variant: "success",
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
        .select("id, name, code, base_price")
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
        variant: "success",
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
        variant: "success",
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

export const useCreatePOSCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      outletId,
      name,
      description,
      color,
      icon,
      sortOrder,
    }: {
      outletId: string;
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      sortOrder?: number;
    }) => {
      const orgIdResponse = await supabase.rpc("get_current_user_org_id");
      const orgId = orgIdResponse.data;

      const { data, error } = await supabase
        .from("pos_categories")
        .insert({
          org_id: orgId,
          outlet_id: outletId,
          code: name.toLowerCase().replace(/\s+/g, '_'),
          name,
          description,
          color: color || '#6366f1',
          icon: icon || 'utensils',
          sort_order: sortOrder || 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as POSCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-categories"] });
      toast({
        title: "Catégorie créée",
        description: "La catégorie a été créée avec succès",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la catégorie",
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePOSCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      color,
      icon,
      sortOrder,
    }: {
      id: string;
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      sortOrder?: number;
    }) => {
      const updates: any = {};
      if (name !== undefined) {
        updates.name = name;
        updates.code = name.toLowerCase().replace(/\s+/g, '_');
      }
      if (description !== undefined) updates.description = description;
      if (color !== undefined) updates.color = color;
      if (icon !== undefined) updates.icon = icon;
      if (sortOrder !== undefined) updates.sort_order = sortOrder;
      
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("pos_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as POSCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-categories"] });
      toast({
        title: "Catégorie modifiée",
        description: "La catégorie a été modifiée avec succès",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la catégorie",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePOSCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from("pos_categories")
        .update({ is_active: false })
        .eq("id", categoryId);

      if (error) throw error;
      return categoryId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-categories"] });
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la catégorie",
        variant: "destructive",
      });
    },
  });
};

export const useDuplicatePOSCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      // Get original category
      const { data: original, error: fetchError } = await supabase
        .from("pos_categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const { data, error } = await supabase
        .from("pos_categories")
        .insert({
          org_id: original.org_id,
          outlet_id: original.outlet_id,
          code: `${original.code}_copy`,
          name: `${original.name} (Copie)`,
          description: original.description,
          color: original.color,
          icon: original.icon,
          sort_order: original.sort_order + 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as POSCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-categories"] });
      toast({
        title: "Catégorie dupliquée",
        description: "La catégorie a été dupliquée avec succès",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de dupliquer la catégorie",
        variant: "destructive",
      });
    },
  });
};

export const useReorderPOSCategories = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const promises = updates.map(({ id, sort_order }) =>
        supabase
          .from("pos_categories")
          .update({ sort_order })
          .eq("id", id)
      );

      const results = await Promise.all(promises);
      const error = results.find(result => result.error)?.error;
      if (error) throw error;

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-categories"] });
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des catégories a été mis à jour",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de réorganiser les catégories",
        variant: "destructive",
      });
    },
  });
}

// ============= FAMILIES HOOKS =============
export function usePOSFamilies(outletId?: string) {
  return useQuery({
    queryKey: ['pos-families', outletId],
    queryFn: async () => {
      let query = supabase
        .from('pos_families')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });
}

export function usePOSSubfamilies(familyId?: string) {
  return useQuery({
    queryKey: ['pos-subfamilies', familyId],
    queryFn: async () => {
      let query = supabase
        .from('pos_subfamilies')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (familyId) {
        query = query.eq('family_id', familyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });
}

export function useCreatePOSFamily() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      outletId?: string;
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      sortOrder?: number;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: orgData } = await supabase.rpc('get_current_user_org_id');

      const insertData = {
        org_id: orgData,
        outlet_id: data.outletId || null,
        name: data.name,
        description: data.description || '',
        color: data.color || '#6366f1',
        icon: data.icon || 'folder',
        sort_order: data.sortOrder || 0,
        created_by: user.user.id,
      };

      const { data: result, error } = await supabase
        .from('pos_families')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-families'] });
      toast({
        title: "Famille créée",
        description: "La famille a été créée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer la famille: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePOSFamily() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      sortOrder?: number;
    }) => {
      const updateData = {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color && { color: data.color }),
        ...(data.icon && { icon: data.icon }),
        ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('pos_families')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-families'] });
      toast({
        title: "Famille modifiée",
        description: "La famille a été modifiée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de modifier la famille: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePOSFamily() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (familyId: string) => {
      const { error } = await supabase
        .from('pos_families')
        .update({ is_active: false })
        .eq('id', familyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-families'] });
      toast({
        title: "Famille supprimée",
        description: "La famille a été supprimée avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la famille: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// ============= KEYBOARDS HOOKS =============
export function usePOSKeyboards(outletId?: string) {
  return useQuery({
    queryKey: ['pos-keyboards', outletId],
    queryFn: async () => {
      let query = supabase
        .from('pos_keyboards')
        .select(`
          *,
          pos_keyboard_buttons(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (outletId) {
        query = query.eq('outlet_id', outletId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });
}

export function useCreatePOSKeyboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      outletId?: string;
      name: string;
      description?: string;
      layoutType: string;
      templateType?: string;
      isDefault?: boolean;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: orgData } = await supabase.rpc('get_current_user_org_id');

      const insertData = {
        org_id: orgData,
        outlet_id: data.outletId || null,
        name: data.name,
        description: data.description || '',
        layout_type: data.layoutType,
        template_type: data.templateType || 'custom',
        is_default: data.isDefault || false,
        created_by: user.user.id,
      };

      const { data: result, error } = await supabase
        .from('pos_keyboards')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-keyboards'] });
      toast({
        title: "Clavier créé",
        description: "Le clavier a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le clavier: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePOSKeyboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      description?: string;
      layoutType?: string;
      templateType?: string;
      isDefault?: boolean;
    }) => {
      const updateData = {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.layoutType && { layout_type: data.layoutType }),
        ...(data.templateType && { template_type: data.templateType }),
        ...(data.isDefault !== undefined && { is_default: data.isDefault }),
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('pos_keyboards')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-keyboards'] });
      toast({
        title: "Clavier modifié",
        description: "Le clavier a été modifié avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de modifier le clavier: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useDeletePOSKeyboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (keyboardId: string) => {
      const { error } = await supabase
        .from('pos_keyboards')
        .update({ is_active: false })
        .eq('id', keyboardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-keyboards'] });
      toast({
        title: "Clavier supprimé",
        description: "Le clavier a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le clavier: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};