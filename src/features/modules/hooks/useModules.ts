/**
 * React Query hooks for module management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOrgId } from '@/core/auth/OrgProvider';
import {
  getModules,
  getDeploymentTypes,
  getOrganizationModules,
  getModulePackages,
  calculateOrganizationCost,
  activateModule,
  deactivateModule,
  updateModuleDeployment
} from '../api/modules.api';
import type { ActivateModuleRequest } from '@/types/modules';

// Get all available modules
export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: getModules
  });
}

// Get deployment types
export function useDeploymentTypes() {
  return useQuery({
    queryKey: ['deployment-types'],
    queryFn: getDeploymentTypes
  });
}

// Get organization modules
export function useOrganizationModules() {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: ['organization-modules', orgId],
    queryFn: () => getOrganizationModules(orgId!),
    enabled: !!orgId
  });
}

// Get module packages
export function useModulePackages() {
  return useQuery({
    queryKey: ['module-packages'],
    queryFn: getModulePackages
  });
}

// Get organization cost breakdown
export function useOrganizationCost() {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: ['organization-cost', orgId],
    queryFn: () => calculateOrganizationCost(orgId!),
    enabled: !!orgId
  });
}

// Activate module mutation
export function useActivateModule() {
  const queryClient = useQueryClient();
  const { orgId } = useOrgId();

  return useMutation({
    mutationFn: (request: ActivateModuleRequest) => activateModule(orgId!, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-modules'] });
      queryClient.invalidateQueries({ queryKey: ['organization-cost'] });
      toast.success('Module activé avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de l'activation: ${error.message}`);
    }
  });
}

// Deactivate module mutation
export function useDeactivateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-modules'] });
      queryClient.invalidateQueries({ queryKey: ['organization-cost'] });
      toast.success('Module désactivé avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la désactivation: ${error.message}`);
    }
  });
}

// Update deployment type mutation
export function useUpdateModuleDeployment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgModuleId, deploymentTypeId }: { orgModuleId: string; deploymentTypeId: string }) =>
      updateModuleDeployment(orgModuleId, deploymentTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-modules'] });
      queryClient.invalidateQueries({ queryKey: ['organization-cost'] });
      toast.success('Type de déploiement mis à jour');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });
}