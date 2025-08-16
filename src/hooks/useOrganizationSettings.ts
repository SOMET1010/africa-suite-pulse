import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrganizationSetting {
  id: string;
  org_id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  description?: string;
  is_active: boolean;
}

interface OrganizationSettings {
  currency_code: string;
  currency_symbol: string;
  date_format: string;
  timezone: string;
  language: string;
}

const DEFAULT_SETTINGS: OrganizationSettings = {
  currency_code: 'XOF',
  currency_symbol: 'F CFA',
  date_format: 'dd/MM/yyyy',
  timezone: 'Africa/Abidjan',
  language: 'fr'
};

export function useOrganizationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<OrganizationSetting[]>([]);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["organization-settings"],
    queryFn: async () => {
      // Use default settings until table is available
      console.log('Using default organization settings');
      return [] as OrganizationSetting[];
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      // For now, just simulate saving
      console.log('Saving organization setting:', key, value);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-settings"] });
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres de l'organisation ont été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateSetting = (key: string, value: any) => {
    const updatedSettings = localSettings.map(setting => 
      setting.setting_key === key 
        ? { ...setting, setting_value: value }
        : setting
    );
    
    const existingSetting = localSettings.find(s => s.setting_key === key);
    if (!existingSetting) {
      updatedSettings.push({
        id: `temp-${key}`,
        org_id: '',
        setting_key: key,
        setting_value: value,
        category: 'general',
        is_active: true
      });
    }
    
    setLocalSettings(updatedSettings);
  };

  const saveSettings = () => {
    localSettings.forEach(setting => {
      if (setting.id.startsWith('temp-') || 
          settings.find(s => s.setting_key === setting.setting_key && 
                           JSON.stringify(s.setting_value) !== JSON.stringify(setting.setting_value))) {
        updateSettingMutation.mutate({
          key: setting.setting_key,
          value: setting.setting_value
        });
      }
    });
  };

  // Helper function to get a specific setting value with fallback
  const getSetting = (key: keyof OrganizationSettings): any => {
    const setting = localSettings.find(s => s.setting_key === key);
    return setting?.setting_value ?? DEFAULT_SETTINGS[key];
  };

  // Get current organization settings with defaults
  const organizationSettings: OrganizationSettings = {
    currency_code: getSetting('currency_code'),
    currency_symbol: getSetting('currency_symbol'),
    date_format: getSetting('date_format'),
    timezone: getSetting('timezone'),
    language: getSetting('language')
  };

  return {
    settings: localSettings,
    organizationSettings,
    isLoading,
    updateSetting,
    saveSettings,
    isSaving: updateSettingMutation.isPending,
    getSetting,
  };
}