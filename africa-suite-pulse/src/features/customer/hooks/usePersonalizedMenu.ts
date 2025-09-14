import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MenuRecommendation {
  id: string;
  name: string;
  reason: string;
  confidence: number;
}

interface PersonalizationInsights {
  preferredCategories: Record<string, number>;
  averageOrderValue: number;
  visitFrequency: number;
  lastVisit: string | null;
}

interface PersonalizedMenuData {
  recommendations: MenuRecommendation[];
  insights: PersonalizationInsights;
  personalizationScore: number;
}

interface UsePersonalizedMenuOptions {
  guestId?: string;
  orgId: string;
  enabled?: boolean;
  currentMenu?: any[];
}

interface PaymentTransaction {
  id: string;
  amount: number;
  created_at: string;
  metadata: any;
}

interface GuestPreferences {
  preferences: any;
}

export const usePersonalizedMenu = ({ 
  guestId, 
  orgId, 
  enabled = true,
  currentMenu = []
}: UsePersonalizedMenuOptions) => {
  const [orderHistory, setOrderHistory] = useState<PaymentTransaction[]>([]);
  const [preferences, setPreferences] = useState<any>({});
  
  // Récupération de l'historique des commandes
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!guestId) return;
      
      try {
        // Utilisation directe de fetch pour éviter les problèmes de types Supabase
        const response = await fetch(
          `https://alfflpvdnywwbrzygmoc.supabase.co/rest/v1/payment_transactions?guest_id=eq.${guestId}&select=id,amount,created_at,metadata&order=created_at.desc&limit=20`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZmZscHZkbnl3d2JyenlnbW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIxNTUsImV4cCI6MjA3MDM2ODE1NX0.hV_xY6voTcybMwno9ViAVZvsN8Gbj8L-CDw2Jof17mY',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setOrderHistory(data || []);
        }
      } catch (error) {
        console.error('Error fetching order history:', error);
      }
    };

    fetchOrderHistory();
  }, [guestId]);

  // Récupération des préférences client
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!guestId) return;
      
      try {
        // Utilisation directe de fetch pour éviter les problèmes de types Supabase
        const response = await fetch(
          `https://alfflpvdnywwbrzygmoc.supabase.co/rest/v1/guests?id=eq.${guestId}&select=preferences`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZmZscHZkbnl3d2JyenlnbW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIxNTUsImV4cCI6MjA3MDM2ODE1NX0.hV_xY6voTcybMwno9ViAVZvsN8Gbj8L-CDw2Jof17mY',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const guestData = data[0];
          setPreferences(guestData?.preferences || {});
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, [guestId]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'morning';
    if (hour < 16) return 'lunch';
    return 'evening';
  };

  // Query pour obtenir les recommandations personnalisées
  const personalizedMenuQuery = useQuery({
    queryKey: ['personalized-menu', guestId, orgId, orderHistory.length],
    queryFn: async (): Promise<PersonalizedMenuData> => {
      if (!guestId || orderHistory.length === 0) {
        return {
          recommendations: [],
          insights: {
            preferredCategories: {},
            averageOrderValue: 0,
            visitFrequency: 0,
            lastVisit: null
          },
          personalizationScore: 0
        };
      }

      const { data, error } = await supabase.functions.invoke('ai-menu-personalization', {
        body: {
          guestId,
          orgId,
          currentMenu,
          orderHistory,
          preferences,
          timeOfDay: getTimeOfDay(),
          language: 'fr'
        }
      });

      if (error) {
        console.error('Error getting personalized menu:', error);
        throw error;
      }

      return data as PersonalizedMenuData;
    },
    enabled: enabled && !!guestId && orderHistory.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const refreshRecommendations = () => {
    personalizedMenuQuery.refetch();
  };

  const updatePreferences = async (newPreferences: any) => {
    if (!guestId) return;

    try {
      const { error } = await supabase
        .from('guests')
        .update({ preferences: { ...preferences, ...newPreferences } })
        .eq('id', guestId);

      if (!error) {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
        // Rafraîchir les recommandations après mise à jour des préférences
        setTimeout(() => refreshRecommendations(), 500);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return {
    // Données
    recommendations: personalizedMenuQuery.data?.recommendations || [],
    insights: personalizedMenuQuery.data?.insights || {
      preferredCategories: {},
      averageOrderValue: 0,
      visitFrequency: 0,
      lastVisit: null
    },
    personalizationScore: personalizedMenuQuery.data?.personalizationScore || 0,
    preferences,
    orderHistory,
    
    // État
    isLoading: personalizedMenuQuery.isLoading,
    isError: personalizedMenuQuery.isError,
    error: personalizedMenuQuery.error,
    
    // Actions
    refreshRecommendations,
    updatePreferences,
    
    // Utilitaires
    hasPersonalization: (personalizedMenuQuery.data?.personalizationScore || 0) > 0.3,
    isPersonalized: !!guestId && orderHistory.length > 0
  };
};