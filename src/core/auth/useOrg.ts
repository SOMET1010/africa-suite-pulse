import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOrgId(): string | null {
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentOrgId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get the user's organization from their profile
        const { data: profile, error } = await (supabase as any)
          .from('profiles')
          .select('org_id')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          setOrgId(null);
        } else {
          setOrgId((profile as any)?.org_id || null);
        }
      } else {
        setOrgId(null);
      }
    };

    getCurrentOrgId();
  }, []);

  return orgId;
}