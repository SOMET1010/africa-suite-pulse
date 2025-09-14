import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingLevel {
  level: number;
  name: string;
  isActive: boolean;
}

export interface PromotionalPeriod {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  applicable_days: number[];
  discount_type: 'percentage' | 'fixed_amount' | 'buy_x_get_y';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applicable_categories?: string[];
  applicable_products?: string[];
  customer_types: string[];
  is_active: boolean;
  priority: number;
  usage_limit?: number;
  usage_count: number;
}

export interface PricingShift {
  id: string;
  name: string;
  description?: string;
  price_level: number;
  start_time: string;
  end_time: string;
  applicable_days: number[];
  is_active: boolean;
  priority: number;
}

export interface ProductPricing {
  base_price: number;
  price_level_1?: number;
  price_level_2?: number;
  price_level_3?: number;
  min_price?: number;
  max_price?: number;
  happy_hour_price?: number;
  current_price: number;
  promotion_applied?: {
    promotion_id: string;
    promotion_name: string;
    discount_type: string;
    discount_value: number;
    discount_amount: number;
  };
}

export const useCurrentPricingLevel = (outletId?: string) => {
  return useQuery({
    queryKey: ["current-pricing-level", outletId],
    queryFn: async () => {
      if (!outletId) return 1;
      
      const { data, error } = await supabase.rpc('get_current_pricing_level', {
        p_outlet_id: outletId
      });
      
      if (error) throw error;
      return data || 1;
    },
    enabled: !!outletId,
    refetchInterval: 60000, // Refetch every minute to keep pricing current
  });
};

export const usePromotionalPeriods = () => {
  return useQuery({
    queryKey: ["promotional-periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotional_periods")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });
      
      if (error) throw error;
      return data as PromotionalPeriod[];
    },
  });
};

export const usePricingShifts = (outletId?: string) => {
  return useQuery({
    queryKey: ["pricing-shifts", outletId],
    queryFn: async () => {
      if (!outletId) return [];
      
      const { data, error } = await supabase
        .from("pricing_shifts")
        .select("*")
        .eq("outlet_id", outletId)
        .eq("is_active", true)
        .order("priority", { ascending: false });
      
      if (error) throw error;
      return data as PricingShift[];
    },
    enabled: !!outletId,
  });
};

export const useProductPricing = (productId: string, quantity: number = 1, customerType: string = 'regular') => {
  return useQuery({
    queryKey: ["product-pricing", productId, quantity, customerType],
    queryFn: async () => {
      // Get product details first
      const { data: product, error: productError } = await supabase
        .from("pos_products")
        .select(`
          base_price, 
          price_level_1, 
          price_level_2, 
          price_level_3, 
          min_price, 
          max_price, 
          happy_hour_price
        `)
        .eq("id", productId)
        .single();
      
      if (productError) throw productError;
      
      // Calculate promotional pricing
      const { data: pricing, error: pricingError } = await supabase.rpc('calculate_promotional_price', {
        p_product_id: productId,
        p_base_price: product.base_price,
        p_quantity: quantity,
        p_customer_type: customerType
      });
      
      if (pricingError) throw pricingError;
      
      const pricingData = pricing as any;
      return {
        ...product,
        current_price: pricingData.final_price || product.base_price,
        promotion_applied: pricingData.promotion?.promotion_id ? pricingData.promotion : undefined
      } as ProductPricing;
    },
    enabled: !!productId,
  });
};

export const useActivePromotions = () => {
  return useQuery({
    queryKey: ["active-promotions"],
    queryFn: async () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDay = now.getDay() + 1; // Convert to 1-7 format
      
      const { data, error } = await supabase
        .from("promotional_periods")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now.toISOString().split('T')[0])
        .gte("end_date", now.toISOString().split('T')[0])
        .contains("applicable_days", [currentDay])
        .order("priority", { ascending: false });
      
      if (error) throw error;
      
      // Filter by time if start_time and end_time are set
      return data.filter(promotion => {
        if (!promotion.start_time || !promotion.end_time) return true;
        
        const startTime = promotion.start_time;
        const endTime = promotion.end_time;
        
        if (startTime <= endTime) {
          return currentTime >= startTime && currentTime <= endTime;
        } else {
          // Handle overnight periods
          return currentTime >= startTime || currentTime <= endTime;
        }
      }) as PromotionalPeriod[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
};