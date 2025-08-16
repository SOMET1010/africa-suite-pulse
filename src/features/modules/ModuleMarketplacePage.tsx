/**
 * Module marketplace page - main interface for selecting and managing modules
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { logger } from '@/lib/logger';
import { Separator } from '@/components/ui/separator';
import { Store, Package, Settings, CreditCard, TrendingUp } from 'lucide-react';
import { ModuleCard } from './components/ModuleCard';
import { PackageCard } from './components/PackageCard';
import { DeploymentSelector } from './components/DeploymentSelector';
import { 
  useModules, 
  useOrganizationModules, 
  useModulePackages, 
  useDeploymentTypes,
  useOrganizationCost,
  useActivateModule,
  useDeactivateModule
} from './hooks/useModules';

export function ModuleMarketplacePage() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedDeploymentType, setSelectedDeploymentType] = useState('cloud');
  const [activationDialogOpen, setActivationDialogOpen] = useState(false);

  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: organizationModules = [] } = useOrganizationModules();
  const { data: packages = [] } = useModulePackages();
  const { data: deploymentTypes = [] } = useDeploymentTypes();
  const { data: costBreakdown } = useOrganizationCost();

  const activateModuleMutation = useActivateModule();
  const deactivateModuleMutation = useDeactivateModule();

  const activeModuleMap = new Map(
    organizationModules.map(om => [om.module?.code, om])
  );

  const handleActivateModule = (moduleCode: string) => {
    setSelectedModule(moduleCode);
    setActivationDialogOpen(true);
  };

  const confirmActivation = () => {
    if (!selectedModule) return;
    
    activateModuleMutation.mutate({
      module_code: selectedModule,
      deployment_type_code: selectedDeploymentType,
      trial_days: 14 // 14 days trial
    }, {
      onSuccess: () => {
        setActivationDialogOpen(false);
        setSelectedModule(null);
      }
    });
  };

  const selectedModuleData = modules.find(m => m.code === selectedModule);

  if (modulesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8" />
            Module Marketplace
          </h1>
          <p className="text-muted-foreground">
            Personnalisez votre solution AfricaSuite avec les modules adaptés à vos besoins
          </p>
        </div>
      </div>

      {/* Cost Summary */}
      {costBreakdown && costBreakdown.module_count > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Votre Configuration Actuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{costBreakdown.module_count}</div>
                <div className="text-sm text-muted-foreground">Modules actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{costBreakdown.total_monthly_cost}€</div>
                <div className="text-sm text-muted-foreground">Coût mensuel</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{costBreakdown.total_setup_fees}€</div>
                <div className="text-sm text-muted-foreground">Frais d'installation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {costBreakdown.active_modules.filter(m => m.is_trial).length}
                </div>
                <div className="text-sm text-muted-foreground">En période d'essai</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="packages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Packages Prédéfinis
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Modules Individuels
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Modules Actifs
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Packages Recommandés</h2>
            <p className="text-muted-foreground mb-6">
              Solutions complètes adaptées à votre secteur d'activité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                package={pkg}
                onSelect={() => logger.info('Package selected', { code: pkg.code })}
                isLoading={false}
              />
            ))}
          </div>
        </TabsContent>

        {/* Individual Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Modules Disponibles</h2>
            <p className="text-muted-foreground mb-6">
              Choisissez individuellement les modules qui vous intéressent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                organizationModule={activeModuleMap.get(module.code)}
                onActivate={handleActivateModule}
                onDeactivate={(orgModuleId) => deactivateModuleMutation.mutate(orgModuleId)}
                isLoading={activateModuleMutation.isPending || deactivateModuleMutation.isPending}
              />
            ))}
          </div>
        </TabsContent>

        {/* Active Modules Tab */}
        <TabsContent value="active" className="space-y-6">
          {organizationModules.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Vos Modules Actifs</h2>
              
              <div className="grid gap-4">
                {organizationModules.map((orgModule) => (
                  <Card key={orgModule.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{orgModule.module?.name}</h3>
                          <p className="text-sm text-muted-foreground">{orgModule.module?.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{orgModule.deployment_type?.name}</Badge>
                            {orgModule.trial_until && new Date(orgModule.trial_until) >= new Date() && (
                              <Badge variant="secondary">
                                Essai jusqu'au {new Date(orgModule.trial_until).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {((orgModule.custom_price || orgModule.module?.base_price_monthly || 0) * 
                              (orgModule.deployment_type?.price_modifier || 1)).toFixed(0)}€/mois
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Activé le {new Date(orgModule.activated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun module actif</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par activer des modules pour personnaliser votre expérience
              </p>
              <Button onClick={() => {
                const packagesTab = document.querySelector('[value="packages"]') as HTMLButtonElement;
                packagesTab?.click();
              }}>
                Découvrir les packages
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Activation Dialog */}
      <Dialog open={activationDialogOpen} onOpenChange={setActivationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activer le module {selectedModuleData?.name}</DialogTitle>
            <DialogDescription>
              Configurez le déploiement de ce module selon vos préférences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedModuleData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedModuleData.name}</CardTitle>
                  <CardDescription>{selectedModuleData.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Prix de base:</span>
                      <span className="font-medium">{selectedModuleData.base_price_monthly}€/mois</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Période d'essai:</span>
                      <span className="font-medium text-green-600">14 jours gratuits</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {deploymentTypes.length > 0 && selectedModuleData && (
              <DeploymentSelector
                deploymentTypes={deploymentTypes}
                selectedType={selectedDeploymentType}
                onSelect={setSelectedDeploymentType}
                basePrice={selectedModuleData.base_price_monthly}
              />
            )}

            <Separator />

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setActivationDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={confirmActivation}
                disabled={activateModuleMutation.isPending}
              >
                {activateModuleMutation.isPending ? 'Activation...' : 'Activer le module'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}