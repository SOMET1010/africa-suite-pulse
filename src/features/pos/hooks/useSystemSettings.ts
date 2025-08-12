import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemSetting {
  id: string;
  org_id: string;
  setting_key: string;
  setting_value: any;
  category: string;
  description?: string;
  is_active: boolean;
}

export function useSystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<SystemSetting[]>([]);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["pos-system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_system_settings")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from("pos_system_settings")
        .upsert([{
          setting_key: key,
          setting_value: value,
          category: 'general',
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-system-settings"] });
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres ont été mis à jour avec succès.",
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

  return {
    settings: localSettings,
    isLoading,
    updateSetting,
    saveSettings,
    isSaving: updateSettingMutation.isPending,
  };
}