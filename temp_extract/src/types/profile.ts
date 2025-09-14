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

export interface ProfileUpdatePayload {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  preferences?: Record<string, any>;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: 'fr' | 'en';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  dashboard?: {
    defaultView?: 'overview' | 'reservations' | 'analytics';
    refreshInterval?: number;
  };
}