/**
 * Module card component for marketplace display
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Module, OrganizationModule } from '@/types/modules';

interface ModuleCardProps {
  module: Module;
  organizationModule?: OrganizationModule;
  onActivate?: (moduleCode: string) => void;
  onDeactivate?: (orgModuleId: string) => void;
  isLoading?: boolean;
}

export function ModuleCard({ module, organizationModule, onActivate, onDeactivate, isLoading }: ModuleCardProps) {
  const IconComponent = module.icon ? Icons[module.icon as keyof typeof Icons] as any : Icons.Package;
  const isActive = !!organizationModule?.is_active;
  const isCore = module.is_core;
  const isTrial = organizationModule?.trial_until && new Date(organizationModule.trial_until) >= new Date();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-slate-100 text-slate-800';
      case 'hospitality': return 'bg-blue-100 text-blue-800';
      case 'pos': return 'bg-green-100 text-green-800';
      case 'operations': return 'bg-orange-100 text-orange-800';
      case 'analytics': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`relative transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary ring-opacity-50' : ''}`}>
      {isCore && (
        <div className="absolute -top-2 -right-2">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            <Star className="h-3 w-3 mr-1" />
            Core
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {IconComponent && <IconComponent className="h-8 w-8 text-muted-foreground" />}
            <div>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <Badge className={getCategoryColor(module.category)}>
                {module.category}
              </Badge>
            </div>
          </div>
          {isActive && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Actif</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <CardDescription className="mb-4">{module.description}</CardDescription>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Prix mensuel</span>
            <span className="text-lg font-bold text-primary">
              {module.base_price_monthly}€/mois
            </span>
          </div>

          {isTrial && (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Essai jusqu'au {new Date(organizationModule.trial_until!).toLocaleDateString()}
              </span>
            </div>
          )}

          {module.features && module.features.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Fonctionnalités incluses:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {module.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    {feature}
                  </li>
                ))}
                {module.features.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{module.features.length - 3} autres fonctionnalités
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {isActive ? (
          <div className="flex gap-2 w-full">
            {!isCore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeactivate?.(organizationModule.id)}
                disabled={isLoading}
                className="flex-1"
              >
                Désactiver
              </Button>
            )}
            <Button variant="secondary" size="sm" className="flex-1">
              Configurer
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onActivate?.(module.code)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Activation...' : 'Activer le module'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}