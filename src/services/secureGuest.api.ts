import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecureGuestAccess {
  searchGuests: (searchTerm: string, limit?: number) => Promise<any[]>;
  getGuestDetails: (guestId: string) => Promise<any>;
  getGuestsList: (limit?: number, offset?: number) => Promise<any[]>;
  checkRateLimit: () => Promise<boolean>;
}

export const secureGuestService: SecureGuestAccess = {
  async searchGuests(searchTerm: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .rpc('search_guests_secure', {
          search_term: searchTerm,
          limit_count: limit
        });

      if (error) {
        console.error('Error searching guests:', error);
        throw new Error('Accès non autorisé ou erreur de recherche');
      }

      return data || [];
    } catch (error) {
      console.error('Secure guest search error:', error);
      throw error;
    }
  },

  async getGuestDetails(guestId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_guest_details_secure', {
          guest_id: guestId
        });

      if (error) {
        console.error('Error fetching guest details:', error);
        throw new Error('Accès non autorisé aux détails du client');
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Secure guest details error:', error);
      throw error;
    }
  },

  async getGuestsList(limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .rpc('get_guests_masked', {
          limit_count: limit,
          offset_count: offset
        });

      if (error) {
        console.error('Error fetching guests list:', error);
        throw new Error('Accès non autorisé à la liste des clients');
      }

      return data || [];
    } catch (error) {
      console.error('Secure guests list error:', error);
      throw error;
    }
  },

  async checkRateLimit() {
    try {
      const { data, error } = await supabase
        .rpc('check_guest_access_rate_limit');

      if (error) {
        console.error('Rate limit check error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Rate limit error:', error);
      return false;
    }
  }
};

// Hook for secure guest operations with proper error handling
export const useSecureGuestAccess = () => {
  const { toast } = useToast();

  const handleSecureOperation = async <T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> => {
    try {
      // Check rate limit first
      const rateLimitOk = await secureGuestService.checkRateLimit();
      if (!rateLimitOk) {
        toast({
          title: "Limite de débit atteinte",
          description: "Trop de demandes d'accès aux données client. Veuillez patienter.",
          variant: "destructive"
        });
        throw new Error('Rate limit exceeded');
      }

      return await operation();
    } catch (error: any) {
      console.error('Secure operation error:', error);
      
      if (error.message?.includes('Rate limit exceeded')) {
        // Already handled above
        return null;
      }
      
      if (error.message?.includes('Unauthorized')) {
        toast({
          title: "Accès non autorisé",
          description: "Vous n'avez pas les permissions nécessaires pour cette action.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      return null;
    }
  };

  return {
    searchGuests: (searchTerm: string, limit?: number) =>
      handleSecureOperation(
        () => secureGuestService.searchGuests(searchTerm, limit),
        "Erreur lors de la recherche de clients"
      ),
    
    getGuestDetails: (guestId: string) =>
      handleSecureOperation(
        () => secureGuestService.getGuestDetails(guestId),
        "Erreur lors de la récupération des détails du client"
      ),
    
    getGuestsList: (limit?: number, offset?: number) =>
      handleSecureOperation(
        () => secureGuestService.getGuestsList(limit, offset),
        "Erreur lors de la récupération de la liste des clients"
      ),
  };
};