import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { POSTable } from '../types';

export function usePOSTables(outletId?: string) {
  return useQuery({
    queryKey: ['pos-tables', outletId],
    queryFn: async () => {
      if (!outletId) {
        throw new Error('Outlet ID is required');
      }

      console.log('🔍 [usePOSTables] Fetching tables for outlet:', outletId);

      const { data, error } = await supabase
        .from('pos_tables')
        .select('*')
        .eq('outlet_id', outletId)
        .eq('is_active', true)
        .order('table_number');

      if (error) {
        console.error('❌ [usePOSTables] Error:', error);
        throw error;
      }

      console.log('✅ [usePOSTables] Tables fetched:', data);

      return data as POSTable[];
    },
    enabled: !!outletId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}