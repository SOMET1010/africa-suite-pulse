export interface HotelSettings {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone: string;
  currency: string;
  logo_url?: string;
  is_activated: boolean;
  activation_code?: string;
  created_at: string;
  updated_at: string;
}

export interface HotelSettingsInput {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone: string;
  currency: string;
  logo_url?: string;
}

export interface HotelSettingsUpdate {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  logo_url?: string;
}

export interface RoomType {
  id: string;
  org_id: string;
  code: string;
  label: string;
  capacity: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

export const CURRENCIES = [
  { value: 'XOF', label: 'Franc CFA (XOF)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar US (USD)' },
  { value: 'MAD', label: 'Dirham Marocain (MAD)' },
  { value: 'TND', label: 'Dinar Tunisien (TND)' },
];

export const TIMEZONES = [
  { value: 'Africa/Abidjan', label: 'Afrique/Abidjan (GMT+0)' },
  { value: 'Africa/Casablanca', label: 'Afrique/Casablanca (GMT+1)' },
  { value: 'Africa/Tunis', label: 'Afrique/Tunis (GMT+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
];

export const COUNTRIES = [
  { value: 'CI', label: "Côte d'Ivoire" },
  { value: 'MA', label: 'Maroc' },
  { value: 'TN', label: 'Tunisie' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'FR', label: 'France' },
];