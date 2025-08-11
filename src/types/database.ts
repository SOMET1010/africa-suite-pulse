// Unified database types for the application
import type { Database } from '@/integrations/supabase/types';

// Re-export main Database type
export type { Database } from '@/integrations/supabase/types';

// Table row types
export type Profile = Database['public']['Tables']['user_profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type Permission = Database['public']['Tables']['permissions']['Row'];
export type ProfilePermission = Database['public']['Tables']['profile_permissions']['Row'];
export type ProfilePermissionInsert = Database['public']['Tables']['profile_permissions']['Insert'];

export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type PaymentMethodInsert = Database['public']['Tables']['payment_methods']['Insert'];
export type PaymentMethodUpdate = Database['public']['Tables']['payment_methods']['Update'];

export type PaymentTerminal = Database['public']['Tables']['payment_terminals']['Row'];
export type PaymentTerminalInsert = Database['public']['Tables']['payment_terminals']['Insert'];
export type PaymentTerminalUpdate = Database['public']['Tables']['payment_terminals']['Update'];

export type Currency = Database['public']['Tables']['currencies']['Row'];
export type CurrencyInsert = Database['public']['Tables']['currencies']['Insert'];
export type CurrencyUpdate = Database['public']['Tables']['currencies']['Update'];

// Manual types for payment_transactions (not in generated schema)
export type PaymentTransaction = {
  id: string;
  org_id: string;
  invoice_id: string;
  method_id: string;
  amount: number;
  currency_code: string | null;
  status: string;
  reference: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PaymentTransactionInsert = {
  org_id: string;
  invoice_id: string;
  method_id: string;
  amount: number;
  currency_code?: string | null;
  status?: string;
  reference?: string | null;
  metadata?: Record<string, unknown>;
};

export type PaymentTransactionUpdate = {
  invoice_id?: string;
  method_id?: string;
  amount?: number;
  currency_code?: string | null;
  status?: string;
  reference?: string | null;
  metadata?: Record<string, unknown>;
};

export type StaffInvitation = Database['public']['Tables']['staff_invitations']['Row'];
export type StaffInvitationInsert = Database['public']['Tables']['staff_invitations']['Insert'];

// App Users type (from profiles_backup table schema)
export type AppUser = {
  id: string;
  user_id: string;
  org_id: string;
  login: string;
  full_name: string;
  profile_id: string | null;
  password_expires_on: string | null;
  active: boolean;
  created_at: string;
  last_login_at: string | null;
  profiles?: {
    id: string;
    code: string;
    label: string;
    access_level: string;
  } | null;
};

export type AppUserInsert = {
  user_id: string;
  org_id: string;
  login: string;
  full_name: string;
  profile_id?: string | null;
  password_expires_on?: string | null;
  active?: boolean;
};

export type AppUserUpdate = {
  login?: string;
  full_name?: string;
  profile_id?: string | null;
  password_expires_on?: string | null;
  active?: boolean;
  last_login_at?: string | null;
};

// Payment Transaction with relations
export type PaymentTransactionWithMethod = PaymentTransaction & {
  payment_methods: {
    label: string;
    code: string;
  };
};

// Invitation with role type
export type InvitationPayload = {
  org_id: string;
  email: string;
  role: 'admin' | 'staff' | 'manager';
};

// Service management types
export type ServiceFamily = {
  id: string;
  org_id: string;
  code: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceFamilyInsert = {
  org_id: string;
  code: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
};

export type ServiceFamilyUpdate = {
  code?: string;
  label?: string;
  description?: string;
  icon?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
};

export type Service = {
  id: string;
  org_id: string;
  family_id: string;
  code: string;
  label: string;
  description?: string;
  price: number;
  cost_price?: number;
  profit_margin?: number;
  vat_rate: number;
  unit?: string;
  min_quantity?: number;
  max_quantity?: number;
  tags?: string[];
  is_active: boolean;
  is_free_price: boolean;
  created_at: string;
  updated_at: string;
  family?: {
    id: string;
    code: string;
    label: string;
    color?: string;
    icon?: string;
  };
};

export type ServiceInsert = {
  org_id: string;
  family_id: string;
  code: string;
  label: string;
  description?: string;
  price?: number;
  cost_price?: number;
  profit_margin?: number;
  vat_rate?: number;
  unit?: string;
  min_quantity?: number;
  max_quantity?: number;
  tags?: string[];
  is_active?: boolean;
  is_free_price?: boolean;
};

export type ServiceUpdate = {
  family_id?: string;
  code?: string;
  label?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  profit_margin?: number;
  vat_rate?: number;
  unit?: string;
  min_quantity?: number;
  max_quantity?: number;
  tags?: string[];
  is_active?: boolean;
  is_free_price?: boolean;
};

export type ArrangementService = {
  id?: string;
  arrangement_id?: string;
  service_id: string;
  quantity: number;
  unit_price?: number;
  is_included: boolean;
  is_optional: boolean;
  order_index: number;
  created_at?: string;
  // For joined data
  service?: Service;
};

export type Arrangement = {
  id: string;
  org_id: string;
  code: string;
  label: string;
  description?: string;
  base_price?: number;
  min_nights?: number;
  max_nights?: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  services: ArrangementService[];
};

export type ArrangementInsert = {
  org_id: string;
  code: string;
  label: string;
  description?: string;
  base_price?: number;
  min_nights?: number;
  max_nights?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
};

export type ArrangementUpdate = {
  code?: string;
  label?: string;
  description?: string;
  base_price?: number;
  min_nights?: number;
  max_nights?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
};

export type ServiceStats = {
  totalFamilies: number;
  activeFamilies: number;
  totalServices: number;
  activeServices: number;
  totalArrangements: number;
  activeArrangements: number;
  averageServicePrice: number;
  totalServiceValue: number;
  // Legacy properties for compatibility
  averagePrice: number;
  byFamily: Record<string, number>;
  totalRevenuePotential: number;
  profitMargin: number;
};

// RPC function response types
export type HasPermissionResponse = boolean;

// Supabase query response types
export type SupabaseResponse<T> = {
  data: T | null;
  error: any;
};

export type SupabaseMultiResponse<T> = {
  data: T[] | null;
  error: any;
};