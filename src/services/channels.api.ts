import { supabase } from '@/integrations/supabase/client';
import { ApiHelpers, throwIfError } from './api.core';

// Types
export interface ChannelIntegration {
  id: string;
  org_id: string;
  channel_name: string;
  channel_type: 'booking_com' | 'expedia' | 'airbnb' | 'agoda' | 'hotels_com' | 'other';
  api_credentials: Record<string, any>;
  mapping_config: Record<string, any>;
  sync_settings: Record<string, any>;
  last_sync_at?: string;
  sync_status: 'inactive' | 'syncing' | 'error' | 'success';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateChannelData {
  channel_name: string;
  channel_type: 'booking_com' | 'expedia' | 'airbnb' | 'agoda' | 'hotels_com' | 'other';
  api_credentials: Record<string, any>;
  mapping_config?: Record<string, any>;
  sync_settings?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  message: string;
  stats?: {
    reservations_synced: number;
    rates_updated: number;
    availability_updated: number;
    errors: number;
  };
}

export class ChannelsAPI {
  // Get all channel integrations for org
  async getChannels(): Promise<ChannelIntegration[]> {
    const { data, error } = await supabase
      .from('channel_integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(channel => ({
      ...channel,
      channel_type: channel.channel_type as 'booking_com' | 'expedia' | 'airbnb' | 'agoda' | 'hotels_com' | 'other',
      sync_status: channel.sync_status as 'inactive' | 'syncing' | 'error' | 'success',
      api_credentials: channel.api_credentials as Record<string, any>,
      mapping_config: channel.mapping_config as Record<string, any>,
      sync_settings: channel.sync_settings as Record<string, any>
    }));
  }

  // Get channel by ID
  async getChannel(id: string): Promise<ChannelIntegration | null> {
    const { data, error } = await supabase
      .from('channel_integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data ? {
      ...data,
      api_credentials: data.api_credentials as Record<string, any>,
      mapping_config: data.mapping_config as Record<string, any>,
      sync_settings: data.sync_settings as Record<string, any>
    } : null;
  }

  // Create channel integration
  async createChannel(channelData: CreateChannelData): Promise<ChannelIntegration> {
    // Get current user's org_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: appUser } = await supabase
      .from('app_users')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!appUser?.org_id) throw new Error('Organization not found');

    const { data, error } = await supabase
      .from('channel_integrations')
      .insert({
        org_id: appUser.org_id,
        channel_name: channelData.channel_name,
        channel_type: channelData.channel_type,
        api_credentials: channelData.api_credentials,
        mapping_config: channelData.mapping_config || {},
        sync_settings: channelData.sync_settings || {
          auto_sync: true,
          sync_interval: 'hourly',
          sync_reservations: true,
          sync_rates: true,
          sync_availability: true
        },
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      api_credentials: data.api_credentials as Record<string, any>,
      mapping_config: data.mapping_config as Record<string, any>,
      sync_settings: data.sync_settings as Record<string, any>
    };
  }

  // Update channel integration
  async updateChannel(id: string, updates: Partial<CreateChannelData>): Promise<ChannelIntegration> {
    const { data, error } = await supabase
      .from('channel_integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      api_credentials: data.api_credentials as Record<string, any>,
      mapping_config: data.mapping_config as Record<string, any>,
      sync_settings: data.sync_settings as Record<string, any>
    };
  }

  // Delete channel integration
  async deleteChannel(id: string): Promise<void> {
    const { error } = await supabase
      .from('channel_integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Test channel connection
  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('test-channel-connection', {
        body: { channel_id: id }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  // Sync channel data
  async syncChannel(id: string, full_sync = false): Promise<SyncResult> {
    try {
      const { data, error } = await supabase.functions.invoke('sync-channel-data', {
        body: { 
          channel_id: id,
          full_sync 
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message,
        stats: { reservations_synced: 0, rates_updated: 0, availability_updated: 0, errors: 1 }
      };
    }
  }

  // Get supported channel types
  getSupportedChannels() {
    return [
      {
        type: 'booking_com',
        name: 'Booking.com',
        description: 'Connect to Booking.com to sync reservations and rates',
        features: ['Reservations', 'Rates', 'Availability', 'Reviews']
      },
      {
        type: 'expedia',
        name: 'Expedia',
        description: 'Integration with Expedia Partner Central',
        features: ['Reservations', 'Rates', 'Availability']
      },
      {
        type: 'airbnb',
        name: 'Airbnb',
        description: 'Sync with Airbnb for short-term rentals',
        features: ['Reservations', 'Calendar', 'Messaging']
      },
      {
        type: 'agoda',
        name: 'Agoda',
        description: 'Connect to Agoda marketplace',
        features: ['Reservations', 'Rates', 'Availability']
      },
      {
        type: 'hotels_com',
        name: 'Hotels.com',
        description: 'Integration with Hotels.com',
        features: ['Reservations', 'Rates', 'Availability']
      },
      {
        type: 'other',
        name: 'Custom Integration',
        description: 'Custom channel manager integration',
        features: ['Custom API', 'Flexible mapping']
      }
    ];
  }
}

export const channelsAPI = new ChannelsAPI();