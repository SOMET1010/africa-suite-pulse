import { supabase } from "@/integrations/supabase/client";
import type { 
  SubscriptionPlan, 
  OrganizationSubscription, 
  SubscriptionUsage,
  CreateSubscriptionInput,
  UpdateSubscriptionInput 
} from "@/types/subscriptions";

// Subscription Plans
export const listSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw error;
  return data || [];
};

export const getSubscriptionPlan = async (planId: string): Promise<SubscriptionPlan | null> => {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
};

// Organization Subscriptions
export const getOrganizationSubscription = async (orgId: string): Promise<OrganizationSubscription | null> => {
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('org_id', orgId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createOrganizationSubscription = async (input: CreateSubscriptionInput): Promise<OrganizationSubscription> => {
  // Calculate period end based on billing cycle
  const now = new Date();
  const periodEnd = new Date(now);
  if (input.billing_cycle === 'yearly') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const { data, error } = await supabase
    .from('organization_subscriptions')
    .insert({
      ...input,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const updateOrganizationSubscription = async (
  subscriptionId: string, 
  updates: UpdateSubscriptionInput
): Promise<OrganizationSubscription> => {
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .update(updates)
    .eq('id', subscriptionId)
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

// Subscription Usage
export const getCurrentUsage = async (orgId: string): Promise<SubscriptionUsage[]> => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('subscription_usage')
    .select('*')
    .eq('org_id', orgId)
    .gte('period_start', startOfMonth.toISOString())
    .order('metric_name');

  if (error) throw error;
  return data || [];
};

export const trackUsage = async (
  orgId: string,
  subscriptionId: string,
  metricName: 'rooms' | 'users' | 'transactions' | 'api_calls',
  value: number
): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { error } = await supabase
    .from('subscription_usage')
    .upsert({
      org_id: orgId,
      subscription_id: subscriptionId,
      metric_name: metricName,
      metric_value: value,
      period_start: startOfMonth.toISOString(),
      period_end: endOfMonth.toISOString(),
    }, {
      onConflict: 'org_id,subscription_id,metric_name,period_start'
    });

  if (error) throw error;
};

// Business Logic
export const calculateSubscriptionPrice = (
  plan: SubscriptionPlan, 
  billingCycle: 'monthly' | 'yearly'
): number => {
  if (billingCycle === 'yearly' && plan.price_yearly) {
    return plan.price_yearly;
  }
  return plan.price_monthly;
};

export const hasFeature = (subscription: OrganizationSubscription, feature: string): boolean => {
  return subscription.plan?.features[feature] === true;
};

export const isUsageLimitReached = (
  subscription: OrganizationSubscription,
  usage: SubscriptionUsage[],
  metric: 'rooms' | 'users'
): boolean => {
  const plan = subscription.plan;
  if (!plan) return false;

  const currentUsage = usage.find(u => u.metric_name === metric);
  if (!currentUsage) return false;

  const limit = metric === 'rooms' ? plan.max_rooms : plan.max_users;
  if (!limit) return false; // No limit for this plan

  return currentUsage.metric_value >= limit;
};