/**
 * Deployment type selector component
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Cloud, Server } from 'lucide-react';
import type { DeploymentType } from '@/types/modules';

interface DeploymentSelectorProps {
  deploymentTypes: DeploymentType[];
  selectedType: string;
  onSelect: (deploymentTypeCode: string) => void;
  basePrice: number;
}

export function DeploymentSelector({ deploymentTypes, selectedType, onSelect, basePrice }: DeploymentSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Type de déploiement</h3>
        <p className="text-sm text-muted-foreground">
          Choisissez comment vous souhaitez héberger cette solution
        </p>
      </div>

      <RadioGroup value={selectedType} onValueChange={onSelect}>
        <div className="grid gap-4">
          {deploymentTypes.map((type) => {
            const monthlyPrice = basePrice * type.price_modifier;
            const isSelected = selectedType === type.code;
            
            return (
              <Card key={type.id} className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={type.code} id={type.code} />
                      <Label htmlFor={type.code} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          {type.code === 'cloud' ? (
                            <Cloud className="h-5 w-5" />
                          ) : (
                            <Server className="h-5 w-5" />
                          )}
                          <CardTitle className="text-base">{type.name}</CardTitle>
                        </div>
                      </Label>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {monthlyPrice.toFixed(0)}€/mois
                      </div>
                      {type.price_modifier !== 1 && (
                        <Badge variant={type.price_modifier < 1 ? "secondary" : "destructive"}>
                          {type.price_modifier < 1 ? '-' : '+'}
                          {Math.abs((1 - type.price_modifier) * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription className="mb-3">{type.description}</CardDescription>
                  
                  {type.setup_fee > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Frais d'installation:</span> {type.setup_fee}€ (unique)
                    </div>
                  )}
                  
                  <div className="mt-3 space-y-2 text-sm">
                    {type.code === 'cloud' ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                          Hébergement géré par nos soins
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                          Mises à jour automatiques
                        </div>
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                          Support technique inclus
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                          Contrôle total de vos données
                        </div>
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                          Installation sur vos serveurs
                        </div>
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                          Tarif préférentiel
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>
    </div>
  );
}