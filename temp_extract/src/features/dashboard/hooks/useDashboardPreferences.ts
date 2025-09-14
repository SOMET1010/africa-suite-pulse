import { useState, useEffect, useCallback } from 'react';
import { WidgetConfig } from '../components/DashboardWidget';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface DashboardPreferences {
  widgets: WidgetConfig[];
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number;
  notifications: {
    sound: boolean;
    desktop: boolean;
    reservations: boolean;
    payments: boolean;
    maintenance: boolean;
  };
  shortcuts: Record<string, string>;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: 'occupancy-kpi',
    title: 'Taux d\'Occupation',
    type: 'kpi',
    size: 'small',
    position: { x: 0, y: 0 },
    visible: true
  },
  {
    id: 'revenue-kpi',
    title: 'Revenus du Jour',
    type: 'kpi',
    size: 'small',
    position: { x: 1, y: 0 },
    visible: true
  },
  {
    id: 'adr-kpi',
    title: 'Prix Moyen (ADR)',
    type: 'kpi',
    size: 'small',
    position: { x: 2, y: 0 },
    visible: true
  },
  {
    id: 'revpar-kpi',
    title: 'RevPAR',
    type: 'kpi',
    size: 'small',
    position: { x: 3, y: 0 },
    visible: true
  },
  {
    id: 'occupancy-chart',
    title: 'Tendance d\'Occupation',
    type: 'chart',
    size: 'large',
    position: { x: 0, y: 1 },
    visible: true
  },
  {
    id: 'revenue-chart',
    title: 'Évolution Revenus',
    type: 'chart',
    size: 'large',
    position: { x: 2, y: 1 },
    visible: true
  },
  {
    id: 'alerts-widget',
    title: 'Alertes',
    type: 'alerts',
    size: 'medium',
    position: { x: 0, y: 3 },
    visible: true
  },
  {
    id: 'quick-actions',
    title: 'Actions Rapides',
    type: 'actions',
    size: 'medium',
    position: { x: 2, y: 3 },
    visible: true
  }
];

const DEFAULT_PREFERENCES: DashboardPreferences = {
  widgets: DEFAULT_WIDGETS,
  theme: 'auto',
  refreshInterval: 30000, // 30 seconds
  notifications: {
    sound: true,
    desktop: true,
    reservations: true,
    payments: true,
    maintenance: true
  },
  shortcuts: {
    'ctrl+n': '/rack/new-reservation',
    'ctrl+r': '/rack',
    'ctrl+p': '/pos',
    'ctrl+a': '/arrivals',
    'ctrl+h': '/housekeeping',
    '/': 'search'
  }
};

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load preferences from localStorage for now (until we add dashboard_preferences to app_users)
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem('dashboard_preferences');
        if (savedPreferences) {
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...JSON.parse(savedPreferences)
          });
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }
      } catch (error) {
        logger.error('Error loading dashboard preferences', error);
        setPreferences(DEFAULT_PREFERENCES);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage for now
  const savePreferences = useCallback(async (newPreferences: Partial<DashboardPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      localStorage.setItem('dashboard_preferences', JSON.stringify(updatedPreferences));
      setPreferences(updatedPreferences);
      
      toast({
        title: 'Préférences sauvegardées',
        description: 'Vos préférences ont été mises à jour'
      });
    } catch (error) {
      logger.error('Error saving dashboard preferences', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les préférences',
        variant: 'destructive'
      });
    }
  }, [preferences, toast]);

  const updateWidgets = useCallback((widgets: WidgetConfig[]) => {
    savePreferences({ widgets });
  }, [savePreferences]);

  const updateNotificationSettings = useCallback((notifications: Partial<DashboardPreferences['notifications']>) => {
    savePreferences({
      notifications: { ...preferences.notifications, ...notifications }
    });
  }, [preferences.notifications, savePreferences]);

  const updateTheme = useCallback((theme: DashboardPreferences['theme']) => {
    savePreferences({ theme });
  }, [savePreferences]);

  const updateRefreshInterval = useCallback((refreshInterval: number) => {
    savePreferences({ refreshInterval });
  }, [savePreferences]);

  const resetToDefaults = useCallback(() => {
    savePreferences(DEFAULT_PREFERENCES);
  }, [savePreferences]);

  return {
    preferences,
    isLoading,
    updateWidgets,
    updateNotificationSettings,
    updateTheme,
    updateRefreshInterval,
    resetToDefaults,
    savePreferences
  };
}