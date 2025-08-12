import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type RateWindowRow = Database['public']['Tables']['rate_windows']['Row'];

export interface RateWindow extends Omit<RateWindowRow, 'day_conditions'> {
  day_conditions: {
    monday?: { arrival?: boolean; departure?: boolean; stay?: boolean };
    tuesday?: { arrival?: boolean; departure?: boolean; stay?: boolean };
    wednesday?: { arrival?: boolean; departure?: boolean; stay?: boolean };
    thursday?: { arrival?: boolean; departure?: boolean; stay?: boolean };
    friday?: { arrival?: boolean; departure?: boolean; stay?: boolean };
    saturday?: { arrival?: boolean; departure?: boolean; stay?: boolean };
    sunday?: { arrival?: boolean; departure?: boolean; stay?: boolean };
  };
}

export interface RateCalculationParams {
  orgId: string;
  roomType?: string;
  arrivalDate: string;
  departureDate: string;
  adults: number;
  children: number;
}

export interface RateCalculationResult {
  totalAmount: number;
  dailyRates: Array<{
    date: string;
    baseRate: number;
    adjustedRate: number;
    rateWindow: RateWindow | null;
  }>;
  breakdown: {
    accommodation: number;
    extras: number;
    taxes: number;
  };
}

export class RateCalculationService {
  /**
   * Calculate rate for a reservation based on room type, dates, and occupancy
   */
  static async calculateRate(params: RateCalculationParams): Promise<RateCalculationResult> {
    const { orgId, roomType, arrivalDate, departureDate, adults, children } = params;
    
    console.log('🔄 Calculating rate for:', params);
    
    // Get all applicable rate windows
    const rateWindows = await this.getApplicableRateWindows(orgId, roomType, arrivalDate, departureDate);
    
    // Generate daily rates
    const dailyRates = await this.generateDailyRates(
      rateWindows, 
      arrivalDate, 
      departureDate,
      adults,
      children
    );
    
    // Calculate totals
    const totalAmount = dailyRates.reduce((sum, rate) => sum + rate.adjustedRate, 0);
    
    const result: RateCalculationResult = {
      totalAmount,
      dailyRates,
      breakdown: {
        accommodation: totalAmount,
        extras: 0, // TODO: Add extras calculation
        taxes: 0,  // TODO: Add tax calculation
      },
    };
    
    console.log('✅ Rate calculation result:', result);
    return result;
  }
  
  /**
   * Get rate windows that apply to the given period
   */
  private static async getApplicableRateWindows(
    orgId: string, 
    roomType?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<RateWindow[]> {
    let query = supabase
      .from('rate_windows')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('priority', { ascending: false }); // Higher priority first
    
    // Filter by room type if specified
    if (roomType) {
      query = query.or(`room_type_id.is.null,room_type_id.eq.${roomType}`);
    }
    
    // Filter by date range if specified
    if (startDate && endDate) {
      query = query
        .lte('valid_from', endDate)
        .gte('valid_until', startDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching rate windows:', error);
      throw error;
    }
    
    return (data || []).map(row => ({
      ...row,
      day_conditions: typeof row.day_conditions === 'string' ? 
        JSON.parse(row.day_conditions) : 
        row.day_conditions
    })) as RateWindow[];
  }
  
  /**
   * Generate daily rates for each day in the stay
   */
  private static async generateDailyRates(
    rateWindows: RateWindow[],
    arrivalDate: string,
    departureDate: string,
    adults: number,
    children: number
  ) {
    const dailyRates = [];
    const startDate = new Date(arrivalDate);
    const endDate = new Date(departureDate);
    
    for (let currentDate = new Date(startDate); currentDate < endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = this.getDayOfWeek(currentDate);
      
      // Find best rate window for this date
      const applicableWindow = this.findBestRateWindow(
        rateWindows,
        dateStr,
        dayOfWeek,
        dateStr === arrivalDate, // is arrival day
        this.getNextDay(dateStr) === departureDate // is departure day
      );
      
      let baseRate = applicableWindow?.base_rate || 0;
      let adjustedRate = baseRate;
      
      // Apply occupancy adjustments
      if (applicableWindow) {
        if (adults === 1 && applicableWindow.single_rate) {
          adjustedRate = applicableWindow.single_rate;
        } else if (adults > 2 && applicableWindow.extra_person_rate) {
          const extraPersons = adults - 2;
          adjustedRate = baseRate + (extraPersons * applicableWindow.extra_person_rate);
        }
      }
      
      dailyRates.push({
        date: dateStr,
        baseRate,
        adjustedRate,
        rateWindow: applicableWindow,
      });
    }
    
    return dailyRates;
  }
  
  /**
   * Find the best rate window for a specific date and conditions
   */
  private static findBestRateWindow(
    rateWindows: RateWindow[],
    date: string,
    dayOfWeek: string,
    isArrival: boolean,
    isDeparture: boolean
  ): RateWindow | null {
    // Filter windows that are valid for this date
    const validWindows = rateWindows.filter(window => {
      // Check date validity
      if (window.valid_from > date || window.valid_until < date) {
        return false;
      }
      
      // Check day conditions
      const dayCondition = window.day_conditions[dayOfWeek as keyof typeof window.day_conditions];
      if (dayCondition) {
        if (isArrival && dayCondition.arrival === false) return false;
        if (isDeparture && dayCondition.departure === false) return false;
        if (!isArrival && !isDeparture && dayCondition.stay === false) return false;
      }
      
      return true;
    });
    
    // Return the highest priority valid window
    return validWindows[0] || null;
  }
  
  /**
   * Get day of week in lowercase
   */
  private static getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }
  
  /**
   * Get next day as ISO string
   */
  private static getNextDay(dateStr: string): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Get default rate for a room type (fallback when no rate windows match)
   */
  static async getDefaultRate(orgId: string, roomType?: string): Promise<number> {
    // TODO: Implement default rates from room types or hotel settings
    return 0;
  }
  
  /**
   * Create a new rate window
   */
  static async createRateWindow(
    rateWindow: Omit<RateWindow, 'id' | 'created_at' | 'updated_at'> & { 
      code: string; 
      name: string; 
    }
  ): Promise<RateWindow> {
    const insertData = {
      ...rateWindow,
      day_conditions: JSON.stringify(rateWindow.day_conditions),
    };
    
    const { data, error } = await supabase
      .from('rate_windows')
      .insert(insertData)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      day_conditions: typeof data.day_conditions === 'string' ? 
        JSON.parse(data.day_conditions) : 
        data.day_conditions
    } as RateWindow;
  }
  
  /**
   * Update a rate window
   */
  static async updateRateWindow(id: string, updates: Partial<RateWindow>): Promise<RateWindow> {
    const updateData = {
      ...updates,
      day_conditions: updates.day_conditions ? 
        JSON.stringify(updates.day_conditions) : 
        undefined,
    };
    
    const { data, error } = await supabase
      .from('rate_windows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      day_conditions: typeof data.day_conditions === 'string' ? 
        JSON.parse(data.day_conditions) : 
        data.day_conditions
    } as RateWindow;
  }
  
  /**
   * Delete a rate window
   */
  static async deleteRateWindow(id: string): Promise<void> {
    const { error } = await supabase
      .from('rate_windows')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}