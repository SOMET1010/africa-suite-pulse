import { z } from 'zod';

export const hotelSettingsSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().min(1, 'Fuseau horaire requis'),
  currency: z.string().min(1, 'Devise requise'),
  logo_url: z.string().url('URL invalide').optional().or(z.literal('')),
});

export type HotelSettingsFormData = z.infer<typeof hotelSettingsSchema>;

export const formatCurrency = (amount: number, currency: string): string => {
  const formatters: { [key: string]: Intl.NumberFormat } = {
    XOF: new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF' }),
    EUR: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    MAD: new Intl.NumberFormat('ar-MA', { style: 'currency', currency: 'MAD' }),
    TND: new Intl.NumberFormat('ar-TN', { style: 'currency', currency: 'TND' }),
  };
  
  return formatters[currency]?.format(amount) || `${amount} ${currency}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};