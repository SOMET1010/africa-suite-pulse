import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/unified-toast";

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
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

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
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (error) throw error;

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