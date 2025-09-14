import { supabase } from '@/integrations/supabase/client';
import { ApiHelpers, throwIfError } from './api.core';

export interface LoyaltyProgram {
  id: string;
  org_id: string;
  name: string;
  description: string;
  is_active: boolean;
  points_per_night: number;
  points_per_currency_unit: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTier {
  id: string;
  program_id: string;
  name: string;
  code: string;
  min_points: number;
  color: string;
  benefits: any; // JSONB field
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CustomerLoyaltyPoints {
  id: string;
  guest_id: string;
  program_id: string;
  total_points: number;
  tier_id?: string;
  tier_achieved_at?: string;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  program?: any;
  tier?: any;
}

export interface LoyaltyTransaction {
  id: string;
  guest_id: string;
  program_id: string;
  reservation_id?: string;
  transaction_type: string;
  points: number;
  description?: string;
  reference?: string;
  created_at: string;
  created_by?: string;
}

export const loyaltyApi = {
  // Get customer loyalty status
  async getCustomerLoyalty(guestId: string): Promise<CustomerLoyaltyPoints | null> {
    const { data, error } = await supabase
      .from('customer_loyalty_points')
      .select(`
        *,
        program:loyalty_programs(*),
        tier:loyalty_tiers(*)
      `)
      .eq('guest_id', guestId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Get loyalty transactions for a guest
  async getLoyaltyTransactions(guestId: string): Promise<LoyaltyTransaction[]> {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    return throwIfError(data, error);
  },

  // Add loyalty points manually
  async addLoyaltyPoints(
    guestId: string,
    programId: string,
    points: number,
    transactionType: string = 'bonus',
    description?: string,
    reference?: string
  ): Promise<void> {
    const { error } = await supabase.rpc('add_loyalty_points', {
      p_guest_id: guestId,
      p_program_id: programId,
      p_points: points,
      p_transaction_type: transactionType,
      p_description: description,
      p_reference: reference
    });

    if (error) throw error;
  },

  // Get active loyalty program for org
  async getActiveLoyaltyProgram(orgId: string): Promise<LoyaltyProgram | null> {
    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Get loyalty tiers for a program
  async getLoyaltyTiers(programId: string): Promise<LoyaltyTier[]> {
    const { data, error } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('sort_order');

    return throwIfError(data, error);
  }
};