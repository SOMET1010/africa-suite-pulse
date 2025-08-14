import { supabase } from '@/integrations/supabase/client';
import { ApiHelpers, throwIfError } from './api.core';

// Types
export interface AnalyticsPrediction {
  id: string;
  org_id: string;
  prediction_type: 'occupancy' | 'revenue' | 'demand';
  target_date: string;
  predicted_value: number;
  confidence_score: number;
  input_features: Record<string, any>;
  model_version: string;
  created_at: string;
  created_by?: string;
}

export interface CustomDashboard {
  id: string;
  org_id: string;
  user_id?: string;
  name: string;
  description?: string;
  layout: Record<string, any>;
  filters: Record<string, any>;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDashboardData {
  name: string;
  description?: string;
  layout: Record<string, any>;
  filters?: Record<string, any>;
  is_public?: boolean;
  is_default?: boolean;
}

export interface PredictionRequest {
  prediction_type: 'occupancy' | 'revenue' | 'demand';
  target_date: string;
  include_features?: string[];
}

export class AnalyticsAPI {
  // Get predictions
  async getPredictions(
    type?: 'occupancy' | 'revenue' | 'demand',
    days = 30
  ): Promise<AnalyticsPrediction[]> {
    let query = supabase
      .from('analytics_predictions')
      .select('*')
      .gte('target_date', new Date().toISOString().split('T')[0])
      .order('target_date', { ascending: true })
      .limit(days);

    if (type) {
      query = query.eq('prediction_type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(prediction => ({
      ...prediction,
      prediction_type: prediction.prediction_type as 'occupancy' | 'revenue' | 'demand',
      input_features: prediction.input_features as Record<string, any>
    }));
  }

  // Generate new prediction
  async generatePrediction(request: PredictionRequest): Promise<AnalyticsPrediction> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-prediction', {
        body: request
      });

      if (error) throw error;
      return {
        ...data,
        input_features: data.input_features as Record<string, any>
      };
    } catch (error: any) {
      throw new Error(`Failed to generate prediction: ${error.message}`);
    }
  }

  // Get occupancy forecast
  async getOccupancyForecast(days = 30): Promise<{
    dates: string[];
    occupancy: number[];
    confidence: number[];
  }> {
    const predictions = await this.getPredictions('occupancy', days);
    
    return {
      dates: predictions.map(p => p.target_date),
      occupancy: predictions.map(p => p.predicted_value),
      confidence: predictions.map(p => p.confidence_score)
    };
  }

  // Get revenue forecast
  async getRevenueForecast(days = 30): Promise<{
    dates: string[];
    revenue: number[];
    confidence: number[];
  }> {
    const predictions = await this.getPredictions('revenue', days);
    
    return {
      dates: predictions.map(p => p.target_date),
      revenue: predictions.map(p => p.predicted_value),
      confidence: predictions.map(p => p.confidence_score)
    };
  }

  // Dashboard management
  async getDashboards(): Promise<CustomDashboard[]> {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dashboard => ({
      ...dashboard,
      layout: dashboard.layout as Record<string, any>,
      filters: dashboard.filters as Record<string, any>
    }));
  }

  async getDashboard(id: string): Promise<CustomDashboard | null> {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data ? {
      ...data,
      layout: data.layout as Record<string, any>,
      filters: data.filters as Record<string, any>
    } : null;
  }

  async createDashboard(dashboardData: CreateDashboardData): Promise<CustomDashboard> {
    // Get current user's org_id and user_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: appUser } = await supabase
      .from('app_users')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (!appUser?.org_id) throw new Error('Organization not found');

    const { data, error } = await supabase
      .from('custom_dashboards')
      .insert({
        org_id: appUser.org_id,
        user_id: user.id,
        name: dashboardData.name,
        description: dashboardData.description,
        layout: dashboardData.layout,
        filters: dashboardData.filters || {},
        is_public: dashboardData.is_public || false,
        is_default: dashboardData.is_default || false,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      layout: data.layout as Record<string, any>,
      filters: data.filters as Record<string, any>
    };
  }

  async updateDashboard(id: string, updates: Partial<CreateDashboardData>): Promise<CustomDashboard> {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      layout: data.layout as Record<string, any>,
      filters: data.filters as Record<string, any>
    };
  }

  async deleteDashboard(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_dashboards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Advanced analytics queries
  async getRevenueOptimization(): Promise<{
    current_adr: number;
    optimal_adr: number;
    potential_increase: number;
    recommendations: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('revenue-optimization', {
        body: {}
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(`Failed to get revenue optimization: ${error.message}`);
    }
  }

  async getMarketAnalysis(): Promise<{
    market_position: number;
    competitor_rates: Record<string, number>;
    demand_trends: Array<{ date: string; demand: number }>;
    recommendations: string[];
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('market-analysis', {
        body: {}
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(`Failed to get market analysis: ${error.message}`);
    }
  }

  // Automated reporting
  async scheduleReport(config: {
    report_type: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv';
  }): Promise<{ success: boolean; schedule_id: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('schedule-report', {
        body: config
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(`Failed to schedule report: ${error.message}`);
    }
  }
}

export const analyticsAPI = new AnalyticsAPI();