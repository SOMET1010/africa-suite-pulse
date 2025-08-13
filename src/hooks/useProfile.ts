import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  preferences: Record<string, any>;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setProfile(data);
      logger.debug('Profile fetched successfully', { userId, hasData: !!data });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch profile');
      setError(error);
      logger.error('Failed to fetch profile', error, { userId });
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setError(null);
      
      if (!profile) {
        throw new Error('No profile to update');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      logger.audit('Profile updated', { profileId: profile.id, updates: Object.keys(updates) });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      logger.error('Failed to update profile', error, { profileId: profile?.id });
      throw error;
    }
  };

  // Update last seen
  const updateLastSeen = async () => {
    if (!profile) return;

    try {
      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', profile.id);
      
      logger.debug('Last seen updated', { profileId: profile.id });
    } catch (err) {
      logger.error('Failed to update last seen', err, { profileId: profile.id });
    }
  };

  // Initialize profile on mount
  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchProfile(user.id);
      } else {
        setLoading(false);
      }
    };

    initialize();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update last seen periodically
  useEffect(() => {
    if (!profile) return;

    updateLastSeen();

    const interval = setInterval(updateLastSeen, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [profile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: profile ? () => fetchProfile(profile.id) : undefined,
  };
}