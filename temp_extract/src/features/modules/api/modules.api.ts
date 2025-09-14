/**
 * API functions for module management
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  Module, 
  DeploymentType, 
  OrganizationModule, 
  ModulePackage, 
  ModuleCostBreakdown,
  ActivateModuleRequest 
} from '@/types/modules';

// Get all available modules
export async function getModules() {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('base_price_monthly', { ascending: true });

  if (error) throw error;
  return data as Module[];
}

// Get deployment types
export async function getDeploymentTypes() {
  const { data, error } = await supabase
    .from('deployment_types')
    .select('*')
    .eq('is_active', true)
    .order('price_modifier', { ascending: true });

  if (error) throw error;
  return data as DeploymentType[];
}

// Get organization modules with details
export async function getOrganizationModules(orgId: string) {
  const { data, error } = await supabase
    .from('organization_modules')
    .select(`
      *,
      module:modules(*),
      deployment_type:deployment_types(*)
    `)
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('activated_at', { ascending: false });

  if (error) throw error;
  return data as OrganizationModule[];
}

// Get module packages
export async function getModulePackages() {
  const { data, error } = await supabase
    .from('module_packages')
    .select('*')
    .eq('is_active', true)
    .order('base_price_monthly', { ascending: true });

  if (error) throw error;
  return data as ModulePackage[];
}

// Calculate organization module cost
export async function calculateOrganizationCost(orgId: string) {
  const { data, error } = await supabase.rpc('calculate_organization_module_cost', {
    p_org_id: orgId
  });

  if (error) throw error;
  return data[0] as ModuleCostBreakdown;
}

// Activate module for organization
export async function activateModule(orgId: string, request: ActivateModuleRequest) {
  const { data, error } = await supabase.rpc('activate_organization_module', {
    p_org_id: orgId,
    p_module_code: request.module_code,
    p_deployment_type_code: request.deployment_type_code,
    p_trial_days: request.trial_days || null
  });

  if (error) throw error;
  return data;
}

// Deactivate module
export async function deactivateModule(orgModuleId: string) {
  const { error } = await supabase
    .from('organization_modules')
    .update({
      is_active: false,
      deactivated_at: new Date().toISOString()
    })
    .eq('id', orgModuleId);

  if (error) throw error;
  return true;
}

// Update deployment type for module
export async function updateModuleDeployment(orgModuleId: string, deploymentTypeId: string) {
  const { error } = await supabase
    .from('organization_modules')
    .update({
      deployment_type_id: deploymentTypeId,
      updated_at: new Date().toISOString()
    })
    .eq('id', orgModuleId);

  if (error) throw error;
  return true;
}