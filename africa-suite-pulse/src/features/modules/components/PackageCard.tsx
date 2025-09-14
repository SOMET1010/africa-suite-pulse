/**
 * Package card component for predefined module bundles
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Star, Users } from 'lucide-react';
import type { ModulePackage } from '@/types/modules';

interface PackageCardProps {
  package: ModulePackage;
  onSelect?: (packageCode: string) => void;
  isLoading?: boolean;
}

export function PackageCard({ package: pkg, onSelect, isLoading }: PackageCardProps) {
  const originalPrice = pkg.base_price_monthly / (1 - pkg.discount_percentage / 100);
  const savings = originalPrice - pkg.base_price_monthly;

  return (
    <Card className={`relative transition-all hover:shadow-lg ${pkg.is_featured ? 'ring-2 ring-primary' : ''}`}>
      {pkg.is_featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            Recommandé
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          {pkg.code === 'enterprise' ? (
            <Crown className="h-12 w-12 text-primary" />
          ) : (
            <Users className="h-12 w-12 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
        <CardDescription className="text-muted-foreground">{pkg.description}</CardDescription>
        {pkg.target_audience && (
          <Badge variant="outline" className="mx-auto w-fit">
            {pkg.target_audience}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="text-center pb-6">
        <div className="mb-4">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-primary">{pkg.base_price_monthly}€</span>
            <span className="text-muted-foreground">/mois</span>
          </div>
          
          {pkg.discount_percentage > 0 && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice.toFixed(0)}€/mois
              </span>
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                Économisez {savings.toFixed(0)}€/mois
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Modules inclus:</span>
            <span className="font-medium">{pkg.module_ids.length}</span>
          </div>
          {pkg.discount_percentage > 0 && (
            <div className="flex justify-between">
              <span>Remise:</span>
              <span className="font-medium text-green-600">-{pkg.discount_percentage}%</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onSelect?.(pkg.code)}
          disabled={isLoading}
          className="w-full"
          variant={pkg.is_featured ? "default" : "outline"}
        >
          {isLoading ? 'Sélection...' : 'Choisir ce package'}
        </Button>
      </CardFooter>
    </Card>
  );
}