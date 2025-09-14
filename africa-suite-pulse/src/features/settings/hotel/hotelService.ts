import { supabase } from '@/integrations/supabase/client';
import type { HotelSettings, HotelSettingsInput, HotelSettingsUpdate } from '../types';

export class HotelService {
  static async getHotelSettings(orgId: string): Promise<HotelSettings | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('hotel_settings')
        .select('*')
        .eq('org_id', orgId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching hotel settings:', error);
      throw new Error('Erreur lors de la récupération des paramètres hôtel');
    }
  }

  static async createHotelSettings(
    orgId: string, 
    settings: HotelSettingsInput
  ): Promise<HotelSettings> {
    try {
      const { data, error } = await (supabase as any)
        .from('hotel_settings')
        .insert({
          org_id: orgId,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating hotel settings:', error);
      throw new Error('Erreur lors de la création des paramètres hôtel');
    }
  }

  static async updateHotelSettings(
    id: string, 
    settings: HotelSettingsUpdate
  ): Promise<HotelSettings> {
    try {
      const { data, error } = await (supabase as any)
        .from('hotel_settings')
        .update(settings)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating hotel settings:', error);
      throw new Error('Erreur lors de la mise à jour des paramètres hôtel');
    }
  }

  static async activateHotel(id: string, activationCode: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('hotel_settings')
        .update({ 
          is_activated: true,
          activation_code: activationCode 
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error activating hotel:', error);
      throw new Error("Erreur lors de l'activation de l'hôtel");
    }
  }
}