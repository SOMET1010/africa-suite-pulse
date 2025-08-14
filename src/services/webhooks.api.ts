import { supabase } from '@/integrations/supabase/client';
import { ApiHelpers, throwIfError } from './api.core';

// Types
export interface Webhook {
  id: string;
  org_id: string;
  name: string;
  url: string;
  events: string[];
  secret_key?: string;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  attempt_count: number;
  delivered_at?: string;
  created_at: string;
}

export interface CreateWebhookData {
  name: string;
  url: string;
  events: string[];
  secret_key?: string;
  retry_count?: number;
  timeout_seconds?: number;
}

export class WebhooksAPI {
  // Get all webhooks for org
  async getWebhooks(): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get webhook by ID
  async getWebhook(id: string): Promise<Webhook | null> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

  // Create webhook
  async createWebhook(webhookData: CreateWebhookData): Promise<Webhook> {
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
      .from('webhooks')
      .insert({
        org_id: appUser.org_id,
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events,
        secret_key: webhookData.secret_key,
        retry_count: webhookData.retry_count || 3,
        timeout_seconds: webhookData.timeout_seconds || 30,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update webhook
  async updateWebhook(id: string, updates: Partial<CreateWebhookData>): Promise<Webhook> {
    const { data, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete webhook
  async deleteWebhook(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get webhook deliveries
  async getWebhookDeliveries(webhookId: string, limit = 50): Promise<WebhookDelivery[]> {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(delivery => ({
      ...delivery,
      payload: delivery.payload as Record<string, any>
    }));
  }

  // Test webhook
  async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const webhook = await this.getWebhook(id);
      if (!webhook) throw new Error('Webhook not found');

      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook delivery' }
      };

      // Call edge function to deliver webhook
      const { data, error } = await supabase.functions.invoke('deliver-webhook', {
        body: {
          webhook_id: id,
          event_type: 'webhook.test',
          payload: testPayload
        }
      });

      if (error) throw error;
      return { success: true, message: 'Test webhook delivered successfully' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export const webhooksAPI = new WebhooksAPI();