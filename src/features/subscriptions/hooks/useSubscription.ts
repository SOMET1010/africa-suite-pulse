import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrgId } from '@/core/auth/useOrg';
import {
  listSubscriptionPlans,
  getOrganizationSubscription,
  createOrganizationSubscription,
  updateOrganizationSubscription,
  getCurrentUsage,
  trackUsage
} from '../api/subscriptions.api';
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from '@/types/subscriptions';
import { toast } from 'sonner';

// Query Keys
const SUBSCRIPTION_KEYS = {
  plans: ['subscription-plans'] as const,
  orgSubscription: (orgId: string) => ['organization-subscription', orgId] as const,
  usage: (orgId: string) => ['subscription-usage', orgId] as const,
};

// Subscription Plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.plans,
    queryFn: listSubscriptionPlans,
  });
};

// Organization Subscription
export const useOrganizationSubscription = () => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.orgSubscription(orgId || ''),
    queryFn: () => getOrganizationSubscription(orgId || ''),
    enabled: !!orgId,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrganizationSubscription,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: SUBSCRIPTION_KEYS.orgSubscription(data.org_id) 
      });
      toast.success('Abonnement créé avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la création de l\'abonnement: ' + error.message);
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();
  
  return useMutation({
    mutationFn: ({ subscriptionId, updates }: { 
      subscriptionId: string; 
      updates: UpdateSubscriptionInput 
    }) => updateOrganizationSubscription(subscriptionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: SUBSCRIPTION_KEYS.orgSubscription(orgId || '') 
      });
      toast.success('Abonnement mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour: ' + error.message);
    },
  });
};

// Usage Tracking
export const useSubscriptionUsage = () => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.usage(orgId || ''),
    queryFn: () => getCurrentUsage(orgId || ''),
    enabled: !!orgId,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useTrackUsage = () => {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();
  
  return useMutation({
    mutationFn: ({ 
      subscriptionId, 
      metricName, 
      value 
    }: {
      subscriptionId: string;
      metricName: 'rooms' | 'users' | 'transactions' | 'api_calls';
      value: number;
    }) => trackUsage(orgId || '', subscriptionId, metricName, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: SUBSCRIPTION_KEYS.usage(orgId || '') 
      });
    },
  });
};