import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePOSProducts(outletId?: string) {
  return useQuery({
    queryKey: ['pos-products', outletId],
    queryFn: async () => {
      if (!outletId) {
        throw new Error('Outlet ID is required');
      }

      console.log('🔍 [usePOSProducts] Fetching products for outlet:', outletId);

      const { data, error } = await supabase
        .from('pos_products')
        .select(`
          *,
          pos_categories(
            id,
            name,
            code,
            color
          )
        `)
        .eq('outlet_id', outletId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ [usePOSProducts] Error:', error);
        throw error;
      }

      console.log('✅ [usePOSProducts] Products fetched:', data);
      return data;
    },
    enabled: !!outletId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePOSCategories(outletId?: string) {
  return useQuery({
    queryKey: ['pos-categories', outletId],
    queryFn: async () => {
      if (!outletId) {
        throw new Error('Outlet ID is required');
      }

      console.log('🔍 [usePOSCategories] Fetching categories for outlet:', outletId);

      const { data, error } = await supabase
        .from('pos_categories')
        .select('*')
        .eq('outlet_id', outletId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('❌ [usePOSCategories] Error:', error);
        throw error;
      }

      console.log('✅ [usePOSCategories] Categories fetched:', data);
      return data;
    },
    enabled: !!outletId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}