import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCurrentOrg() {
  return useQuery({
    queryKey: ['current-org'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('app_users')
        .select('org_id')
        .eq('user_id', user.user.id)
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (error) throw error;
      return data;
    },
  });
}