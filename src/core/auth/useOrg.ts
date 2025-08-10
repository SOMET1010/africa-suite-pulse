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
        // Retourner l'org_id de l'utilisateur connecté
        // Pour l'instant, on utilise un ID fixe pour les tests
        setOrgId('your-org-id-here');
      }
    };

    getCurrentOrgId();
  }, []);

  return orgId;
}