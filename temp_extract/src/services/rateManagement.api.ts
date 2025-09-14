import { supabase } from '@/integrations/supabase/client';

export interface RateWindow {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  rate_type: 'percentage' | 'fixed';
  adjustment_value: number;
  min_stay?: number;
  max_stay?: number;
  applicable_days: number[];
  client_types: string[];
  room_types: string[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SeasonalRate {
  id: string;
  org_id: string;
  name: string;
  season_type: 'high' | 'low' | 'shoulder' | 'peak';
  start_date: string;
  end_date: string;
  room_type: string;
  base_rate: number;
  weekend_rate?: number;
  multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RateCalculationParams {
  room_type: string;
  check_in: string;
  check_out: string;
  guest_type: 'individual' | 'group' | 'corporate';
  base_rate: number;
}

export interface RateCalculationResult {
  base_rate: number;
  seasonal_adjustment: number;
  window_adjustments: Array<{
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  }>;
  total_rate: number;
  breakdown: {
    subtotal: number;
    adjustments: number;
    final_total: number;
  };
}

export class RateManagementService {
  // Rate Windows
  static async getRateWindows(orgId: string): Promise<RateWindow[]> {
    // Simulate API call for now since table doesn't exist yet
    console.log('Getting rate windows for org:', orgId);
    return [];
  }

  static async createRateWindow(window: Omit<RateWindow, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<RateWindow> {
    // Simulate API call for now since table doesn't exist yet
    console.log('Creating rate window:', window);
    const mockWindow: RateWindow = {
      ...window,
      id: 'mock-' + Date.now(),
      org_id: 'mock-org',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return mockWindow;
  }

  // Seasonal Rates
  static async getSeasonalRates(orgId: string): Promise<SeasonalRate[]> {
    // Simulate API call for now since table doesn't exist yet  
    console.log('Getting seasonal rates for org:', orgId);
    return [];
  }

  static async createSeasonalRate(rate: Omit<SeasonalRate, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<SeasonalRate> {
    // Simulate API call for now since table doesn't exist yet
    console.log('Creating seasonal rate:', rate);
    const mockRate: SeasonalRate = {
      ...rate,
      id: 'mock-' + Date.now(),
      org_id: 'mock-org',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return mockRate;
  }

  // Advanced Rate Calculation with Yield Management
  static async calculateAdvancedRate(params: RateCalculationParams, orgId: string): Promise<RateCalculationResult> {
    try {
      // Get rate windows and seasonal rates
      const [rateWindows, seasonalRates] = await Promise.all([
        this.getRateWindows(orgId),
        this.getSeasonalRates(orgId)
      ]);

      const checkIn = new Date(params.check_in);
      const checkOut = new Date(params.check_out);
      const dayOfWeek = checkIn.getDay();
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      let result: RateCalculationResult = {
        base_rate: params.base_rate,
        seasonal_adjustment: 0,
        window_adjustments: [],
        total_rate: params.base_rate,
        breakdown: {
          subtotal: params.base_rate,
          adjustments: 0,
          final_total: params.base_rate
        }
      };

      // Apply seasonal rates
      const applicableSeasonalRate = seasonalRates.find(rate => {
        const rateStart = new Date(rate.start_date);
        const rateEnd = new Date(rate.end_date);
        return (
          rate.room_type === params.room_type &&
          checkIn >= rateStart &&
          checkIn <= rateEnd
        );
      });

      if (applicableSeasonalRate) {
        const seasonalRate = [0, 6].includes(dayOfWeek) && applicableSeasonalRate.weekend_rate
          ? applicableSeasonalRate.weekend_rate
          : applicableSeasonalRate.base_rate;
        
        result.seasonal_adjustment = seasonalRate * applicableSeasonalRate.multiplier - params.base_rate;
        result.total_rate = seasonalRate * applicableSeasonalRate.multiplier;
        result.breakdown.subtotal = result.total_rate;
      }

      // Apply rate windows
      const applicableWindows = rateWindows.filter(window => {
        const windowStart = new Date(window.start_date);
        const windowEnd = new Date(window.end_date);
        
        return (
          checkIn >= windowStart &&
          checkIn <= windowEnd &&
          window.applicable_days.includes(dayOfWeek) &&
          window.client_types.includes(params.guest_type) &&
          (window.room_types.length === 0 || window.room_types.includes(params.room_type)) &&
          (!window.min_stay || nights >= window.min_stay) &&
          (!window.max_stay || nights <= window.max_stay)
        );
      });

      // Sort by priority and apply adjustments
      applicableWindows.sort((a, b) => a.priority - b.priority);

      let currentRate = result.total_rate;
      for (const window of applicableWindows) {
        let adjustmentAmount = 0;
        
        if (window.rate_type === 'percentage') {
          adjustmentAmount = (currentRate * window.adjustment_value) / 100;
        } else {
          adjustmentAmount = window.adjustment_value;
        }

        result.window_adjustments.push({
          name: window.name,
          type: window.rate_type,
          value: window.adjustment_value,
          amount: adjustmentAmount
        });

        currentRate += adjustmentAmount;
        result.breakdown.adjustments += adjustmentAmount;
      }

      result.total_rate = Math.max(0, currentRate);
      result.breakdown.final_total = result.total_rate;

      return result;
    } catch (error) {
      console.error('Rate calculation error:', error);
      throw error;
    }
  }

  // Yield Management - Dynamic pricing based on occupancy and demand
  static async calculateYieldRate(
    baseParams: RateCalculationParams,
    orgId: string,
    occupancyRate: number = 0.7
  ): Promise<RateCalculationResult> {
    const advancedRate = await this.calculateAdvancedRate(baseParams, orgId);

    // Yield management multipliers based on occupancy
    let yieldMultiplier = 1.0;
    
    if (occupancyRate >= 0.9) {
      yieldMultiplier = 1.3; // High demand, increase price by 30%
    } else if (occupancyRate >= 0.8) {
      yieldMultiplier = 1.15; // Medium-high demand, increase by 15%
    } else if (occupancyRate >= 0.7) {
      yieldMultiplier = 1.0; // Normal demand, no change
    } else if (occupancyRate >= 0.5) {
      yieldMultiplier = 0.9; // Low demand, decrease by 10%
    } else {
      yieldMultiplier = 0.8; // Very low demand, decrease by 20%
    }

    const yieldAdjustment = (advancedRate.total_rate * yieldMultiplier) - advancedRate.total_rate;

    advancedRate.window_adjustments.push({
      name: 'Yield Management',
      type: 'percentage',
      value: (yieldMultiplier - 1) * 100,
      amount: yieldAdjustment
    });

    advancedRate.total_rate = Math.max(0, advancedRate.total_rate + yieldAdjustment);
    advancedRate.breakdown.adjustments += yieldAdjustment;
    advancedRate.breakdown.final_total = advancedRate.total_rate;

    return advancedRate;
  }

  // Get current occupancy rate for yield management
  static async getCurrentOccupancyRate(orgId: string, date: string): Promise<number> {
    try {
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id')
        .eq('org_id', orgId);

      const { data: occupiedRooms } = await supabase
        .from('reservations')
        .select('room_id')
        .eq('org_id', orgId)
        .lte('date_arrival', date)
        .gte('date_departure', date)
        .in('status', ['confirmed', 'present']);

      const totalRooms = rooms?.length || 1;
      const occupiedCount = occupiedRooms?.length || 0;

      return occupiedCount / totalRooms;
    } catch (error) {
      console.error('Error calculating occupancy rate:', error);
      return 0.7; // Default fallback
    }
  }
}