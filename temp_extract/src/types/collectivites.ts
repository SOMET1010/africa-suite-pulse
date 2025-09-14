/**
 * Types for Collectivités module
 */

export interface CollectiveOrganization {
  id: string;
  org_id: string;
  name: string;
  code: string;
  organization_type: 'school' | 'company' | 'administration' | 'association';
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  budget_limit?: number;
  budget_consumed: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CollectiveBeneficiary {
  id: string;
  org_id: string;
  collective_organization_id: string;
  guest_id?: string;
  beneficiary_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  category: 'student' | 'employee' | 'teacher' | 'visitor';
  grade_level?: string;
  department?: string;
  dietary_restrictions: string[];
  allergies: string[];
  credit_balance: number;
  monthly_allowance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubsidyProgram {
  id: string;
  org_id: string;
  collective_organization_id: string;
  name: string;
  code: string;
  program_type: 'fixed_amount' | 'percentage' | 'free_meal' | 'tiered';
  rules: Record<string, any>;
  valid_from?: string;
  valid_until?: string;
  applicable_categories: string[];
  applicable_business_types: string[];
  daily_limit?: number;
  weekly_limit?: number;
  monthly_limit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BeneficiaryCard {
  id: string;
  org_id: string;
  beneficiary_id: string;
  card_number: string;
  card_type: 'nfc' | 'qr' | 'rfid';
  status: 'active' | 'blocked' | 'lost' | 'expired';
  issued_date: string;
  expires_date?: string;
  last_used_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CollectiveMeal {
  id: string;
  org_id: string;
  beneficiary_id: string;
  collective_organization_id: string;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  total_amount: number;
  subsidy_amount: number;
  paid_amount: number;
  payment_method?: string;
  business_type: string;
  pos_order_id?: string;
  attended_at: string;
  created_at: string;
}

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: '🍽️',
    color: 'bg-gradient-to-br from-orange-400 to-red-500',
    description: 'Service de restauration complète'
  },
  {
    id: 'fast_food',
    name: 'Fast-Food',
    icon: '🍔',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    description: 'Restauration rapide'
  },
  {
    id: 'bar',
    name: 'Bar',
    icon: '🍹',
    color: 'bg-gradient-to-br from-blue-400 to-purple-500',
    description: 'Service de boissons et cocktails'
  },
  {
    id: 'boutique',
    name: 'Boutique',
    icon: '🛍️',
    color: 'bg-gradient-to-br from-pink-400 to-purple-500',
    description: 'Vente de produits divers'
  },
  {
    id: 'collectivites',
    name: 'Collectivités',
    icon: '🏫',
    color: 'bg-gradient-to-br from-green-400 to-teal-500',
    description: 'Cantines scolaires et restaurants d\'entreprise'
  }
];