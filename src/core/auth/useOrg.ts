import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useOrgId(): string | null {
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    // Pour l'instant, on retourne un org_id fixe
    // À adapter selon votre logique d'authentification
    const getCurrentOrgId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Pour l'instant, on utilise l'organisation qui a le plus de chambres
        // Dans un vrai système, cela viendrait d'une table de profils utilisateur
        setOrgId('7e389008-3dd1-4f54-816d-4f1daff1f435');
      }
    };

    getCurrentOrgId();
  }, []);

  return orgId;
}