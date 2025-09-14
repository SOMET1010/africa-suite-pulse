/**
 * Integration between business type selection and module activation
 */

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  useActivateModule, 
  useOrganizationModules,
  useModules 
} from '@/features/modules/hooks/useModules';
import { type BusinessType } from '@/types/collectivites';

// Mapping business types to required modules
const BUSINESS_MODULE_MAPPING: Record<string, string[]> = {
  restaurant: ['pos-restaurant', 'inventory-restaurant', 'staff-management'],
  fast_food: ['pos-fast-food', 'quick-orders', 'delivery-tracking'],
  bar: ['pos-bar', 'mixology', 'tab-management'],
  boutique: ['pos-retail', 'inventory-retail', 'barcode-scanner'],
  collectivites: ['pos-collectivites', 'badge-scanner', 'subsidy-management', 'meal-planning']
};

const BUSINESS_PACKAGES: Record<string, string> = {
  restaurant: 'restaurant-complete',
  fast_food: 'fast-food-complete', 
  bar: 'bar-complete',
  boutique: 'retail-complete',
  collectivites: 'collectivites-complete'
};

interface BusinessModuleIntegrationProps {
  businessType: string;
  onModulesActivated?: () => void;
}

export function BusinessModuleIntegration({ 
  businessType, 
  onModulesActivated 
}: BusinessModuleIntegrationProps) {
  const { toast } = useToast();
  const { data: modules = [] } = useModules();
  const { data: organizationModules = [] } = useOrganizationModules();
  const activateModuleMutation = useActivateModule();

  const activeModuleCodes = organizationModules
    .filter(om => om.is_active)
    .map(om => om.module?.code)
    .filter(Boolean);

  useEffect(() => {
    const requiredModules = BUSINESS_MODULE_MAPPING[businessType] || [];
    const missingModules = requiredModules.filter(
      moduleCode => !activeModuleCodes.includes(moduleCode)
    );

    if (missingModules.length > 0) {
      // Check if modules exist in catalog
      const availableModules = modules.filter(m => 
        missingModules.includes(m.code) && m.is_active
      );

      if (availableModules.length > 0) {
        toast({
          title: "Modules recommandés détectés",
          description: `Des modules spécialisés pour ${businessType} sont disponibles. Voulez-vous les activer ?`,
          action: (
            <div className="flex gap-2">
              <button
                onClick={activateBusinessModules}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                Activer
              </button>
            </div>
          ),
        });
      }
    }
  }, [businessType, activeModuleCodes, modules]);

  const activateBusinessModules = async () => {
    const requiredModules = BUSINESS_MODULE_MAPPING[businessType] || [];
    const missingModules = requiredModules.filter(
      moduleCode => !activeModuleCodes.includes(moduleCode)
    );

    const availableModules = modules.filter(m => 
      missingModules.includes(m.code) && m.is_active
    );

    try {
      for (const module of availableModules) {
        await activateModuleMutation.mutateAsync({
          module_code: module.code,
          deployment_type_code: 'cloud',
          trial_days: 14
        });
      }

      toast({
        title: "Modules activés avec succès",
        description: `${availableModules.length} modules spécialisés pour ${businessType} ont été activés.`,
      });

      onModulesActivated?.();
    } catch (error) {
      toast({
        title: "Erreur lors de l'activation",
        description: "Impossible d'activer certains modules. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return null;
}

export function getBusinessTypeModules(businessType: string) {
  return BUSINESS_MODULE_MAPPING[businessType] || [];
}

export function getBusinessTypePackage(businessType: string) {
  return BUSINESS_PACKAGES[businessType];
}