import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserSettings {
  id: string;
  user_id: string;
  org_id: string;
  theme: string;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_notifications: boolean;
  desktop_notifications: boolean;
  notification_frequency: string;
  dashboard_layout: Record<string, any>;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsData {
  theme?: 'light' | 'dark' | 'system';
  language?: 'fr' | 'en';
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  sound_notifications?: boolean;
  desktop_notifications?: boolean;
  notification_frequency?: 'instant' | 'hourly' | 'daily';
  dashboard_layout?: Record<string, any>;
  preferences?: Record<string, any>;
}

class UserSettingsService {
  // Get current user settings
  async getUserSettings(): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK
      throw error;
    }
    
    return data ? {
      ...data,
      dashboard_layout: data.dashboard_layout as Record<string, any>,
      preferences: data.preferences as Record<string, any>
    } : null;
  }

  // Create or update user settings
  async updateUserSettings(updates: UpdateUserSettingsData): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Try to get current org_id from app_users table
    const { data: appUser } = await supabase
      .from('app_users')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!appUser?.org_id) throw new Error('Organization not found');

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        org_id: appUser.org_id,
        ...updates,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      dashboard_layout: data.dashboard_layout as Record<string, any>,
      preferences: data.preferences as Record<string, any>
    };
  }

  // Initialize default settings for new user
  async initializeDefaultSettings(): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: appUser } = await supabase
      .from('app_users')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!appUser?.org_id) throw new Error('Organization not found');

    const defaultSettings = {
      user_id: user.id,
      org_id: appUser.org_id,
      theme: 'system' as const,
      language: 'fr' as const,
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: true,
      sound_notifications: true,
      desktop_notifications: false,
      notification_frequency: 'instant' as const,
      dashboard_layout: {},
      preferences: {},
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      dashboard_layout: data.dashboard_layout as Record<string, any>,
      preferences: data.preferences as Record<string, any>
    };
  }
}

export const userSettingsService = new UserSettingsService();

// React Query hooks
export const useUserSettings = () => {
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: () => userSettingsService.getUserSettings(),
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: UpdateUserSettingsData) => 
      userSettingsService.updateUserSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

export const useInitializeUserSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userSettingsService.initializeDefaultSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};