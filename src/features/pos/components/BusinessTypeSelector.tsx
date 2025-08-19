import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Settings, Package } from 'lucide-react';
import { BUSINESS_TYPES, type BusinessType } from '@/types/collectivites';
import { BusinessModuleIntegration, getBusinessTypeModules } from './BusinessModuleIntegration';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BusinessTypeSelectorProps {
  onBusinessTypeSelect: (businessType: string) => void;
  onSettings?: () => void;
}

export function BusinessTypeSelector({ onBusinessTypeSelect, onSettings }: BusinessTypeSelectorProps) {
  const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);

  useEffect(() => {
    // Restore from session storage
    const savedBusinessType = sessionStorage.getItem('pos_business_type');
    if (savedBusinessType) {
      setSelectedBusinessType(savedBusinessType);
    }
  }, []);

  const handleBusinessTypeSelect = (businessType: BusinessType) => {
    setSelectedBusinessType(businessType.id);
    sessionStorage.setItem('pos_business_type', businessType.id);
    setShowModuleDialog(true);
  };

  const handleContinue = () => {
    if (selectedBusinessType) {
      onBusinessTypeSelect(selectedBusinessType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AfricaSuite POS Multi-Métiers
          </h1>
          <p className="text-xl text-muted-foreground">
            Choisissez votre type d'activité pour commencer
          </p>
        </div>

        {/* Business Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {BUSINESS_TYPES.map((businessType) => (
            <Card
              key={businessType.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                selectedBusinessType === businessType.id
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleBusinessTypeSelect(businessType)}
            >
              <CardContent className="p-0">
                <div className={`h-32 ${businessType.color} flex items-center justify-center relative`}>
                  <span className="text-6xl">{businessType.icon}</span>
                  {selectedBusinessType === businessType.id && (
                    <Badge className="absolute top-2 right-2 bg-white text-primary">
                      Sélectionné
                    </Badge>
                  )}
                </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {businessType.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {businessType.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="h-3 w-3" />
                      {getBusinessTypeModules(businessType.id as any).length} modules spécialisés
                    </div>
                  </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        {selectedBusinessType && (
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={handleContinue}
              className="px-8"
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {onSettings && (
              <Button
                variant="outline"
                size="lg"
                onClick={onSettings}
                className="px-8"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configuration
              </Button>
            )}
          </div>
        )}

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔄</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Multi-activités</h4>
            <p className="text-sm text-muted-foreground">
              Gérez plusieurs types d'activités depuis une seule interface
            </p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎫</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">RestoBadges</h4>
            <p className="text-sm text-muted-foreground">
              Système de badges pour collectivités avec subventions automatiques
            </p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-semibold text-foreground mb-2">Reporting unifié</h4>
            <p className="text-sm text-muted-foreground">
              Tableaux de bord et statistiques consolidées par métier
            </p>
          </div>
        </div>
      </div>

      {/* Module Activation Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configuration des modules</DialogTitle>
            <DialogDescription>
              Activation des modules spécialisés pour votre activité
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Des modules optimisés pour votre type d'activité seront configurés automatiquement.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowModuleDialog(false);
                  handleContinue();
                }}
              >
                Ignorer
              </Button>
              <Button onClick={() => {
                setShowModuleDialog(false);
                handleContinue();
              }}>
                Configurer les modules
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Module Integration */}
      {selectedBusinessType && (
        <BusinessModuleIntegration 
          businessType={selectedBusinessType as any}
          onModulesActivated={() => {
            // Modules activated successfully
          }}
        />
      )}
    </div>
  );
}