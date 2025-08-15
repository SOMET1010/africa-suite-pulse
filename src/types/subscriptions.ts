export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly?: number;
  currency_code: string;
  max_rooms?: number;
  max_users?: number;
  features: any;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSubscription {
  id: string;
  org_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  setup_fee_paid: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionUsage {
  id: string;
  org_id: string;
  subscription_id: string;
  metric_name: string;
  metric_value: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionInput {
  org_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  trial_end?: string;
  metadata?: Record<string, any>;
}

export interface UpdateSubscriptionInput {
  plan_id?: string;
  billing_cycle?: 'monthly' | 'yearly';
  status?: 'active' | 'cancelled' | 'expired' | 'suspended';
  metadata?: Record<string, any>;
}