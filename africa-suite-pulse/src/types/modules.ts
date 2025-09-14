/**
 * Types for modular system management
 */

export type ModuleCategory = 'core' | 'hospitality' | 'pos' | 'operations' | 'analytics' | 'enterprise';

export type Module = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: ModuleCategory;
  base_price_monthly: number;
  is_core: boolean;
  is_active: boolean;
  dependencies: string[];
  features: string[];
  created_at: string;
  updated_at: string;
};

export type DeploymentType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_modifier: number;
  setup_fee: number;
  is_active: boolean;
  created_at: string;
};

export type OrganizationModule = {
  id: string;
  org_id: string;
  module_id: string;
  deployment_type_id: string;
  is_active: boolean;
  activated_at: string;
  deactivated_at: string | null;
  trial_until: string | null;
  custom_price: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  module?: Module;
  deployment_type?: DeploymentType;
};

export type ModulePackage = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  target_audience: string | null;
  module_ids: string[];
  base_price_monthly: number;
  discount_percentage: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ModuleCostBreakdown = {
  total_monthly_cost: number;
  total_setup_fees: number;
  module_count: number;
  active_modules: {
    module_code: string;
    module_name: string;
    deployment_type: string;
    monthly_cost: number;
    is_trial: boolean;
  }[];
};

export type ActivateModuleRequest = {
  module_code: string;
  deployment_type_code: string;
  trial_days?: number;
};